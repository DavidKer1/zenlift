## Why

The SQLite schema DDL exists but has no mechanism to apply it idempotently or evolve it over time. Without a versioned migration runner, every schema change requires manual intervention, risking data loss, duplicate application, or drift between development and production databases. This blocks all storage-layer work (repositories, seed data, active-session recovery).

## What Changes

- Create `src/storage/migrations/index.ts` exporting the `Migration` interface, `MIGRATIONS` array, `runMigrations()`, and `getCurrentVersion()`
- Migration v1 executes `CREATE_TABLES_SQL` + `CREATE_INDICES_SQL` from `src/storage/database/schema.ts`
- Each migration runs in its own transaction via `db.transaction()`
- After each successful migration, the version is recorded in the `_migrations` table
- `runMigrations()` is idempotent: only applies migrations with version > current max version
- `getCurrentVersion()` returns the highest applied migration version (or 0 if none)
- Handles the first-run case where `_migrations` table doesn't exist yet (it is created by schema v1)

## Capabilities

### New Capabilities

- `migration-runner`: A versioned, idempotent SQLite migration system that applies pending migrations in order, each in its own transaction, and tracks applied versions via the `_migrations` table. Exposes `runMigrations(db)` to apply pending migrations and `getCurrentVersion(db)` to query the current schema version.

### Modified Capabilities

<!-- No existing capability requirements are changing. This is a new artifact. -->

## Impact

- New file: `src/storage/migrations/index.ts`
- Depends on: `src/storage/database/schema.ts` exporting `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL`
- Blocks: repository implementations (which need schema applied before CRUD operations)
- Integration point: database initialization code must call `runMigrations(db)` before any repository queries
