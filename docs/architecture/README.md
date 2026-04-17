# Architecture Guidelines

This directory contains diagrams and documentation regarding the architecture of the modern Citizenos front-end application.

## Key Patterns
- **Zoneless Angular**: The application avoids `zone.js` and instead uses `provideZonelessChangeDetection()`.
- **Signals**: Reactivity is driven by `@angular/core` signals.
- **Standalone**: No `NgModules` are used for application routing or component creation.
