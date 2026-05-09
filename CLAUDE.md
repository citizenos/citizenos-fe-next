# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This is `citizenos-fe-next` — the Angular 21 frontend replacing the legacy app. The parent `CLAUDE.md` (one directory up) has the full architecture reference. This file adds local corrections and quick-reference items.

## Commands

```sh
npm start          # Dev server (ng serve) at http://localhost:4200
npm run build      # Production build → dist/
npm test           # Run all unit tests via ng test (uses Angular compiler)
npm run lint       # Run ESLint
npm run e2e        # Playwright end-to-end tests
npm run e2e:ui     # Playwright UI mode (interactive)
```

Single test file:
```sh
npx ng test --no-watch --include src/app/path/to/file.spec.ts
```

**CRITICAL**: Never `npx vitest run` directly — it skips the Angular compiler, causing `input()` signals to appear uninitialized and 60+ tests to fail. Always use `ng test`.

## Component Compliance Checklist

Every new or migrated component must satisfy:

- No `CommonModule` import
- `inject()` DI — no constructor injection
- `signal()` / `computed()` for local state — no `new BehaviorSubject()` in components
- `@if` / `@for` / `@else` / `@empty` — not `*ngIf` / `*ngFor`
- `ChangeDetectionStrategy.OnPush` on every component
- `standalone: true` on every component
- No unused imports

## Correction: `ItemsListService` has a `reset()` method

Despite what the parent CLAUDE.md says, `ItemsListService` **does** have a `reset()` method (line 90 of `core/services/items-list.service.ts`). Call `service.reset()` to restore default params and page 1.

## Tracking Files

- **`MIGRATION-AGENT-CHECKLIST.md`** — per-component migration status (Account, Groups, Topics). Check before starting any migration work.
- **`ESLINT-CLEANUP.md`** — prioritised ESLint fix list (P0→P3). Mark items `[x]` as done; work top-to-bottom.
- **`TASKS.md`** (repo root, one level up) — active task tracking for the whole monorepo. Use this instead of TodoWrite.

## Known Pre-existing Test Failures (do not chase)

These fail before your changes and are not your responsibility:

- `page-list-header.component.spec.ts` — NG0950 (4 tests)
- `list-filter-toolbar.component.spec.ts` — DOM query count (1 test)
- `create-menu.component.spec.ts` — TranslatePipe mock (3 tests)
- `pagination.component.spec.ts` — `pages()` returns `[]` (8 tests)
- `icon.component.spec.ts` — NG0950 (4 tests)
- `nav.component.spec.ts`, `topic-header.component.spec.ts` — external template resolution

## Dialog System Quick Reference

```typescript
// Open
const ref = dialog.open(MyDialogComponent, { data: { foo: 'bar' } });
ref.afterClosed().subscribe(result => ...);

// Inside dialog component
private data = inject<{ foo: string }>(DIALOG_DATA);
private dialogRef = inject(DialogRef);
this.dialogRef.close(result);
```

Import path: `src/app/shared/dialog` (via `index.ts` barrel).

## Argument / Ideation Special Cases

- `argument.edits` is a **keyed object**, not an array — use `Object.entries()` or `keyvalue` pipe.
- `ArgumentComponent` uses `forwardRef(() => ArgumentComponent)` for recursive nesting — do not remove.
- After argument mutations, **emit to the parent** — do not call a service reload; `TopicArgumentService` exposes no reload trigger.
