# Migration Audit Report: citizenos-fe-next

This report summarizes the findings from an audit of the current state of the `citizenos-fe-next` migration, evaluated against the project rules and the `migration-agent-checklist.md`.

## Executive Summary
The migration has made significant progress in adopting Angular 21 patterns (Signals, Standalone, `inject()`). However, there are recurring violations of the migration checklist, particularly regarding **SVG inlining**, **shared component usage**, and **template hygiene**.

---

## 1. Iconography & SVG Inlining
- **Violations**: Significant use of inlined SVGs in `TopicHeaderComponent` and `TopicIdeationComponent`.
- **Status**: Currently being refactored to use `IconRegistryService` and `<cos-icon>`.

---

## 2. Shared Component Usage
- **Violations**: `ListFilterToolbarComponent` not used in `TopicIdeationComponent`. Raw `<select>` elements used instead.
- **Empty States**: Missing `@empty` blocks in `TopicDiscussionComponent`.

---

## 3. Angular 21 Pattern Compliance
- **Manual Subscriptions**: Manual `.subscribe()` in constructors should be refactored to `toSignal` or `computed` where possible.
- **Getters**: `isLoggedIn` getter in `TopicHeaderComponent` should be a `computed` signal.

---

## 4. Specific Component Audit
- `TopicView`: Missing initial loading state.
- `TopicContent`: `ResizeObserver` needs mock in spec.
- `TopicDiscussion`: Template missing `@empty`.
