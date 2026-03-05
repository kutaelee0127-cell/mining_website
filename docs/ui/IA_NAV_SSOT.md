# IA_NAV_SSOT — 미닝(mining) 운정점 웹사이트 Navigation & IA (SSOT)

이 문서는 **라우팅/내비게이션/화면 상태(loading/empty/error/forbidden)** 의 단일 진실 원천(SSOT)입니다.  
구현은 반드시 이 문서의 경로/구조를 1:1로 따라야 하며, 임의의 라우트 추가/변경은 변경 프로세스를 거칩니다.
## 디자인 시스템(SSOT)
- 기본 레이아웃 언어: **Bento Grid**
- SSOT: `design/derived/states/app__layout-bento.md` 및 `design/derived/pages/*.md`
- Figma/이미지 시안은 근거로 인정하지 않음(구현 가능한 텍스트 스펙만 인정)


우선순위(강 → 약):
1) `openapi/openapi.yaml` (API 계약 SSOT)
2) `docs/ui/IA_NAV_SSOT.md` (이 문서)
3) `docs/ui/COPY_KEYS_SSOT.md` (카피/i18n 키)
4) 기타 UI 구현물

---

## 0) 전제(권한/테마/언어)

### 0.1 권한 레벨
- Visitor: READ-ONLY
- Admin: CRUD + Rollback(되돌리기)

### 0.2 테마
- `dark` 기본
- 사용자 토글로 `light` 전환 가능(기본은 로컬 스토리지 저장; 서버 저장은 TBD)

### 0.3 언어
- 기본 `ko-KR`
- 지원 `en-US`
- 전환은 UI 토글로 가능(기본은 로컬 스토리지; 서버 저장은 TBD)

---

## 1) Global Layout (Web)

### 1.1 Desktop / Tablet (>= 768px)
- Top Navigation (sticky):
  - 좌측: 로고(홈으로)
  - 가운데: 메뉴(메인/소개/갤러리/스타일/리뷰/예약)
  - 우측: 언어 토글 / 테마 토글 / (관리자 로그인 상태면) 편집 모드 토글
- CTA:
  - “예약”은 메뉴 내 항목 + 우측 보조 CTA 버튼(스크롤 시에도 노출) 권장
- Footer:
  - 주소/연락처/영업시간(가능하면)
  - 외부 링크(인스타, 네이버 지도, 네이버 예약)

### 1.2 Mobile (< 768px)
- Top bar:
  - 좌측: 로고
  - 우측: 메뉴(햄버거) + 예약 CTA(아이콘/버튼)
- Mobile menu(오버레이):
  - 동일 메뉴 항목
- 하단 고정 CTA(권장):
  - “예약” 버튼(스크롤 깊어져도 전환 유도)

---

## 2) Route Tree (정규 경로 SSOT)

> 주의: API 경로(`/api/*`)와 충돌 방지를 위해 UI 라우트는 `/api`를 사용하지 않는다.  
> Admin 전용 UI는 `/__admin/*` 네임스페이스를 사용한다(메뉴 노출 없음).

### 2.1 Public Routes (방문자 노출)
- `/` : 메인(Home)
- `/about` : 소개(디자이너 프로필 + 매장 위치)
- `/gallery` : 갤러리
- `/styles` : 스타일(이미지 + 가격 정보)
- `/reviews` : 리뷰
- `/booking` : 예약(네이버 스토어 링크 안내 + 이동)

### 2.2 Hidden Auth Routes (메뉴 비노출, 주소로만 접근)
- `/__admin/login` : 관리자 로그인(숨김)
- `/__admin/setup` : 최초 1회 관리자 생성(필요 시에만 노출; `GET /setup/status` 결과에 따름)

### 2.3 Admin Routes (관리자만 표시/접근)
- `/__admin/revisions` : 되돌리기(변경 이력 목록)
- `/__admin/revisions/:revisionId` : 되돌리기 상세(스냅샷/복원 실행)

> 관리자 편집은 “별도 관리자 페이지에서만”이 아니라,
> **각 공개 페이지(`/`, `/about`, ...)** 에서 로그인 상태일 때 “편집 모드”로 진입 가능해야 한다.

---

## 3) Navigation Spec (메뉴)

### 3.1 Public Top Nav (순서 고정)
1) `nav.home` → `/`
2) `nav.about` → `/about`
3) `nav.gallery` → `/gallery`
4) `nav.styles` → `/styles`
5) `nav.reviews` → `/reviews`
6) `nav.booking` → `/booking`

### 3.2 Admin-only Nav (노출 조건: admin 로그인 + 편집 모드)
- `nav.rollback` → `/__admin/revisions`
- `action.logout` → (API: `POST /auth/logout`)

