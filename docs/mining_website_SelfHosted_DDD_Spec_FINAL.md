# 미닝(mining) 운정점 — 최신 트렌디 UI 1인 디자이너 예약제 미용실 웹사이트 (Self-hosted)  
문서: DDD Spec (FINAL)  
생성 시각: 2026-03-04 (Asia/Seoul)

> 본 문서는 “미닝(mining) 운정점” 고객 유치를 위한 **미용실 홍보/소개 웹사이트**의 설계(DDD) 기준 문서입니다.  
> 단일 진실 원천(SSOT) 우선순위는 아래와 같습니다:
1) `openapi/openapi.yaml` (API 계약 + 상태/정책 + DB/인덱스: 최상위 SSOT)  
2) `docs/mining_website_SelfHosted_DDD_Spec_FINAL.md` (도메인/정책/기본값 의미 설명)  
3) `docs/ui/IA_NAV_SSOT.md` (라우팅/IA SSOT)  
4) `docs/ui/COPY_KEYS_SSOT.md` (카피/i18n 키 SSOT)

---

## 0. Executive Summary

### 0.1 문제(Problem)
- 지역 기반 미용실(1인 디자이너)에서 **온라인 첫인상**이 곧 방문/예약 전환율에 직결됨.
- 방문자는 “가격/스타일/디자이너 신뢰/위치/리뷰/예약 동선”을 빠르게 판단하며, UI가 올드하면 이탈.
- 운영 관점에서 SNS/사진/가격이 자주 바뀌는데, 외부 개발 도움 없이 **관리자가 직접 수정(CRUD)** 해야 함.

### 0.2 목표(Goals)
- 방문자(읽기 전용)가 접속 즉시 “가보고 싶다/예약하고 싶다”를 느끼도록 **최신 트렌드 UI/UX**로 브랜딩 강화.
- 필수 메뉴 제공:
  - 메인(Home)
  - 소개(디자이너 프로필(인스타 링크), 매장 위치(네이버 지도 링크/연결))
  - 갤러리(사진 업로드)
  - 스타일(이미지 + 가격 정보)
  - 리뷰
  - 예약(네이버 스토어 링크)
  - 로그인(숨김: 주소로만 접근, 메뉴 노출 없음)
  - 되돌리기(관리자만: 변경 이력 시간 요약 + 롤백)
- 권한:
  - 방문자: R(읽기 전용)
  - 관리자: CRUD + 롤백
- 테마:
  - 다크/라이트 지원, **다크 기본**
- 다국어:
  - 한국어/영어(ko-KR/en-US) 지원

### 0.3 비목표(Non-goals / Out of Scope)
- 자체 예약/결제/스케줄링 엔진(네이버 스토어 링크로 대체)
- 방문자 회원가입/리뷰 작성(방문자는 R만)
- 무거운 기술(복잡한 CMS, 대규모 권한/조직, 실시간 협업 편집, 고비용 외부 SaaS 의존)
- 과도한 애니메이션/3D로 인한 성능 저하(“트렌디”는 “빠르고 매끈한 상호작용”을 의미)

### 0.4 MVP 정의(MVP)
MVP는 아래 4가지를 동시에 만족해야 완료로 간주한다:
1) 공개(방문자) UI: Home/About/Gallery/Styles/Reviews/Booking 페이지 완성 (모바일 우선)  
2) 관리자 편집(UI 내): 각 페이지에 편집 진입(수정 버튼) → 텍스트 수정/이미지 업로드/교체/리스트 CRUD 가능  
3) 되돌리기(관리자 전용): 변경 이력(시간 요약) 목록 + 특정 시점으로 복원(롤백)  
4) i18n + 테마: ko/en 전환, 다크/라이트 토글(기본 다크)

### 0.5 비기능 요구사항(NFR)
- 성능:
  - LCP/CLS 개선을 위한 이미지 최적화(리사이즈/압축/지연 로딩)
  - 갤러리 그리드/리스트는 스켈레톤 + 점진 로딩
  - 캐시(ETag/Last-Modified), 정적 에셋 캐시 헤더
