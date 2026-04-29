# SEO Slug Migration

기존 `post-숫자` URL을 의미 있는 URL로 바꾸는 운영 절차입니다.

## 대상

| Old slug | New slug | Title |
| --- | --- | --- |
| `post-1775743007845` | `event-loop` | 이벤트 루프? |
| `post-1775458763748` | `execution-context` | 실행 컨텍스트란? |
| `post-1773710473028` | `object-literal` | 객체 리터럴 |
| `post-1773710420355` | `type-conversion-short-circuit` | 타입 변환과 단축 평가 |
| `post-1773710298845` | `operators` | 연산자 |
| `post-1773710193086` | `data-types` | 데이터 타입 |
| `post-1773709982254` | `expression-and-statement` | JS - 표현식과 문 |
| `js` | `javascript-variables` | JS에서의 변수 |
| `2026` | `the-glow-2026` | 더 글로우 2026 갔다옴. |
| `post-1773126868662` | `toeic-speaking-ih` | 토익스피킹 자랑 |
| `test` | `cat-ddungi` | 고양이 자랑~ |

## 서버에서 실행

```bash
cd /root/servers/MY-BLOG
git pull --ff-only origin main

sudo mkdir -p /opt/jackblog/backups
TS=$(date +%Y%m%d-%H%M%S)
cp /opt/jackblog/shared/jackblog.db "/opt/jackblog/backups/jackblog-before-slug-migration-${TS}.db"

sqlite3 /opt/jackblog/shared/jackblog.db < scripts/seo-slug-migration.sql
sqlite3 /opt/jackblog/shared/jackblog.db "select slug, title from post order by published_at desc;"

sudo systemctl restart jackblog-api jackblog-frontend
./scripts/deploy-check.sh blog.jackihyun.com
```

## 확인할 URL

```bash
curl -I https://blog.jackihyun.com/posts/event-loop
curl -I https://blog.jackihyun.com/posts/execution-context
curl -I https://blog.jackihyun.com/sitemap.xml
```

## 주의

이 SQL은 글의 `id`를 바꾸지 않고 `slug`만 바꿉니다. 그래서 댓글, 좋아요, 조회수처럼 글 `id`에 연결된 데이터는 유지됩니다.

기존 URL을 외부에 이미 공유했다면, DB 변경 후 old URL에서 new URL로 가는 301 redirect를 추가하는 것이 좋습니다.
