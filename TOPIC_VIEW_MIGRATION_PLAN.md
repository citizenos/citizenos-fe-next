# Topic View Migration Plan

**Generated**: 2026-05-09  
**Skill**: `plan-migration`  
**Source**: `citizenos-fe/src/app/topic/`  
**Target**: `citizenos-fe-next/src/app/features/topics/topic-view/components/`

---

## State of Play

The topic-view orchestrating component and its template are **already fully migrated**.
All 14 sub-components listed below **exist in fe-next** but have **no spec files**.
`topic-invitation` exists with a minimal spec (4 tests) that needs expansion.
`topic-participants-section.manageParticipants()` is a stub pending `topic-participants`.

**Definition of done for every task below:**  
`npx ng test --no-watch --include src/app/.../component.spec.ts` → 0 failures  
`npm run build` → 0 errors

---

## Implementation Order

Fewest dependencies first — each group unblocks the next:

```
Group A (no inter-deps):
  3.2 argument-deleted
  3.3 argument-edits
  3.6 argument-why-dialog
  3.7 argument-report-moderate
  3.10 topic-member-invite-delete
  3.11 topic-member-invite

Group B (depend only on Group A dialogs):
  3.4 argument-reactions
  3.5 argument-reply
  3.8 edit-argument
  3.9 invite-editors
  3.12 topic-member-user
  3.13 topic-member-group

Group C (depend on members from Groups A+B):
  3.14 topic-participants         ← must come before 3.15
  3.15 topic-participants-section ← wires manageParticipants() stub

Group D (standalone):
  3.1 topic-invitation            ← expand existing spec
```

---

## Task 3.1 — Expand spec for `topic-invitation`

**Source**: `citizenos-fe/src/app/topic/components/topic-invitation/topic-invitation.component.ts`  
**Target**: `features/topics/topic-invitation/topic-invitation.component.ts`  
**Complexity**: Medium — route-activated, no template, orchestrates dialog + navigation  
**Status**: Component done. Spec has 4 tests; needs 5 more cases.

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Reads `topicId`, `inviteId`, `join` from route. Calls `TopicInviteUserService.get()`. On success: if `join=true` and user matches → `joinTopic()`. Otherwise navigates to dashboard + opens `InvitationDialogComponent`. Dialog result: `true` + authenticated + same user → `joinTopic()`; same user different account → logout + login redirect; not registered → signup redirect; registered → login redirect. On error: navigate `/` + notification. |
| `joinTopic()` | private | Calls `topicInviteUserService.accept()`, navigates to `/topics/:topicId` on success. |

### Additional spec cases needed

```
- joins topic directly when join=true and user id matches (authenticated)
- navigates to login when dialog confirmed and user is registered but different
- navigates to signup when dialog confirmed and user is not registered
- shows 41002 notification on specific API error code
- navigates to '/' on generic API error
```

---

## Task 3.2 — Write spec for `argument-deleted`

**Source**: `citizenos-fe/src/app/topic/components/argument-deleted/`  
**Target**: `features/topics/topic-view/components/argument-deleted/`  
**Complexity**: Low — 2 methods, 3 conditional branches

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Warning SVG icon | — | always |
| "Flagged by" message | `.bold` | `deletedReasonType && deletedReasonText` |
| "Why?" button | `.btn_link` | `deletedReasonType && deletedReasonText` |
| "View Anyway" button | `.btn_link` | `deletedReasonType && deletedReasonText` AND `!isArgumentVisible()` |
| "Creator removed" message | `.bold` | `deletedBy.id === creator.id && !deletedReasonType && !deletedReasonText` |
| "View Anyway" button | `.btn_link` | creator-removed branch AND `!isArgumentVisible()` |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `showReason()` | "Why?" click | Opens `ArgumentWhyDialogComponent` with `argument` data |
| `showArgument()` | "View Anyway" click | Sets `isArgumentVisible(true)`, emits `showDeletedArgument(true)` |

### Inputs / Outputs

- `argument = input.required<any>()`
- `showDeletedArgument = output<boolean>()`

### Spec plan

```
- renders without error (flagged-by scenario)
- shows "Why?" and "View Anyway" buttons when deletedReasonType + deletedReasonText present
- hides "View Anyway" after showArgument() is called
- showReason() opens ArgumentWhyDialogComponent
- showArgument() emits showDeletedArgument(true)
- shows creator-removed message when deletedBy.id === creator.id and no reason
- shows "View Anyway" in creator-removed branch
```

---

## Task 3.3 — Write spec for `argument-edits`

