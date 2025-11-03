#!/bin/sh
set -e

# Create a runtime-config.js file from environment variables so the built SPA
# can read backend URL at runtime without rebuilding.

OUT="/usr/share/nginx/html/runtime-config.js"

# Prefer RUNTIME_API_URL, fall back to VITE_API_URL
BASE="${RUNTIME_API_URL:-${VITE_API_URL:-}}"

# Normalize: if it's not empty and missing http(s) prefix, prefix with https://
if [ -n "$BASE" ] && ! echo "$BASE" | grep -qE '^https?://'; then
  BASE="https://$BASE"
fi

echo "// runtime-config generated at container start" > "$OUT"
if [ -n "$BASE" ]; then
  # export both variables the app may check
  echo "window.__FF_API_BASE__ = '$BASE';" >> "$OUT"
  echo "window.__RUNTIME_API_BASE__ = '$BASE';" >> "$OUT"
else
  # ensure the variables are defined to avoid undefined checks in app
  echo "window.__FF_API_BASE__ = '';" >> "$OUT"
  echo "window.__RUNTIME_API_BASE__ = '';" >> "$OUT"
fi

echo "// runtime-config: using backend='$BASE'"

# Exec nginx so signals are forwarded correctly
exec nginx -g 'daemon off;'
