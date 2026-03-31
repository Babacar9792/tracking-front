#!/bin/sh
cat > /usr/share/nginx/html/env.js <<EOF
window.__env = {
  wsUrl: "${WS_URL:-http://localhost:8083/ws}"
};
EOF
exec nginx -g "daemon off;"