**Source**: `citizenos-fe/src/app/topic/components/argument-edits/`  
**Target**: `features/topics/topic-view/components/argument-edits/`  
**Complexity**: Low-Medium — 3 methods, iterates keyed edits object

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Edits list | `.edits_wrap` | always |
| Each edit row | `.argument_edit` | `@for over editsEntries()` |
| Edit date | `.date_wrap` | per edit |
| Edit subject | `.argument_subject` | per edit |
| Edit body | `.argument_body` | per edit |
| Copy link button | — | per edit |
| Hide edits button | `.edits_header` area | always |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `editsEntries()` | computed | `Object.entries(argument().edits)` sorted by key |
| `hideEdits()` | close button | Emits `showEditsChange(false)` |
| `copyArgumentLink(event, version)` | copy button | Uses `navigator.clipboard.writeText()` to copy URL with `#version` hash |

### Inputs / Outputs

- `argument = input.required<any>()`
- `topicId = input.required<string>()`
- `showEditsChange = output<boolean>()`

### Spec plan

```
- renders without error with argument that has edits
- renders one row per edit entry
- hideEdits() emits showEditsChange(false)
- copyArgumentLink() calls navigator.clipboard.writeText
- handles argument with no edits (empty list)
```

---

## Task 3.4 — Write spec for `argument-reactions`

**Source**: `citizenos-fe/src/app/topic/components/argument-reactions/`  
**Target**: `features/topics/topic-view/components/argument-reactions/`  
**Complexity**: Medium — dialog component, pagination, service call on init

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Member list | `.row_list` | always |
| Each member row | `.row_cell` | `@for` over paged members |
| Profile image | `.profile_image_wrap` | per member |
| Vote icon (up/down) | — | per member, based on value |
| Pagination | `cos-pagination` | `totalPages() > 1` |
| Close button | `[dialogClose]` | always |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Calls `TopicArgumentService.votes()`, stores result in `members` signal, calculates `totalPages` |
| `loadPage(pageNr)` | pagination | Sets `page` signal |
| `isOnPage(index, page)` | computed | Returns true if `index` falls within current page slice |

### Dialog data

`DIALOG_DATA: { commentId: string, topicId: string, discussionId: string }`

### Spec plan

```
- renders without error, calls TopicArgumentService.votes() on init
- renders a row per member
- shows upvote icon for value === 1, downvote for value === -1
- loadPage() updates page signal
- isOnPage() returns correct boolean
- pagination visible when totalPages > 1
- handles empty member list
```

---

## Task 3.5 — Write spec for `argument-reply`

**Source**: `citizenos-fe/src/app/topic/components/argument-reply/`  
**Target**: `features/topics/topic-view/components/argument-reply/`  
**Complexity**: Medium — form with validation, auth guard, service call

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Reply wrapper | `.reply_wrap + argument().type` | always |
| Form + textarea | `#argument_reply_text` | `userStore.isAuthenticated()` |
| Error SVG + label | `.error_label` | `errors()?.text` |
| Close (X) button | `.close_button` | authenticated |
| Submit button | `.btn_medium_submit.bold` | authenticated, disabled when `!replyText().length` |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `saveReply()` | submit click | Validates `replyText`; on success calls `TopicArgumentService.createReply()`, emits `showReplyChange(false)` |
| `close()` | close button | Emits `showReplyChange(false)` |

### Inputs / Outputs

- `argument = input.required<any>()`
- `topicId = input.required<string>()`
- `showReplyChange = output<boolean>()`

### Spec plan

```
- renders without error when authenticated
- shows nothing (form hidden) when not authenticated
- close() emits showReplyChange(false)
- submit button disabled when replyText is empty
- submit button enabled when replyText has content
- saveReply() calls TopicArgumentService with correct params
- saveReply() emits showReplyChange(false) on success
- shows error label when errors().text is set
```

---

## Task 3.6 — Write spec for `argument-why-dialog`

**Source**: `citizenos-fe/src/app/topic/components/argument-why-dialog/`  
**Target**: `features/topics/topic-view/components/argument-why-dialog/`  
**Complexity**: Low — display-only dialog, no methods

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Info icon | — | always |
| Deletion reason type | — | always (from `data.argument`) |
| Deletion reason text | — | always |
| Close button | `[dialogClose]` | always |

### Dialog data

`DIALOG_DATA: { argument: { deletedReasonType: string, deletedReasonText: string, deletedBy: { name } } }`

### Spec plan

```
- renders without error with dialog data
- displays deletedReasonType
- displays deletedReasonText
- close button has [dialogClose] attribute
```