- SEO/공유:
  - 메타 태그(OpenGraph), 페이지별 title/description(다국어)
- 접근성:
  - 키보드 탐색, 대비(다크 테마), 이미지 대체텍스트(alt) 관리
- 보안:
  - 관리자 인증(세션/토큰), 로그인 rate limit
  - 파일 업로드 검증(허용 확장자/사이즈, MIME 신뢰 금지)
  - 관리자 기능은 인증 필수, 롤백은 관리자만
- 운영 용이성:
  - self-hosted(단일 서버/컨테이너)로 배포 가능
  - 백업: DB + 업로드 폴더를 주기적 백업(로컬/외장)
  - 설정은 환경변수/관리 UI에서 변경 가능(민감정보는 env)

### 0.6 리스크(Risks)와 대응
- 리스크: “수정 이력/롤백”이 구현 복잡도를 올림  
  - 대응: 모든 변경은 `Revision`으로 스냅샷 저장(append-only), 복원은 “이전 스냅샷을 현재로 적용 + 새 Revision 기록”으로 단순화.
- 리스크: 이미지 업로드 남용/대용량으로 성능 저하  
  - 대응: 업로드 제한(용량/해상도), 서버 리사이즈 파이프라인(옵션), CDN 없이도 캐시 헤더 적용.
- 리스크: Instagram/네이버 등 외부 연동이 정책/토큰 문제로 실패  
  - 대응: 외부 연동은 “옵션 기능”으로 설계. 실패 시 기본 링크로 degrade.
- 리스크: “숨김 로그인 URL”을 보안으로 오해  
  - 대응: 숨김은 UX 요구(메뉴 비노출)일 뿐. **보안은 인증/권한으로 보장**.

### 0.7 운영 전략(Ops Strategy)
- 배포 모델: self-hosted 단일 인스턴스
- 저장소:
  - DB: SQLite(기본) 또는 Postgres(선택)  
  - Media: 로컬 파일시스템(`/data/uploads`) + 메타는 DB
- 백업:
  - DB 파일 + uploads 폴더를 일 단위 스냅샷
- 관측:
  - 요청 ID, 에러 로그, 업로드 실패 로그
- 롤백(운영):
  - UI 기반 롤백 + (선택) 전체 스냅샷 복구(서버 백업)

---

## 1. 도메인 모델(DDD) 설계

### 1.1 Bounded Contexts
1) **Public Site Context (Read Model)**
   - 방문자에게 노출되는 컨텐츠 조회(메인/소개/갤러리/스타일/리뷰/예약)
   - 캐시/ETag 제공
2) **Content Authoring Context (Admin CRUD)**
   - 관리자 편집(UI 내) + 저장
   - 페이지/리스트 아이템 CRUD (갤러리/스타일/리뷰/디자이너 프로필/소개 텍스트/홈 히어로)
3) **Media Library Context**
   - 이미지 업로드/교체/메타(alt text) 관리
   - 파일 검증 및 저장(로컬)
4) **Identity & Access Context**
   - setup(최초 관리자 생성), 로그인/리프레시/로그아웃
   - 관리자 권한(ROLE_ADMIN 고정)
5) **Revision & Rollback Context**
   - 변경 이력(시간 요약) 기록
   - 특정 revision으로 복원(restore)
6) **Integrations Context (Optional)**
   - Instagram feed 캐시/동기화(가능할 때만)
   - 네이버 지도/네이버 스토어는 “링크/임베드” 중심(필수 API 연동 아님)

### 1.2 Context Map (관계)
- Public Site (Downstream) ← Content Authoring (Upstream)
- Public Site (Downstream) ← Media Library (Upstream)
- Content Authoring → Revision & Rollback (항상 revision 생성)
- Content Authoring → Identity & Access (관리자 인증 필요)
- Integrations → Public Site (옵션 데이터 제공, 실패 시 무시)

