## 1. Migration interface and constants

- [x] 1.1 Create `src/storage/migrations/index.ts` with JSDoc header and imports from `@/storage/database/schema`
- [x] 1.2 Define `Migration` interface with `version: number`, `description: string`, `sql: string`
- [x] 1.3 Define `MIGRATIONS` array with v1 migration importing `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL`

## 2. getCurrentVersion

- [x] 2.1 Implement `getCurrentVersion(db)` using `db.getAllAsync('SELECT MAX(version) as maxVersion FROM _migrations')`
- [x] 2.2 Handle missing `_migrations` table via try/catch, returning 0 on error
- [x] 2.3 Return the max version number (or 0 if null/undefined)

## 3. runMigrations core logic

- [x] 3.1 Implement `runMigrations(db)` — call `getCurrentVersion(db)` to get current version
- [x] 3.2 Filter `MIGRATIONS` array to only those with `version > currentVersion`
- [x] 3.3 Iterate pending migrations in version order

## 4. Per-migration transaction

- [x] 4.1 Wrap each migration in explicit `BEGIN` / `COMMIT` / `ROLLBACK` via `db.execAsync()`
- [x] 4.2 After successful SQL execution, INSERT into `_migrations` with version, description, and `new Date().toISOString()` as appliedAt
- [x] 4.3 On failure, ROLLBACK the transaction and propagate the error

## 5. TypeScript and integration verification

- [x] 5.1 Run `npx tsc --noEmit` to verify no type errors
- [x] 5.2 Verify exports: `Migration`, `MIGRATIONS`, `runMigrations`, `getCurrentVersion`
- [x] 5.3 Confirm v1 migration references `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL` from schema.ts
- [x] 5.4 Confirm `_migrations` table DDL exists in `CREATE_TABLES_SQL` (from sqlite-schema change)
