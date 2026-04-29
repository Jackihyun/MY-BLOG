#!/usr/bin/env bash

set -euo pipefail

DOMAIN="${1:-blog.jackihyun.com}"
API_ORIGIN="https://${DOMAIN}"
LOCAL_API="http://127.0.0.1:8081"
LOCAL_WEB="http://127.0.0.1:3000"

echo "== service status =="
sudo systemctl status jackblog-api --no-pager -l | sed -n '1,12p'
sudo systemctl status jackblog-frontend --no-pager -l | sed -n '1,12p'
sudo systemctl status caddy --no-pager -l | sed -n '1,12p'

echo
echo "== local health =="
curl -fsS -o /dev/null -w "local web / : %{http_code}\n" "${LOCAL_WEB}/"
curl -fsS -o /dev/null -w "local api /api/posts : %{http_code}\n" "${LOCAL_API}/api/posts"
curl -fsS -o /dev/null -w "local api /api/category-tree : %{http_code}\n" "${LOCAL_API}/api/category-tree"
curl -sS -o /dev/null -w "local api /api/visitors/stats : %{http_code}\n" "${LOCAL_API}/api/visitors/stats"

echo
echo "== external health =="
curl -fsS -o /dev/null -w "external / : %{http_code}\n" "${API_ORIGIN}/"
curl -fsS -o /dev/null -w "external /api/posts : %{http_code}\n" "${API_ORIGIN}/api/posts"
curl -fsS -o /dev/null -w "external /api/category-tree : %{http_code}\n" "${API_ORIGIN}/api/category-tree"
curl -sS -o /dev/null -w "external /api/visitors/stats : %{http_code}\n" "${API_ORIGIN}/api/visitors/stats"
curl -sS -o /dev/null -w "external /api/auth/session : %{http_code}\n" "${API_ORIGIN}/api/auth/session"

echo
echo "OK: deploy checks passed"
