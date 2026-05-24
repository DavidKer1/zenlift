## Why

Zenlift's local-first data model needs strict domain types before SQLite repositories, screens, and calculations are implemented. Defining these entities early keeps workout history immutable, IDs sync-ready, and feature code aligned with the documented model.

## What Changes

- Add TypeScript interfaces for the core workout tracking entities from the compact data model.
- Add string union types for domain enums such as equipment, exercise category, set type, workout status, and personal record type.
- Use SQL-facing snake_case fields for persisted entities and typed composed read models for richer queries.
- Include types for full routines, full sessions, workout exercises with sets, and workout summaries.
- Ensure `npx tsc --noEmit` can validate the domain entity surface.

## Capabilities

### New Capabilities
- `domain-entities`: Type-safe domain entity definitions and composed query models for routines, workouts, sets, settings, and records.

### Modified Capabilities

## Impact

- Creates `src/domain/entities/index.ts`.
- Provides the type contract for SQLite schema, repositories, services, and UI flows.
- Must stay aligned with `docs/data_model.md` and the product rule that all IDs are UUID text values.
