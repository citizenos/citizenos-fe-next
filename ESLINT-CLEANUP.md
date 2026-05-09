# ESLint Cleanup Tasks

**Total: 390 problems (0 errors, 390 warnings) — all remaining are `no-explicit-any` P3 warnings**

Run `npm run lint` to see current status.

---

## Overview

| Rule | Errors | Warns | Files | Auto-fix | Priority |
|------|-------:|------:|------:|:--------:|:--------:|
| `@typescript-eslint/no-explicit-any` | 0 | 390 | ~130 | ❌ | P3 |
| `@angular-eslint/template/interactive-supports-focus` | 150 | 0 | 50 | ❌ | P2 |
| `@angular-eslint/template/click-events-have-key-events` | 148 | 0 | 48 | ❌ | P2 |
| `@angular-eslint/template/elements-content` | 120 | 0 | 60 | ❌ | P2 || `@typescript-eslint/no-unused-vars` | 0 | 145 | 80 | ❌ | P1 |
| `@angular-eslint/template/label-has-associated-control` | 38 | 0 | 18 | ❌ | P2 |
| `@typescript-eslint/no-empty-function` | 0 | 25 | 15 | ❌ | P1 |
| `@typescript-eslint/no-inferrable-types` | 0 | 0 | 0 | ✅ | P0 |
| `@angular-eslint/template/alt-text` | 12 | 0 | 11 | ❌ | P2 |
| `@angular-eslint/directive-selector` | 0 | 0 | 0 | ❌ | P1 |
| `prefer-const` | 0 | 0 | 0 | ✅ | P0 |
| `@angular-eslint/no-empty-lifecycle-method` | 0 | 0 | 0 | ❌ | P1 |
| `@typescript-eslint/consistent-indexed-object-style` | 0 | 0 | 0 | ✅ | P0 |
| `@angular-eslint/no-output-native` | 0 | 0 | 0 | ❌ | P1 |
| `@angular-eslint/use-lifecycle-interface` | 0 | 0 | 0 | ❌ | P1 |
| `@typescript-eslint/ban-ts-comment` | 0 | 0 | 0 | ❌ | P1 |
| `@angular-eslint/no-input-rename` | 0 | 0 | 0 | ❌ | P1 |
| `@angular-eslint/no-output-on-prefix` | 0 | 0 | 0 | ❌ | P1 |
| `@typescript-eslint/prefer-for-of` | 0 | 0 | 0 | ❌ | P1 |
| `no-prototype-builtins` | 0 | 0 | 0 | ❌ | P1 |
| `no-self-assign` | 0 | 0 | 0 | ✅ | P0 |
| `no-empty` | 0 | 0 | 0 | ❌ | P1 |
| `@typescript-eslint/no-unused-expressions` | 0 | 0 | 0 | ❌ | P0 |
| `@angular-eslint/component-selector` | 0 | 0 | 0 | ❌ | P1 |
| `@angular-eslint/template/prefer-control-flow` | 0 | 0 | 0 | ❌ | P1 |
| `@angular-eslint/template/role-has-required-aria` | 1 | 0 | 1 | ❌ | P2 |
| `@typescript-eslint/consistent-type-definitions` | 0 | 0 | 0 | ✅ | P0 |
| `@angular-eslint/prefer-inject` | 0 | 0 | 0 | ❌ | P1 |

---

## P0 — Auto-fixable & Bugs (fix immediately)

These can be fixed with `--fix` or are actual bugs that need manual attention.

### [x] 1. Auto-fix: `prefer-const` + `no-inferrable-types` + `consistent-indexed-object-style`

**45 issues, ~20 files — run `npx ng lint --fix`**

These are trivially auto-fixable by ESLint. One command cleans them all.

### [x] 2. Bug: `no-self-assign` — self-assignment in help component

- `src/app/core/components/shell/help/help.component.ts` (line 350)
  - `this.helpFrame.nativeElement.src` is assigned to itself — likely a bug or workaround that needs investigation.

### [x] 3. Bug: `no-unused-expressions` — expression used as statement

- `src/app/core/state/activity-feed.state.ts` (line 20)
  - Expression statement that does nothing — likely a missing function call.

---

## P1 — Quick Manual Fixes (small effort, high value)

### [x] 4. Remove unused imports and variables (`no-unused-vars`) — 145 warnings in 80 files

Delete unused imports, variables, and function parameters. For unused callback params, prefix with `_`.

**Top offenders:**
- `src/app/core/services/activity.service.ts` — unused `of`
- `src/app/core/services/items-list.service.ts` — unused `signal`, `Signal`, `computed`
- `src/app/core/services/topic.service.ts` — unused `exhaustMap`, `of`
- `src/app/core/state/user.store.ts` — unused `withHooks`, `User`
- `src/app/core/services/tour.service.ts` — unused `computed`, `inject`, `BehaviorSubject`, `take`
- `src/app/core/services/notification.service.ts` — unused `inject`
- `src/app/features/account/password-forgot/password-forgot.component.ts` — unused `Router`
- `src/app/features/account/password-reset/password-reset.component.ts` — unused `Router`
- `src/app/features/account/profile/profile.component.ts` — unused `computed`
- Multiple spec files with unused `vi`, `of`, `throwError` imports
- Multiple components with unused `err` callback params (prefix with `_err`)

