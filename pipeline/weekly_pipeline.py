"""
Chiranjiv weekly marketing analytics pipeline (Tier 0)
========================================================
Standardizes weekly GA4 + Meta exports into one canonical schema, resolves the
GA4<->Meta join key (numeric Campaign ID vs. UTM text), and upserts the result
into a master dataset (append new weeks, overwrite existing weeks -- because
Meta's numbers revise retroactively for several days after a period closes).

Usage:
    python weekly_pipeline.py --ga4 path/to/ga4_export.csv --meta path/to/meta_export.csv \
        --master path/to/Chiranjiv_Master_Dataset.xlsx \
        --week-start 2026-04-30 --week-end 2026-06-30

Run this once per week with that week's two fresh exports. Re-running with the
same week-start/week-end is safe -- it overwrites that week's rows instead of
duplicating them.
"""
import argparse
import csv
import io
import json
import os
import re
from datetime import datetime, timezone

import pandas as pd

CANONICAL_COLUMNS = [
    "week_start_date", "week_end_date", "platform", "campaign_id", "campaign_name",
    "ad_id", "ad_name", "content_type", "spend", "currency", "impressions", "reach",
    "clicks", "ctr", "cpc", "cpm", "landing_page_views", "total_organic_engagements",
    "engagement_rate", "sessions", "engaged_sessions", "ga_engagement_rate", "new_users",
    "returning_users", "cost_per_session", "cost_per_new_user", "session_conv_rate",
    "match_key", "match_status", "source_file", "load_timestamp", "platform_specific_metrics",
]

KEY_COLS = ["platform", "campaign_id", "ad_id", "week_start_date"]

MATCH_OVERRIDES_DEFAULT = {
    # ga_session_campaign_value -> meta_campaign_id
    # Seeded from the Apr30-Jun30 2026 period. Add a new line here any time GA logs
    # a UTM-text value (instead of the numeric Campaign ID) for a new ad.
    "early_june_igreel_paid_campaign1": "120246050052030097",
}


def _read_meta_csv(path):
    return pd.read_csv(path, dtype=str)


def _read_ga4_csv(path):
    # GA4 UI exports begin with '#' comment lines and a blank line before the header.
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    header_idx = next(i for i, l in enumerate(lines) if l.strip() and not l.startswith("#"))
    data = "".join(lines[header_idx:])
    df = pd.read_csv(io.StringIO(data), dtype=str, index_col=False)
    return df


def _num(v, default=0.0):
    try:
        if v is None or (isinstance(v, float) and pd.isna(v)) or v == "":
            return default
        return float(v)
    except (ValueError, TypeError):
        return default


def standardize_meta(csv_path):
    """Map a raw Meta Business Suite ad-level export to the canonical schema."""
    raw = _read_meta_csv(csv_path)
    rows = []
    for _, r in raw.iterrows():
        spend = _num(r.get("Amount spent (INR)"))
        impressions = _num(r.get("Impressions"))
        reach = _num(r.get("Reach"))
        clicks = _num(r.get("Clicks (all)"))
        reactions = _num(r.get("Post reactions"))
        comments = _num(r.get("Post comments"))
        saves = _num(r.get("Post saves"))
        shares = _num(r.get("Post shares"))
        follows = _num(r.get("Instagram follows"))
        likes = _num(r.get("Facebook likes"))
        total_eng = reactions + comments + saves + shares + follows + likes
        rows.append({
            "platform": "Meta",
            "campaign_id": str(r.get("Campaign ID", "")).strip(),
            "campaign_name": r.get("Campaign name", ""),
            "ad_id": str(r.get("Ad ID", "")).strip(),
            "ad_name": r.get("Ad name", ""),
            "content_type": "Instagram Reel/Post",
            "spend": spend,
            "currency": "INR",
            "impressions": impressions,
            "reach": reach,
            "clicks": clicks,
            "ctr": (clicks / impressions) if impressions else 0.0,
            "cpc": (spend / clicks) if clicks else 0.0,
            "cpm": (spend / impressions * 1000) if impressions else 0.0,
            "landing_page_views": _num(r.get("Landing page views")),
            "total_organic_engagements": total_eng,
            "engagement_rate": (total_eng / reach) if reach else 0.0,
            "platform_specific_metrics": json.dumps({
                "post_reactions": reactions, "post_comments": comments,
                "post_saves": saves, "post_shares": shares,
                "instagram_follows": follows, "facebook_likes": likes,
                "results": _num(r.get("Results")), "result_indicator": r.get("Result indicator", ""),
                "cost_per_result": _num(r.get("Cost per results")),
            }),
        })
    return pd.DataFrame(rows)


def standardize_ga4(csv_path):
    """Map a raw GA4 'Session campaign' traffic acquisition export to the canonical schema."""
    raw = _read_ga4_csv(csv_path)
    raw.columns = [c.strip() for c in raw.columns]
    exclude = {"(referral)", "(organic)", "(not set)", "(direct)", "", "Grand total"}
    rows = []
    for _, r in raw.iterrows():
        campaign_key = str(r.get("Session campaign", "")).strip()
        if campaign_key in exclude or pd.isna(r.get("Session campaign")):
            continue
        rows.append({
            "ga_session_campaign_key": campaign_key,
            "sessions": _num(r.get("Sessions")),
            "engaged_sessions": _num(r.get("Engaged sessions")),
            "ga_engagement_rate": _num(r.get("Engagement rate")),
            "new_users": _num(r.get("New users")),
            "returning_users": _num(r.get("Returning users")),
        })
    return pd.DataFrame(rows)


