# Contabo Clean Redeploy Guide

이 가이드는 `blog.jackihyun.com`을 "처음부터" 다시 올릴 때 사용하는 절차입니다.

핵심 목표:
- 레거시 마이그레이션 글 제거
- DB 기반 실제 작성 글만 유지
- 프론트/백엔드 배포 구조 단순화

## 0) 작업 전 원칙

- 운영 서버에서 바로 삭제하지 말고 반드시 백업 먼저 수행
- 레거시 fallback은 비활성화 유지 (`NEXT_PUBLIC_ENABLE_LEGACY_FILE_POSTS=false`)
- 배포 후 체크는 `scripts/deploy-check.sh`로 고정

## 1) 사전 백업 (필수)

서버에서 실행:

```bash
sudo mkdir -p /opt/jackblog/backups
TS=$(date +%Y%m%d-%H%M%S)

# DB 백업
cp "/opt/jackblog/shared/jackblog.db" "/opt/jackblog/backups/jackblog-${TS}.db"

# 업로드 파일 백업
tar -czf "/opt/jackblog/backups/uploads-${TS}.tar.gz" -C "/opt/jackblog/shared" uploads

# 환경 파일 백업
cp "/opt/jackblog/shared/.env.api" "/opt/jackblog/backups/env.api-${TS}.bak"
cp "/opt/jackblog/shared/.env.web" "/opt/jackblog/backups/env.web-${TS}.bak"
```

## 2) 마이그레이션 글 정리

로컬에서 실행 (API 직접 호출):

```bash
# 삭제 대상 확인
cd frontend
API_URL=https://blog.jackihyun.com/api ADMIN_PASSWORD=<admin-password> npm run cleanup:migrated:dry-run

# 실제 삭제
API_URL=https://blog.jackihyun.com/api ADMIN_PASSWORD=<admin-password> npm run cleanup:migrated
```

## 3) 서버 디렉토리 재구성

서버에서 실행:

```bash
sudo mkdir -p /opt/jackblog/{releases,shared}
mkdir -p /opt/jackblog/shared/uploads
sudo chown -R $USER:$USER /opt/jackblog
```

`shared`에는 환경파일과 영구 데이터만 유지:

- `/opt/jackblog/shared/.env.api`
- `/opt/jackblog/shared/.env.web`
- `/opt/jackblog/shared/jackblog.db`
- `/opt/jackblog/shared/uploads/`

예시는 아래 파일 참고:
- `deploy/contabo/.env.api.example`
- `deploy/contabo/.env.web.example`

기존 운영 데이터를 한 번 옮겨야 한다면:

```bash
# 기존 DB가 current/backend 안에 있던 경우
cp /opt/jackblog/current/backend/jackblog.db /opt/jackblog/shared/jackblog.db

# 기존 업로드가 /app/data/uploads 에 있던 경우
cp -R /app/data/uploads/. /opt/jackblog/shared/uploads/
```

## 4) 코드 배포

서버에서:

```bash
cd /opt/jackblog
git clone <your-repo-url> releases/$(date +%Y%m%d-%H%M%S)
cd releases/*

# frontend build
cd frontend
npm ci
npm run build
cd ..

# backend build
cd backend
chmod +x gradlew
./gradlew clean bootJar
```

새 릴리즈를 current로 연결:

```bash
cd /opt/jackblog
LATEST=$(ls -1 releases | sort | tail -n 1)
ln -sfn "/opt/jackblog/releases/${LATEST}" /opt/jackblog/current
```

## 5) systemd / Caddy 설정

서비스 파일 배치:

```bash
sudo cp deploy/contabo/jackblog-api.service /etc/systemd/system/jackblog-api.service
sudo cp deploy/contabo/jackblog-frontend.service /etc/systemd/system/jackblog-frontend.service
sudo systemctl daemon-reload
sudo systemctl enable jackblog-api jackblog-frontend
```

Caddy 설정:

```bash
sudo cp deploy/contabo/Caddyfile /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

## 6) 서비스 기동

```bash
sudo systemctl restart jackblog-api
sudo systemctl restart jackblog-frontend
sudo systemctl status jackblog-api --no-pager
sudo systemctl status jackblog-frontend --no-pager
```

## 7) 배포 검증

서버에서:

```bash
chmod +x scripts/deploy-check.sh
./scripts/deploy-check.sh blog.jackihyun.com
```

확인 포인트:
- `/` 200
- `/api/posts` 200
- `/api/visitors/stats` 200
- `/api/category-tree` 200
- `/api/auth/session` 200 또는 401(구성에 따라)

## 8) 롤백

문제 발생 시:

```bash
cd /opt/jackblog
ln -sfn /opt/jackblog/releases/<previous-release> /opt/jackblog/current
sudo systemctl restart jackblog-api jackblog-frontend
```

DB까지 되돌릴 때:

```bash
cp /opt/jackblog/backups/jackblog-<timestamp>.db /opt/jackblog/shared/jackblog.db
sudo systemctl restart jackblog-api
```

## 9) GitHub Actions 배포(선택)

수동 배포 안정화 후 연결 권장.

동작 방식:
- 서버의 기존 `current`에서 원격 저장소 URL을 읽음
- `/opt/jackblog/releases/<timestamp>`에 새 release clone
- 새 release 안에서 frontend/backend build
- `current` 심볼릭 링크를 새 release로 교체
- systemd 재시작 후 `scripts/deploy-check.sh` 실행
- 오래된 release는 최근 5개만 남기고 정리

필요 secrets:
- `CONTABO_HOST`
- `CONTABO_USER`
- `CONTABO_SSH_KEY`
- `CONTABO_APP_DIR` (예: `/opt/jackblog/current`)

워크플로우 파일: `.github/workflows/deploy-contabo.yml`
