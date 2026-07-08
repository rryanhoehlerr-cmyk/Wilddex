/**
 * Chiranjiv weekly marketing analytics pipeline — Google Apps Script (Tier 0, Sheets-native)
 * =========================================================================================
 * Mirrors the logic already validated in weekly_pipeline.py against real data. Run this
 * bound to the Google Sheet that IS your master dataset / Looker Studio data source.
 *
 * SHEETS THIS SCRIPT EXPECTS:
 *   - "Meta_staging"   : paste that week's raw Meta Business Suite export here (with headers)
 *   - "GA4_staging"    : paste that week's raw GA4 traffic-acquisition export here (with headers,
 *                        i.e. delete the '#' comment lines GA4 puts at the top before pasting)
 *   - "Overrides"       : two columns, ga_session_campaign_key | meta_campaign_id — this is the
 *                        Sheets equivalent of MATCH_OVERRIDES_DEFAULT in the Python script. Add a
 *                        row here whenever GA logs a UTM-text value instead of the numeric ID.
 *   - "Master"          : created/managed by this script. This is what Looker Studio should
 *                        point at.
 *
 * NOT YET TESTED IN A LIVE SHEET — validate on a duplicate/test spreadsheet before relying on it
 * for the real master dataset. The join/upsert logic below is a direct port of the Python
 * version, which WAS tested against the real Apr30-Jun30 2026 export and a simulated second week.
 *
 * INSTALL:
 *   1. Open the Google Sheet you want as your master dataset.
 *   2. Extensions > Apps Script.
 *   3. Paste this file's contents in, replacing the default Code.gs.
 *   4. Save. Reload the Sheet — a "Chiranjiv Pipeline" menu should appear.
 *   5. Create the four sheet tabs listed above (Meta_staging, GA4_staging, Overrides, Master).
 *   6. Each week: paste that week's raw exports into Meta_staging / GA4_staging, then
 *      Chiranjiv Pipeline > Run weekly update, enter the week's start/end date when prompted.
 */

const CANONICAL_COLUMNS = [
  "week_start_date", "week_end_date", "platform", "campaign_id", "campaign_name",
  "ad_id", "ad_name", "content_type", "spend", "currency", "impressions", "reach",
  "clicks", "ctr", "cpc", "cpm", "landing_page_views", "total_organic_engagements",
  "engagement_rate", "sessions", "engaged_sessions", "ga_engagement_rate", "new_users",
  "returning_users", "cost_per_session", "cost_per_new_user", "session_conv_rate",
  "match_key", "match_status", "source_file", "load_timestamp", "platform_specific_metrics"
];
const KEY_COLS = ["platform", "campaign_id", "ad_id", "week_start_date"];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Chiranjiv Pipeline")
    .addItem("Run weekly update", "runWeeklyUpdate")
    .addItem("Export Dashboard Data (active only)", "exportDashboardFlat")
    .addToUi();
}

