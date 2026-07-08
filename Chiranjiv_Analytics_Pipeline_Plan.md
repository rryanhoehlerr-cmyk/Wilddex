# Chiranjiv Marketing Analytics — Pipeline Architecture Plan

Prepared as a planning document, no implementation yet. Covers the recommended architecture, the master dataset design, an automation matrix, current constraints, and how this connects to Looker Studio.

## 1. Recommendation up front

Build this in three tiers, not one leap. Tier 0 is buildable this week with zero new accounts. Tier 1 removes the GA4 half of the manual work once you grant API access. Tier 2 removes the Meta half once you either build against Meta's Marketing API or pay for a connector (Supermetrics, Windsor.ai, Funnel). Store the master dataset in **Google Sheets now**, migrate to **BigQuery later** — not because Sheets is inferior, but because your current data volume (a handful of campaigns, one export per week) doesn't justify BigQuery's operational overhead yet. Migrate when platform count or row count actually demands it, not before.

The single highest-leverage change you can make — cheaper than any of the automation work below — is fixing UTM tagging at ad-creation time so GA and Meta share one join key. That one fix removes the entire "Match Key" reconciliation step this pipeline currently needs.

## 2. Ideal end-state workflow

```
Marketing Platforms (Meta, future: TikTok/YouTube/etc.)
        │  scheduled pull (API) or manual export
        ▼
Standardization Layer (schema mapping, cleaning, dedup)
        │
        ▼
Master Dataset  (append-only fact table, one row per platform+campaign+ad+week)
        │
        ▼
Looker Studio  (live-connected data source)
        │
        ▼
Dashboard (auto-refreshes) + scheduled email/Slack summaries
```

Each box is a separable component. That separation is what makes the system "reusable indefinitely" — adding TikTok later means writing one new standardization function, not rebuilding the pipeline.

## 3. Tiered architecture recommendation

### Tier 0 — Buildable now, zero new accounts
- You export GA4 and Meta CSVs weekly (as you already do).
- You drop them in a shared location (a Drive folder, or hand them to me).
- A standardization script (Apps Script or Python, run by you or by me on request) maps each source's columns to the canonical schema (Section 4), dedupes against what's already in the master, and appends.
- Looker Studio reads the master Google Sheet directly.
- **Manual steps remaining:** exporting from GA4 and Meta, uploading the files. Everything after that is automatic.