---

## 2. Aggregate / Entity / Value Object 명세

> 설계 원칙:
- 방문자 쓰기 기능이 없으므로, “읽기 모델 최적화”보다 “운영 편집 안정성/롤백”을 우선한다.
- 모든 변경은 Revision으로 남겨 복구 가능해야 한다.
- 다국어는 구조적으로 “한 필드에 ko/en을 같이 저장” (LocalizedText)하여 누락 시 fallback 가능하게 한다.

### 2.1 Value Objects

#### 2.1.1 LocalizedText
- 정의: `{ "ko-KR": string, "en-US"?: string }`
- 불변 규칙:
  - `"ko-KR"`는 필수(기본 언어)
  - `"en-US"`는 선택(없으면 ko-KR로 fallback)

#### 2.1.2 MoneyKRW
- 정의: `{ amount: integer, currency: "KRW" }`
- 규칙:
  - amount는 0 이상
  - 표시 형식(원화 포맷)은 UI 책임

#### 2.1.3 ExternalLink
- 정의: `{ label: LocalizedText, url: string, open_in_new_tab: boolean }`
- 규칙:
  - url은 https 권장(강제 정책은 TBD)
  - open_in_new_tab 기본 true(외부 링크)

---

### 2.2 Aggregates

#### 2.2.1 SiteSettings (Aggregate Root)
- 목적: 사이트 전역 설정(브랜드/외부 링크/테마 기본값/언어 지원)
- 식별자: singleton (`id = "site"`)
- 주요 속성:
  - `brand_name: LocalizedText` (기본값: "미닝(mining) 운정점")
  - `brand_tagline: LocalizedText` (TBD: 슬로건)
  - `default_theme: "dark" | "light"` (default: dark)
  - `supported_locales: ["ko-KR","en-US"]`
  - `links.booking: ExternalLink` (네이버 스토어)
  - `links.instagram: ExternalLink` (디자이너 인스타)
  - `links.naver_map: ExternalLink` (네이버 지도)
  - `business_hours: LocalizedText` (TBD)
  - `contact_phone: string` (TBD)
  - `address: LocalizedText` (TBD)
  - `location_latlng: { lat: number, lng: number }` (TBD)
- Invariants:
  - default_theme는 supported theme 중 하나여야 함
  - supported_locales는 고정(ko-KR/en-US)

#### 2.2.2 HomePage (Aggregate Root, singleton)
- 목적: 메인 페이지 구성(히어로/소개 요약/대표 스타일/CTA)
- 식별자: singleton (`id="home"`)
- 주요 속성:
  - `hero_title: LocalizedText`
  - `hero_subtitle: LocalizedText`
  - `hero_media_id?: MediaAssetId` (이미지/영상의 경우 확장, MVP는 이미지)
  - `hero_cta_label: LocalizedText` (예: “예약하러 가기”)
  - `highlights: array<Highlight>` (최대 3~6 권장)
- Invariants:
  - highlights 길이 상한(기본 6, SSOT)

#### 2.2.3 AboutPage (Aggregate Root, singleton)
- 목적: 소개 페이지(브랜드 스토리/디자이너/위치)
- 식별자: singleton (`id="about"`)
- 주요 속성:
  - `brand_story: LocalizedText`
  - `designer_intro: LocalizedText`
  - `designer_profile_ids: DesignerProfileId[]` (정렬 포함)
  - `location_block: LocationBlock` (address/map/transport 등)
- Invariants:
  - designer_profile_ids의 순서가 표시 순서

#### 2.2.4 DesignerProfile (Aggregate Root)
- 목적: 디자이너 프로필(1인 디자이너 중심이지만 확장 가능)
- 속성:
  - `display_name: LocalizedText` (TBD: 실명/닉네임)
  - `role_title: LocalizedText` (예: “원장/디자이너”)
  - `bio: LocalizedText`
  - `instagram_url: string`
  - `profile_media_id?: MediaAssetId`
  - `is_primary: boolean` (1인일 경우 true)
  - `sort_order: integer`