---

## Task 3.7 — Write spec for `argument-report-moderate`

**Source**: `citizenos-fe/src/app/topic/components/argument-report-moderate/`  
**Target**: `features/topics/topic-view/components/argument-report-moderate/`  
**Complexity**: Medium — reactive form, service call, dialog

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Argument content preview | `.dialog_info` | always |
| Report type radio/dropdown | — | always |
| Reason textarea | — | always |
| Error message | — | `errors` set |
| Submit button | — | always |
| Close button | `[dialogClose]` | always |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `constructor()` | — | Reads `data` from `DIALOG_DATA`, builds reactive form |
| `selectReportType(type)` | type selection | Sets form control `type` value |
| `doModerate()` | submit click | Validates form; calls `TopicArgumentService.moderate()` with `reportId`, `token`, `type`, `text`; closes dialog |

### Dialog data

`DIALOG_DATA: { argument, report, topicId, discussionId, commentId, reportId, token }`

### Spec plan

```
- renders without error with dialog data
- selectReportType() updates form control
- doModerate() calls TopicArgumentService.moderate() with correct params
- doModerate() closes dialog on success
- shows error when form is invalid
- close button present
```

---

## Task 3.8 — Write spec for `edit-argument`

**Source**: `citizenos-fe/src/app/topic/components/edit-argument/`  
**Target**: `features/topics/topic-view/components/edit-argument/`  
**Complexity**: Medium — form with type select, validation, service call

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Sets `editSubject`, `editText`, `editType` signals from `argument()` |
| `argumentMaxLength()` | computed | Returns char limit based on `editType()` |
| `updateArgument()` | submit click | Validates; calls `TopicArgumentService.update()` with updated argument; emits `showEdit(true)` on success |
| `argumentEditMode()` | close button | Resets form to original; emits `showEdit(null)` |

### Inputs / Outputs

- `topicId = input.required<string>()`
- `argument = input.required<any>()`
- `showEdit = output<boolean | null>()`

### Spec plan

```
- renders without error, fields pre-filled from argument
- argumentEditMode() emits showEdit(null)
- updateArgument() calls TopicArgumentService.update() with correct payload
- updateArgument() emits showEdit(true) on success
- argumentMaxLength() returns correct limit per type
- type selection updates editType signal
```

---

## Task 3.9 — Write spec for `invite-editors`

**Source**: `citizenos-fe/src/app/topic/components/invite-editors/`  
**Target**: `features/topics/topic-view/components/invite-editors/`  
**Complexity**: High — search, email validation, pagination, bulk actions

### Dialog data

`DIALOG_DATA: { topic: Topic, allowedLevels?: string[] }`

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `onSearch(str)` | search input | Debounced call to `SearchService`; filters out already-added members |
| `addTopicMember(member)` | search result click | Adds user to `members` signal |
| `addCorrectedEmail(email, index)` | correction form | Replaces invalid email at index |
| `removeInvalidEmail(index)` | remove invalid | Removes from `invalid` signal |
| `removeTopicMemberUser(member)` | remove icon | Removes from `members` signal |
| `updateTopicMemberUserLevel(member, level)` | level dropdown | Updates member's level |
| `updateAllMemberLevels(level)` | bulk level btn | Sets all members to same level |
| `removeAllMembers()` | clear all | Empties `members` signal |
| `isOnPage(index)` | computed | Returns true if index is on current page |
| `loadPage(pageNr)` | pagination | Sets `page` signal |
| `inviteEditors()` | submit | Calls `TopicInviteUserService` + `TopicMemberUserService` to send invites and set levels; closes dialog |

### Spec plan

```
- renders without error with topic data
- onSearch() calls SearchService with query string
- addTopicMember() adds member to list
- removeTopicMemberUser() removes member from list
- updateTopicMemberUserLevel() updates member level
- updateAllMemberLevels() sets all members to same level
- removeAllMembers() clears member list
- isOnPage() returns false for index outside page
- loadPage() updates page signal
- inviteEditors() calls TopicInviteUserService with correct data
- inviteEditors() closes dialog on success
```

---

## Task 3.10 — Write spec for `topic-member-invite-delete`

**Source**: `citizenos-fe/src/app/topic/components/topic-member-invite-delete/`  
**Target**: `features/topics/topic-view/components/topic-member-invite-delete/`  
**Complexity**: Low — radio dialog, single method

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| User name/email display | — | always |
| Radio: delete this invite | `.radio_box` | always |
| Radio: delete all invites for user | `.radio_box` | always |
| Confirm button | — | always, disabled when no option selected |
| Cancel button | `[dialogClose]` | always |

