# AGENTS.md

> This file is designed to be parsed and completed by AI agents.
> All sections MUST be filled. Do not leave placeholders in the final version.

---

## PROJECT_OVERVIEW

**purpose:**
The `citizenos-fe-next` application is the modern front-end for the CitizenOS platform, enabling civic participation, group decision-making, and secure electronic voting.

**scope:**
This Angular application acts as the user interface for civic discussions, group management, proposal ideation, and secure digital signature processes, replacing the legacy front-end with scalable, strongly-typed, zoneless Angular 21 patterns.

**key_features:**
- Interactive Public and Private Topics (Ideation/Discussion/Voting)
- Secure User Authentication and e-ID Integration (Web-EID)
- Global Group Management and Permissions System

---

## REPOSITORY_STRUCTURE

**tree:**
/
├── README.md
├── CHANGELOG.md
├── AGENTS.md
├── docs/
├── src/
├── tests/


**directories:**
- path: /src
  description: Contains all the Angular 21 source code including standalone components, routes, styles, and Signal state stores.

- path: /docs
  description: Contains comprehensive guides, architecture diagrams, API docs, and end-user guides.

- path: /tests
  description: E2E and Vitest setup/specs for complete application testing.

---

## TECHNOLOGY_STACK

**languages:**
- TypeScript
- HTML
- SCSS

**frameworks:**
- Angular 21 (Zoneless, Standalone)

**infrastructure:**
- Webpack/Vite (Angular Build System)
- Node.js

**databases:**
- N/A (Client-side app communicating with REST API)

**tools:**
- Vitest (Unit Testing)
- @ngrx/signals (State Management patterns)
- Tailwind (if to be configured later) or generic SCSS structure

---

## KEY_CONVENTIONS

**code_style:**
Strict TypeScript with ESLint and Prettier rules; Zoneless Angular relying on Signals (`input()`, `output()`, `model()`) exclusively.

**naming_conventions:**
Kebab-case for file names and directories. PascalCase for classes. CamelCase for properties and signal methods.

**commit_messages:**
Conventional Commits style, e.g., `feat: login page implementation`, `fix: header padding`.

**documentation_rules:**
Mandatory completion of english documentation for new features before any PR merging. No undocumented configurations.

---

## BRANCH_STRATEGY

**main_branches:**
- name: main
  purpose: Deployable production-ready state of the user interface.

- name: develop
  purpose: Aggregation of all completed feature branches before release to main.

**supporting_branches:**
- pattern: feature/*
  purpose: Development of new capabilities or migration tasks.

- pattern: bugfix/*
  purpose: Quick patching of identified issues.

- pattern: hotfix/*
  purpose: Direct patches to production code for critical severity issues.

**merge_rules:**
- Documentation must be up-to-date.
- Passing unit tests via Vitest required.

---

## REFERENCES

**internal:**
- path: /docs/architecture
  description: Frontend module architecture and state store structures.

- path: /docs/api
  description: Integration guide with the Citizenos API endpoints.

**external:**
- name: Angular Signals
  url: https://angular.dev/guide/signals

---



## AI_INSTRUCTIONS

**rules:**
- Fill all sections before marking task complete
- Do not remove section headers
- Keep formatting consistent
- Validate against repository contents
- **Do NOT use the `any` type** to resolve TypeScript errors; avoid introducing new lint warnings. Use proper typings, strict interfaces, or `Partial<T>`.

---

## METADATA

**last_updated:** 2026-04-17
**updated_by:** Antigravity AI
**version:** 1.0.0