- Invariants:
  - is_primary = true 는 최대 1명(정책: 시스템에서 강제)

#### 2.2.5 GalleryItem (Aggregate Root)
- 목적: 갤러리 사진 카드
- 속성:
  - `media_id: MediaAssetId` (필수)
  - `caption: LocalizedText` (선택)
  - `tags: string[]` (선택)
  - `featured: boolean`
  - `published: boolean` (default true)
  - `sort_order?: integer` (선택: 수동 정렬)
- Invariants:
  - media_id 필수
  - tags 최대 개수/길이 제한(SSOT)

#### 2.2.6 StyleItem (Aggregate Root)
- 목적: 스타일/가격 카드(시술 메뉴)
- 속성:
  - `name: LocalizedText` (필수)
  - `description: LocalizedText` (선택)
  - `price: MoneyKRW` (필수)
  - `duration_minutes?: integer` (선택)
  - `media_id?: MediaAssetId` (선택)
  - `category: "CUT" | "COLOR" | "PERM" | "CARE" | "ETC"` (SSOT)
  - `published: boolean` (default true)

#### 2.2.7 ReviewItem (Aggregate Root)
- 목적: 리뷰 카드(수동 큐레이션, 방문자 작성 불가)
- 속성:
  - `author_name: string` (또는 익명)
  - `rating?: integer` (1~5, 선택)
  - `content: LocalizedText` (ko 필수)
  - `source: "MANUAL" | "NAVER" | "INSTAGRAM"` (MVP는 MANUAL 중심)
  - `source_url?: string`
  - `published: boolean` (default true)
- Invariants:
  - rating이 있으면 1~5
  - source_url은 source가 MANUAL이 아닐 때 권장

#### 2.2.8 MediaAsset (Aggregate Root)
- 목적: 업로드 이미지/파일 메타
- 속성:
  - `storage_key: string` (서버 내부 경로/키)
  - `public_url: string` (정적 서빙 URL)
  - `content_type: string`
  - `size_bytes: integer`
  - `width?: integer`, `height?: integer`
  - `alt_text: LocalizedText` (권장)
  - `purpose: "HERO" | "GALLERY" | "STYLE" | "PROFILE" | "MISC"`
- Invariants:
  - 허용 content_type(SSOT allowlist)
  - size_bytes 상한(SSOT)

#### 2.2.9 AdminUser / Session (Aggregate Root)
- AdminUser:
  - `username`, `password_hash`, `display_name?`, `locale_preference`, `created_at`, `last_login_at`
- RefreshSession:
  - `token_hash`, `expires_at`, `revoked_at?`, `rotated_from_id?`, `user_agent?`, `ip?`
- Invariants:
  - username unique
  - refresh token rotation 정책 준수

#### 2.2.10 RevisionEntry (Aggregate Root)
- 목적: 변경 이력(시간 요약) + 롤백 기반
- 속성:
  - `entity_type` (enum)
  - `entity_id` (string)
  - `snapshot_json` (변경 후 스냅샷, 또는 변경 전/후 중 정책 선택: 본 설계는 “변경 후 스냅샷”)
  - `summary: LocalizedText` 또는 string(기본 ko)
  - `diff_stats` (선택: { fields_changed: number, media_changes: number })
  - `actor_admin_user_id`
  - `created_at`
  - `restore_of_revision_id?` (복원으로 생성된 revision이면 원본 id)
- Invariants:
  - RevisionEntry는 immutable(수정 불가)
  - restore는 “스냅샷 적용 + 새 revision 생성”으로만 수행

---

## 3. 핵심 유스케이스(Use Cases)

