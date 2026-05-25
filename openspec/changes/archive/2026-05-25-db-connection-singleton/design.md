## Context

Zenlift uses `expo-sqlite` for local-first data storage. The app must ensure that all database operations share the same connection to benefit from WAL mode's concurrent read/write semantics and to guarantee migrations run exactly once. Currently there is no centralized connection management—each consumer would open its own connection, risking inconsistent state.

The `migration-system` change provides `runMigrations(db)` and `getCurrentVersion(db)`, which this singleton invokes during initialization.

## Goals / Non-Goals

**Goals:**
- Provide a single `getDatabase()` entry point that always returns the same `SQLiteDatabase` instance
- Prevent concurrent calls from triggering duplicate initialization (double-open)
- Enable WAL journal mode and foreign key enforcement on every connection
- Run migrations automatically and exactly once, before the database is used
- Support safe teardown for testing via `resetDatabaseInstance()`

**Non-Goals:**
- Connection pooling or read replicas (not needed for mobile local-first)
- Encryption at rest (expo-sqlite does not support SQLCipher; out of scope)
- Migration rollback or version downgrade (handled by `migration-system` if needed)
- Replacing existing direct `openDatabaseAsync` calls (deferred to follow-up changes)

## Decisions

### Decision 1: Singleton with `initPromise` guard

**Chosen:** Module-level `let db: SQLite.SQLiteDatabase | null = null` and `let initPromise: Promise<SQLite.SQLiteDatabase> | null = null`.

`getDatabase()` returns the existing `db` if set. If `initPromise` is already in flight, it returns that same promise—this prevents concurrent callers from starting a second initialization. Otherwise it creates a new `initPromise`, runs the full init sequence, sets `db` on success, clears `initPromise`, and returns `db`.

**Alternatives considered:**
- *Lazy static with mutex/lock*: Overkill for JS single-threaded event loop; the promise guard achieves the same effect without extra dependencies.
- *React Context provider*: Would tie database life cycle to component tree; not suitable for SQLite which should outlive individual screens.
- *Expo's `useSQLiteContext`*: Only available inside React components; we need access from non-React code (repositories, migrations).

### Decision 2: WAL mode and foreign keys as PRAGMAs

**Chosen:** Execute `PRAGMA journal_mode=WAL` and `PRAGMA foreign_keys=ON` via `db.execAsync()` immediately after opening, before running migrations.

WAL mode allows concurrent reads while a write is in progress, which matters during active workouts where autosave writes happen while the UI reads history. Foreign keys ensure referential integrity (e.g., a set cannot reference a deleted exercise).

### Decision 3: Initialization sequence

1. `SQLite.openDatabaseAsync('zenlift.db')`
2. `await db.execAsync('PRAGMA journal_mode = WAL')`
3. `await db.execAsync('PRAGMA foreign_keys = ON')`
4. `await runMigrations(db)`
5. Set module-level `db` variable
6. Clear `initPromise`
7. Log success and return `db`

On any error, clear `initPromise`, log the error, and re-throw so callers can handle it.

### Decision 4: Teardown functions

- `closeDatabase()`: Calls `db.closeAsync()`, sets `db` and `initPromise` to `null`. For app shutdown or logout.
- `resetDatabaseInstance()`: Same as `closeDatabase()` but semantically intended for test teardown (reset between test suites).

## Risks / Trade-offs

- **[Risk] `openDatabaseAsync` may throw if the database file is corrupted** → Mitigation: Error is caught, `initPromise` is cleared so the next call retries initialization from scratch.
- **[Risk] Multiple `getDatabase()` calls before init completes all receive the same promise—if it fails, all callers see the error simultaneously** → Mitigation: Callers should catch and may retry. The singleton clears the failed promise so the next call starts fresh.
- **[Risk] WAL file (`zenlift.db-wal`) may grow large without checkpointing** → Mitigation: SQLite auto-checkpoints at 1000 pages by default. If this becomes an issue, we can add periodic `PRAGMA wal_checkpoint(TRUNCATE)` in a future change.
- **[Trade-off] Global mutable state (`db`, `initPromise`)** → Acceptable because it's module-scoped (not global), there is exactly one database, and the pattern is well-established in React Native SQLite usage.

## Migration Plan

1. Create `src/storage/database/connection.ts` with the singleton implementation
2. No existing code is broken—this is a new module
3. Follow-up changes will replace existing `SQLite.openDatabaseAsync` calls with `getDatabase()`
4. Rollback: Delete the file; no data migration needed since this is a connection wrapper

## Open Questions

- None at this time.
