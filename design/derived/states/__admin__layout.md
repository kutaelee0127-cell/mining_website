# /__admin/* — state spec (derived)

Depends-on: `design/derived/states/app__layout-bento.md`

---

## 목적
- 관리자 CRUD 조작이 빠르고 실수 여지가 적을 것

---

## 레이아웃
- 좌측: AdminNav (고정)
- 우측: Bento Grid 기반의 편집 패널
- 모든 편집 화면은 **list + detail**로 구성:
  - list: grid/table
  - detail: side panel 또는 modal

---

## 동시성(If-Match)
- detail 열람 시 반드시 `ETag` 확보(단건 GET) → PATCH/DELETE 시 `If-Match` 필수
