#!/bin/sh
set -e

# Generate runtime-config.js from environment variables so the SPA can read
# backend URL at container start without rebuilding.
OUT="/usr/share/nginx/html/runtime-config.js"
BASE="${RUNTIME_API_URL:-${VITE_API_URL:-}}"
if [ -n "$BASE" ] && ! echo "$BASE" | grep -qE '^https?://'; then
  BASE="https://$BASE"
fi
echo "// runtime-config generated at container start" > "$OUT"
if [ -n "$BASE" ]; then
  echo "window.__FF_API_BASE__ = '$BASE';" >> "$OUT"
  echo "window.__RUNTIME_API_BASE__ = '$BASE';" >> "$OUT"
else
  echo "window.__FF_API_BASE__ = '';" >> "$OUT"
  echo "window.__RUNTIME_API_BASE__ = '';" >> "$OUT"
fi
echo "// runtime-config: using backend='$BASE'"

exec nginx -g 'daemon off;'
