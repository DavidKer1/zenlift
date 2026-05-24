## Context

The compact data model defines the entities needed for exercises, routines, workout sessions, set logs, personal records, settings, and migrations. There are currently no domain entity files under `src/domain/`.

## Goals / Non-Goals

**Goals:**
- Represent all documented core entities as strict TypeScript interfaces.
- Use text ID fields consistently for UUIDs.
- Keep persisted entity fields in snake_case to match SQLite rows.
- Provide composed read models for common repository and UI shapes.

**Non-Goals:**
- Do not create SQLite schema or repositories.
- Do not implement validation schemas.
- Do not implement business calculations.

## Decisions

- Use string union types instead of TypeScript enums to keep emitted JavaScript minimal and easy to serialize.
- Use nullable fields as `string | null` or `number | null` where SQLite rows can be null.
- Keep date/time values as ISO-8601 strings at the entity boundary.
- Define composed types in the same barrel file until usage pressure justifies splitting by aggregate.

## Risks / Trade-offs

- Snake_case differs from UI conventions -> Keep row entities snake_case and allow later mapper/view-model types if needed.
- Future schema changes -> Keep entity names aligned with `docs/data_model.md` and update through OpenSpec deltas.
- Over-modeling early -> Include only documented MVP/P1 entities and composed query types requested by the task.
