#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: VERCEL_TOKEN unset — cannot deploy SAMPLE preview." >&2
  exit 1
fi
npm run build
npx vercel deploy --prod --yes --temporary