### [x] 5. Remove empty lifecycle methods (`no-empty-lifecycle-method`) — 7 errors in 7 files

Remove empty `ngOnInit()`, `ngOnDestroy()` etc. or add actual logic.

- `src/app/features/account/login/esteid/esteid.component.ts`
- `src/app/features/topics/topic-view/components/argument/argument.component.ts`
- `src/app/features/topics/topic-view/components/idea-reply-form/idea-reply-form.component.ts`
- `src/app/features/topics/topic-view/components/topic-add-groups-dialog/topic-add-groups-dialog.component.ts`
- `src/app/features/topics/topic-view/components/topic-discussion/topic-discussion.component.ts`
- `src/app/features/topics/topic-view/topic-view.component.ts`
- `src/app/shared/directives/etherpad.directive.ts`

### [x] 6. Fix directive/component selector prefixes — CLEARED

Directives and components must use `app-` or `cos-` prefix.

- `src/app/shared/dialog/dialog-ref.ts` — also needs `prefer-inject`
- `src/app/shared/directives/download.directive.ts`
- `src/app/shared/directives/dragndrop.directive.ts`
- `src/app/shared/directives/html.directive.ts`
- `src/app/shared/directives/markdown.directive.ts`
- `src/app/features/topics/topic-view/components/idea-reply-report/idea-reply-report.component.ts` (component-selector)
- Spec files with mock directives (3 files) — use `app-` or `cos-` prefix for stubs

### [x] 7. Fix output naming issues — CLEARED

**`no-output-native`** — output names clash with native DOM events:
- `src/app/features/account/profile/profile.component.spec.ts`
- `src/app/shared/components/pagination/pagination.component.ts`
- `src/app/shared/components/tabs/tabs.component.ts`
- `src/app/shared/components/typeahead/typeahead.component.ts` (×2)

**`no-output-on-prefix`** — output names should not start with `on`:
- `src/app/features/groups/dialogs/topic-requests-dialog/topic-requests-dialog.component.ts`
- `src/app/shared/components/create-menu/create-menu.component.ts`

### [x] 8. Fix input rename issues (`no-input-rename`) — CLEARED

- `src/app/features/home/components/feature-box/feature-box.component.ts` (×2)
- `src/app/shared/directives/markdown.directive.ts`

### [x] 9. Replace `@ts-ignore` with `@ts-expect-error` (`ban-ts-comment`) — 3 errors in 3 files

- `src/app/features/account/login/login.component.spec.ts`
- `src/app/features/groups/group-create/components/group-create-help/group-create-help.component.spec.ts`
- `src/app/shared/components/topic-attachments/topic-attachments.component.spec.ts`

### [x] 10. Misc single-issue fixes — CLEARED

- **`no-prototype-builtins`**: `src/app/core/components/shell/global-search-panel/global-search-panel.component.ts`
  - Replace `obj.hasOwnProperty(x)` with `Object.hasOwn(obj, x)` or `Object.prototype.hasOwnProperty.call(obj, x)`
- **`no-empty`**: `src/app/core/components/shell/language-select/language-select.component.ts`
  - Add comment or logic to empty catch/if block
- **`prefer-for-of`**: 2 files — use `for...of` instead of indexed loop
- **`prefer-control-flow`**: `src/app/features/topics/topic-view/components/topic-settings/topic-settings.component.html`
  - Replace `*ngIf`/`*ngFor` with `@if`/`@for`
- **`prefer-inject`**: `src/app/shared/dialog/dialog-ref.ts`
  - Use `inject()` instead of constructor injection
- **`use-lifecycle-interface`**: 4 files — add lifecycle interface (e.g., `implements OnInit`)

### [x] 11. Empty functions in non-lifecycle methods (`no-empty-function`) — 25 warnings in 15 files

Review empty methods — add `// intentionally empty` comment or actual logic.

---

## P2 — Accessibility (a11y) Template Fixes

**~684 errors across 78+ template files**

These are real accessibility issues. Fix by adding keyboard event handlers, ARIA attributes, and semantic HTML.

### [x] 12. `click-events-have-key-events` + `interactive-supports-focus` — 148 errors in 48 files

Every `(click)` handler on a non-interactive element needs:
1. A `(keydown.enter)` or `(keyup)` handler
2. A `tabindex="0"` attribute
3. A `role="button"` attribute

Or better: replace `<div (click)>` / `<span (click)>` with `<button>`.

