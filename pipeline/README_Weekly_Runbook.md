# Chiranjiv Weekly Pipeline — Runbook (Tier 0)

Validated against the real Apr 30 – Jun 30, 2026 export and a simulated second week (including a retroactive-correction scenario). Two ways to run this — pick one path, don't mix them for the same master dataset.

## Path A — Run it through me (Python script, no new accounts)

Each week:
1. Export the week's GA4 traffic-acquisition CSV and Meta Business Suite ad-level CSV, same formats as before.
2. Upload both files to me along with the week's start/end date.
3. I run `weekly_pipeline.py`, which appends/updates `Chiranjiv_Master_Dataset.xlsx` and regenerates the flat `Chiranjiv_DataStudio_Import_v2.xlsx`.
4. You upload the refreshed `Chiranjiv_DataStudio_Import_v2.xlsx` to Google Sheets (or I can if you connect a Drive folder), Looker Studio picks up the change automatically.

Command, if you ever want to run it yourself:
```
python weekly_pipeline.py \
  --ga4 path/to/this_week_ga4.csv \
  --meta path/to/this_week_meta.csv \
  --master Chiranjiv_Master_Dataset.xlsx \
  --week-start 2026-07-01 --week-end 2026-07-07 \
  --dashboard Chiranjiv_DataStudio_Import_v2.xlsx
```
Safe to re-run with the same `--week-start`/`--week-end` — it overwrites that week's rows instead of duplicating them (needed because Meta's numbers revise for several days after a period closes).

## Path B — Run it natively in Google Sheets (chiranjiv_pipeline.gs)

Once you're ready to make the master dataset live in Google Sheets (required for Looker Studio either way):
1. Create/open the Google Sheet that will be your master dataset.
2. Extensions > Apps Script, paste in `chiranjiv_pipeline.gs`, save.
3. Reload the Sheet. Create four tabs: `Meta_staging`, `GA4_staging`, `Overrides`, `Master` (this last one gets created automatically on first run if missing).
4. In `Overrides`, add header row `ga_session_campaign_key | meta_campaign_id`, then one row: `early_june_igreel_paid_campaign1 | 120246050052030097` (this is the one known UTM-text mapping from the current dataset).
5. Each week: paste that week's raw GA4 export into `GA4_staging` (delete GA4's `#` comment lines first) and raw Meta export into `Meta_staging`.
6. Menu: **Chiranjiv Pipeline > Run weekly update**, enter the week's start/end date.
7. Menu: **Chiranjiv Pipeline > Export Dashboard Data (active only)** to refresh the Looker Studio-facing tab.
8. Point Looker Studio at the `Dashboard Data` tab of this Sheet.

**Not yet tested live** — this is a direct port of the Python logic (which was tested), but Apps Script execution itself hasn't been run in a real Sheet. Test on a duplicate spreadsheet with one week of real data before trusting it with the actual master dataset.

## When a new ad's GA campaign key doesn't match

If GA logs a UTM-text value instead of a numeric Campaign ID (this happens when an ad's destination URL has manual UTM parameters instead of Meta's dynamic `{{campaign.id}}` parameter):
- **Fix going forward:** set `utm_campaign={{campaign.id}}` on new ads so this stops happening.
- **For ads already running this way:** add a row to `match_overrides` (Python: edit `MATCH_OVERRIDES_DEFAULT` in `weekly_pipeline.py`; Sheets: add a row to the `Overrides` tab) mapping the GA text value to the Meta Campaign ID. Do this once per ad; it applies automatically on every future run.

## Files in this folder

- `weekly_pipeline.py` — the tested Python pipeline.
- `chiranjiv_pipeline.gs` — the Sheets-native port (test before relying on it).
- `Chiranjiv_Master_Dataset.xlsx` — master dataset, seeded with the real Apr30-Jun30 2026 data (6 rows, one per Meta campaign, canonical schema).
- `Chiranjiv_DataStudio_Import_v2.xlsx` — flat, active-campaigns-only export of the master, generated from it. This supersedes the manually-built `Chiranjiv_DataStudio_Import.xlsx` from before — this one regenerates automatically every time you run the pipeline instead of being hand-built.
- `test_data/` — the synthetic "week 2" files used to validate append + upsert logic. Not real data, kept for reference/regression testing only.
