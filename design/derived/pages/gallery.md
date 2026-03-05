# /gallery — derived UI spec

Depends-on: `design/derived/states/app__layout-bento.md`

---

## 목적
- 스타일 결과물 시각 증명(신뢰/전환)

---

## 그리드 규칙
- Mobile: 2열(카드 폭이 충분하면)
- Desktop: 3–4열
- Bento 슬롯 혼합 허용: S/M/L (단, 관리/정렬 UX를 해치지 않게 “셀 단위”는 명확히)

---

## 카드 구성
- GalleryItemCard:
  - 이미지(cover)
  - 오버레이: 태그/카테고리(선택), 촬영/시술명(선택)
  - 클릭: 라이트박스(선택) 또는 상세(선택)

---

## 상태
- loading: SkeletonCard grid
- empty: “갤러리 준비중” + 스타일 보기 CTA(`/styles`)
