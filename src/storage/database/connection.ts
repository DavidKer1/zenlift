import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from '@/storage/migrations';
import { seedIfEmpty } from '@/storage/repositories/seedData';

let db: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[DB] Initializing database connection...');

      const database = await SQLite.openDatabaseAsync('zenlift.db');

      await database.execAsync('PRAGMA journal_mode = WAL');
      await database.execAsync('PRAGMA foreign_keys = ON');
      await runMigrations(database);
      await seedIfEmpty(database);

      db = database;
      initPromise = null;

      console.log('[DB] Database initialized successfully');
      return database;
    } catch (error) {
      initPromise = null;
      console.error('[DB] Failed to initialize database:', error);
      throw error;
    }
  })();

  return initPromise;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
  initPromise = null;
}

export async function resetDatabaseInstance(): Promise<void> {
  return closeDatabase();
}
