---
title: "TypeScript 실전 팁: 프론트엔드 개발자가 알아야 할 타입 패턴"
date: "2024-05-10"
category: "TypeScript"
---

TypeScript를 사용하면서 자주 마주치는 상황들과 해결 패턴을 정리했습니다. 실무에서 바로 활용할 수 있는 팁들을 소개합니다.

&nbsp;

## 1. 유니온 타입과 타입 가드

```typescript
type ApiResponse =
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };

function handleResponse(response: ApiResponse) {
  if (response.status === 'success') {
    // response.data 사용 가능
  }
}
```

&nbsp;

## 2. Utility Types 활용

TypeScript가 제공하는 유틸리티 타입들을 적극 활용하세요.

- `Partial<T>`: 모든 속성을 선택적으로
- `Required<T>`: 모든 속성을 필수로
- `Pick<T, K>`: 특정 속성만 선택
- `Omit<T, K>`: 특정 속성만 제외

&nbsp;

## 3. 제네릭 활용하기

재사용 가능한 컴포넌트나 함수를 만들 때 제네릭을 사용합니다.

```typescript
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  // ...
}
```

&nbsp;

## 4. const assertion

객체나 배열의 타입을 좁힐 때 유용합니다.

```typescript
const colors = ['red', 'green', 'blue'] as const;
// type: readonly ["red", "green", "blue"]
```

&nbsp;

## 5. 타입 vs 인터페이스

- **interface**: 객체 타입 정의, 확장에 유리
- **type**: 유니온, 튜플 등 복잡한 타입에 유리

일관성 있게 사용하는 것이 중요합니다.

&nbsp;

---

TypeScript는 처음에는 번거롭게 느껴질 수 있지만, 익숙해지면 버그를 미리 방지하고 개발 생산성을 높여줍니다!
