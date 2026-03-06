# /about — derived UI spec

Depends-on: `design/derived/states/app__layout-bento.md`

---

## 목적
- 디자이너 신뢰 확보 + 매장 정보 제공

---

## 섹션 구성(Bento)

### 1) Designer Profile (L)
- Slot: `L`
- Content: 프로필 사진 + 소개 + 경력/강점 + Instagram link
- Instagram link opens external page with safe rel attributes
- Admin can edit profile text and Instagram URL

### 2) Policies (M)
- Slot: `M`
- Content: 예약/취소/지각 정책(짧게)

### 3) Location Detail (L)
- Slot: `L`
- Content: 지도(네이버) + 주소/주차/대중교통 안내
- Naver map link opens in new tab with rel safety attributes
