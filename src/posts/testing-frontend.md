---
title: "프론트엔드 테스트 전략: 무엇을, 어떻게 테스트할 것인가"
date: "2023-12-08"
category: "Testing"
---

프론트엔드 테스트는 어렵게 느껴질 수 있습니다. 하지만 올바른 전략을 세우면 효율적으로 코드 품질을 보장할 수 있습니다.

&nbsp;

## 테스트 피라미드

```
        /\
       /  \   E2E (적게)
      /----\
     /      \  통합 테스트
    /--------\
   /          \ 유닛 테스트 (많이)
  /____________\
```

&nbsp;

## 1. 유닛 테스트 (Jest + Testing Library)

개별 함수나 컴포넌트를 테스트합니다.

```javascript
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('버튼이 올바르게 렌더링된다', () => {
  render(<Button>클릭</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('클릭');
});
```

&nbsp;

## 2. 통합 테스트

여러 컴포넌트가 함께 동작하는지 테스트합니다.

```javascript
test('폼 제출이 올바르게 동작한다', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText('이메일'), 'test@test.com');
  await userEvent.click(screen.getByRole('button', { name: '로그인' }));

  expect(await screen.findByText('환영합니다')).toBeInTheDocument();
});
```

&nbsp;

## 3. E2E 테스트 (Playwright/Cypress)

실제 브라우저에서 사용자 시나리오를 테스트합니다.

```javascript
test('로그인 플로우', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

&nbsp;

## 무엇을 테스트할까?

**테스트해야 할 것**
- 비즈니스 로직
- 사용자 인터랙션
- 에러 처리
- 접근성

**테스트하지 않아도 될 것**
- 구현 세부사항
- 라이브러리 내부
- 스타일 (시각적 테스트는 별도)

&nbsp;

---

100% 커버리지보다 중요한 건 올바른 테스트를 작성하는 것입니다. 사용자 관점에서 테스트하세요!
