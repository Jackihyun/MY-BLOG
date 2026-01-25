---
title: "Tailwind CSS 베스트 프랙티스와 생산성 팁"
date: "2024-03-18"
category: "CSS"
---

Tailwind CSS는 유틸리티 퍼스트 CSS 프레임워크로, 올바르게 사용하면 개발 생산성을 크게 높일 수 있습니다. 실무에서 검증된 베스트 프랙티스를 공유합니다.

&nbsp;

## 1. 컴포넌트 추출 시점

클래스가 반복될 때 컴포넌트로 추출하세요.

```jsx
// Before: 반복되는 버튼 스타일
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Button 1
</button>

// After: 컴포넌트로 추출
const Button = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
    {children}
  </button>
);
```

&nbsp;

## 2. @apply는 신중하게

`@apply`는 CSS 파일 크기를 증가시킵니다. 가능하면 컴포넌트 추출을 권장합니다.

&nbsp;

## 3. 커스텀 디자인 시스템

`tailwind.config.js`에서 디자인 토큰을 정의하세요.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        }
      }
    }
  }
}
```

&nbsp;

## 4. 반응형 디자인

모바일 퍼스트로 작성하고, 큰 화면에서 스타일을 추가합니다.

```html
<div className="text-sm md:text-base lg:text-lg">
  반응형 텍스트
</div>
```

&nbsp;

## 5. 유용한 플러그인

- `@tailwindcss/typography`: 마크다운 스타일링
- `@tailwindcss/forms`: 폼 요소 기본 스타일
- `tailwind-merge`: 클래스 충돌 해결

&nbsp;

## 6. 클래스 정렬

Prettier 플러그인으로 클래스 순서를 자동 정렬하세요.

```bash
npm install -D prettier-plugin-tailwindcss
```

&nbsp;

---

Tailwind를 잘 활용하면 일관된 디자인 시스템을 유지하면서도 빠르게 UI를 구축할 수 있습니다!
