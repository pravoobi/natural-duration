# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-25

### Added
- `parseDuration` — parse human-written duration strings into structured objects
- `parseDurationSafe` — non-throwing variant with a `confidence` score (0–1)
- `parseRelative` — parse relative expressions (`"in 3 days"`, `"next Monday"`) and resolve to a `Date`
- `parseRecurring` — parse recurring schedule expressions (`"every 10 minutes"`, `"every 2nd Tuesday at 9am"`)
- `formatDuration` — format a `DurationObject` back to a human string (`long`, `short`, `verbose`)
- `msToComponents` — decompose raw milliseconds into a `DurationObject`
- `registerLocale` / `getLocale` — locale extension points for community locale packs
- English (`en`) locale with full unit, weekday, relative, and recurring expression coverage
- `strict` mode option that throws on unrecognised input instead of returning a zero result
- 1000-character input length guard across all parse functions
- Dual CJS + ESM build with TypeScript declarations and source maps

[Unreleased]: https://github.com/OWNER/natural-duration/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/OWNER/natural-duration/releases/tag/v0.1.0