### 3.1 방문자(Read-only)
1) 홈에서 브랜드/감성/대표 스타일을 보고 예약 CTA 클릭  
2) 소개에서 디자이너 프로필(인스타 링크) 확인  
3) 위치 블록에서 네이버 지도 열기  
4) 갤러리에서 최신 스타일 사진 확인(스크롤/필터는 옵션)  
5) 스타일/가격에서 시술 메뉴와 가격 확인  
6) 리뷰에서 신뢰 확보  
7) 예약 페이지에서 네이버 스토어로 이동

### 3.2 관리자(CRUD + Rollback)
1) 숨김 로그인 URL 접속 → 로그인 성공  
2) 홈 히어로 문구/이미지 수정(업로드/교체)  
3) 갤러리 사진 추가/교체/삭제/정렬  
4) 스타일 항목 추가/가격 수정/숨김 처리  
5) 리뷰 항목 추가/정렬/숨김 처리  
6) 소개(디자이너 프로필/스토리/위치 링크) 수정  
7) “되돌리기” 페이지에서 특정 시점 선택 → 복원 실행  
8) 복원 후 즉시 공개 반영(방문자 페이지에서 확인)

---

## 4. 시스템 정책(권한/멱등성/동시성/복구)

### 4.1 권한(Authorization)
- Public endpoints: 인증 불필요, 읽기만
- Admin endpoints: `ROLE_ADMIN` 필요
- Rollback(Revision restore): `ROLE_ADMIN` 중에서도 동일 권한(추가 분리 없음, 필요 시 TBD)

### 4.2 멱등성(Idempotency)
- 모든 admin mutation(POST/PATCH/PUT/DELETE)은 `Idempotency-Key` 헤더를 지원/권장.
- 서버 정책:
  - 동일 키 + 동일 request_hash → 이전 응답 재사용(200/201 동일 응답)
  - 동일 키 + 다른 request_hash → 409 `IDEMPOTENCY_CONFLICT`
- TTL(기본 24h, SSOT)

#### 4.2.1 파일 업로드 멱등성(권장: SHA-256 기반 중복 체크)
- 대용량 업로드는 헤더 기반 멱등성만으로는 재시도 효율이 낮다(부분 업로드/중복 업로드 판단 불가).
- 클라이언트는 업로드 파일의 `sha256`(hex) 값을 계산해 요청에 포함한다.
- 서버 정책(SSOT: OpenAPI):
  - `GET /admin/media/by-hash/{sha256}`: 동일 해시가 이미 존재하면 200 + 기존 MediaAsset 반환(업로드 생략 가능)
  - `POST /admin/media`: `sha256`가 존재하고 이미 등록된 해시라면 **200 OK**로 기존 MediaAsset 반환(중복 생성 금지)
  - 신규 해시이면 **201 Created**로 새 MediaAsset 생성
- `Idempotency-Key`는 여전히 지원하되, 업로드 중복 방지의 1차 키는 `sha256`로 둔다.

### 4.3 동시성(Optimistic Concurrency)
- 각 Aggregate에는 `version`(정수)을 둔다.
- 업데이트 요청은 `If-Match`(ETag 기반)로 충돌 방지한다.
- 불일치 시 409 `VERSION_CONFLICT`.

#### 4.3.1 ETag(If-Match) 규칙과 획득 경로
- ETag는 엔티티의 `version`에서 파생한다(예: `ETag: W/"<version>"`).
- 관리 UI는 수정 전 아래 중 하나로 ETag를 확보해야 한다:
  - 단건 조회(권장): `GET /admin/<resource>/{id}` 응답 헤더의 `ETag`
  - 리스트 기반(예외): 리스트 응답의 각 아이템에 포함된 `version` 값으로 `If-Match: W/"<version>"` 구성
    - 리스트 응답 헤더의 ETag는 컬렉션 해시일 수 있으므로, 아이템 PATCH에 사용하지 않는다.

