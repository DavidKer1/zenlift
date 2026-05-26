import type { SQLiteDatabase, SQLiteBindValue } from 'expo-sqlite';
import { generateId } from '@/utils/id';
import type {
  Routine,
  RoutineDay,
  RoutineExercise,
  FullRoutine,
  FullRoutineDay,
  RoutineExerciseWithExercise,
  Exercise,
} from '@/domain/entities';

export type RoutineWithCounts = Routine & {
  day_count: number;
  exercise_count: number;
};

interface RoutineJoinRow {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  notes: string | null;
  sort_order: number;
  ex_id: string;
  ex_name: string;
  ex_equipment: string;
  ex_category: string;
  ex_is_custom: number;
  ex_is_favorite: number;
  ex_notes: string | null;
  ex_created_at: string | null;
  ex_updated_at: string | null;
}

function mapJoinRow(row: RoutineJoinRow): RoutineExerciseWithExercise {
  return {
    id: row.id,
    routine_day_id: row.routine_day_id,
    exercise_id: row.exercise_id,
    target_sets: row.target_sets,
    target_reps_min: row.target_reps_min,
    target_reps_max: row.target_reps_max,
    notes: row.notes,
    sort_order: row.sort_order,
    exercise: {
      id: row.ex_id,
      name: row.ex_name,
      equipment: row.ex_equipment as Exercise['equipment'],
      category: row.ex_category as Exercise['category'],
      is_custom: row.ex_is_custom as Exercise['is_custom'],
      is_favorite: row.ex_is_favorite as Exercise['is_favorite'],
      notes: row.ex_notes,
      created_at: row.ex_created_at,
      updated_at: row.ex_updated_at,
    },
  };
}

type RoutineData = {
  name: string;
  description?: string | null;
  goal?: string | null;
};

type RoutineUpdates = {
  name?: string;
  description?: string | null;
  goal?: string | null;
  sortOrder?: number;
};

type DayData = {
  name: string;
  dayOfWeek?: number | null;
};

type DayUpdates = {
  name?: string;
  dayOfWeek?: number | null;
  sortOrder?: number;
};

type ExerciseData = {
  exerciseId: string;
  targetSets?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  notes?: string | null;
};

type ExerciseUpdates = {
  exerciseId?: string;
  targetSets?: number | null;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  notes?: string | null;
  sortOrder?: number;
};

const EXERCISES_JOIN_SQL = `
  SELECT
    re.id, re.routine_day_id, re.exercise_id,
    re.target_sets, re.target_reps_min, re.target_reps_max,
    re.notes, re.sort_order,
    e.id AS ex_id, e.name AS ex_name,
    e.equipment AS ex_equipment, e.category AS ex_category,
    e.is_custom AS ex_is_custom, e.is_favorite AS ex_is_favorite,
    e.notes AS ex_notes, e.created_at AS ex_created_at,
    e.updated_at AS ex_updated_at
  FROM routine_exercises re
  JOIN exercises e ON re.exercise_id = e.id
  WHERE re.routine_day_id = ?
  ORDER BY re.sort_order ASC
`;

export class RoutineRepo {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async getAll(options?: { includeArchived?: boolean }): Promise<Routine[]> {
    const includeArchived = options?.includeArchived ?? false;
    if (includeArchived) {
      return this.db.getAllAsync<Routine>(
        'SELECT * FROM routines ORDER BY sort_order ASC',
      );
    }
    return this.db.getAllAsync<Routine>(
      'SELECT * FROM routines WHERE is_archived = 0 ORDER BY sort_order ASC',
    );
  }

  async getAllWithDayCount(options?: {
    includeArchived?: boolean;
  }): Promise<RoutineWithCounts[]> {
    const includeArchived = options?.includeArchived ?? false;
    const archiveFilter = includeArchived ? '' : 'WHERE r.is_archived = 0';

    return this.db.getAllAsync<RoutineWithCounts>(
      `
        SELECT
          r.*,
          COALESCE(day_counts.day_count, 0) AS day_count,
          COALESCE(exercise_counts.exercise_count, 0) AS exercise_count
        FROM routines r
        LEFT JOIN (
          SELECT routine_id, COUNT(*) AS day_count
          FROM routine_days
          GROUP BY routine_id
        ) day_counts ON day_counts.routine_id = r.id
        LEFT JOIN (
          SELECT rd.routine_id, COUNT(re.id) AS exercise_count
          FROM routine_days rd
          LEFT JOIN routine_exercises re ON re.routine_day_id = rd.id
          GROUP BY rd.routine_id
        ) exercise_counts ON exercise_counts.routine_id = r.id
        ${archiveFilter}
        ORDER BY r.sort_order ASC
      `,
    );
  }

