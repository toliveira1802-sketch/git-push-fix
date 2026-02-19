#!/bin/sh
# Injeta runtime env vars no index.html antes de iniciar o nginx
# Permite passar secrets via docker run -e sem hardcodar no codigo

INDEX_FILE=/usr/share/nginx/html/index.html

# Injeta script com variaveis de ambiente antes do </head>
sed -i "s|</head>|<script>\
window.__SUPABASE_URL__='${SUPABASE_URL:-}';\
window.__SUPABASE_ANON_KEY__='${SUPABASE_ANON_KEY:-}';\
window.__ANTHROPIC_API_KEY__='${ANTHROPIC_API_KEY:-}';\
</script></head>|" "$INDEX_FILE"

exec nginx -g 'daemon off;'
