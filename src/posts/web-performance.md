---
title: "웹 성능 최적화: Core Web Vitals 개선하기"
date: "2024-04-05"
category: "Performance"
---

Google의 Core Web Vitals는 사용자 경험을 측정하는 핵심 지표입니다. LCP, FID, CLS를 개선하는 실전 방법들을 알아봅니다.

&nbsp;

## Core Web Vitals 이해하기

### LCP (Largest Contentful Paint)
페이지의 가장 큰 콘텐츠가 렌더링되는 시간. **2.5초 이내**가 좋음.

### FID (First Input Delay)
사용자의 첫 입력에 대한 응답 시간. **100ms 이내**가 좋음.

### CLS (Cumulative Layout Shift)
레이아웃 변동 점수. **0.1 이하**가 좋음.

&nbsp;

## LCP 개선 방법

1. **이미지 최적화**: WebP/AVIF 포맷 사용, 적절한 크기
2. **서버 응답 시간 단축**: CDN 활용, 캐싱
3. **렌더링 블로킹 리소스 제거**: Critical CSS 인라인
4. **프리로드**: `<link rel="preload">`로 중요 리소스 미리 로드

&nbsp;

## CLS 개선 방법

1. **이미지에 width/height 명시**
2. **폰트 로딩 최적화**: `font-display: swap`
3. **동적 콘텐츠에 공간 예약**
4. **애니메이션에 transform 사용**

&nbsp;

## 측정 도구

- **Lighthouse**: Chrome DevTools 내장
- **PageSpeed Insights**: 실제 사용자 데이터 포함
- **Web Vitals Extension**: 실시간 모니터링

&nbsp;

## Next.js에서의 최적화

```javascript
import Image from 'next/image';

// 자동 이미지 최적화
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority
/>
```

&nbsp;

---

성능 최적화는 SEO와 사용자 경험 모두에 영향을 미칩니다. 정기적으로 측정하고 개선해나가세요!
