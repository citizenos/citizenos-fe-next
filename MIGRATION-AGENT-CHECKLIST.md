# Migration Agent Checklist

Track migration status from `citizenos-fe` (Vue) to `citizenos-fe-next` (Angular 21).

---

## Compliance Rules (per CLAUDE.md)

Every migrated component must satisfy:

- [ ] No `CommonModule` import
- [ ] `inject()` DI — no constructor injection
- [ ] `signal()` / `computed()` for state — no RxJS BehaviorSubjects
- [ ] `toObservable(computed(...))` when reactive filter streams are needed
- [ ] `@if` / `@for` / `@else` / `@empty` — no `*ngIf` / `*ngFor`
- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] `standalone: true` on every component
- [ ] No speculative error handling (only at system boundaries)
- [ ] No unused imports left behind

---

## Feature Areas

### Shared / Core — ✅ COMPLETE

All shared components complete and quality-clean.

---

### Home — ✅ COMPLETE

---

### Dashboard — ✅ COMPLETE

---

### Account — ✅ COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| Login / Register | ✅ | |
| Profile | ✅ | |
| AddEid | ✅ | Migrated to Standalone/Signals |
| ConnectEid | ✅ | Migrated to Standalone/Signals |
| VerifyEmail | ✅ | Migrated to Standalone/Signals |
| MobiilId | ✅ | Handled within EstEid/Login components |
| PrivacyPolicy | ✅ | Migrated |

---

### Groups — ✅ COMPLETE

All group components migrated and verified.

---

### Topics — ✅ COMPLETE

| Component | Status | Notes |
|-----------|--------|-------|
| MyTopicsComponent | ✅ | |
| PublicTopicsComponent | ✅ | |
| TopicViewComponent | ✅ | Header, content, sidebar, state-items |
| TopicCreateComponent | ✅ | Reviewed, fully migrated |
| VoteCreateComponent | ✅ | Migrated and tested |
| IdeationCreateComponent | ✅ | Reviewed, fully migrated |
| Argument dialogs | ✅ | All 5 dialogs migrated |
| Vote dialogs | ✅ | All 6 dialogs migrated |
| Deadline dialogs | ✅ | All 3 deadline dialogs migrated |
| Ideation feature | ✅ | All ~15 components migrated |

---

### Auth extras — ✅ COMPLETE

AddEid, ConnectEid, VerifyEmail, MobiilId are all complete and integrated.

---

### Core extras — 🔶 PARTIAL

| Component | Status | Notes |
|-----------|--------|-------|
| Accessibility menu | ❌ | Not started |
| Onboarding | ✅ | Topic-specific onboarding complete |
| Feedback | ✅ | Managed via UiStateService |
| Help | ✅ | Managed via UiStateService |
| Search | ✅ | Integrated in list views |

---

## Services Created

| Service | Path | Notes |
|---------|------|-------|
| GroupDetailService | `core/services/group-detail.service.ts` | Includes `update()` and `uploadGroupImage()` |
| GroupMemberTopicService | `core/services/group-member-topic.service.ts` | Includes `addTopic()` |
| GroupMemberUserService | `core/services/group-member-user.service.ts` | |
| GroupJoinService | `core/services/group-join.service.ts` | `generateToken()`, `updateLevel()` |
| GroupInviteUserService | `core/services/group-invite-user.service.ts` | `invite()` |
| GroupRequestTopicService | `core/services/group-request-topic.service.ts` | `getRequests()`, `request()`, `accept()`, `reject()` |

---

## Known Pre-existing Test Failures (do not chase)

- page-list-header.component.spec.ts: NG0950 (4 tests)
- list-filter-toolbar.component.spec.ts: DOM query wrong count (1 test)
- create-menu.component.spec.ts: TranslatePipe mock (3 tests)
- pagination.component.spec.ts: pages() returns [] (8 tests)
- icon.component.spec.ts: NG0950 (4 tests)
- nav.component.spec.ts, topic-header.component.spec.ts: external template resolution

---

## Next Priority

1. **Topic create/edit form** — mega-form ~1700 lines
3. **Ideation feature** — ~15 components
4. **Topic sub-flows** — arguments, vote dialogs, deadlines
5. **Auth extras** — add-eid, connect-eid, verify-email, mobiil-id