### 3.3 Login 항목(금지)
- 공개 메뉴/푸터 어디에도 “로그인” 링크를 노출하지 않는다.
- `/__admin/login`은 “주소를 아는 관리자만” 접근하도록 설계하되, 보안은 인증으로 보장한다.

---

## 4) Page Composition & Required States

모든 페이지는 아래 4 상태를 반드시 포함한다:
- loading: 스켈레톤/플레이스홀더
- empty: 데이터가 0개일 때(갤러리/리뷰/스타일)
- error: 네트워크/서버 오류
- forbidden: (관리자 전용 페이지에서) 401/403 시

### 4.1 `/` (Home)
- 목적: 첫 인상 + 즉시 예약 전환
- 구성(권장):
  - Hero(강한 비주얼 + 한 줄 메시지 + 예약 CTA)
  - Highlights(3~6개)
  - Featured styles(선택)
  - Reviews highlight(선택)
  - Location teaser(선택: 버튼으로 /about 이동)
- 상태:
  - loading: hero skeleton + highlights skeleton
  - error: 재시도 버튼 + 예약 CTA는 유지(가능하면)
  - empty: highlights 없으면 섹션 숨김(레이아웃 깨짐 금지)

### 4.2 `/about`
- 목적: 신뢰(디자이너) + 접근성(위치)
- 구성:
  - Brand story
  - Designer profiles(인스타 링크)
  - Location block(네이버 지도 버튼)
- 상태:
  - empty: 디자이너 0이면 “준비 중” 메시지 + 예약 CTA 유지

### 4.3 `/gallery`
- 목적: 스타일/감성 증명(사진)
- 구성:
  - Grid(모바일 2열, 데스크탑 3~4열)
  - (옵션) 태그 필터 chips
  - (옵션) featured 섹션
- 상태:
  - empty: “갤러리 준비 중” 메시지 + 예약 CTA
  - error: 재시도 + fallback(예약 CTA/인스타 링크)

### 4.4 `/styles`
- 목적: 가격 정보 제공 + 시술 선택 도와 전환
- 구성:
  - Category tabs
  - Style cards(이미지/설명/가격)
- 상태:
  - empty: “가격표 준비 중” 메시지 + 예약 CTA

### 4.5 `/reviews`
- 목적: 신뢰 확보
- 구성:
  - Review cards list
  - (옵션) 출처 링크(네이버/인스타)
- 상태:
  - empty: “리뷰 준비 중” 메시지 + 예약 CTA

### 4.6 `/booking`
- 목적: 네이버 스토어 예약으로 안전하게 전환
- 구성:
  - 짧은 안내문(외부 페이지 이동)
  - Primary CTA: “네이버에서 예약하기”
  - Secondary: 지도 보기 / 인스타 보기
- 상태:
  - error: 링크 데이터 로드 실패 시 “기본 예약 링크”로 degrade(TBD: env fallback)

### 4.7 `/__admin/login` (Hidden)
- 목적: 관리자 인증
- 구성:
  - username/password
  - 로그인 실패 메시지
- 상태:
  - forbidden: 해당 없음(여기는 public이지만 실패 시 401)
  - error: 네트워크 오류 표시

### 4.8 `/__admin/revisions` (Admin)
- 목적: 변경 이력 확인 및 롤백
- 구성:
  - 시간순 리스트(최신 먼저)
  - 필터(entity_type/page)
  - 각 항목: 시간 + 요약 + 대상
- 상태:
  - forbidden: 401/403 시 로그인 안내(단, 로그인 링크는 “텍스트”로만, 내비에 넣지 않음)
  - empty: “변경 이력이 없습니다.”

---

## 5) IA 충돌 검증 및 해결

### 5.1 라우트 충돌 방지
- UI: `/`, `/about`, `/gallery`, `/styles`, `/reviews`, `/booking`, `/__admin/*`
- API: `/api/*` (서버 라우팅/프록시에서 분리)
- 정적 파일: `/assets/*` 또는 `/uploads/*` (TBD, 서버 설정에 따름)

### 5.2 보안/노출 충돌
- “숨김 로그인”은 보안이 아니라 UX 요구이므로:
  - 인증 실패(401/403) 처리는 API 기반으로 확실히 처리
  - 관리자 전용 라우트는 반드시 auth guard 적용

---

## 6) 변경 프로세스(필수)
내비/라우트 변경 시:
1) ADR 작성 (`docs/ADR/` — TBD: repo에 ADR 폴더 생성)
2) 이 문서(`IA_NAV_SSOT.md`) 수정
3) `COPY_KEYS_SSOT.md` 동기화(메뉴/타이틀 키)
4) OpenAPI(필요 시) 및 UI 구현 반영 + evidence

끝.
