# 미닝(mining) 운정점 — OpenClaw TDD Addendum (FINAL)
Generated: 2026-03-04 (Asia/Seoul)

> 목적: 태스크를 “스크린샷/수동 확인”이 아니라 **CLI 기반 Evidence**로만 닫는다.  
> 규칙: expected ≠ actual 이면 무조건 FAIL. PASS는 `summary.json(pass=true & result=PASS)`로만 판정.

---

## 0) SSOT 연결 규칙(강제)

우선순위(충돌 시 상위가 승리):
1) `openapi/openapi.yaml` — API 계약/스키마/에러/상태머신/DB(있다면)
2) `docs/ui/IA_NAV_SSOT.md` — 라우트/내비/관리자 전용 노출 규칙
3) `docs/ui/COPY_KEYS_SSOT.md` — i18n 키 SSOT (하드코딩 금지)
4) `design/derived/**` — UI 파생 스펙(페이지/상태/토큰/컴포넌트)
5) `docs/mining_website_OpenClaw_Evidence_Playbook_FINAL.md` — 태스크 순서/범위
6) 본 문서 — Evidence 포맷/판정 규칙

---

## 1) Evidence 번들 표준 구조(필수)

태스크 1개 완료 시, 다음 폴더 구조를 반드시 생성한다:

```text
/evidence/<piece_id>/<task_id>/
  expected.md                # 합격 기준(사람이 읽는 문서)
  cases/                     # 계약 테스트 케이스(구조화)
    *.case.yaml
  run.sh                     # 재현 가능한 단일 실행 스크립트(필수)
  actual/                    # 실제 실행 결과(자동 저장)
    http/                    # curl 결과(status/header/body)
    ui/                      # UI 테스트 리포트(선택)
    db/                      # db 출력(선택)
    fs/                      # 파일/해시 검증(선택)
    logs/                    # 서버/러너 로그(필수 권장)
  junit.xml                  # 있으면 포함(선택)
  summary.json               # 자동 요약(필수): PASS/FAIL의 유일 근거
```

### 1.1 `summary.json` 필수 필드(스키마)
```json
{
  "piece_id": "P2",
  "task_id": "P2-T1",
  "result": "PASS",
  "pass": true,
  "checks": [
    {
      "name": "GET /public/pages/home returns 200",
      "expected": "status=200 and schema=Page",
      "actual_path": "actual/http/get-home.json",
      "pass": true
    }
  ]
}
```

필수 조건:
- top-level `piece_id`, `task_id`
- top-level `result`: `"PASS"` 또는 `"FAIL"`
- top-level `pass`: boolean
- `checks[]`:
  - `name` (짧고 명확)
  - `expected` (검증 기준)
  - `actual_path` (증거 파일 경로)
  - `pass` (boolean)

---

## 2) Contract Case 포맷(SSOT 기반)

`/evidence/<piece>/<task>/cases/*.case.yaml` 은 다음 포맷을 따른다:

```yaml
id: P1-T1-LOGIN-001
name: Admin login success
depends_on: []   # optional
request:
  method: POST
  url: /auth/login
  headers:
    Accept-Language: ko-KR
    Content-Type: application/json
  body:
    username: admin
    password: "admin1234!"
expect:
  status: 200
  assertions:
    - type: jq
      expr: '.user.role == "ADMIN"'
    - type: jq
      expr: '(.session.access_token | length) > 20'
```

### 2.1 Assertion 타입(최소 지원)
- `jq`: JSON 응답을 jq 표현식으로 검증(참/거짓)
- `regex`: 문자열/헤더를 정규식으로 검증
- `equals`: 완전일치(정적 값에만)

### 2.2 동적 값(토큰/시간/ID) 처리 원칙
- 토큰/ID는 “존재/형식/길이/패턴”으로만 검증한다.
- 시간은 “범위(예: now±5m)” 또는 “필드 존재/정렬”로 검증한다.
- “정확히 이 값이어야 한다” 같은 brittle assertion 금지.

---

## 3) run.sh 규칙(강제)

### 3.1 실행 원칙
- `run.sh`는 **단일 커맨드로 재현 가능**해야 한다.
- `set -euo pipefail` 강제.
- 실패 시에도 `actual/logs`에 최소 로그 1개는 남겨야 한다.
- PASS/FAIL은 `summary.json`을 자동 생성하여 판정한다.
- 스크립트 종료 코드:
  - PASS면 `0`
  - FAIL이면 `1`

