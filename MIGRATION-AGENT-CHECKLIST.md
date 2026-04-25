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

### Account — 🔶 PARTIAL

| Component | Status | Notes |
|-----------|--------|-------|
| Login / Register | ✅ | |
| Profile | ✅ | |
| AddEid | ❌ | Not started |
| ConnectEid | ❌ | Not started |
| VerifyEmail | ❌ | Not started |
| MobiilId | ❌ | Not started |
| PrivacyPolicy | ❌ | Not started |

---

### Groups — 🔶 PARTIAL

| Component | Status | Notes |
|-----------|--------|-------|
| MyGroupsComponent | ✅ | |
| PublicGroupsComponent | ✅ | |
| GroupCardComponent | ✅ | |
| GroupDetailComponent | ✅ | Signals, reactive filters, tabs, pagination |
| GroupCreateComponent | ✅ | OnPush, fixed createGroup (invite+topics+image), cancel route, contact+rules in step-info, level dropdown in step-invite, 33 tests |
| GroupSettingsDialogComponent | ✅ | Info + settings tabs, image upload, rules list |
| GroupInviteDialogComponent | ✅ | Invite (user search + email) + share (join link) tabs |
| GroupAddTopicsDialogComponent | ✅ | Topic search, level selection, forkJoin save |
| GroupRequestTopicsDialogComponent | ✅ | Topic search, optional message, forkJoin send |
| TopicRequestsDialogComponent | ✅ | Accept/reject pending requests |
| Member level/remove (inline) | ✅ | Dropdown in members tab — update level, confirm-delete, 6 tests |

---

### Topics — 🔶 PARTIAL

| Component | Status | Notes |
|-----------|--------|-------|
| MyTopicsComponent | ✅ | |
| PublicTopicsComponent | ✅ | |
| TopicViewComponent | ✅ | Header, content, sidebar, state-items |
| TopicCreateComponent | 🔶 | Exists, needs full review |
| VoteCreateComponent | 🔶 | Fixed dead imports; needs testing |
| IdeationCreateComponent | 🔶 | Exists, needs review |
| Argument dialogs | ❌ | Not started |
| Vote dialogs | ❌ | Not started |
| Deadline dialogs | ❌ | Not started |

---

### Auth extras — ❌ NOT STARTED

AddEid, ConnectEid, VerifyEmail, MobiilId

---

### Core extras — ❌ NOT STARTED

Accessibility menu, onboarding, feedback, help, search

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
