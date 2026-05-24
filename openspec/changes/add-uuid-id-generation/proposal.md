## Why

All Zenlift records need text UUIDs from day one so offline-created data can remain stable and future sync can merge safely. A single ID utility prevents ad hoc identifiers from leaking into repositories, seeds, and workout creation flows.

## What Changes

- Add a shared `generateId()` utility for UUID text IDs.
- Prefer `crypto.randomUUID()` when available in the runtime.
- Provide a safe fallback that works when `crypto.randomUUID()` is unavailable.
- Add lightweight verification that repeated calls produce unique SQLite-compatible text IDs.

## Capabilities

### New Capabilities
- `id-generation`: Shared UUID text ID generation for local-first entities.

### Modified Capabilities

## Impact

- Creates `src/utils/id.ts`.
- May add a small fallback dependency if the current runtime/tooling needs it.
- Will be used by future database seeds, repositories, workout sessions, routines, exercises, and set logs.
