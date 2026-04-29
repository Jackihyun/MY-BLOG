#!/usr/bin/env bash

set -euo pipefail

DOMAIN="${1:-blog.jackihyun.com}"
API_ORIGIN="https://${DOMAIN}"
LOCAL_API="http://127.0.0.1:8081"
LOCAL_WEB="http://127.0.0.1:3000"

check_required_url() {
  local label="$1"
  local url="$2"
  local attempts="${3:-20}"
  local delay="${4:-2}"
  local code

  for _ in $(seq 1 "$attempts"); do
    code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" =~ ^[23] ]]; then
      printf "%s : %s\n" "$label" "$code"
      return 0
    fi
    sleep "$delay"
  done

  printf "%s : %s\n" "$label" "$code"
  return 1
}

check_optional_url() {
  local label="$1"
  local url="$2"
  local code

  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  printf "%s : %s\n" "$label" "$code"
}

echo "== service status =="
sudo systemctl status jackblog-api --no-pager -l | sed -n '1,12p'
sudo systemctl status jackblog-frontend --no-pager -l | sed -n '1,12p'
sudo systemctl status caddy --no-pager -l | sed -n '1,12p'

echo
echo "== local health =="
check_required_url "local web /" "${LOCAL_WEB}/"
check_required_url "local api /api/posts" "${LOCAL_API}/api/posts"
check_required_url "local api /api/category-tree" "${LOCAL_API}/api/category-tree"
check_optional_url "local api /api/visitors/stats" "${LOCAL_API}/api/visitors/stats"

echo
echo "== external health =="
check_required_url "external /" "${API_ORIGIN}/"
check_required_url "external /api/posts" "${API_ORIGIN}/api/posts"
check_required_url "external /api/category-tree" "${API_ORIGIN}/api/category-tree"
check_optional_url "external /api/visitors/stats" "${API_ORIGIN}/api/visitors/stats"
check_optional_url "external /api/auth/session" "${API_ORIGIN}/api/auth/session"

echo
echo "OK: deploy checks passed"
