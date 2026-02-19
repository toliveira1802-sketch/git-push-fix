#!/bin/sh
# Injeta runtime env vars no index.html antes de iniciar o nginx
# Isso permite passar secrets via docker run -e sem hardcodar no codigo

INDEX_FILE=/usr/share/nginx/html/index.html

# Injeta script com variaveis de ambiente antes do </head>
sed -i "s|</head>|<script>window.__ANTHROPIC_API_KEY__='${ANTHROPIC_API_KEY:-}';</script></head>|" "$INDEX_FILE"

exec nginx -g 'daemon off;'
