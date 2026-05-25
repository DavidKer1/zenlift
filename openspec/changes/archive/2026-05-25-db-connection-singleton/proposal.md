## Why

Zenlift needs a single, consistent database connection across the entire app. Without a singleton, multiple callers could open separate connections, leading to lost writes in WAL mode, stale reads, and migration race conditions. A singleton ensures every part of the app shares one connection with WAL journaling, foreign key enforcement, and automatic migration execution on first open.

## What Changes

- Create `src/storage/database/connection.ts` exporting `getDatabase()`, `closeDatabase()`, and `resetDatabaseInstance()`
- Implement singleton pattern with `initPromise` guard to prevent concurrent double-initialization
- Activate `PRAGMA journal_mode=WAL` for concurrent read/write performance
- Activate `PRAGMA foreign_keys=ON` for referential integrity
- Run `runMigrations(db)` automatically during initialization, before returning the database instance
- Use `expo-sqlite` (`SQLite.openDatabaseAsync`) with database name `zenlift.db`
- Handle initialization errors gracefully and surface them to callers

## Capabilities

### New Capabilities

- `database-connection`: Singleton database connection management with WAL mode, foreign keys, and automatic migrations

### Modified Capabilities

<!-- No existing capabilities are modified. -->

## Impact

- New module: `src/storage/database/connection.ts`
- Depends on `src/storage/migrations/index.ts` (from `migration-system` change) for `runMigrations(db)` and `getCurrentVersion(db)`
- All code that currently opens a database directly will need to migrate to `getDatabase()` (no **BREAKING** changes in this proposal—existing code can be migrated incrementally)
- Core dependency: `expo-sqlite` (already in project)
