#!/bin/sh
set -eu

CONFIG_PATH="/usr/share/nginx/html/env.js"

cat > "$CONFIG_PATH" <<EOF
window.APP_CONFIG = {
  ENV: "${APP_ENV:-unknown}",
  TOKEN: "${APP_TOKEN:-}",
  API_URL: "${APP_URL:-}"
};
EOF

echo "[40-write-app-env] wrote $CONFIG_PATH (ENV=${APP_ENV:-unknown})"
