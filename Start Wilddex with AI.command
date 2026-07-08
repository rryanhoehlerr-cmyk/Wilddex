#!/bin/bash
# Runs WildDex locally WITH the AI identify/illustrate functions (Gemini).
# One-time: copy .dev.vars.example to .dev.vars and paste your GEMINI_API_KEY.
cd "$(dirname "$0")" || exit 1

if [ ! -f ".dev.vars" ]; then
  echo ""
  echo "  No .dev.vars file found."
  echo "  1) Duplicate  .dev.vars.example  ->  .dev.vars"
  echo "  2) Paste your Gemini key after  GEMINI_API_KEY="
  echo "     (free key: https://aistudio.google.com)"
  echo ""
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

echo "Starting WildDex with AI at http://localhost:8788  (Ctrl+C to stop)"
# Opens the browser shortly after the server boots.
( sleep 3 && open "http://localhost:8788" ) &
# npx fetches wrangler on first run; serves static files + the /functions API.
npx --yes wrangler@latest pages dev . --port 8788 --compatibility-date=2024-11-01