function sheetToObjects_(sheetName) {
  const sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sh) throw new Error(`Sheet "${sheetName}" not found.`);
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(c => c !== "" && c !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function num_(v, def) {
  def = def || 0;
  if (v === "" || v === null || v === undefined) return def;
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function standardizeMeta_(rows) {
  return rows.map(r => {
    const spend = num_(r["Amount spent (INR)"]);
    const impressions = num_(r["Impressions"]);
    const reach = num_(r["Reach"]);
    const clicks = num_(r["Clicks (all)"]);
    const reactions = num_(r["Post reactions"]);
    const comments = num_(r["Post comments"]);
    const saves = num_(r["Post saves"]);
    const shares = num_(r["Post shares"]);
    const follows = num_(r["Instagram follows"]);
    const likes = num_(r["Facebook likes"]);
    const totalEng = reactions + comments + saves + shares + follows + likes;
    return {
      platform: "Meta",
      campaign_id: String(r["Campaign ID"] || "").trim(),
      campaign_name: r["Campaign name"] || "",
      ad_id: String(r["Ad ID"] || "").trim(),
      ad_name: r["Ad name"] || "",
      content_type: "Instagram Reel/Post",
      spend: spend,
      currency: "INR",
      impressions: impressions,
      reach: reach,
      clicks: clicks,
      ctr: impressions ? clicks / impressions : 0,
      cpc: clicks ? spend / clicks : 0,
      cpm: impressions ? (spend / impressions) * 1000 : 0,
      landing_page_views: num_(r["Landing page views"]),
      total_organic_engagements: totalEng,
      engagement_rate: reach ? totalEng / reach : 0,
      platform_specific_metrics: JSON.stringify({
        post_reactions: reactions, post_comments: comments, post_saves: saves,
        post_shares: shares, instagram_follows: follows, facebook_likes: likes,
        results: num_(r["Results"]), result_indicator: r["Result indicator"] || "",
        cost_per_result: num_(r["Cost per results"])
      })
    };
  });
}

function standardizeGa4_(rows) {
  const exclude = new Set(["(referral)", "(organic)", "(not set)", "(direct)", "", "Grand total"]);
  return rows
    .filter(r => {
      const key = String(r["Session campaign"] || "").trim();
      return key && !exclude.has(key);
    })
    .map(r => ({
      ga_session_campaign_key: String(r["Session campaign"]).trim(),
      sessions: num_(r["Sessions"]),
      engaged_sessions: num_(r["Engaged sessions"]),
      ga_engagement_rate: num_(r["Engagement rate"]),
      new_users: num_(r["New users"]),
      returning_users: num_(r["Returning users"])
    }));
}

function loadOverrides_() {
  const sh = SpreadsheetApp.getActive().getSheetByName("Overrides");
  const overrides = {};
  if (!sh) return overrides;
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const [gaKey, metaId] = values[i];
    if (gaKey && metaId) overrides[String(gaKey).trim()] = String(metaId).trim();
  }
  return overrides;
}

function resolveMatchKey_(metaCampaignId, ga4ByKey, overrides) {
  if (ga4ByKey[metaCampaignId]) return { key: metaCampaignId, status: "Direct ID match" };
  for (const gaKey in overrides) {
    if (overrides[gaKey] === metaCampaignId && ga4ByKey[gaKey]) {
      return { key: gaKey, status: "UTM text match" };
    }
  }
  return { key: null, status: "No GA counterpart" };
}

function joinMetaGa4_(metaRows, ga4Rows, overrides) {
  const ga4ByKey = {};
  ga4Rows.forEach(r => ga4ByKey[r.ga_session_campaign_key] = r);

  return metaRows.map(m => {
    const match = resolveMatchKey_(m.campaign_id, ga4ByKey, overrides);
    const ga = match.key ? ga4ByKey[match.key] : null;
    const sessions = ga ? ga.sessions : 0;
    const newUsers = ga ? ga.new_users : 0;
    const row = Object.assign({}, m);
    row.match_key = match.key || "";
    row.match_status = (m.spend > 0 || m.impressions > 0) ? match.status : "Matched (zero-activity)";
    row.sessions = sessions;
    row.engaged_sessions = ga ? ga.engaged_sessions : 0;
    row.ga_engagement_rate = ga ? ga.ga_engagement_rate : 0;
    row.new_users = newUsers;
    row.returning_users = ga ? ga.returning_users : 0;
    row.cost_per_session = sessions ? m.spend / sessions : 0;
    row.cost_per_new_user = newUsers ? m.spend / newUsers : 0;
    row.session_conv_rate = m.clicks ? sessions / m.clicks : 0;
    return row;
  });
}

function runWeeklyUpdate() {
  const ui = SpreadsheetApp.getUi();
  const startResp = ui.prompt("Week start date (YYYY-MM-DD)", ui.ButtonSet.OK_CANCEL);
  if (startResp.getSelectedButton() !== ui.Button.OK) return;
  const endResp = ui.prompt("Week end date (YYYY-MM-DD)", ui.ButtonSet.OK_CANCEL);
  if (endResp.getSelectedButton() !== ui.Button.OK) return;
  const weekStart = startResp.getResponseText().trim();
  const weekEnd = endResp.getResponseText().trim();

  const metaRaw = sheetToObjects_("Meta_staging");
  const ga4Raw = sheetToObjects_("GA4_staging");
  const overrides = loadOverrides_();

  const metaStd = standardizeMeta_(metaRaw);
  const ga4Std = standardizeGa4_(ga4Raw);
  const combined = joinMetaGa4_(metaStd, ga4Std, overrides);

  const now = new Date().toISOString();
  combined.forEach(row => {
    row.week_start_date = weekStart;
    row.week_end_date = weekEnd;
    row.source_file = "Meta_staging + GA4_staging";
    row.load_timestamp = now;
  });

  upsertIntoMaster_(combined);
  ui.alert(`Done. ${combined.length} row(s) upserted for week ${weekStart} – ${weekEnd}.`);
}

function upsertIntoMaster_(newRows) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName("Master");
  if (!sh) {
    sh = ss.insertSheet("Master");
    sh.appendRow(CANONICAL_COLUMNS);
  }

  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const existingRows = data.slice(1);

  const keyIdx = KEY_COLS.map(k => headers.indexOf(k));
  const newKeys = new Set(newRows.map(r => KEY_COLS.map(k => String(r[k])).join("||")));

  const keptRows = existingRows.filter(row => {
    const key = keyIdx.map(i => String(row[i])).join("||");
    return !newKeys.has(key);
  });

  const newRowArrays = newRows.map(r => CANONICAL_COLUMNS.map(c => (r[c] !== undefined ? r[c] : "")));
  const allRows = keptRows.concat(newRowArrays);

  sh.clearContents();
  sh.appendRow(CANONICAL_COLUMNS);
  if (allRows.length) sh.getRange(2, 1, allRows.length, CANONICAL_COLUMNS.length).setValues(allRows);
}

function exportDashboardFlat() {
  const ss = SpreadsheetApp.getActive();
  const master = ss.getSheetByName("Master");
  if (!master) { SpreadsheetApp.getUi().alert('No "Master" sheet yet — run "Run weekly update" first.'); return; }

  const data = master.getDataRange().getValues();
  const headers = data[0];
  const spendIdx = headers.indexOf("spend");
  const imprIdx = headers.indexOf("impressions");
  const active = data.slice(1).filter(r => Number(r[spendIdx]) > 0 || Number(r[imprIdx]) > 0);

  let out = ss.getSheetByName("Dashboard Data");
  if (!out) out = ss.insertSheet("Dashboard Data");
  out.clearContents();
  out.appendRow(headers);
  if (active.length) out.getRange(2, 1, active.length, headers.length).setValues(active);

  SpreadsheetApp.getUi().alert(`Dashboard Data refreshed: ${active.length} active row(s). Point Looker Studio at this tab.`);
}
