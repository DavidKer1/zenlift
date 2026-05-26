import { CREATE_TABLES_SQL } from '@/storage/database/schema';
import { MIGRATIONS } from './index';

describe('schema and migrations', () => {
  const removedColumn = ['rest', 'seconds'].join('_');

  it('does not define the removed break column on routine_exercises in current schema', () => {
    const routineExercisesTable = CREATE_TABLES_SQL.match(
      /CREATE TABLE IF NOT EXISTS routine_exercises \(([\s\S]*?)\);/,
    )?.[1];

    expect(routineExercisesTable).toBeDefined();
    expect(routineExercisesTable).toContain('target_sets');
    expect(routineExercisesTable).toContain('target_reps_min');
    expect(routineExercisesTable).toContain('target_reps_max');
    expect(routineExercisesTable).not.toContain(removedColumn);
  });

  it('includes a migration that rebuilds routine_exercises without the removed break column', () => {
    const migration = MIGRATIONS.find((item) => item.version === 2);

    expect(migration).toBeDefined();
    expect(migration?.sql).toContain('ALTER TABLE routine_exercises RENAME TO routine_exercises_legacy');
    expect(migration?.sql).toContain('CREATE TABLE routine_exercises');
    expect(migration?.sql).toContain('INSERT INTO routine_exercises');
    expect(migration?.sql).toContain('DROP TABLE routine_exercises_legacy');

    const createTableSql = migration?.sql.match(
      /CREATE TABLE routine_exercises \(([\s\S]*?)\);/,
    )?.[1];
    expect(createTableSql).toBeDefined();
    expect(createTableSql).not.toContain(removedColumn);
  });
});
