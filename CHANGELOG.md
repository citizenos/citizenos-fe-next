# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Comprehensive Registration form with validation (Company, Confirm Password, Terms, Show in Search).
- Password visibility toggle (eye/eye-off) for password fields.
- Social login integration (Facebook, Google, Smart-ID, Estonian ID) via partner URL flow.
- Custom `InputComponent` support for legacy floating labels and Noto Sans typography.
- Standardized `ButtonComponent` variants and sizes aligned with legacy design system.
- `JSONPointerCompiler` support for resolving legacy `@:` translation string references.

### Changed
- Refactored `InputComponent` to use `ViewEncapsulation.None` for precise native input styling.
- Global typography updated to Noto Sans across the application.
- Standardized flexbox alignment for action buttons.
- Migrated initial scaffolding to Angular 21 Zoneless patterns.
- Vitest testing framework integration.
- Standard project documentation files (`AGENTS.md`, `README.md`, `CHANGELOG.md`).