### 4.4 실패 복구(Failure Recovery)
- Media 업로드 중단:
  - 업로드가 완료되지 않으면 MediaAsset 생성/참조가 이루어지지 않도록 2단계(업로드→등록)로 설계
- Revision:
  - 스냅샷은 DB 트랜잭션 내에서 entity 업데이트와 함께 저장(원자성)
- Integrations(옵션):
  - Instagram 동기화 실패 시 public feed endpoint는 빈 배열 반환 + UI는 링크로 degrade


### 4.5 삭제/복원 정책(Soft Delete + Restore UPSERT)
- Admin의 `DELETE`는 **하드 삭제가 아니라 소프트 삭제**를 기본 정책으로 한다(`deleted_at` 설정).
- Public 조회는 `deleted_at IS NULL`인 리소스만 노출한다.
- Revision 기반 복원(restore)은 **UPSERT**로 정의한다:
  - 엔티티가 존재하면 snapshot 적용 + `deleted_at=NULL`
  - 엔티티가 (과거 하드 삭제 등으로) 존재하지 않으면 동일 `entity_id`로 Insert 후 snapshot 적용

### 4.6 Revision 보존(Retention) 정책(기본: SQLite)
- SQLite 장기 운영 시 `revisions` 테이블이 무한히 커지는 것을 방지하기 위해 보존 정책을 둔다.
- 기본 정책(SSOT: OpenAPI x-constants):
  - 엔티티당 최신 N개만 유지(권장 기본값: 50)
  - 또는/그리고 일정 기간 초과 리비전 삭제(권장 기본값: 90일)
- 서버는 주기적 정리(job/cron)를 제공한다(예: 1일 1회). SQLite는 정리 후 `VACUUM`/WAL 정책을 운영 환경에 맞게 선택한다.

---

## 5. 시스템 아키텍처 및 구현 전략

### 5.1 아키텍처 개요
- Web UI(SSR 권장) + API 서버 + DB + 로컬 미디어 스토리지
- 권장(참조 구현):
  - UI: Next.js(SSR/SSG) 또는 Remix (SEO 우선)
  - API: Node(TypeScript) Fastify/Express
  - DB: SQLite(기본) / Postgres(선택)
  - Media: 로컬 `/data/uploads` (정적 서빙)
- 핵심은 프레임워크가 아니라 **OpenAPI 계약(SSOT)** 준수.

### 5.2 UI 구현(트렌디 UX) 핵심 전략
- 첫 화면(홈):
  - 강한 히어로(이미지/짧은 문구) + 즉시 예약 CTA
  - 스크롤 유도(“대표 스타일” / “리뷰 하이라이트” / “위치”)
- 갤러리:
  - Masonry 또는 균일 그리드(모바일 2열, 데스크탑 3~4열)
  - 탭/칩 기반 필터(옵션), 로딩 스켈레톤
- 스타일/가격:
  - 카드 리스트 + 카테고리 탭(CUT/COLOR/PERM/CARE/ETC)
  - 가격은 한눈에, 상세는 확장(accordion)
- 리뷰:
  - 카드 캐러셀(과도한 자동 슬라이드 금지), 출처 링크(선택)
- 예약:
  - 외부(네이버 스토어) 이동 전 간단 안내 + 버튼
- 관리자 편집 UX:
  - “Edit mode” 토글(관리자 로그인 시)
  - 각 섹션 우측 상단에 “수정” 버튼
  - 이미지 교체는 드래그&드롭 + 즉시 미리보기
  - 저장 시 토스트 + Revision 자동 생성
  - 되돌리기는 “변경 시간/요약/대상” 중심

### 5.3 퍼포먼스 최적화 방안
- 이미지:
  - 업로드 시 서버에서 리사이즈(옵션) 또는 클라이언트에서 사전 압축(옵션)
  - WebP 변환은 옵션(TBD)
- 캐시:
  - Public GET 응답: ETag + Cache-Control (짧은 max-age + revalidate)
  - 정적 이미지: 긴 max-age + immutable(파일명 해시 기반이면 최적)
