---
title: "React에서 API 데이터 페칭: 패턴과 라이브러리 비교"
date: "2023-09-05"
category: "React"
---

프론트엔드에서 데이터 페칭은 필수입니다. useEffect부터 React Query까지, 다양한 데이터 페칭 패턴을 비교해봅니다.

&nbsp;

## 1. 기본 useEffect + fetch

가장 기본적인 방법이지만 많은 보일러플레이트가 필요합니다.

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <List data={users} />;
}
```

&nbsp;

## 2. React Query (TanStack Query)

현재 가장 인기 있는 서버 상태 관리 라이브러리입니다.

```jsx
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <List data={data} />;
}
```

**장점**
- 자동 캐싱 및 중복 요청 제거
- 백그라운드 리페칭
- 낙관적 업데이트
- DevTools 지원

&nbsp;

## 3. SWR

Vercel에서 만든 데이터 페칭 라이브러리입니다.

```jsx
function UserList() {
  const { data, error, isLoading } = useSWR('/api/users', fetcher);
  // ...
}
```

React Query보다 가볍고 간단합니다.

&nbsp;

## 4. Server Components (Next.js)

Next.js App Router에서는 서버에서 직접 데이터를 페칭합니다.

```jsx
// 서버 컴포넌트
async function UserList() {
  const users = await fetch('/api/users').then(res => res.json());
  return <List data={users} />;
}
```

클라이언트 번들 크기가 줄고, 워터폴이 제거됩니다.

&nbsp;

## 어떤 것을 선택할까?

| 상황 | 추천 |
|------|------|
| 간단한 프로젝트 | SWR |
| 복잡한 캐싱 필요 | React Query |
| Next.js 사용 | Server Components + React Query |
| 학습 목적 | useEffect |

&nbsp;

## 공통 고려사항

- **로딩 상태** 처리
- **에러 핸들링**
- **캐싱 전략**
- **재시도 로직**

&nbsp;

---

데이터 페칭은 UX에 직접적인 영향을 미칩니다. 프로젝트에 맞는 도구를 선택하고, 로딩/에러 상태를 잘 처리하세요!
