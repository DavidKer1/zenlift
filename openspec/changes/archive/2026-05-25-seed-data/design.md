## Context

Zenlift is a local-first SQLite app. On first launch, the database has empty `muscle_groups`, `exercises`, and `exercise_muscles` tables. Users cannot build routines or track workouts without these reference entities. Seeding must be idempotent and fast.

The `exercise-repository` change provides the repository layer for the `exercises`, `muscle_groups`, and `exercise_muscles` tables. `seedData.ts` sits at the same layer and is called during database initialization (after migrations, before the app renders).

## Goals / Non-Goals

**Goals:**
- Seed 13 muscle groups with distinct colors
- Seed 25 essential exercises with `isCustom=0`
- Link each exercise to at least one primary muscle via `exercise_muscles`, with optional secondary muscles
- Ensure idempotency: running seed multiple times produces the same result (INSERT OR IGNORE)
- `seedIfEmpty()` guards against re-seeding when data already exists
- Run all inserts in a single transaction for performance
- Support optional JSON data source (`assets/exercise.json`) with hardcoded fallback

**Non-Goals:**
- User-editable muscle groups (seed data is fixed)
- Full exercise library (25 exercises covers MVP essentials)
- Migration or update mechanism for seed data changes
- Localization of exercise names in this change
- UI for managing seed exercises

## Decisions

### D1: UUID generation via deterministic helper

Each seed record gets a deterministic UUID derived from its entity name using `generateSeedId(prefix, name)`. This ensures the same UUID across all devices and seed runs, making INSERT OR IGNORE work correctly without needing to query existing rows first.

```typescript
function generateSeedId(prefix: string, name: string): string {
  // Stable UUID generation from prefix + name
  const hash = simpleHash(`${prefix}:${name}`);
  return formatUUID(hash);
}
```

**Alternative considered**: Using `crypto.randomUUID()` at call time. Rejected because different UUIDs on each run would break INSERT OR IGNORE (different IDs = new rows).

### D2: Single transaction for all inserts

`seedDatabase(db)` wraps all INSERT statements in `BEGIN TRANSACTION`/`COMMIT`. This avoids partial seeds and is significantly faster than individual inserts. On failure, the transaction rolls back and the app retries on next launch.

### D3: Plan A (JSON file) + Plan B (hardcoded data)

The module attempts to load `assets/exercise.json` first. If unavailable or malformed, falls back to hardcoded data arrays. This allows editing seed data without modifying TypeScript code while guaranteeing the app always works.

Structure of `assets/exercise.json`:

```json
{
  "muscleGroups": [
    { "id": "<uuid>", "name": "Chest", "displayNameEs": "Pecho", "color": "#EF4444" }
  ],
  "exercises": [
    {
      "id": "<uuid>",
      "name": "Bench Press",
      "equipment": "Barbell",
      "category": "Chest",
      "muscles": [
        { "muscleGroupId": "<chest-uuid>", "role": "primary" }
      ]
    }
  ]
}
```

### D4: seedIfEmpty checks muscle_groups only

Since muscle groups are a prerequisite for exercises (FK relationship), checking only `muscle_groups` is sufficient. If muscle groups exist, we assume exercises exist too. This is the simplest and fastest guard.

## Risks / Trade-offs

**[Risk] Seed data becomes outdated over time** → Since exercises are `isCustom=0` and not user-editable, updating them requires a new app version. Mitigation: keep the seed set small (25 exercises) and allow users to create custom exercises.

**[Risk] Hardcoded data and JSON diverge** → If someone updates the JSON but not the hardcoded fallback (or vice versa), different users could see different data. Mitigation: add a CI test that validates JSON equals hardcoded data; document that JSON is the source of truth and hardcoded data must match.

**[Risk] INSERT OR IGNORE skips constraint violations silently** → If an exercise references a muscle group that doesn't exist, it could fail silently. Mitigation: insert muscle groups first, then exercises, then exercise_muscles in that order; use FK validation in tests.

**[Risk] JSON file loading on first render** → Reading a JSON asset on app launch adds negligible latency (<5ms). Not a concern.

## Open Questions

- Should the JSON file be generated from the hardcoded data or vice versa? Proposed: JSON is source of truth; hardcoded is a snapshot. CI validates they match.
- Should seed data be versioned for future migrations? Out of scope for MVP; can be added later with a `seed_version` setting.
