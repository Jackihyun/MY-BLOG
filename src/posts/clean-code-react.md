---
title: "클린 코드 React: 가독성 높은 컴포넌트 작성법"
date: "2023-11-15"
category: "React"
---

좋은 React 코드는 읽기 쉽고, 유지보수하기 쉬워야 합니다. 실무에서 적용할 수 있는 클린 코드 패턴들을 알아봅니다.

&nbsp;

## 1. 컴포넌트 분리 원칙

하나의 컴포넌트는 하나의 역할만 수행해야 합니다.

```jsx
// Bad: 너무 많은 책임
function UserProfile() {
  // 데이터 페칭, 폼 처리, UI 렌더링 모두 처리
}

// Good: 역할 분리
function UserProfile() {
  const user = useUser();
  return <UserProfileView user={user} />;
}
```

&nbsp;

## 2. Props 정리하기

### 구조 분해 할당 활용

```jsx
// Bad
function Card(props) {
  return <div>{props.title}</div>;
}

// Good
function Card({ title, description, onClick }) {
  return <div onClick={onClick}>{title}</div>;
}
```

### Props가 많으면 객체로

```jsx
// Bad: 너무 많은 props
<UserCard name={name} email={email} avatar={avatar} role={role} />

// Good: 객체로 전달
<UserCard user={user} />
```

&nbsp;

## 3. 조건부 렌더링 정리

```jsx
// Bad: 중첩된 삼항 연산자
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : null}

// Good: Early return
if (isLoading) return <Spinner />;
if (error) return <Error />;
if (!data) return null;
return <Content data={data} />;
```

&nbsp;

## 4. Custom Hooks로 로직 분리

```jsx
// Bad: 컴포넌트에 로직이 섞임
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  // 복잡한 페칭 로직...
}

// Good: Hook으로 분리
function ProductList() {
  const { products, loading, error } = useProducts();
  // UI만 담당
}
```

&nbsp;

## 5. 명확한 네이밍

- 컴포넌트: **PascalCase** (UserProfile, ProductCard)
- 함수: **동사**로 시작 (fetchUser, handleClick)
- Boolean: **is/has/should** 접두사 (isLoading, hasError)
- 이벤트 핸들러: **handle** 접두사 (handleSubmit)

&nbsp;

---

클린 코드는 미래의 나와 팀원을 위한 배려입니다. 오늘 작성한 코드를 3개월 후에도 이해할 수 있게 작성하세요!
