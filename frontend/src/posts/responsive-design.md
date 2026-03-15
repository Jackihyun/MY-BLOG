---
title: "반응형 웹 디자인 완벽 가이드: 모바일 퍼스트 접근법"
date: "2024-01-12"
category: "CSS"
---

반응형 웹 디자인은 더 이상 선택이 아닌 필수입니다. 모바일 트래픽이 전체의 60%를 넘어선 지금, 효과적인 반응형 디자인 전략을 알아봅니다.

&nbsp;

## 모바일 퍼스트란?

작은 화면부터 디자인을 시작하고, 큰 화면으로 확장하는 접근법입니다.

```css
/* 기본: 모바일 스타일 */
.container {
  padding: 1rem;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
  }
}
```

&nbsp;

## 핵심 브레이크포인트

| 이름 | 크기 | 대상 기기 |
|------|------|----------|
| sm | 640px | 큰 폰 |
| md | 768px | 태블릿 |
| lg | 1024px | 노트북 |
| xl | 1280px | 데스크탑 |

&nbsp;

## 유연한 레이아웃

### Grid 시스템

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

### Flexbox 활용

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
```

&nbsp;

## 반응형 이미지

```html
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px"
  src="medium.jpg"
  alt="반응형 이미지"
/>
```

&nbsp;

## 터치 친화적 UI

- 터치 타겟 최소 44x44px
- 충분한 여백 확보
- 호버 상태 대신 포커스 상태 활용

&nbsp;

---

반응형 디자인은 단순히 레이아웃 변경이 아니라, 각 기기에서 최적의 사용자 경험을 제공하는 것입니다!
