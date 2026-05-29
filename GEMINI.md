# CitizenosFeNext - Project Instructions

This project is the modern Angular 21 frontend for the CitizenOS platform, replacing the legacy frontend with a scalable, strongly-typed, and zoneless architecture.

## Project Overview
- **Purpose**: Modern frontend for CitizenOS, enabling civic participation, group decision-making, and secure electronic voting.
- **Technology Stack**: 
    - **Framework**: Angular 21 (Zoneless, Standalone Components).
    - **State Management**: `@ngrx/signals`.
    - **Language**: TypeScript (Strict mode).
    - **Styling**: SCSS.
    - **Internationalization**: `@ngx-translate`.
    - **E-ID Integration**: `web-eid` for secure digital signatures.
    - **Testing**: Vitest (Unit) and Playwright (E2E).

## Building and Running
- **Development Server**: `npm start` or `ng serve` (runs at `http://localhost:4200`).
- **Production Build**: `npm run build` or `ng build`.
- **Unit Testing**: `npm test` or `ng test`. 
    - **CRITICAL**: Always use `ng test`. Never run `npx vitest` directly as it skips the Angular compiler and will cause signal-related test failures.
- **End-to-End Testing**: `npm run e2e` (Playwright).
- **Linting**: `npm run lint` (ESLint).

## Architectural Guidelines
- **Zoneless Angular**: The project uses `provideZonelessChangeDetection()`.
- **Standalone Components**: Every component, directive, and pipe must be `standalone: true`.
- **Signals-First**: Use `signal()`, `computed()`, `input()`, `output()`, and `model()` for state and data flow.
- **Dependency Injection**: Use the `inject()` function instead of constructor injection.
- **Change Detection**: Every component must use `ChangeDetectionStrategy.OnPush`.
- **Control Flow**: Use the new `@if`, `@for`, `@else`, `@empty`, `@switch` syntax.
- **Routing**: Localized routes are managed under `:lang` (e.g., `/en/topics`). Feature routes are lazy-loaded.

## Development Conventions
- **No `any` Type**: Never use `any`. Use proper interfaces, `Partial<T>`, `unknown`, or specific types.
- **Naming**: Use kebab-case for file and directory names.
- **Component Checklist**:
    - `standalone: true`.
    - `ChangeDetectionStrategy.OnPush`.
    - No `CommonModule` imports.
    - Use `inject()`.
    - Use Signals for local state.
- **ESLint & Prettier**: Strict adherence to linting rules is required. Check `ESLINT-CLEANUP.md` for prioritized fixes.
- **Migration Tracking**: Refer to `MIGRATION-AGENT-CHECKLIST.md` for the status of component migrations.

## Key Files
- `CLAUDE.md`: Local guidance and quick references.
- `AGENTS.md`: AI agent context and repository structure.
- `MIGRATION-AGENT-CHECKLIST.md`: Tracks migration progress of components.
- `ESLINT-CLEANUP.md`: List of prioritized ESLint fixes.
- `src/app/app.config.ts`: Core application configuration.
- `src/app/app.routes.ts`: Root routing configuration.
