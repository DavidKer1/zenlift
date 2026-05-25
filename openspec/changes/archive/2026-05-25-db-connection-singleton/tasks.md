## 1. Module scaffolding

- [x] 1.1 Create `src/storage/database/` directory
- [x] 1.2 Create `src/storage/database/connection.ts` with module-level `db` and `initPromise` variables
- [x] 1.3 Add `console` logging for init start, success, and error paths

## 2. Singleton implementation

- [x] 2.1 Implement `getDatabase()` with the singleton + `initPromise` guard pattern
- [x] 2.2 Ensure concurrent callers share the same `initPromise` without duplicate initialization
- [x] 2.3 Implement `closeDatabase()` to close the connection and null out `db`/`initPromise`
- [x] 2.4 Implement `resetDatabaseInstance()` as a test-teardown alias for `closeDatabase()`

## 3. Database initialization sequence

- [x] 3.1 Call `SQLite.openDatabaseAsync('zenlift.db')` as the first step
- [x] 3.2 Execute `PRAGMA journal_mode = WAL` via `db.execAsync()`
- [x] 3.3 Execute `PRAGMA foreign_keys = ON` via `db.execAsync()`
- [x] 3.4 Call `runMigrations(db)` from `src/storage/migrations/index.ts`
- [x] 3.5 On success, store `db` in the module-level variable and clear `initPromise`
- [x] 3.6 On any error, clear `initPromise` (do NOT store a failed db), log error, and re-throw

## 4. Edge cases and hardening

- [x] 4.1 Handle the case where `getDatabase()` is called after `closeDatabase()` (should re-initialize)
- [x] 4.2 Ensure `PRAGMA` failures are caught and surfaced as initialization errors
- [x] 4.3 Add TypeScript type imports from `expo-sqlite`

## 5. Verification

- [x] 5.1 Verify `getDatabase()` returns the same instance on repeated calls
- [x] 5.2 Verify WAL mode is active by reading `PRAGMA journal_mode` after init
- [x] 5.3 Verify foreign keys are ON by reading `PRAGMA foreign_keys` after init
- [x] 5.4 Verify migrations run automatically on first open
- [x] 5.5 Run typecheck and confirm no errors