### Tier 1 — GA4 fully automated
- GA4 has a real API (Analytics Data API). Once you grant a service account Viewer access to your GA4 property, a scheduled Apps Script (time-driven trigger, e.g. every Monday 6am) pulls the week's session data directly — no export, no upload.
- Meta remains manual (export + upload) until Tier 2.
- **Setup cost:** one-time, requires your Google Cloud Console access (I can walk you through it, but can't do it without you granting access).

### Tier 2 — Meta fully automated
Two paths, pick one:
- **Build:** Meta Marketing API via a developer app + long-lived system-user token. Free, but requires initial developer setup and periodic token/API-version maintenance.
- **Buy:** A connector like Supermetrics, Windsor.ai, or Funnel.io pulls Meta (and dozens of other ad platforms) into Sheets/BigQuery/Looker Studio on a schedule, no code. Costs roughly $50–300/month depending on data volume, but removes all engineering maintenance.
- **Recommendation:** if you plan to add 2+ more ad platforms in the next year, buy. If Meta stays your only paid channel, build — the API isn't hard, just fiddly to maintain.

### Tier 3 — Migrate storage to BigQuery
Trigger this migration when *any* of the following becomes true: more than ~3-4 platforms feeding the master dataset, more than ~50-100k rows/year, you need SQL-level joins/transformations Sheets can't express cleanly, or more than one person/dashboard needs to query concurrently. Until then, BigQuery is added complexity with no payoff.

## 4. Master dataset schema

Use a **wide core + long extension** pattern. Every platform maps into the same core columns (so cross-platform comparison always works), and platform-specific oddball metrics go in a catch-all column rather than forcing a schema change every time a new metric shows up.

**Grain:** one row per `(platform, campaign_id, ad_id, week_start_date)`.

**Core columns (every platform must map to these):**
`week_start_date, week_end_date, platform, campaign_id, campaign_name, ad_id, ad_name, content_type, spend, currency, impressions, reach, clicks, ctr, cpc, cpm, landing_page_views, total_organic_engagements, engagement_rate, sessions, engaged_sessions, ga_engagement_rate, new_users, returning_users, cost_per_session, cost_per_new_user, session_conv_rate, match_key, match_status, source_file, load_timestamp`

**Extension column:** `platform_specific_metrics` (JSON blob) — holds things like Instagram saves/shares/follows today, and whatever TikTok or YouTube contribute tomorrow (watch time, completion rate, etc.), without ever altering the core table.

This is exactly the structure your current `Merged Campaign Data` tab already approximates — the migration path from what exists today to this schema is small.

## 5. Deduplication and historical data — the retroactive-data risk

**This is the bottleneck most people miss.** Ad platforms revise numbers retroactively: Meta's attribution windows (7-day click / 1-day view) mean a campaign's reported results can keep changing for several days after the reporting period ends. A naive append-only pipeline will end up with stale numbers for last week sitting permanently in your master dataset once this week's data is appended.

Recommended handling:
- Natural key = `platform + campaign_id + ad_id + week_start_date`.
- On each weekly load, if a key already exists in the master, **overwrite** the existing row with the new snapshot rather than appending a duplicate (upsert, not pure append).
- Optionally keep a secondary `history` table (true append-only, every snapshot including retroactive corrections) if you ever want to analyze how estimates shifted over time. Not necessary for a dashboard, useful for audit.

## 6. Data flow, explicitly

```
GA4 property
   → GA4 Data API (Tier 1) or manual CSV export (Tier 0)
   → Standardization function (GA4 → core schema)
   → Master Sheet "GA4_staging" tab
        ↘
Meta Business Suite / Ads Manager
   → Marketing API (Tier 2) or manual CSV export (Tier 0/1)
   → Standardization function (Meta → core schema)
   → Master Sheet "Meta_staging" tab
        ↘
Join on match_key (campaign_id / UTM) → dedup/upsert against Master tab
   → Master Sheet "Master" tab  (source of truth)
        ↓
Looker Studio data source = Master tab (Sheets connector) or BigQuery table (post-migration)
        ↓
Dashboard auto-refreshes on view; scheduled email delivery via Looker Studio's native "Schedule email delivery"
```

## 7. Automation matrix (Phase 4)

| Step | Automatable? | Notes |
|---|---|---|
| Download GA4 report | **Fully** (Tier 1) | GA4 Data API, no manual export needed once service account is set up |
| Download Meta report | **Partially today, Fully at Tier 2** | Manual export now; Marketing API or paid connector removes this |
| Import into staging | **Fully** | Once files land in a known Drive folder, a script/Apps Script trigger reads them automatically |
| Clean/standardize columns | **Fully** | One mapping function per platform, written once, reused every week |
| Deduplicate/upsert | **Fully** | Key-based logic, no judgment required |
| Append to master | **Fully** | Mechanical once standardization is done |
| Refresh dashboard | **Fully** | Looker Studio refreshes on open; Sheets-based sources refresh live |
| Scheduled email/Slack summary | **Fully** | Looker Studio has native scheduled email delivery |
| Flagging anomalies (e.g. zero-spend campaign, broken UTM) | **Partially** | Rules can catch it (fully automatable); deciding *why* and what to do about it is analyst judgment |
| Interpreting results / strategic calls | **Manual** | This is the point of the dashboard — humans decide, machines report |
| Onboarding a new platform (writing its mapping function) | **Manual, one-time per platform** | After that one-time engineering cost, it's fully automated going forward |

## 8. Current constraints (Phase 5)

**Can automate today, no new accounts needed:** cleaning, standardization, deduplication, and appending — i.e., everything after the raw files exist. I can do this each week if you upload the two exports.

**Cannot automate today, requires your action outside this chat:** granting a Google Cloud service account access to your GA4 property (Tier 1); creating a Meta developer app and system-user token, or subscribing to a paid connector (Tier 2); moving the master dataset to Google Sheets/BigQuery and wiring up Looker Studio (needs your Google account, not mine).

**Automate later as this scales:** BigQuery migration, SQL-based transformation layer, multi-platform mapping library, automated anomaly alerts, scheduled dashboard emails to your boss.

## 9. Working with your files (Phase 6 findings, from this session)

Concrete issues found in your actual exports, and the fix for each:

- **GA4 and Meta use two different join key formats** (numeric Campaign ID vs. UTM text) depending on whether the ad's link had manual UTM parameters. **Fix:** at ad-creation time, set the destination URL's `utm_campaign` to Meta's dynamic parameter `{{campaign.id}}` (Meta auto-fills the numeric ID). Do this for every future ad and the join key mismatch disappears — no more manual "Match Key" reconciliation.
- **Meta's UI export truncates long text fields** ("Instagram post: India is the most genetically...") with no way to recover the full text from the export alone. **Fix:** widen the relevant columns before exporting from the Business Suite UI, or pull via the Marketing API instead, which returns untruncated fields.
- **No consistent file-naming convention.** For any automated "watch this Drive folder" step to work, exports need predictable names, e.g. `meta_YYYYMMDD_YYYYMMDD.csv` / `ga4_YYYYMMDD_YYYYMMDD.csv`.
- **Facebook Likes column is empty for all current rows** — expected, since these ads target Instagram only; not a data quality issue, just something the schema should tolerate (nullable, not required).

## 10. Looker Studio data source recommendation (Phase 7)

**Do not upload Excel files directly to Looker Studio.** Looker Studio's file-upload path is static — it doesn't refresh, so you'd be manually re-uploading every week, which defeats the entire point of this project.

**Use Google Sheets now.** Native connector, zero cost, refreshes automatically, sufficient performance at your current and near-term data volume, and it's exactly the format the rest of this plan is built around.

**Migrate to BigQuery when you hit the Tier 3 triggers in Section 3** — more platforms, more rows, need for SQL transforms, or multiple concurrent dashboard users. BigQuery also has a native, first-class Looker Studio connector, so the migration is a data-relocation exercise, not a dashboard rebuild.

**Skip BigQuery for now** even though it's the "more scalable" answer in the abstract — at 5-30 rows a week, it adds authentication, billing, and schema-management overhead with no visible benefit yet.

## 11. Risks and bottlenecks

- **Retroactive metric revisions** (Section 5) — biggest correctness risk, solved by upsert-not-append.
- **Meta API maintenance burden** — access tokens expire, API versions get deprecated roughly annually; whoever builds the Tier 2 integration owns this upkeep indefinitely, or you pay a vendor to own it instead.
- **Schema drift** — a new platform inevitably has a metric none of the others have. The wide-core/long-extension schema (Section 4) contains this risk to one JSON column instead of a redesign.
- **Google Sheets scale ceiling** — fine today, but Sheets performance degrades with heavy formula use well before it hits the hard 10M-cell limit. Keep the Master tab formula-light (values, not live cross-sheet formulas) once it's feeding Looker Studio.
- **Single point of manual failure** — if you're the only one exporting/uploading, a missed week creates a gap. Worth a calendar reminder until Tier 1/2 close the gap.

## 12. Alternative approaches if full automation isn't possible

1. **Hybrid (recommended near-term):** you export raw files weekly, automation handles everything downstream. Lowest cost, some manual time every week (~10 minutes), no new accounts required.
2. **Buy:** Supermetrics/Windsor.ai/Funnel handle both GA4 and Meta (and future platforms) end-to-end into Sheets or BigQuery. Zero engineering, ongoing subscription cost, fastest path to "fully automated."
3. **Build:** GA4 Data API + Meta Marketing API + Cloud Functions/Apps Script + BigQuery. Zero recurring cost beyond negligible GCP usage, but real upfront engineering time and ongoing maintenance (token refresh, API deprecations).

## 13. Suggested next steps

1. Fix UTM tagging on new Meta ads now (`utm_campaign={{campaign.id}}`) — costs nothing, pays off immediately.
2. Decide which tier to start building: Tier 0 (this week, no new accounts) vs. jumping straight to Tier 1 (needs Google Cloud Console access from you).
3. If interested in Tier 2, decide build-vs-buy for Meta automation now, since that decision shapes how much engineering effort is worth investing in Tier 0/1 first.
