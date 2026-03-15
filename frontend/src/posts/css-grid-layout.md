---
title: "CSS Grid 마스터하기: 복잡한 레이아웃도 쉽게"
date: "2023-10-20"
category: "CSS"
---

CSS Grid는 2차원 레이아웃을 위한 강력한 도구입니다. Flexbox와 함께 사용하면 어떤 레이아웃도 구현할 수 있습니다.

&nbsp;

## Grid vs Flexbox

- **Flexbox**: 1차원 (행 OR 열)
- **Grid**: 2차원 (행 AND 열)

둘 다 알아야 하고, 상황에 맞게 사용해야 합니다.

&nbsp;

## Grid 기본 문법

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}
```

&nbsp;

## 핵심 속성들

### 1. grid-template-columns/rows

```css
/* 고정 크기 */
grid-template-columns: 200px 200px 200px;

/* 비율 */
grid-template-columns: 1fr 2fr 1fr;

/* 반복 */
grid-template-columns: repeat(3, 1fr);

/* 자동 채우기 */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

&nbsp;

### 2. grid-area로 영역 지정

```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

&nbsp;

### 3. 아이템 배치

```css
.item {
  grid-column: 1 / 3;  /* 1번 라인부터 3번 라인까지 */
  grid-row: 1 / 2;
}

/* 또는 span 사용 */
.item {
  grid-column: span 2;  /* 2칸 차지 */
}
```

&nbsp;

## 실전 예제: 대시보드 레이아웃

```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

.nav { grid-column: 1 / -1; }
.sidebar { grid-row: 2; }
.content { grid-row: 2; }
```

&nbsp;

## 반응형 Grid

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

이 한 줄로 반응형 갤러리가 완성됩니다!

&nbsp;

---

Grid를 익히면 복잡한 레이아웃도 직관적으로 구현할 수 있습니다. Flexbox와 함께 마스터하세요!
