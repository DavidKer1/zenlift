import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { z } from 'zod';

import { clearSettingsStorage } from '@/features/settings/useSettings';
import { getDatabase } from '@/storage/database/connection';
import { seedDatabase } from '@/storage/repositories/seedData';

const EXPORT_VERSION = 1;
const MAX_IMPORT_SIZE_BYTES = 50 * 1024 * 1024;

const TABLE_COLUMNS = {
  muscle_groups: ['id', 'name', 'display_name_es', 'color'],
  exercises: [
    'id',
    'name',
    'equipment',
    'category',
    'is_custom',
    'is_favorite',
    'notes',
    'created_at',
    'updated_at',
  ],
  exercise_muscles: ['id', 'exercise_id', 'muscle_group_id', 'role'],
  routines: ['id', 'name', 'description', 'goal', 'is_archived', 'sort_order', 'created_at', 'updated_at'],
  routine_days: ['id', 'routine_id', 'name', 'day_of_week', 'sort_order'],
  routine_exercises: [
    'id',
    'routine_day_id',
    'exercise_id',
    'target_sets',
    'target_reps_min',
    'target_reps_max',
    'rest_seconds',
    'notes',
    'sort_order',
  ],
  workout_sessions: [
    'id',
    'routine_id',
    'routine_day_id',
    'name',
    'started_at',
    'ended_at',
    'duration_seconds',
    'status',
    'notes',
    'created_at',
    'updated_at',
  ],
  workout_exercises: ['id', 'workout_session_id', 'exercise_id', 'sort_order', 'notes'],
  set_logs: [
    'id',
    'workout_exercise_id',
    'set_number',
    'weight',
    'reps',
    'set_type',
    'is_completed',
    'completed_at',
    'notes',
  ],
  personal_records: [
    'id',
    'exercise_id',
    'workout_session_id',
    'type',
    'value',
    'weight',
    'reps',
    'achieved_at',
  ],
  app_settings: ['key', 'value'],
} as const;

const EXPORT_TABLES = Object.keys(TABLE_COLUMNS) as TableName[];

const IMPORT_TABLES: TableName[] = [
  'muscle_groups',
  'exercises',
  'exercise_muscles',
  'routines',
  'routine_days',
  'routine_exercises',
  'workout_sessions',
  'workout_exercises',
  'set_logs',
  'personal_records',
  'app_settings',
];

const DELETE_TABLES: TableName[] = [
  'set_logs',
  'personal_records',
  'workout_exercises',
  'workout_sessions',
  'routine_exercises',
  'routine_days',
  'routines',
  'exercise_muscles',
  'exercises',
  'muscle_groups',
  'app_settings',
];

type TableName = keyof typeof TABLE_COLUMNS;
type DatabaseRow = Record<string, unknown>;

const rowSchema = z.object({}).catchall(z.unknown());

export const zenliftExportSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string().min(1),
  appVersion: z.string().min(1),
  muscle_groups: z.array(rowSchema),
  exercises: z.array(rowSchema),
  exercise_muscles: z.array(rowSchema),
  routines: z.array(rowSchema),
  routine_days: z.array(rowSchema),
  routine_exercises: z.array(rowSchema),
  workout_sessions: z.array(rowSchema),
  workout_exercises: z.array(rowSchema),
  set_logs: z.array(rowSchema),
  personal_records: z.array(rowSchema),
  app_settings: z.array(rowSchema),
});

export type ZenliftExportData = z.infer<typeof zenliftExportSchema>;

export type ImportPickResult =
  | { canceled: true }
  | {
      canceled: false;
      uri: string;
      name: string;
      size: number | null;
      isLargeFile: boolean;
    };

export function getAppMetadata() {
  return {
    appName: Constants.expoConfig?.name ?? 'Zenlift',
    appVersion: Constants.expoConfig?.version ?? '1.0.0',
    buildNumber:
      Constants.expoConfig?.ios?.buildNumber ??
      Constants.expoConfig?.android?.versionCode?.toString() ??
      Constants.nativeBuildVersion ??
      'dev',
  };
}

function createExportFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `zenlift-${timestamp}.zenlift`;
}

function normalizeSqlValue(value: unknown): string | number | null {
  if (value === null || typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return JSON.stringify(value);
}

async function readTable(table: TableName): Promise<DatabaseRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<DatabaseRow>(`SELECT * FROM ${table}`);
}

async function insertRow(table: TableName, row: DatabaseRow): Promise<boolean> {
  const db = await getDatabase();
  const allowedColumns = TABLE_COLUMNS[table];
  const columns = allowedColumns.filter((column) => row[column] !== undefined);

  if (columns.length === 0) {
    return false;
  }

  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map((column) => normalizeSqlValue(row[column]));
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
    ...values,
  );

  return result.changes > 0;
}

export async function exportZenliftData(): Promise<string> {
  const sharingAvailable = await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error('La hoja para compartir no esta disponible en este dispositivo.');
  }

  const metadata = getAppMetadata();
  const exportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: metadata.appVersion,
  } as ZenliftExportData;

  for (const table of EXPORT_TABLES) {
    exportData[table] = await readTable(table);
  }

  const file = new File(Paths.cache, createExportFilename());
  file.create({ overwrite: true });
  file.write(JSON.stringify(exportData, null, 2));

  await Sharing.shareAsync(file.uri, {
    dialogTitle: 'Exportar datos Zenlift',
    mimeType: 'application/json',
    UTI: 'public.json',
  });

  return file.uri;
}

export async function pickZenliftImportFile(): Promise<ImportPickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: '*/*',
  });

  if (result.canceled) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  const size = asset.size ?? null;

  return {
    canceled: false,
    uri: asset.uri,
    name: asset.name,
    size,
    isLargeFile: typeof size === 'number' && size > MAX_IMPORT_SIZE_BYTES,
  };
}

export async function importZenliftData(uri: string): Promise<{ inserted: number }> {
  const file = new File(uri);
  const rawText = await file.text();
  const parsed = JSON.parse(rawText) as unknown;
  const exportData = zenliftExportSchema.parse(parsed);
  let inserted = 0;

  for (const table of IMPORT_TABLES) {
    for (const row of exportData[table]) {
      if (await insertRow(table, row)) {
        inserted += 1;
      }
    }
  }

  return { inserted };
}

export async function deleteAllZenliftData(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync('BEGIN;');

  try {
    for (const table of DELETE_TABLES) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }

  clearSettingsStorage();
  await seedDatabase(db);
}