### Dialog data

`DIALOG_DATA: { user: { name, email } }`

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `removeInvites()` | confirm click | Closes dialog with `invitesToDelete` value (`'single'` or `'all'`) |

### Spec plan

```
- renders without error with user data
- displays user name and email
- confirm button disabled until radio selected
- removeInvites() closes dialog with 'single' when first option chosen
- removeInvites() closes dialog with 'all' when second option chosen
- cancel button has [dialogClose]
```

---

## Task 3.11 — Write spec for `topic-member-invite`

**Source**: `citizenos-fe/src/app/topic/components/topic-member-invite/`  
**Target**: `features/topics/topic-view/components/topic-member-invite/`  
**Complexity**: Medium — shows invite row, handles expiry, delete flow

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Avatar / initials | `.profile_image_wrap` | always |
| User name or email | `.name` | always |
| Invite status | `.invite_info` | always |
| Expiration warning | — | `isExpired(invite.expiresAt)` |
| Level display (disabled) | `.level.disabled` | always |
| Delete menu | `.dropdown` | `topic().canUpdate` |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `now()` | computed | Returns current date (used for expiry comparison) |
| `isExpired(expiresAt)` | computed | Returns true if `expiresAt < now()` |
| `doDeleteInviteUser()` | delete click | Opens `TopicMemberInviteDeleteComponent` dialog; on close with `'single'` deletes one invite; on `'all'` emits `deleteAllInvitesForUser` output |

### Inputs / Outputs

- `topic = input.required<Topic>()`
- `invite = input.required<any>()`
- `fields = input<any>()`
- `deleteAllInvitesForUser = output<string>()`

### Spec plan

```
- renders without error
- shows expiration warning when invite is expired
- does not show expiration warning when invite is valid
- delete menu hidden when topic.canUpdate is false
- doDeleteInviteUser() opens TopicMemberInviteDeleteComponent
- on dialog close 'single': calls TopicInviteUserService.delete()
- on dialog close 'all': emits deleteAllInvitesForUser
```

---

## Task 3.12 — Write spec for `topic-member-group`

**Source**: `citizenos-fe/src/app/topic/components/topic-member-group/`  
**Target**: `features/topics/topic-view/components/topic-member-group/`  
**Complexity**: Low-Medium — group row with level dropdown and delete

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Sets `groupLevel` signal from `group().level` |
| `doUpdateMemberGroup(level)` | level dropdown | Calls `TopicMemberGroupService.update()`, updates `groupLevel` signal |
| `doDeleteMemberGroup()` | delete click | Opens `ConfirmDialogComponent`; on confirm calls `TopicMemberGroupService.delete()` |

### Inputs / Outputs

- `topic = input.required<Topic>()`
- `group = input.required<any>()`
- `canUpdate = input<any>()`
- `fields = input<any>()`

### Spec plan

```
- renders without error with group data
- displays group name as link to group page
- level dropdown hidden when canUpdate is falsy
- doUpdateMemberGroup() calls TopicMemberGroupService.update() with new level
- doDeleteMemberGroup() opens ConfirmDialogComponent
- on confirm dialog true: calls TopicMemberGroupService.delete()
```

---

## Task 3.13 — Write spec for `topic-member-user`

**Source**: `citizenos-fe/src/app/topic/components/topic-member-user/`  
**Target**: `features/topics/topic-view/components/topic-member-user/`  
**Complexity**: Medium — user row with level, delete, leave-topic edge case

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Sets `memberLevel` signal from `member().level` |
| `doUpdateMemberUser(level)` | level dropdown | Calls `TopicMemberUserService.update()`, updates signal |
| `doDeleteMemberUser()` | delete click | Opens `ConfirmDialogComponent`; on confirm calls `TopicMemberUserService.delete()` |
| `doLeaveTopic()` | — called from delete when current user matches | Navigates to `/my/topics` after delete |

### Inputs / Outputs

- `topic = input.required<Topic>()`
- `member = input.required<any>()`
- `fields = input<any>()`
- `withEmail = input<boolean>(true)`

### Spec plan

```
- renders without error with member data
- shows email when withEmail is true
- hides email when withEmail is false
- level dropdown visible when topic admin
- doUpdateMemberUser() calls TopicMemberUserService.update() with new level
- doDeleteMemberUser() opens ConfirmDialogComponent
- on confirm: calls TopicMemberUserService.delete()
- on confirm when member is current user: navigates to /my/topics
```

---

