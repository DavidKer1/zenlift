## Context

The domain entities are already defined in `src/domain/entities/index.ts` with snake_case field names matching SQLite conventions. The storage layer (`src/storage/`) has scaffold directories but no implementation. The schema DDL is the blocking prerequisite for repositories, migrations, and seed data.

The project uses `expo-sqlite` with WAL mode. All tables use `TEXT` primary keys for UUIDs (except `app_settings` and `_migrations`). Foreign keys are enforced with `PRAGMA foreign_keys = ON`.

## Goals / Non-Goals

**Goals:**
- Export `CREATE_TABLES_SQL` and `CREATE_INDICES_SQL` as TypeScript string constants
- Every column name matches the snake_case field names from the domain entities exactly
- Foreign keys enforce referential integrity with CASCADE DELETE
- CHECK constraints prevent invalid enum values at the database level
- Indices cover the query hotspots identified in the data model docs

**Non-Goals:**
- Migration versioning or runner (handled separately)
- Seed data insertion (handled separately)
- Table alteration or DROP statements
- Repository implementation

## Decisions

**Decision 1: Two separate SQL constants**

`CREATE_TABLES_SQL` for table creation and `CREATE_INDICES_SQL` for indices. This allows the migration runner to execute tables first, then indices, keeping concerns separated. Single-string alternatives were considered but rejected because indices depend on tables existing and re-running index creation independently is useful.

**Decision 2: `IF NOT EXISTS` on all statements**

Every `CREATE TABLE` and `CREATE INDEX` uses `IF NOT EXISTS` to make the schema idempotent. This is essential for the migration runner, which may re-execute the full schema on app start to ensure correctness.

**Decision 3: Column names use snake_case matching TypeScript entities**

The TypeScript entities (`src/domain/entities/index.ts`) already use snake_case. Column names mirror those fields exactly so that `SELECT *` rows map 1:1 to entity interfaces without aliasing. Example: `is_custom` not `isCustom`, `display_name_es` not `displayNameEs`.

**Decision 4: `TEXT` for all entity PKs except `app_settings` and `_migrations`**

`app_settings.key` is the PK (not a UUID) and `_migrations.version` is an integer PK. All other tables use `id TEXT PRIMARY KEY`. SQLite does not require a separate `UNIQUE` constraint on the PK column.

**Decision 5: CHECK constraints on enum columns**

Enums validated at the schema level:
- `workout_sessions.status`: CHECK(status IN ('active','completed','cancelled'))
- `exercise_muscles.role`: CHECK(role IN ('primary','secondary'))
- `set_logs.set_type`: CHECK(set_type IN ('normal','warmup','drop','failure','amrap'))
- `personal_records.type`: CHECK(type IN ('max_weight','max_volume','max_reps','estimated_1rm','max_session_volume'))

All correspond to TypeScript union types in the domain entities.

**Decision 6: `FOREIGN KEY ... REFERENCES ... ON DELETE CASCADE`**

Cascading deletes propagate from parent to child rows. When a routine is deleted, its days and exercises are removed. When a workout session is deleted, its exercises and set logs are removed. This matches the data model doc and ensures no orphaned rows.

**Decision 7: `_` prefix on `_migrations` table**

The underscore prefix signals this is an internal/meta table, not a domain entity. It follows SQLite convention for internal tables.

## Risks / Trade-offs

- **[Risk] CASCADE DELETE may surprise if a routine is deleted unintentionally** → Mitigation: UI should confirm routine deletion. The repository layer can also implement soft-delete via `is_archived` before hard-delete.

- **[Risk] Schema changes require new migrations** → Mitigation: The `_migrations` table tracks which migrations have run. Schema changes after this initial DDL will go through the migration runner, not by editing `schema.ts`.

- **[Risk] CHECK constraints are enforced at SQLite level even when domain types change** → Mitigation: Domain union types in `src/domain/entities/index.ts` are the single source of truth. The schema CHECK constraints mirror them. Updates to both must stay in sync.
