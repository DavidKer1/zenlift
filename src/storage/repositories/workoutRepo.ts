import type {
  WorkoutSession,
  WorkoutExercise,
  SetLog,
  PersonalRecord,
  FullWorkoutSession,
  WorkoutExerciseWithSets,
  AppSettings,
  Exercise,
  Routine,
  RoutineDay,
  SetType,
  SQLiteBoolean,
  PersonalRecordType,
} from '@/domain/entities';
import type { SQLiteDatabase } from 'expo-sqlite';
import { generateId } from '@/utils/id';

export type PersonalRecordWithExerciseName = PersonalRecord & {
  exercise_name: string;
};

export type HomeCalendarActivityDate = {
  date: string;
  session_count: number;
};

export type HomeCalendarFrequencyKind =
  | 'routine_day'
  | 'routine'
  | 'session_name'
  | 'total';

export type HomeCalendarRepeatParams = {
  routineId: string;
  routineDayId?: string;
  name: string;
};

export type HomeCalendarLatestWorkout = {
  id: string;
  started_at: string;
  session_name: string | null;
  routine_id: string | null;
  routine_day_id: string | null;
  routine_name: string | null;
  routine_day_name: string | null;
  display_label: string;
  frequency_count: number;
  frequency_kind: HomeCalendarFrequencyKind;
  is_repeatable: boolean;
  repeat_params: HomeCalendarRepeatParams | null;
};

export type HomeCalendarSummary = {
  activity_dates: HomeCalendarActivityDate[];
  latest_workout: HomeCalendarLatestWorkout | null;
};

type HomeCalendarLatestWorkoutRow = WorkoutSession & {
  routine_name: string | null;
  routine_day_name: string | null;
};

type CountRow = {
  count: number;
};

function getHomeCalendarDisplayLabel(
  workout: HomeCalendarLatestWorkoutRow,
): string {
  if (workout.routine_day_name && workout.routine_name) {
    return `${workout.routine_name} - ${workout.routine_day_name}`;
  }
  if (workout.routine_day_name) return workout.routine_day_name;
  if (workout.routine_name) return workout.routine_name;
  if (workout.name?.trim()) return workout.name.trim();
  return 'Workout session';
}

export class WorkoutRepo {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  private generateId(): string {
    return generateId();
  }

  // ---------------------------------------------------------------------------
  // Session operations
  // ---------------------------------------------------------------------------

