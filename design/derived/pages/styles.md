# /styles — derived UI spec

Depends-on: `design/derived/states/app__layout-bento.md`

---

## 목적
- 가격/메뉴를 한 번에 이해 → 예약 전환

---

## 섹션 구성

### 1) Category tabs (sticky)
- 상단 sticky 탭
- 탭 변경 시 목록만 교체(페이지 전환 최소)

### 2) Style cards (M/L)
- Slot: `M` 또는 `L`
- Content: 이미지 + 스타일명 + 설명 + 가격(필수) + 소요시간(선택)

### 3) CTA strip (S/M)
- “예약하기” CTA를 목록 하단/상단에 반복 배치
