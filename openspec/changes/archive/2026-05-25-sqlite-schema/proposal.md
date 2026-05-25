## Why

Zenlift needs a complete, valid SQLite schema matching the 12 domain entity interfaces. Without the DDL, no storage layer can be built — repositories cannot create tables, migrations cannot run, and the entire data layer is blocked. This change delivers the foundational SQL all storage code depends on.

## What Changes

- Create `src/storage/database/schema.ts` with full SQLite DDL for all 12 tables
- Export `CREATE_TABLES_SQL` as a single constant with all `CREATE TABLE IF NOT EXISTS` statements
- Export `CREATE_INDICES_SQL` as a separate constant with all `CREATE INDEX IF NOT EXISTS` statements
- All primary keys are `TEXT` for UUIDs (except `app_settings.key` and `_migrations.version`)
- All foreign keys include `ON DELETE CASCADE`
- CHECK constraints on `status`, `role`, `set_type`, and `type` columns
- 5 covering indices for query hotspots (exercise_muscles lookups, session filtering, set logs)

## Capabilities

### New Capabilities

- `sqlite-ddl`: The complete SQLite schema exported as runnable SQL string constants, covering all 12 domain tables with indices and integrity constraints

### Modified Capabilities

<!-- No existing capability requirements are changing. This is a new artifact. -->

## Impact

- New file: `src/storage/database/schema.ts`
- Depends on domain entity types already defined in `src/domain/entities/index.ts`
- Blocked by: none (entities are defined)
- Blocks: repository implementations, migration runner, seed data, active-session recovery
