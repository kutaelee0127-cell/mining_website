# CI scope fix pack (mining_website)

이 패키지는 “CI가 매번 full을 타는 문제”를 해결하기 위한 최소 패치 세트다.
애매하면 full로 가는 **fail-closed** 원칙을 유지한다.

## 포함 파일
- `scripts/ci_select_scope.sh` : git diff 기반 EVIDENCE_SCOPE 자동 선택(ui|full)
- `.github/workflows/ci.yml` : scope 선택 step을 포함한 예시 workflow
- `scripts/ci_poll.sh` : 5분 간격/60분 제한 CI 폴링 스크립트
- `agent/AGENT_PROMPT.md` : Task 1=Commit 1, CI PASS, 리뷰 대응 포함 프롬프트

## 적용
1) 레포 루트에 파일을 복사한다.
2) 로컬/러너에서 실행 권한 부여:
   - `chmod +x scripts/ci_select_scope.sh scripts/ci_poll.sh`
3) 기존 workflow가 있으면, “Select evidence scope from diff” step만 이식해도 된다.

## 주의
- diff 계산 불가(얕은 체크아웃 등)면 full로 간다.
- UI-only 판정은 보수적이다(애매하면 full).