### 3.2 run.sh가 수행해야 하는 최소 단계(권장)
(태스크 성격에 따라 생략 가능하지만, 생략 시 expected.md에 이유 명시)

- (A) OpenAPI lint (OpenAPI 변경이 있는 태스크면 필수)
- (B) 서버 기동(필요 시) + readiness 체크
- (C) 계약 케이스 실행(가능하면) 또는 최소 curl/jq 검증
- (D) UI 테스트(해당 태스크가 UI를 포함하면 필수): lint/typecheck/test
- (E) actual/* 산출물 저장
- (F) summary.json 생성

---

## 4) Done Definition (태스크 종료 조건)

### 4.1 API 태스크(권장 최소)
각 OpenAPI operation마다 최소 2 케이스:
- Happy path 1개 (정상)
- Auth/Invalid 1개 (401/403/400 등)

### 4.2 UI 태스크(권장 최소)
각 UI 라우트/화면마다 최소 2 검증:
- (1) lint/typecheck/test PASS (컴포넌트/유닛)
- (2) headless e2e smoke (Playwright 등) 1개:
  - 페이지 로드
  - 핵심 CTA/섹션 존재
  - admin/visitor 권한에 따른 UI 노출 차이(편집 버튼 등)

> 단, 스크린샷을 “사람이 비교”하는 방식은 금지.  
> 시각 회귀가 필요하면 **픽셀 diff를 CLI로 PASS/FAIL**하는 형태만 허용.

### 4.3 i18n/Copy SSOT(필수)
- UI 문자열 하드코딩 금지.
- COPY_KEYS_SSOT에 있는 키는 `locales/ko-KR.json`, `locales/en-US.json`에 100% 존재해야 한다(테스트로 강제).

---

## 5) CI 지연 최소화(2-Lane 검증) + 로컬 precheck 강제

### 5.1 2-Lane 전략
- Fast lane (5~20초 목표):
  - lint / typecheck / unit tests / openapi lint
  - 개발 루프에서 자주 실행
- Slow lane (30초~2분+):
  - 서버 기동 + contract cases + e2e smoke + cleanup
  - 태스크 완료 직전에 1~2회만

태스크 완료 판정은 언제나:
- `evidence/<P>/<T>/summary.json`의 `pass=true` AND `result="PASS"`

### 5.2 로컬 precheck(강제 조항)
PR push 전에 반드시 아래 중 해당되는 세트를 1회 실행한다(태스크 run.sh 외 별도):

- OpenAPI 변경이 있을 때:
  - `bash scripts/run_openapi_lint.sh`
- UI 변경이 있을 때:
  - `pnpm -C packages/ui lint`
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui test`
- UI-kit 변경이 있을 때:
  - `pnpm -C packages/ui-kit lint`
  - `pnpm -C packages/ui-kit test`
- API 서버 변경이 있을 때(프로젝트에 맞는 스크립트로 고정):
  - `pnpm -C packages/api-server test`

> 위 커맨드는 P0 단계에서 실제 스크립트로 고정/문서화한다.  
> “커맨드가 없어서 못 돌렸다”는 사유는 허용되지 않는다(먼저 스크립트 태스크를 만든다).

### 5.3 CI 대기 예산(입력값 반영)
- CI_WAIT_BUDGET_MIN: 25
- 원칙:
  - CI 지연이 심해도 “사람 QA 태스크”로 대체 금지
  - 로컬에서 run.sh PASS 확인 후 푸시
  - CI 실패가 인프라성으로 보이면(네트워크/러너 문제) 1회 rerun까지만 허용

---

## 6) 플레이키(Flaky) 방지 규칙

- 외부 네트워크에 의존하는 테스트 금지(네이버/인스타 실호출 금지)
  - 링크 존재/형식/rel 속성만 검증
- 시간/랜덤은 seed 고정 또는 허용 범위 비교
- e2e는 mock/seed 데이터로 고정
- 포트 충돌/잔존 프로세스 방지:
  - run.sh는 종료 시 cleanup(trap) 포함
- evidence `actual/`는 run 시작 시 정리하거나 run_id 분리 저장

끝.