- 번들:
  - 라우트 기반 코드 스플리팅(특히 관리자 UI)
  - 애니메이션은 GPU-friendly 변환 위주

### 5.4 보안 구현 전략
- Auth:
  - access token(짧은 TTL) + refresh cookie(회전)
  - 로그인 rate limit + 실패 로그
- Upload:
  - MIME/확장자 allowlist
  - 서버 파일명 생성(경로 traversal 차단)
  - 크기 제한(SSOT)
- Admin UI:
  - “숨김 로그인 URL”은 UI 노출만 숨김. 접근 제어는 인증으로.

---

## 6. 상태머신(주요) 및 정책

### 6.1 Refresh Session Rotation (상태)
- ACTIVE → ROTATED → (REVOKED | EXPIRED)
- 규칙:
  - refresh 시 새 세션 발급 + 기존 세션 ROTATED 처리
  - ROTATED 토큰 재사용 시 401(또는 409) 처리(SSOT로 고정)

### 6.2 Revision Restore (정책)
- restore 요청이 들어오면(SSOT: OpenAPI):
  1) 대상 revision의 snapshot을 대상 엔티티에 적용(원자적)
     - 적용은 UPSERT로 정의한다(row 없음 → insert, `deleted_at` 존재 → 해제 후 적용)
  2) “복원 실행” 자체도 새 RevisionEntry로 기록(restore_of_revision_id 설정)
- 사용자는 “되돌리기 페이지”에서 시간순으로 복원 가능

### 6.3 Public Read Policy
- `published=true`인 항목만 public에 노출
- 정렬:
  - `sort_order`가 있으면 우선, 없으면 `created_at desc`

---

## 7. DB/인덱스/스토리지(개념)
- SSOT는 `openapi/openapi.yaml`의 `x-db`가 최종 결정권자.
- 본 문서는 의미만 설명:
  - singleton 테이블(site_settings/home_page/about_page)
  - 리스트 테이블(gallery_items/style_items/review_items/designer_profiles)
  - media_assets(파일 메타)
  - revisions(변경 이력)
  - idempotency_keys(멱등 처리)
  - admin_users/refresh_sessions(인증)

---

## 8. TBD & Decision Log

### 8.1 TBD(명시적으로 미정)
- 매장 정확 주소/위도경도/전화번호/영업시간(초기 데이터)
- 디자이너 표시명/프로필 사진/소개 문구(초기 데이터)
- 예약 링크(네이버 스토어) 정확 URL
- 네이버 지도 링크 정확 URL (또는 임베드 방식)
- Instagram 연동 방식:
  - 단순 링크만(최소)
  - oEmbed/Graph API 기반 피드(옵션, 토큰 필요)
- 업로드 이미지 리사이즈/변환 정책(WebP 강제 여부)

### 8.2 결정 질문(Decision Questions)
1) “예약”은 (A) 외부 링크로 즉시 이동 vs (B) /booking 내부에서 안내+버튼 제공 중 무엇이 선호인가?  
2) “리뷰”는 (A) 수동 등록만 vs (B) 네이버/인스타에서 일부 자동 가져오기(토큰/정책 필요) 중 무엇인가?  
3) 갤러리 정렬은 (A) 최신순 자동 vs (B) 수동 드래그 정렬을 반드시 제공해야 하는가?  
4) 관리자 계정은 1개 고정인가, 여러 명(스태프)까지 고려하는가?  
5) 이미지 업로드 최대 용량/최대 해상도는 운영적으로 어느 정도가 적절한가?

### 8.3 Decision Log(변경 이력)
- 2026-03-04:
  - 방문자 쓰기 기능 미지원(요구사항: 방문자 R only)
  - 예약은 외부 네이버 스토어 링크 기반(자체 예약 엔진 제외)
  - 롤백은 Revision 스냅샷 기반 + restore 자체도 revision으로 기록

끝.
