---
title: "Next.js 14 App Router 마이그레이션 가이드"
date: "2024-06-20"
category: "Next.js"
---

Next.js 13부터 도입된 App Router는 React Server Components를 기반으로 한 새로운 라우팅 시스템입니다. 이 글에서는 Pages Router에서 App Router로의 마이그레이션 방법을 알아봅니다.

&nbsp;

## App Router의 핵심 변화

### 1. 파일 기반 라우팅 구조

```
app/
  page.tsx        # / 경로
  layout.tsx      # 공통 레이아웃
  about/
    page.tsx      # /about 경로
  posts/
    [id]/
      page.tsx    # /posts/:id 동적 경로
```

&nbsp;

### 2. 서버 컴포넌트가 기본

App Router에서는 모든 컴포넌트가 기본적으로 서버 컴포넌트입니다. 클라이언트 기능이 필요한 경우 `'use client'` 지시어를 사용합니다.

&nbsp;

### 3. 데이터 페칭 방식 변경

`getServerSideProps`, `getStaticProps` 대신 컴포넌트 내에서 직접 `async/await`를 사용합니다.

&nbsp;

## 마이그레이션 체크리스트

- [ ] `pages` 폴더를 `app` 폴더로 변경
- [ ] `_app.tsx`를 `layout.tsx`로 변환
- [ ] `getServerSideProps`를 서버 컴포넌트로 변환
- [ ] 클라이언트 상호작용이 필요한 컴포넌트에 `'use client'` 추가
- [ ] `next/router`를 `next/navigation`으로 변경

&nbsp;

## 주의사항

- 서버 컴포넌트에서는 `useState`, `useEffect` 등 클라이언트 Hook 사용 불가
- 기존 라이브러리 호환성 확인 필요
- 점진적 마이그레이션 권장

&nbsp;

App Router는 성능과 개발자 경험을 크게 향상시킵니다. 새 프로젝트라면 App Router로 시작하는 것을 추천합니다!