## Task 3.14 — Write spec for `topic-participants`

**Source**: `citizenos-fe/src/app/topic/components/topic-participants/`  
**Target**: `features/topics/topic-view/components/topic-participants/`  
**Complexity**: High — dialog with tabs, search, sort, pagination for users/groups/invites

### Dialog data

`DIALOG_DATA: { topic: Topic }`

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `ngOnInit()` | lifecycle | Calls `TopicMemberUserService`, `TopicMemberGroupService`, `TopicInviteUserService` to load members |
| `setUserSearch(val)` | search input | Sets `userSearch` signal, resets page to 1 |
| `setGroupSearch(val)` | search input | Sets `groupSearch` signal, resets page |
| `setInviteSearch(val)` | search input | Sets `inviteSearch` signal, resets page |
| `doUserOrder(field, dir)` | column header | Sets sort field/dir signals, resets page |
| `doGroupOrder(field, dir)` | column header | Same for groups |
| `doInviteOrder(field, dir)` | column header | Same for invites |

### Spec plan

```
- renders without error, calls all three member services on init
- shows users tab by default
- shows correct user count
- setUserSearch() filters displayed users
- setGroupSearch() filters displayed groups
- setInviteSearch() filters displayed invites
- doUserOrder() updates sort signals, resets to page 1
- pagination works correctly per tab
- shows empty state when no members in a tab
```

---

## Task 3.15 — Write spec for `topic-participants-section`

**Source**: `citizenos-fe/src/app/topic/components/topic-participants-section/`  
**Target**: `features/topics/topic-view/components/topic-participants-section/`  
**Complexity**: Low — sidebar section with avatars, two action buttons

**Note**: `manageParticipants()` is currently a stub (comment: `ilmar-249`). The spec should test that it is callable but not assert on its side-effects until `topic-participants` dialog is wired up. Wire up `manageParticipants()` to open `TopicParticipantsComponent` as part of this task.

### UI inventory

| Element | CSS class | Condition |
|---|---|---|
| Section title | `.info_title` | always |
| "Manage" link | `.manage_link` | `topicService.canUpdate(topic())` |
| Member count | `.participants_count` | always |
| First 3 avatars | `.avatars_wrap` | `members()[0..2]` |
| "+N" overflow badge | `.avatar` | `members().length > 3` |
| "Share / Invite" button | `.btn_medium_secondary` | `topicService.canDelete(topic())` |

### Behavior inventory

| Method | Trigger | What it does |
|---|---|---|
| `manageParticipants()` | "Manage" click | **Currently a stub** — should open `TopicParticipantsComponent` dialog |
| `inviteMembers()` | share button click | Opens `TopicInviteDialogComponent` with `{ topic }` |

### Inputs / Outputs

- `topic = input.required<Topic>()`
- `members = input.required<any[]>()`

### Action required before writing spec

Wire up `manageParticipants()`:
```typescript
manageParticipants(): void {
  import('../topic-participants/topic-participants.component').then(m => {
    this.dialogService.open(m.TopicParticipantsComponent, { data: { topic: this.topic() } });
  });
}
```

### Spec plan

```
- renders without error
- shows member count from topic().members.users.count
- shows up to 3 avatars
- shows +N overflow when members.length > 3
- "Manage" link visible when topicService.canUpdate() is true
- "Manage" link hidden when topicService.canUpdate() is false
- manageParticipants() opens TopicParticipantsComponent dialog
- "Share" button visible when topicService.canDelete() is true
- inviteMembers() opens TopicInviteDialogComponent
```

---

## Quality Checklist (per task)

- [ ] `npx ng test --no-watch --include src/app/path/to/file.spec.ts` passes with 0 failures
- [ ] Spec covers: renders, each button, each `@if` branch, each API call (mocked), each output event
- [ ] `npm run build` passes with 0 errors after any code changes
- [ ] Update `TASKS.md` when each task is done

## Dependencies on External Services

All services are available in fe-next. No new service methods needed for any of these spec tasks.

| Service | Used by |
|---|---|
| `TopicArgumentService` | argument-deleted, argument-edits, argument-reactions, argument-reply, argument-report-moderate, edit-argument |
| `TopicInviteUserService` | invite-editors, topic-member-invite, topic-invitation |
| `TopicMemberUserService` | invite-editors, topic-member-user, topic-participants |
| `TopicMemberGroupService` | topic-member-group, topic-participants |
| `SearchService` | invite-editors |
| `DialogService` | topic-participants-section, topic-member-user, topic-member-group, topic-member-invite |
| `UserStore` | argument-reply |
