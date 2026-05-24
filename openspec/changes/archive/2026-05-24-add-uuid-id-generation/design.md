## Context

Zenlift is offline-first and must use UUID text IDs from day one. There is no current shared ID generator in `src/utils/`, so future repositories and seeds would otherwise invent their own IDs.

## Goals / Non-Goals

**Goals:**
- Provide a single `generateId()` utility.
- Prefer standard `crypto.randomUUID()` when available.
- Provide a fallback with low collision risk.
- Keep generated IDs compatible with SQLite `TEXT PRIMARY KEY`.

**Non-Goals:**
- Do not implement sync or conflict resolution.
- Do not create IDs for existing records.
- Do not decide repository APIs.

## Decisions

- Use `globalThis.crypto?.randomUUID` as the first path because it creates standard UUID strings without an extra dependency when available.
- Use a fallback dependency only if needed by the runtime; otherwise use a compact local fallback based on random bytes where available.
- Keep the utility synchronous so repositories and seed builders can call it without changing control flow.

## Risks / Trade-offs

- Runtime crypto availability varies -> Guard access and cover fallback behavior in tests.
- Fallback quality -> Prefer a maintained fallback package if native crypto is insufficient in SDK 55 targets.
- Test flakiness from randomness -> Test format and no collisions over a bounded sample, not exact values.