  async getById(id: string): Promise<Routine | null> {
    return this.db.getFirstAsync<Routine>(
      'SELECT * FROM routines WHERE id = ?',
      id,
    );
  }

  async getFullRoutine(id: string): Promise<FullRoutine | null> {
    const routine = await this.getById(id);
    if (!routine) return null;

    const days = await this.getDays(id);
    const fullDays: FullRoutineDay[] = [];

    for (const day of days) {
      const exercises = await this.getExercises(day.id);
      fullDays.push({ ...day, exercises });
    }

    return { ...routine, days: fullDays };
  }

  async create(data: RoutineData): Promise<Routine> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO routines (id, name, description, goal, is_archived, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, ?, ?)`,
      id,
      data.name,
      data.description ?? null,
      data.goal ?? null,
      now,
      now,
    );

    return (await this.getById(id))!;
  }

  async update(id: string, updates: RoutineUpdates): Promise<void> {
    const clauses: string[] = [];
    const params: SQLiteBindValue[] = [];

    if (updates.name !== undefined) {
      clauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.description !== undefined) {
      clauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.goal !== undefined) {
      clauses.push('goal = ?');
      params.push(updates.goal);
    }
    if (updates.sortOrder !== undefined) {
      clauses.push('sort_order = ?');
      params.push(updates.sortOrder);
    }

    if (clauses.length === 0) return;

    clauses.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await this.db.runAsync(
      `UPDATE routines SET ${clauses.join(', ')} WHERE id = ?`,
      ...params,
    );
  }

  async archive(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE routines SET is_archived = 1, updated_at = ? WHERE id = ?',
      new Date().toISOString(),
      id,
    );
  }

  async unarchive(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE routines SET is_archived = 0, updated_at = ? WHERE id = ?',
      new Date().toISOString(),
      id,
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM routines WHERE id = ?', id);
  }

  async duplicate(id: string, newName: string): Promise<FullRoutine> {
    const newRoutineId = generateId();
    let fullRoutine: FullRoutine;

    await this.db.withTransactionAsync(async () => {
      const original = await this.getById(id);
      if (!original) throw new Error(`Routine ${id} not found`);

      const now = new Date().toISOString();

      await this.db.runAsync(
        `INSERT INTO routines (id, name, description, goal, is_archived, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
        newRoutineId,
        newName,
        original.description,
        original.goal,
        original.sort_order,
        now,
        now,
      );

      const originalDays = await this.getDays(id);
      const dayIdMap = new Map<string, string>();

      for (const day of originalDays) {
        const newDayId = generateId();
        dayIdMap.set(day.id, newDayId);

        await this.db.runAsync(
          `INSERT INTO routine_days (id, routine_id, name, day_of_week, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          newDayId,
          newRoutineId,
          day.name,
          day.day_of_week ?? null,
          day.sort_order,
        );
      }

      for (const day of originalDays) {
        const newDayId = dayIdMap.get(day.id)!;
        const sourceExercises = await this.db.getAllAsync<RoutineExercise>(
          'SELECT * FROM routine_exercises WHERE routine_day_id = ? ORDER BY sort_order ASC',
          day.id,
        );

        for (const ex of sourceExercises) {
          const newExId = generateId();

          await this.db.runAsync(
            `INSERT INTO routine_exercises (id, routine_day_id, exercise_id, target_sets, target_reps_min, target_reps_max, notes, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            newExId,
            newDayId,
            ex.exercise_id,
            ex.target_sets ?? null,
            ex.target_reps_min ?? null,
            ex.target_reps_max ?? null,
            ex.notes ?? null,
            ex.sort_order,
          );
        }
      }

