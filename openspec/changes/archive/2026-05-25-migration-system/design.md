## Context

The `sqlite-schema` change provides `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL` from `src/storage/database/schema.ts`. This migration system is the mechanism that applies that schema (and future changes) to the SQLite database. The `_migrations` table — defined in the schema itself — tracks which migrations have been applied. The migration runner is the bridge between DDL definitions and the live database.

The system must work with `expo-sqlite`'s API: `db.execAsync()` for running SQL and `db.getAllAsync()` for querying the `_migrations` table. WAL mode and foreign keys are enabled by the database initialization layer (not by this migration runner).

## Goals / Non-Goals

**Goals:**
- Apply `CREATE_TABLES_SQL` + `CREATE_INDICES_SQL` as migration v1 on first run
- Track applied migrations in the `_migrations` table
- Ensure each migration runs in its own transaction (`db.transaction()` not available; use `db.execAsync()` wrapped in `BEGIN/COMMIT` — or use `db.withTransactionAsync()` if available in the expo-sqlite version)
- Be idempotent: running `runMigrations()` multiple times applies only pending migrations
- Support incremental migrations (v2, v3...) by appending to the `MIGRATIONS` array
- Export `getCurrentVersion()` for diagnostics and conditional logic

**Non-Goals:**
- Database initialization (opening, WAL mode, foreign keys pragma)
- Down migrations or rollback
- Migration file scanning or dynamic loading (static array is fine for the MVP)
- Seed data insertion (handled separately)

## Decisions

**Decision 1: Static MIGRATIONS array vs. file-based scanning**

Static array chosen. Simple, tree-shakeable, no dynamic imports. Migrations are TypeScript constants, not `.sql` files. This avoids runtime file system access on mobile and works with Hermes. When the migration count grows beyond ~20, we can revisit file-based loading.

**Decision 2: Transaction strategy — explicit BEGIN/COMMIT vs. db.withTransactionAsync()**

Using `db.execAsync()` with explicit `BEGIN; / COMMIT; / ROLLBACK;` wrapped around each migration's SQL. This gives precise control over the transaction boundary and avoids relying on expo-sqlite versions that may not expose `withTransactionAsync()`. The pattern:

```
await db.execAsync('BEGIN;');
try {
  await db.execAsync(migration.sql);
  await db.execAsync(`INSERT INTO _migrations (version, description, appliedAt) VALUES (...);`);
  await db.execAsync('COMMIT;');
} catch (e) {
  await db.execAsync('ROLLBACK;');
  throw e;
}
```

**Decision 3: First-run detection — try/catch on _migrations SELECT vs. pre-check**

`getCurrentVersion()` wraps the `SELECT MAX(version) FROM _migrations` in a try/catch. If the table doesn't exist, it returns 0. This avoids a separate `PRAGMA table_info` check and is simpler. The catch is only needed on the very first run; after v1 applies, the table exists.

**Decision 4: runMigrations signature takes expo-sqlite database instance**

`runMigrations(db: ExpoSQLiteDatabase)` receives the database instance as a parameter rather than importing it. This keeps the module pure and testable — a mock database can be passed in tests. The caller (app initialization code) owns database lifecycle.

**Decision 5: SQL string for v1 — reference the schema constants dynamically vs. import and concatenate**

Import `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL` from `src/storage/database/schema.ts` and concatenate them:

```typescript
import { CREATE_TABLES_SQL, CREATE_INDICES_SQL } from '@/storage/database/schema';

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Create initial schema (12 tables + indices)',
    sql: `${CREATE_TABLES_SQL}\n${CREATE_INDICES_SQL}`,
  },
];
```

This keeps the migration definition in sync with the schema source of truth. If schema.ts changes, v1 SQL changes automatically.

**Decision 6: Error handling — fail fast vs. skip and continue**

Fail fast: if a migration fails, the error propagates to the caller. The failed migration's transaction is rolled back, and no subsequent migrations run. This prevents partial schema states. The caller should handle the error (e.g., show an alert, reset the database).

## Risks / Trade-offs

- **[Risk] Schema.ts changes would silently change v1 behavior for new installs** → Mitigation: After v1 is applied to any production database, never edit schema.ts. All future schema changes go through new migrations (v2, v3...). The `sqlite-schema` change should be treated as immutable after first release.

- **[Risk] Migration v1 is large (12 tables + indices) and could timeout on slow devices** → Mitigation: expo-sqlite executes synchronously within the native thread. The DDL is small enough (under 3KB of SQL) that execution time is negligible. If future migrations are larger, they can be split.

- **[Risk] No rollback strategy** → Mitigation: Backward-incompatible migrations are not part of MVP scope. When needed, a backwards-compatible migration strategy (additive-only, with deprecation phases) should be adopted.

- **[Risk] Concurrent access while migrations run** → Mitigation: WAL mode allows reads during writes, but `runMigrations()` should be called during app initialization before any repository code runs. It's a startup gate, not a background process.

## Open Questions

- Should `runMigrations()` be called from `_layout.tsx` or from a dedicated database init module? → Defer to implementation; a dedicated `src/storage/database/init.ts` that calls `runMigrations(db)` before exporting the db instance is preferred.
- Should we add a `migrations_applied_at` timestamp vs. just `appliedAt`? → The `_migrations` table already has `appliedAt TEXT NOT NULL` from the schema definition. Use `new Date().toISOString()`.
