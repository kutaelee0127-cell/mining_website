# / (Home) — derived UI spec

Depends-on: `design/derived/states/app__layout-bento.md`

---

## 목적
- 첫 인상 + 신뢰 + 즉시 예약 전환(CTA)

---

## 섹션 구성(Bento)

### 1) Hero (XL)
- Slot: `XL`
- Content: 배경 이미지 + 한 줄 메세지 + Primary CTA(예약)
- Secondary: 위치/영업시간/디자이너 이름(간단)

### 2) Highlights (S/M mix)
- Slot: `S` x 4–6 (모바일에서는 2열)
- Content 후보:
  - “1:1 디자이너”
  - “예약 1분”
  - “리뷰 평점”
  - “위치/주차”
- 각 카드에는 짧은 라벨 + 아이콘(선택)

### 3) Featured Styles (L)
- Slot: `L` x 2–3
- Content: 대표 스타일(이미지 + 가격 + 태그)
- Click → `/styles` 필터 적용(가능하면)

### 4) Review Teaser (M/L)
- Slot: `M` 또는 `L`
- Content: 최신 1–2개 리뷰 요약 + “리뷰 더보기”

### 5) Location Teaser (M)
- Slot: `M`
- Content: 지도 링크(네이버 지도) + 주소 + 길찾기 CTA