      fullRoutine = (await this.getFullRoutine(newRoutineId))!;
    });

    return fullRoutine!;
  }

  async getDays(routineId: string): Promise<RoutineDay[]> {
    return this.db.getAllAsync<RoutineDay>(
      'SELECT * FROM routine_days WHERE routine_id = ? ORDER BY sort_order ASC',
      routineId,
    );
  }

  async createDay(routineId: string, data: DayData): Promise<RoutineDay> {
    const id = generateId();

    await this.db.runAsync(
      `INSERT INTO routine_days (id, routine_id, name, day_of_week, sort_order)
       VALUES (?, ?, ?, ?, 0)`,
      id,
      routineId,
      data.name,
      data.dayOfWeek ?? null,
    );

    return (await this.db.getFirstAsync<RoutineDay>(
      'SELECT * FROM routine_days WHERE id = ?',
      id,
    ))!;
  }

  async updateDay(id: string, updates: DayUpdates): Promise<void> {
    const clauses: string[] = [];
    const params: SQLiteBindValue[] = [];

    if (updates.name !== undefined) {
      clauses.push('name = ?');
      params.push(updates.name);
    }
    if (updates.dayOfWeek !== undefined) {
      clauses.push('day_of_week = ?');
      params.push(updates.dayOfWeek);
    }
    if (updates.sortOrder !== undefined) {
      clauses.push('sort_order = ?');
      params.push(updates.sortOrder);
    }

    if (clauses.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE routine_days SET ${clauses.join(', ')} WHERE id = ?`,
      ...params,
    );
  }

  async deleteDay(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM routine_days WHERE id = ?', id);
  }

  async reorderDays(routineId: string, dayIds: string[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (let i = 0; i < dayIds.length; i++) {
        await this.db.runAsync(
          'UPDATE routine_days SET sort_order = ? WHERE id = ? AND routine_id = ?',
          i,
          dayIds[i],
          routineId,
        );
      }
    });
  }

  async getExercises(dayId: string): Promise<RoutineExerciseWithExercise[]> {
    const rows = await this.db.getAllAsync<RoutineJoinRow>(
      EXERCISES_JOIN_SQL,
      dayId,
    );
    return rows.map(mapJoinRow);
  }

  async createExercise(
    dayId: string,
    data: ExerciseData,
  ): Promise<RoutineExercise> {
    const id = generateId();

    await this.db.runAsync(
      `INSERT INTO routine_exercises (id, routine_day_id, exercise_id, target_sets, target_reps_min, target_reps_max, notes, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      id,
      dayId,
      data.exerciseId,
      data.targetSets ?? null,
      data.targetRepsMin ?? null,
      data.targetRepsMax ?? null,
      data.notes ?? null,
    );

    return (await this.db.getFirstAsync<RoutineExercise>(
      'SELECT * FROM routine_exercises WHERE id = ?',
      id,
    ))!;
  }

  async updateExercise(
    id: string,
    updates: ExerciseUpdates,
  ): Promise<void> {
    const clauses: string[] = [];
    const params: SQLiteBindValue[] = [];

    if (updates.exerciseId !== undefined) {
      clauses.push('exercise_id = ?');
      params.push(updates.exerciseId);
    }
    if (updates.targetSets !== undefined) {
      clauses.push('target_sets = ?');
      params.push(updates.targetSets);
    }
    if (updates.targetRepsMin !== undefined) {
      clauses.push('target_reps_min = ?');
      params.push(updates.targetRepsMin);
    }
    if (updates.targetRepsMax !== undefined) {
      clauses.push('target_reps_max = ?');
      params.push(updates.targetRepsMax);
    }
    if (updates.notes !== undefined) {
      clauses.push('notes = ?');
      params.push(updates.notes);
    }
    if (updates.sortOrder !== undefined) {
      clauses.push('sort_order = ?');
      params.push(updates.sortOrder);
    }

    if (clauses.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE routine_exercises SET ${clauses.join(', ')} WHERE id = ?`,
      ...params,
    );
  }

  async deleteExercise(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM routine_exercises WHERE id = ?', id);
  }

  async reorderExercises(
    dayId: string,
    exerciseIds: string[],
  ): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (let i = 0; i < exerciseIds.length; i++) {
        await this.db.runAsync(
          'UPDATE routine_exercises SET sort_order = ? WHERE id = ? AND routine_day_id = ?',
          i,
          exerciseIds[i],
          dayId,
        );
      }
    });
  }
}
