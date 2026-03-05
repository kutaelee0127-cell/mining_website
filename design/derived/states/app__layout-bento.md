# Bento Grid Layout System (SSOT, derived)

Status: FINAL  
Owner: UI/FE implementation  
Applies to: `/`, `/about`, `/gallery`, `/styles`, `/reviews` (public) + `/__admin/*` (admin)

이 문서는 이 프로젝트의 기본 레이아웃 언어를 **Bento Grid**로 고정한다.  
Figma/이미지 시안은 근거로 인정하지 않으며, 구현 가능한 텍스트 스펙만 SSOT로 사용한다.

---

## 1) Grid breakpoints

- Mobile: `4 cols`, `gap 12–16`
- Tablet: `8 cols`, `gap 16`
- Desktop: `12 cols`, `gap 16–24`

규칙:
- 콘텐츠는 **col-span + row-span 슬롯**으로 배치한다.
- 그리드 외곽에는 page padding을 유지한다 (mobile 16, tablet 24, desktop 32).

---

## 2) Bento Card 규격

### 2.1 공통
- radius: `2xl`(큰 곡률)
- border: subtle(1px, surface 대비)
- shadow: default는 약하게, hover에서 한 단계만 상승
- background: `surface` (다크/라이트 토큰에 따라 변환)

### 2.2 Card 슬롯(사이즈)
- `S`: (col 2, row 1) — 작은 KPI/배지/CTA
- `M`: (col 4, row 1) — 정보 카드/짧은 리스트
- `L`: (col 4, row 2) — 이미지+텍스트
- `XL`: (col 6, row 2) — Hero/핵심 섹션

구현은 반응형에서 col-span이 변경될 수 있으나, **의도된 정보량(밀도)**는 유지한다.

---

## 3) States(상태) 패턴

모든 페이지/섹션은 아래 상태를 동일한 UI 패턴으로 제공한다.

- `loading`: SkeletonCard 사용(동일 슬롯 크기)
- `empty`: EmptyCard(짧은 설명 + CTA)
- `error`: ErrorCard(요약 + 재시도 버튼)
- `forbidden`: ForbiddenCard(관리자 전용에서만 사용)

---

## 4) 이미지 규칙

- 모든 카드 썸네일은 `object-fit: cover`
- 로딩/오류 시 placeholder 제공
- lazy-load 기본 ON
- 갤러리/스타일은 “초점(중앙)” 기본, 필요 시 focal 옵션 허용

---

## 5) 접근성/모션

- focus ring 필수
- 자동 슬라이드/과도한 모션 금지(필요 시 사용자가 끌 수 있어야 함)