**Remediated:**
- `nav.component.ts` / `nav.component.html`
- `global-search-panel.component.ts`
- `help.component.ts`
- `language-select.component.ts`
- `profile.component.html`
- `group-card.component.ts`
- `toggle.component.ts`
- `tabs.component.html`
- `step-navigator.component.ts`
- `invitation-dialog.component.html`
- `interrupt-dialog.component.html`
- `activity-item.component.html`
- `dashboard.component.html`
- `group-detail.component.html`
- `group-create.component.html`
- `topic-participants.component.html`
- `topic-view.component.html`
- `invite-editors.component.html`
- `topic-invite-dialog.component.html`
- `accessibility-menu.component.ts`
- `edit-idea-folder.component.ts`
- `step-vote-settings.component.ts`
- `group-add-topics-dialog.component.html`
- `group-request-topics-dialog.component.html`
- `topic-requests-dialog.component.html`
- `step-invite.component.html`
- `group-create-help.component.html`
- `topic-attachments.component.html`
- `step-topic-info.component.html`
- `topic-settings-panel.component.html`
- `topic-add-groups-dialog.component.html`
- `topic-report-form.component.html`
- `topic-report-reason.component.html`
- `argument.component.html`
- `idea-reply-form.component.html`
- `post-argument-form.component.html`
- `topic-discussion.component.html`
- `topic-discussion-create-dialog.component.html`
- `topic-vote-deadline.component.html`
- `topic-notification-settings.component.html`
- `topic-milestones.component.html`
- `topic-content.component.html`

**Remaining top offenders:**
None. All major P2 offenders remediated.

### [x] 13. `elements-content` — 120 errors in 60 files

Elements like `<button>`, `<a>`, `<h1>`–`<h6>` must have text content or `aria-label`.

For icon-only buttons: add `aria-label="description"`.
For headings with translated content: ensure `{{ 'KEY' | translate }}` is inside the tag.

### [x] 14. `label-has-associated-control` — 25 errors in 12 files

`<label>` elements must be linked to a form control via `for="id"` or by wrapping the control.

### [x] 15. `alt-text` — 8 errors in 7 files

Add `alt` attributes to `<img>` elements. Use descriptive text or `alt=""` for decorative images.

### [x] 16. `role-has-required-aria` — 1 error in 1 file

Ensure elements with ARIA `role` have required ARIA attributes.

---

## P3 — Type Safety (gradual, ongoing)

### [/] 17. Replace `any` types (`no-explicit-any`) — 390 warnings in ~130 files

This is the largest category and should be addressed gradually, service by service and component by component.

**Recommended approach:**
1. Start with core interfaces (small surface, high impact)
2. Then core services (most `any` types live here)
3. Then components and specs

**Top 20 files by `any` count:**

| File | Count |
|------|------:|
| `core/services/topic-ideation.service.ts` | 86 |
| `features/topics/topic-view/topic-view.component.spec.ts` | 62 |
| `core/services/activity.service.ts` | 38 |
| `core/services/topic-argument.service.ts` | 37 |
| `core/services/topic-vote.service.ts` | 31 |
| `core/services/topic.service.ts` | 26 |
| `features/topics/topic-view/components/topic-info-sidebar/topic-info-sidebar.component.spec.ts` | 21 |
| `core/services/user.service.ts` | 21 |
| `core/services/topic-event.service.ts` | 21 |
| `features/topics/topic-view/components/topic-vote-cast/topic-vote-cast.component.spec.ts` | 14 |
| `features/topics/topic-view/topic-view.component.ts` | 12 |
| `features/topics/topic-view/components/topic-vote-cast/topic-vote-cast.component.ts` | 11 |
| `shared/directives/markdown.directive.ts` | 11 |
| `core/services/group-join.service.ts` | 10 |
| `core/services/topic-invite-user.service.ts` | 10 |
| `core/services/topic-report.service.ts` | 10 |
| `features/topics/topic-view/components/invite-editors/invite-editors.component.spec.ts` | 10 |
| `core/services/topic-join.service.ts` | 10 |
| `core/services/group-invite-user.service.ts` | 9 |
| `features/groups/group-detail/components/group-invite-user/group-invite-user.component.spec.ts` | 9 |

---

## Execution Strategy

### Phase 1 — Quick wins (< 1 hour)
1. Run `npx ng lint --fix` for auto-fixable rules (P0 items 1)
2. Fix bugs in items 2–3
3. Remove unused imports/vars (item 4) — can be partially automated

### Phase 2 — Manual cleanup (2–4 hours)
4. Fix items 5–11 (lifecycle methods, selectors, outputs, inputs, misc)

### Phase 3 — Accessibility (ongoing, per-component)
5. Fix a11y issues component-by-component during regular work
6. Prioritize most-used components first

### Phase 4 — Type safety (ongoing, per-service)
7. Replace `any` types service-by-service, starting with core services
8. Add proper API response types as interfaces

---

## CI Integration (future)

Once the error count is manageable, add `npm run lint` to CI pipeline:
```yaml
# In CI config
- run: npm run lint -- --max-warnings=0
```

Start with `--max-warnings=<current-count>` and ratchet down over time.