def resolve_match_key(meta_campaign_id, ga4_df, overrides):
    """Return the GA session-campaign key that corresponds to a Meta Campaign ID."""
    if (ga4_df["ga_session_campaign_key"] == meta_campaign_id).any():
        return meta_campaign_id, "Direct ID match"
    for ga_key, mapped_id in overrides.items():
        if mapped_id == meta_campaign_id and (ga4_df["ga_session_campaign_key"] == ga_key).any():
            return ga_key, "UTM text match"
    return None, "No GA counterpart"


def join_meta_ga4(meta_df, ga4_df, overrides=None):
    overrides = overrides or MATCH_OVERRIDES_DEFAULT
    ga4_lookup = ga4_df.set_index("ga_session_campaign_key").to_dict(orient="index")
    combined = []
    for _, m in meta_df.iterrows():
        ga_key, status = resolve_match_key(m["campaign_id"], ga4_df, overrides)
        ga_row = ga4_lookup.get(ga_key, {}) if ga_key else {}
        sessions = ga_row.get("sessions", 0.0)
        new_users = ga_row.get("new_users", 0.0)
        row = dict(m)
        row["match_key"] = ga_key or ""
        row["match_status"] = status if (m["spend"] > 0 or m["impressions"] > 0) else "Matched (zero-activity)"
        row["sessions"] = sessions
        row["engaged_sessions"] = ga_row.get("engaged_sessions", 0.0)
        row["ga_engagement_rate"] = ga_row.get("ga_engagement_rate", 0.0)
        row["new_users"] = new_users
        row["returning_users"] = ga_row.get("returning_users", 0.0)
        row["cost_per_session"] = (m["spend"] / sessions) if sessions else 0.0
        row["cost_per_new_user"] = (m["spend"] / new_users) if new_users else 0.0
        row["session_conv_rate"] = (sessions / m["clicks"]) if m["clicks"] else 0.0
        combined.append(row)
    return pd.DataFrame(combined)


def build_canonical_rows(meta_csv, ga4_csv, week_start, week_end, overrides=None):
    meta_df = standardize_meta(meta_csv)
    ga4_df = standardize_ga4(ga4_csv)
    combined = join_meta_ga4(meta_df, ga4_df, overrides)
    combined["week_start_date"] = week_start
    combined["week_end_date"] = week_end
    combined["source_file"] = f"{os.path.basename(meta_csv)} + {os.path.basename(ga4_csv)}"
    combined["load_timestamp"] = datetime.now(timezone.utc).isoformat()
    for col in CANONICAL_COLUMNS:
        if col not in combined.columns:
            combined[col] = None
    return combined[CANONICAL_COLUMNS]


def upsert_into_master(master_path, new_rows, key_cols=KEY_COLS):
    if os.path.exists(master_path):
        master = pd.read_excel(master_path, dtype=str)
        for col in CANONICAL_COLUMNS:
            if col not in master.columns:
                master[col] = None
        numeric_cols = ["spend","impressions","reach","clicks","ctr","cpc","cpm",
                         "landing_page_views","total_organic_engagements","engagement_rate",
                         "sessions","engaged_sessions","ga_engagement_rate","new_users",
                         "returning_users","cost_per_session","cost_per_new_user","session_conv_rate"]
        for col in numeric_cols:
            master[col] = pd.to_numeric(master[col], errors="coerce")
        new_keys = set(tuple(row) for row in new_rows[key_cols].astype(str).values)
        mask_keep = ~master[key_cols].astype(str).apply(tuple, axis=1).isin(new_keys)
        master = master[mask_keep]
        result = pd.concat([master, new_rows], ignore_index=True)
    else:
        result = new_rows.copy()
    result = result.sort_values(["week_start_date", "platform", "campaign_id", "ad_id"]).reset_index(drop=True)
    result.to_excel(master_path, index=False)
    return result


def export_dashboard_flat(master_df, out_path, active_only=True):
    df = master_df.copy()
    if active_only:
        df = df[(pd.to_numeric(df["spend"], errors="coerce").fillna(0) > 0) |
                 (pd.to_numeric(df["impressions"], errors="coerce").fillna(0) > 0)]
    df.to_excel(out_path, index=False)
    return df


def run(ga4_csv, meta_csv, master_path, week_start, week_end, overrides=None, dashboard_path=None):
    new_rows = build_canonical_rows(meta_csv, ga4_csv, week_start, week_end, overrides)
    master = upsert_into_master(master_path, new_rows)
    if dashboard_path:
        export_dashboard_flat(master, dashboard_path)
    return master


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--ga4", required=True)
    p.add_argument("--meta", required=True)
    p.add_argument("--master", required=True)
    p.add_argument("--week-start", required=True)
    p.add_argument("--week-end", required=True)
    p.add_argument("--dashboard", required=False)
    args = p.parse_args()
    master = run(args.ga4, args.meta, args.master, args.week_start, args.week_end, dashboard_path=args.dashboard)
    print(f"Master dataset now has {len(master)} rows across "
          f"{master['week_start_date'].nunique()} week(s).")
