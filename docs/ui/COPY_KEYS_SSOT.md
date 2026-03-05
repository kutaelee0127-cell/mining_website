# COPY_KEYS_SSOT — 미닝(mining) 운정점 Copy & i18n Keys (SSOT)

이 문서는 **UI 마이크로카피(i18n 키)의 단일 진실 원천(SSOT)** 입니다.  
- 기본 언어: ko-KR
- 영어: en-US
- UI에서 문자열을 하드코딩하지 않으며, 반드시 `t('...')` 키로 참조합니다.
- 단, “관리자가 편집하는 컨텐츠(히어로 문구/소개/캡션/리뷰 본문 등)”는 동적 컨텐츠이므로 본 문서 대상이 아닙니다(LocalizedText로 저장).

네임스페이스:
- `app`, `nav`, `action`, `field`, `msg`, `err`, `status`, `modal`, `admin`, `seo`

---

## 0) 키 규칙(강제)
- 점 표기: `nav.home`, `action.save`
- 신규 키 추가 시:
  1) 이 문서에 키 추가
  2) `locales/ko-KR.json`, `locales/en-US.json`에도 동시 반영(구현 단계)
- 키 삭제는 금지(레거시 호환). 사용 중단은 `deprecated: true` 주석으로 처리(TBD).

---

## 1) App (app.*)

| key | ko-KR | en-US |
|---|---|---|
| app.brandName | 미닝(mining) 운정점 | Mining (Unjeong) |
| app.defaultTitleSuffix | 미닝(mining) 운정점 | Mining (Unjeong) |
| app.skipToContent | 본문으로 바로가기 | Skip to content |

---

## 2) Navigation (nav.*)

| key | ko-KR | en-US |
|---|---|---|
| nav.home | 메인 | Home |
| nav.about | 소개 | About |
| nav.gallery | 갤러리 | Gallery |
| nav.styles | 스타일 | Styles |
| nav.reviews | 리뷰 | Reviews |
| nav.booking | 예약 | Booking |
| nav.rollback | 되돌리기 | Rollback |

---

## 3) Common Actions (action.*)

| key | ko-KR | en-US |
|---|---|---|
| action.bookNow | 예약하기 | Book now |
| action.openNaverBooking | 네이버에서 예약하기 | Book on Naver |
| action.openNaverMap | 네이버 지도 열기 | Open Naver Map |
| action.openInstagram | 인스타그램 보기 | View Instagram |
| action.viewMore | 더 보기 | View more |
| action.close | 닫기 | Close |
| action.cancel | 취소 | Cancel |
| action.save | 저장 | Save |
| action.apply | 적용 | Apply |
| action.retry | 재시도 | Retry |
| action.edit | 수정 | Edit |
| action.add | 추가 | Add |
| action.delete | 삭제 | Delete |
| action.replace | 교체 | Replace |
| action.upload | 업로드 | Upload |
| action.logout | 로그아웃 | Log out |
| action.login | 로그인 | Log in |
| action.enterEditMode | 편집 모드 | Edit mode |
| action.exitEditMode | 편집 종료 | Exit edit mode |
| action.restore | 복원 | Restore |
| action.viewDetails | 상세 보기 | View details |
| action.copyLink | 링크 복사 | Copy link |

---

## 4) Fields / Labels (field.*)

| key | ko-KR | en-US |
|---|---|---|
| field.username | 사용자명 | Username |
| field.password | 비밀번호 | Password |
| field.title | 제목 | Title |
| field.subtitle | 부제 | Subtitle |
| field.description | 설명 | Description |
| field.caption | 캡션 | Caption |
| field.tags | 태그 | Tags |
| field.price | 가격 | Price |
| field.category | 카테고리 | Category |
| field.duration | 소요 시간 | Duration |
| field.minutes | 분 | min |
| field.rating | 평점 | Rating |
| field.author | 작성자 | Author |
| field.source | 출처 | Source |
| field.linkUrl | 링크 URL | Link URL |
| field.address | 주소 | Address |
| field.phone | 전화번호 | Phone |
| field.businessHours | 영업시간 | Business hours |
| field.altText | 대체 텍스트(alt) | Alt text |
| field.language | 언어 | Language |
| field.theme | 테마 | Theme |
| field.dark | 다크 | Dark |
| field.light | 라이트 | Light |
| field.search | 검색 | Search |
| field.filter | 필터 | Filter |

---

## 5) Status / Banners (status.*)

| key | ko-KR | en-US |
|---|---|---|
| status.loading | 불러오는 중… | Loading… |
| status.saving | 저장 중… | Saving… |
| status.saved | 저장됨 | Saved |
| status.published | 공개 | Published |
| status.hidden | 숨김 | Hidden |
| status.adminOnly | 관리자 전용 | Admin only |

---

## 6) Empty / Info Messages (msg.*)