  async createSession(data: {
    name?: string;
    routineId?: string;
    routineDayId?: string;
  }): Promise<WorkoutSession> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      await this.db.runAsync(
        'INSERT INTO workout_sessions (id, routine_id, routine_day_id, name, started_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        id,
        data.routineId ?? null,
        data.routineDayId ?? null,
        data.name ?? null,
        now,
        'active',
        now,
      );
      return {
        id,
        routine_id: data.routineId ?? null,
        routine_day_id: data.routineDayId ?? null,
        name: data.name ?? null,
        started_at: now,
        ended_at: null,
        duration_seconds: null,
        status: 'active',
        notes: null,
        created_at: now,
        updated_at: null,
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] createSession failed: ${(error as Error).message}`,
      );
    }
  }

  async getSession(id: string): Promise<WorkoutSession | null> {
    try {
      return await this.db.getFirstAsync<WorkoutSession>(
        'SELECT * FROM workout_sessions WHERE id = ?',
        id,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getSession(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getActiveSession(): Promise<WorkoutSession | null> {
    try {
      return await this.db.getFirstAsync<WorkoutSession>(
        "SELECT * FROM workout_sessions WHERE status = 'active' LIMIT 1",
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getActiveSession failed: ${(error as Error).message}`,
      );
    }
  }

  async getHistory(limit = 20, offset = 0): Promise<WorkoutSession[]> {
    try {
      return await this.db.getAllAsync<WorkoutSession>(
        "SELECT * FROM workout_sessions WHERE status IN ('completed', 'cancelled') ORDER BY started_at DESC LIMIT ? OFFSET ?",
        limit,
        offset,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getHistory(${limit}, ${offset}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getHistoryByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<WorkoutSession[]> {
    try {
      const inclusiveEnd = `${endDate}T23:59:59.999Z`;
      return await this.db.getAllAsync<WorkoutSession>(
        "SELECT * FROM workout_sessions WHERE status IN ('completed', 'cancelled') AND started_at >= ? AND started_at <= ? ORDER BY started_at DESC",
        startDate,
        inclusiveEnd,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getHistoryByDateRange(${startDate}, ${endDate}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getHistoryByRoutine(routineId: string): Promise<WorkoutSession[]> {
    try {
      return await this.db.getAllAsync<WorkoutSession>(
        "SELECT * FROM workout_sessions WHERE status IN ('completed', 'cancelled') AND routine_id = ? ORDER BY started_at DESC",
        routineId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getHistoryByRoutine(${routineId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getHomeCalendarSummary(months = 3): Promise<HomeCalendarSummary> {
    const safeMonths = Number.isFinite(months)
      ? Math.max(1, Math.min(12, Math.trunc(months)))
      : 3;
    const now = new Date();
    const windowStart = new Date(
      now.getFullYear(),
      now.getMonth() - safeMonths + 1,
      1,
    );
    windowStart.setHours(0, 0, 0, 0);

    try {
      const activityDates = await this.db.getAllAsync<HomeCalendarActivityDate>(
        `SELECT date(started_at) AS date, COUNT(*) AS session_count
         FROM workout_sessions
         WHERE status = 'completed' AND started_at >= ? AND started_at <= ?
         GROUP BY date(started_at)
         ORDER BY started_at ASC`,
        windowStart.toISOString(),
        now.toISOString(),
      );

      const latestWorkout = await this.db.getFirstAsync<HomeCalendarLatestWorkoutRow>(
        `SELECT
           ws.*,
           r.name AS routine_name,
           rd.name AS routine_day_name
         FROM workout_sessions ws
         LEFT JOIN routines r ON r.id = ws.routine_id
         LEFT JOIN routine_days rd ON rd.id = ws.routine_day_id
         WHERE ws.status = 'completed'
         ORDER BY ws.started_at DESC
         LIMIT ?`,
        1,
      );

      if (!latestWorkout) {
        return {
          activity_dates: activityDates,
          latest_workout: null,
        };
      }

      const frequency = await this.getHomeCalendarFrequency(latestWorkout);
      const displayLabel = getHomeCalendarDisplayLabel(latestWorkout);
      const repeatParams = latestWorkout.routine_id
        ? {
            routineId: latestWorkout.routine_id,
            routineDayId: latestWorkout.routine_day_id ?? undefined,
            name: displayLabel,
          }
        : null;

      return {
        activity_dates: activityDates,
        latest_workout: {
          id: latestWorkout.id,
          started_at: latestWorkout.started_at,
          session_name: latestWorkout.name,
          routine_id: latestWorkout.routine_id,
          routine_day_id: latestWorkout.routine_day_id,
          routine_name: latestWorkout.routine_name,
          routine_day_name: latestWorkout.routine_day_name,
          display_label: displayLabel,
          frequency_count: frequency.count,
          frequency_kind: frequency.kind,
          is_repeatable: repeatParams !== null,
          repeat_params: repeatParams,
        },
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getHomeCalendarSummary(${months}) failed: ${(error as Error).message}`,
      );
    }
  }

  private async getHomeCalendarFrequency(
    latestWorkout: HomeCalendarLatestWorkoutRow,
  ): Promise<{ count: number; kind: HomeCalendarFrequencyKind }> {
    if (latestWorkout.routine_day_id) {
      const row = await this.db.getFirstAsync<CountRow>(
        "SELECT COUNT(*) AS count FROM workout_sessions WHERE status = 'completed' AND routine_day_id = ?",
        latestWorkout.routine_day_id,
      );
      return { count: row?.count ?? 0, kind: 'routine_day' };
    }

    if (latestWorkout.routine_id) {
      const row = await this.db.getFirstAsync<CountRow>(
        "SELECT COUNT(*) AS count FROM workout_sessions WHERE status = 'completed' AND routine_id = ?",
        latestWorkout.routine_id,
      );
      return { count: row?.count ?? 0, kind: 'routine' };
    }

    const sessionName = latestWorkout.name?.trim();
    if (sessionName) {
      const row = await this.db.getFirstAsync<CountRow>(
        "SELECT COUNT(*) AS count FROM workout_sessions WHERE status = 'completed' AND name = ?",
        sessionName,
      );
      return { count: row?.count ?? 0, kind: 'session_name' };
    }

    const row = await this.db.getFirstAsync<CountRow>(
      "SELECT COUNT(*) AS count FROM workout_sessions WHERE status = 'completed'",
    );
    return { count: row?.count ?? 0, kind: 'total' };
  }

  async getFullSession(id: string): Promise<FullWorkoutSession | null> {
    try {
      const session = await this.db.getFirstAsync<WorkoutSession>(
        'SELECT * FROM workout_sessions WHERE id = ?',
        id,
      );
      if (!session) return null;

      const workoutExercises = await this.db.getAllAsync<WorkoutExercise>(
        'SELECT * FROM workout_exercises WHERE workout_session_id = ? ORDER BY sort_order ASC',
        id,
      );

      const exerciseIds = [
        ...new Set(workoutExercises.map((we) => we.exercise_id)),
      ];
      const exerciseMap = new Map<string, Exercise>();
      if (exerciseIds.length > 0) {
        const placeholders = exerciseIds.map(() => '?').join(',');
        const exercises = await this.db.getAllAsync<Exercise>(
          `SELECT * FROM exercises WHERE id IN (${placeholders})`,
          ...exerciseIds,
        );
        for (const ex of exercises) {
          exerciseMap.set(ex.id, ex);
        }
      }

      const weIds = workoutExercises.map((we) => we.id);
      const setsMap = new Map<string, SetLog[]>();
      if (weIds.length > 0) {
        const placeholders = weIds.map(() => '?').join(',');
        const allSets = await this.db.getAllAsync<SetLog>(
          `SELECT * FROM set_logs WHERE workout_exercise_id IN (${placeholders}) ORDER BY set_number ASC`,
          ...weIds,
        );
        for (const s of allSets) {
          const list = setsMap.get(s.workout_exercise_id) ?? [];
          list.push(s);
          setsMap.set(s.workout_exercise_id, list);
        }
      }

      const exercises: WorkoutExerciseWithSets[] = workoutExercises.map(
        (we) => ({
          ...we,
          exercise: exerciseMap.get(we.exercise_id)!,
          sets: setsMap.get(we.id) ?? [],
        }),
      );

      const personalRecords = await this.db.getAllAsync<PersonalRecord>(
        'SELECT * FROM personal_records WHERE workout_session_id = ?',
        id,
      );

      let routine: Routine | null = null;
      if (session.routine_id) {
        routine = await this.db.getFirstAsync<Routine>(
          'SELECT * FROM routines WHERE id = ?',
          session.routine_id,
        );
      }

      let routineDay: RoutineDay | null = null;
      if (session.routine_day_id) {
        routineDay = await this.db.getFirstAsync<RoutineDay>(
          'SELECT * FROM routine_days WHERE id = ?',
          session.routine_day_id,
        );
      }

      return {
        ...session,
        routine,
        routine_day: routineDay,
        exercises,
        personal_records: personalRecords,
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getFullSession(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async completeSession(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        "UPDATE workout_sessions SET status = 'completed', ended_at = ?, duration_seconds = CAST((julianday(?) - julianday(started_at)) * 86400 AS INTEGER), updated_at = ? WHERE id = ?",
        now,
        now,
        now,
        id,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] completeSession(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async cancelSession(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        "UPDATE workout_sessions SET status = 'cancelled', ended_at = ?, updated_at = ? WHERE id = ?",
        now,
        now,
        id,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] cancelSession(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async updateSessionNotes(sessionId: string, notes: string): Promise<void> {
    try {
      await this.db.runAsync(
        'UPDATE workout_sessions SET notes = ?, updated_at = ? WHERE id = ?',
        notes,
        new Date().toISOString(),
        sessionId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] updateSessionNotes(${sessionId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM workout_sessions WHERE id = ?', id);
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] deleteSession(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Exercise operations
  // ---------------------------------------------------------------------------

  async addExercise(
    sessionId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise> {
    try {
      const id = this.generateId();
      const sortOrder = await this.getNextSortOrder(
        'workout_exercises',
        'sort_order',
        'workout_session_id',
        sessionId,
      );
      await this.db.runAsync(
        'INSERT INTO workout_exercises (id, workout_session_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)',
        id,
        sessionId,
        exerciseId,
        sortOrder,
      );
      return {
        id,
        workout_session_id: sessionId,
        exercise_id: exerciseId,
        sort_order: sortOrder,
        notes: null,
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] addExercise(${sessionId}, ${exerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async addRoutineDayExercisesToSession(
    sessionId: string,
    routineDayId: string,
  ): Promise<WorkoutExercise[]> {
    try {
      const routineExercises = await this.db.getAllAsync<{
        exercise_id: string;
        sort_order: number;
      }>(
        'SELECT exercise_id, sort_order FROM routine_exercises WHERE routine_day_id = ? ORDER BY sort_order ASC',
        routineDayId,
      );

      const workoutExercises: WorkoutExercise[] = [];
      for (const routineExercise of routineExercises) {
        const id = this.generateId();
        await this.db.runAsync(
          'INSERT INTO workout_exercises (id, workout_session_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)',
          id,
          sessionId,
          routineExercise.exercise_id,
          routineExercise.sort_order,
        );
        workoutExercises.push({
          id,
          workout_session_id: sessionId,
          exercise_id: routineExercise.exercise_id,
          sort_order: routineExercise.sort_order,
          notes: null,
        });
      }

      return workoutExercises;
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] addRoutineDayExercisesToSession(${sessionId}, ${routineDayId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async removeExercise(id: string): Promise<void> {
    try {
      await this.db.runAsync(
        'DELETE FROM workout_exercises WHERE id = ?',
        id,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] removeExercise(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getExercises(sessionId: string): Promise<WorkoutExercise[]> {
    try {
      return await this.db.getAllAsync<WorkoutExercise>(
        'SELECT * FROM workout_exercises WHERE workout_session_id = ? ORDER BY sort_order ASC',
        sessionId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getExercises(${sessionId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getPreviousPerformance(
    exerciseId: string,
    limit = 5,
  ): Promise<{
      started_at: string;
      weight: number;
      reps: number;
      set_type: SetType;
    }[]> {
    try {
      return await this.db.getAllAsync<{
        started_at: string;
        weight: number;
        reps: number;
        set_type: SetType;
      }>(
        `SELECT ws.started_at, sl.weight, sl.reps, sl.set_type
         FROM set_logs sl
         JOIN workout_exercises we ON sl.workout_exercise_id = we.id
         JOIN workout_sessions ws ON we.workout_session_id = ws.id
         WHERE we.exercise_id = ? AND sl.is_completed = 1
         ORDER BY ws.started_at DESC
         LIMIT ?`,
        exerciseId,
        limit,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getPreviousPerformance(${exerciseId}, ${limit}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getExerciseSetHistory(
    exerciseId: string,
  ): Promise<
    {
      id: string;
      workout_exercise_id: string;
      set_number: number;
      weight: number;
      reps: number;
      set_type: SetType;
      is_completed: SQLiteBoolean;
      completed_at: string | null;
      notes: string | null;
      session_id: string;
      started_at: string;
    }[]
  > {
    try {
      return await this.db.getAllAsync<{
        id: string;
        workout_exercise_id: string;
        set_number: number;
        weight: number;
        reps: number;
        set_type: SetType;
        is_completed: SQLiteBoolean;
        completed_at: string | null;
        notes: string | null;
        session_id: string;
        started_at: string;
      }>(
        `SELECT sl.*, ws.id AS session_id, ws.started_at
         FROM set_logs sl
         JOIN workout_exercises we ON sl.workout_exercise_id = we.id
         JOIN workout_sessions ws ON we.workout_session_id = ws.id
         WHERE we.exercise_id = ? AND sl.is_completed = 1 AND sl.set_type != 'warmup'
         AND ws.status IN ('completed', 'cancelled')
         ORDER BY ws.started_at DESC, sl.set_number ASC`,
        exerciseId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getExerciseSetHistory(${exerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getLastWorkoutExerciseData(
    exerciseId: string,
  ): Promise<{ weight: number; reps: number } | null> {
    try {
      return await this.db.getFirstAsync<{ weight: number; reps: number }>(
        `SELECT sl.weight, sl.reps
         FROM set_logs sl
         JOIN workout_exercises we ON sl.workout_exercise_id = we.id
         JOIN workout_sessions ws ON we.workout_session_id = ws.id
         WHERE we.exercise_id = ? AND sl.is_completed = 1
         ORDER BY ws.started_at DESC
         LIMIT 1`,
        exerciseId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getLastWorkoutExerciseData(${exerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Set operations
  // ---------------------------------------------------------------------------

  async addSet(
    workoutExerciseId: string,
    data: {
      weight: number;
      reps: number;
      set_type?: SetType;
      notes?: string;
    },
  ): Promise<SetLog> {
    try {
      const id = this.generateId();
      const setNumber = await this.getNextSetNumber(workoutExerciseId);
      await this.db.runAsync(
        'INSERT INTO set_logs (id, workout_exercise_id, set_number, weight, reps, set_type, is_completed) VALUES (?, ?, ?, ?, ?, ?, 0)',
        id,
        workoutExerciseId,
        setNumber,
        data.weight,
        data.reps,
        data.set_type ?? 'normal',
      );
      return {
        id,
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        weight: data.weight,
        reps: data.reps,
        set_type: data.set_type ?? 'normal',
        is_completed: 0,
        completed_at: null,
        notes: data.notes ?? null,
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] addSet(${workoutExerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async completeSet(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.db.runAsync(
        'UPDATE set_logs SET is_completed = 1, completed_at = ? WHERE id = ?',
        now,
        id,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] completeSet(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async updateSet(
    id: string,
    data: {
      weight?: number;
      reps?: number;
      set_type?: SetType;
      notes?: string;
    },
  ): Promise<void> {
    try {
      const fields: string[] = [];
      const values: (number | string)[] = [];

      if (data.weight !== undefined) {
        fields.push('weight = ?');
        values.push(data.weight);
      }
      if (data.reps !== undefined) {
        fields.push('reps = ?');
        values.push(data.reps);
      }
      if (data.set_type !== undefined) {
        fields.push('set_type = ?');
        values.push(data.set_type);
      }
      if (data.notes !== undefined) {
        fields.push('notes = ?');
        values.push(data.notes);
      }

      if (fields.length === 0) return;

      values.push(id);
      await this.db.runAsync(
        `UPDATE set_logs SET ${fields.join(', ')} WHERE id = ?`,
        ...values,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] updateSet(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async deleteSet(id: string): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM set_logs WHERE id = ?', id);
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] deleteSet(${id}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getSets(workoutExerciseId: string): Promise<SetLog[]> {
    try {
      return await this.db.getAllAsync<SetLog>(
        'SELECT * FROM set_logs WHERE workout_exercise_id = ? ORDER BY set_number ASC',
        workoutExerciseId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getSets(${workoutExerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Personal records
  // ---------------------------------------------------------------------------

  async addPR(data: {
    exerciseId: string;
    workoutSessionId: string;
    type: PersonalRecordType;
    value: number;
    weight?: number | null;
    reps?: number | null;
  }): Promise<PersonalRecord> {
    try {
      const id = this.generateId();
      const now = new Date().toISOString();
      await this.db.runAsync(
        'INSERT INTO personal_records (id, exercise_id, workout_session_id, type, value, weight, reps, achieved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        id,
        data.exerciseId,
        data.workoutSessionId,
        data.type,
        data.value,
        data.weight ?? null,
        data.reps ?? null,
        now,
      );
      return {
        id,
        exercise_id: data.exerciseId,
        workout_session_id: data.workoutSessionId,
        type: data.type,
        value: data.value,
        weight: data.weight ?? null,
        reps: data.reps ?? null,
        achieved_at: now,
      };
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] addPR(${data.exerciseId}, ${data.workoutSessionId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getPRsByExercise(exerciseId: string): Promise<PersonalRecord[]> {
    try {
      return await this.db.getAllAsync<PersonalRecord>(
        'SELECT * FROM personal_records WHERE exercise_id = ? ORDER BY achieved_at DESC',
        exerciseId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getPRsByExercise(${exerciseId}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getLatestPRs(limit = 10): Promise<PersonalRecordWithExerciseName[]> {
    try {
      return await this.db.getAllAsync<PersonalRecordWithExerciseName>(
        `SELECT pr.*, e.name AS exercise_name
         FROM personal_records pr
         JOIN exercises e ON pr.exercise_id = e.id
         ORDER BY pr.achieved_at DESC
         LIMIT ?`,
        limit,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getLatestPRs(${limit}) failed: ${(error as Error).message}`,
      );
    }
  }

  async getPRsBySession(sessionId: string): Promise<PersonalRecord[]> {
    try {
      return await this.db.getAllAsync<PersonalRecord>(
        'SELECT * FROM personal_records WHERE workout_session_id = ?',
        sessionId,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getPRsBySession(${sessionId}) failed: ${(error as Error).message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // App settings
  // ---------------------------------------------------------------------------

  async getSetting(key: string): Promise<string | null> {
    try {
      const row = await this.db.getFirstAsync<AppSettings>(
        'SELECT * FROM app_settings WHERE key = ?',
        key,
      );
      return row?.value ?? null;
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] getSetting(${key}) failed: ${(error as Error).message}`,
      );
    }
  }

  async setSetting(key: string, value: string): Promise<void> {
    try {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
        key,
        value,
      );
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] setSetting(${key}) failed: ${(error as Error).message}`,
      );
    }
  }

  async deleteSetting(key: string): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
    } catch (error) {
      throw new Error(
        `[WorkoutRepo] deleteSetting(${key}) failed: ${(error as Error).message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async getNextSortOrder(
    table: string,
    column: string,
    filterColumn: string,
    filterValue: string,
  ): Promise<number> {
    const row = await this.db.getFirstAsync<{ maxOrder: number | null }>(
      `SELECT COALESCE(MAX(${column}), 0) as maxOrder FROM ${table} WHERE ${filterColumn} = ?`,
      filterValue,
    );
    return (row?.maxOrder ?? 0) + 1;
  }

  private async getNextSetNumber(
    workoutExerciseId: string,
  ): Promise<number> {
    const row = await this.db.getFirstAsync<{ maxNumber: number | null }>(
      'SELECT COALESCE(MAX(set_number), 0) as maxNumber FROM set_logs WHERE workout_exercise_id = ?',
      workoutExerciseId,
    );
    return (row?.maxNumber ?? 0) + 1;
  }
}
