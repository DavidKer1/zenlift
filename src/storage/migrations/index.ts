/**
 * Zenlift SQLite migration system
 *
 * Applies versioned schema migrations idempotently via `runMigrations(db)`.
 * Each migration runs in its own transaction and records its version in
 * the `_migrations` table.
 *
 * @remarks
 * - Migration v1 executes `CREATE_TABLES_SQL` + `CREATE_INDICES_SQL` from
 *   `@/storage/database/schema`.
 * - `runMigrations()` is safe to call multiple times; only pending
 *   migrations are applied.
 * - `getCurrentVersion()` returns the highest applied version or 0 if
 *   no migrations have run yet (including the first-run case where
 *   `_migrations` doesn't exist).
 */

import { CREATE_INDICES_SQL, CREATE_TABLES_SQL } from '@/storage/database/schema';
import type { SQLiteDatabase } from 'expo-sqlite';

// ---------------------------------------------------------------------------
// Migration interface
// ---------------------------------------------------------------------------

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

// ---------------------------------------------------------------------------
// Migration definitions (append new migrations at the end)
// ---------------------------------------------------------------------------

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Create initial schema (12 tables + indices)',
    sql: `${CREATE_TABLES_SQL}\n${CREATE_INDICES_SQL}`,
  },
];

// ---------------------------------------------------------------------------
// getCurrentVersion
// ---------------------------------------------------------------------------

/**
 * Returns the highest applied migration version from `_migrations`, or 0
 * if no migrations have been applied or the table doesn't exist yet.
 */
export async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  try {
    const rows = await db.getAllAsync<{ maxVersion: number | null }>(
      'SELECT MAX(version) as maxVersion FROM _migrations',
    );
    return rows[0]?.maxVersion ?? 0;
  } catch {
    // _migrations table doesn't exist yet (first run before v1 is applied)
    return 0;
  }
}

// ---------------------------------------------------------------------------
// runMigrations
// ---------------------------------------------------------------------------

/**
 * Applies all pending migrations in version order.
 *
 * Each migration is wrapped in an explicit `BEGIN` / `COMMIT` transaction.
 * On failure the transaction is rolled back and the error propagates to
 * the caller.
 *
 * Safe to call multiple times — only migrations with `version > currentVersion`
 * are applied.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  pending.sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.execAsync('BEGIN;');

    try {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO _migrations (version, description, appliedAt) VALUES (?, ?, ?)',
        migration.version,
        migration.description,
        new Date().toISOString(),
      );
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  }
}