| key | ko-KR | en-US |
|---|---|---|
| msg.welcome | 당신의 분위기를 더 선명하게. | Make your vibe sharper. |
| msg.galleryEmpty | 아직 등록된 갤러리 사진이 없습니다. | No gallery photos yet. |
| msg.stylesEmpty | 아직 등록된 스타일/가격 정보가 없습니다. | No styles/prices yet. |
| msg.reviewsEmpty | 아직 등록된 리뷰가 없습니다. | No reviews yet. |
| msg.bookingHint | 예약은 네이버 스토어에서 진행됩니다. | Booking continues on Naver Store. |
| msg.externalLinkHint | 외부 페이지로 이동합니다. | You are leaving this site. |
| msg.changesSaved | 변경사항이 저장되었습니다. | Changes saved. |
| msg.unsavedChanges | 저장되지 않은 변경사항이 있습니다. | You have unsaved changes. |
| msg.confirmDelete | 삭제하시겠습니까? | Are you sure you want to delete? |
| msg.loginTitle | 관리자 로그인 | Admin login |
| msg.loginSubtitle | 편집 및 되돌리기는 관리자만 가능합니다. | Editing and rollback are admin-only. |
| msg.rollbackTitle | 변경 이력 | Change history |
| msg.rollbackSubtitle | 특정 시점으로 되돌릴 수 있습니다. | Restore to a previous point in time. |
| msg.noRevisions | 변경 이력이 없습니다. | No change history yet. |
| msg.restoreWarning | 복원하면 현재 내용이 변경됩니다. | Restoring will overwrite current content. |
| msg.notFound | 페이지를 찾을 수 없습니다. | Page not found. |

---

## 7) Error Messages (err.*)

| key | ko-KR | en-US |
|---|---|---|
| err.unauthorized | 로그인 후 이용해 주세요. | Please log in. |
| err.forbidden | 접근 권한이 없습니다. | You don't have permission. |
| err.validation | 입력값을 확인해 주세요. | Please check your input. |
| err.notFound | 항목을 찾을 수 없습니다. | Item not found. |
| err.conflict | 충돌이 발생했습니다. 다시 시도해 주세요. | A conflict occurred. Please try again. |
| err.network | 네트워크 오류가 발생했습니다. | Network error occurred. |
| err.rateLimited | 요청이 너무 많습니다. 잠시 후 다시 시도하세요. | Too many requests. Try again later. |
| err.server | 서버 오류가 발생했습니다. | Server error occurred. |
| err.unknown | 알 수 없는 오류가 발생했습니다. | Something went wrong. |
| err.mediaTooLarge | 파일 용량이 너무 큽니다. | File is too large. |
| err.mediaUnsupported | 지원하지 않는 파일 형식입니다. | Unsupported file type. |

---

## 8) Modals / Dialogs (modal.*)

| key | ko-KR | en-US |
|---|---|---|
| modal.editSection.title | 섹션 수정 | Edit section |
| modal.editSection.desc | 내용을 수정한 뒤 저장하세요. | Edit the content, then save. |
| modal.upload.title | 이미지 업로드 | Upload image |
| modal.upload.desc | 이미지를 선택하거나 끌어다 놓으세요. | Select an image or drag & drop. |
| modal.delete.title | 삭제 확인 | Confirm delete |
| modal.delete.desc | 삭제 후 되돌릴 수 있습니다(되돌리기에서 복원). | You can restore later from rollback. |
| modal.restore.title | 복원 확인 | Confirm restore |
| modal.restore.desc | 선택한 시점으로 되돌립니다. | Restore to the selected revision. |

---

## 9) Admin (admin.*)

| key | ko-KR | en-US |
|---|---|---|
| admin.editBadge | 관리자 편집 | Admin editing |
| admin.hiddenLoginNotice | 로그인 페이지는 메뉴에 표시되지 않습니다. | Login page is not shown in navigation. |
| admin.revisions.filterAll | 전체 | All |
| admin.revisions.filterHome | 메인 | Home |
| admin.revisions.filterAbout | 소개 | About |
| admin.revisions.filterGallery | 갤러리 | Gallery |
| admin.revisions.filterStyles | 스타일 | Styles |
| admin.revisions.filterReviews | 리뷰 | Reviews |
| admin.revisions.filterSite | 사이트 설정 | Site settings |

---

## 10) SEO (seo.*)

| key | ko-KR | en-US |
|---|---|---|
| seo.home.title | 메인 | Home |
| seo.about.title | 소개 | About |
| seo.gallery.title | 갤러리 | Gallery |
| seo.styles.title | 스타일 | Styles |
| seo.reviews.title | 리뷰 | Reviews |
| seo.booking.title | 예약 | Booking |

---

## 11) Notes
- 이 문서는 “정적 UI 문구”만 다룹니다.
- 히어로 문구/소개 텍스트/캡션/리뷰 본문 등은 관리자 편집 컨텐츠(LocalizedText)로 관리합니다.
- 구현 중 신규 문구가 필요하면 SSOT(이 문서)부터 갱신하고 하드코딩을 금지합니다.

끝.
