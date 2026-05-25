import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Exercise,
  ExerciseCategory,
  Equipment,
  MuscleGroup,
  MuscleRole,
  SQLiteBoolean,
} from '@/domain/entities';
import { generateId } from '@/utils/id';

export interface CreateExerciseData {
  name: string;
  equipment: Equipment;
  category: ExerciseCategory;
  is_custom?: SQLiteBoolean;
  is_favorite?: SQLiteBoolean;
  notes?: string | null;
}

export interface UpdateExerciseData {
  name?: string;
  equipment?: Equipment;
  category?: ExerciseCategory;
  is_custom?: SQLiteBoolean;
  is_favorite?: SQLiteBoolean;
  notes?: string | null;
}

export interface MuscleEntry {
  muscleGroupId: string;
  role: MuscleRole;
}

export class ExerciseRepo {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async getAll(): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      'SELECT * FROM exercises ORDER BY name',
    );
  }

  async getById(id: string): Promise<Exercise | null> {
    return this.db.getFirstAsync<Exercise>(
      'SELECT * FROM exercises WHERE id = ?',
      id,
    );
  }

  async getByMuscle(muscleGroupId: string): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      'SELECT DISTINCT e.* FROM exercises e JOIN exercise_muscles em ON e.id = em.exercise_id WHERE em.muscle_group_id = ?',
      muscleGroupId,
    );
  }

  async getByCategory(category: ExerciseCategory): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE category = ? ORDER BY name',
      category,
    );
  }

  async getByEquipment(equipment: Equipment): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE equipment = ? ORDER BY name',
      equipment,
    );
  }

  async search(query: string): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      "SELECT * FROM exercises WHERE name LIKE '%' || ? || '%' COLLATE NOCASE",
      query,
    );
  }

  async getFavorites(): Promise<Exercise[]> {
    return this.db.getAllAsync<Exercise>(
      'SELECT * FROM exercises WHERE is_favorite = 1 ORDER BY name',
    );
  }

  async getMuscles(exerciseId: string): Promise<MuscleGroup[]> {
    return this.db.getAllAsync<MuscleGroup>(
      'SELECT mg.* FROM muscle_groups mg JOIN exercise_muscles em ON mg.id = em.muscle_group_id WHERE em.exercise_id = ?',
      exerciseId,
    );
  }

  async create(
    data: CreateExerciseData,
    muscleIds: MuscleEntry[],
  ): Promise<Exercise> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.execAsync('BEGIN;');

    try {
      await this.db.runAsync(
        'INSERT INTO exercises (id, name, equipment, category, is_custom, is_favorite, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        id,
        data.name,
        data.equipment,
        data.category,
        data.is_custom ?? 0,
        data.is_favorite ?? 0,
        data.notes ?? null,
        now,
        now,
      );

      for (const { muscleGroupId, role } of muscleIds) {
        const muscleId = generateId();
        await this.db.runAsync(
          'INSERT INTO exercise_muscles (id, exercise_id, muscle_group_id, role) VALUES (?, ?, ?, ?)',
          muscleId,
          id,
          muscleGroupId,
          role,
        );
      }

      await this.db.execAsync('COMMIT;');
    } catch (error) {
      await this.db.execAsync('ROLLBACK;');
      throw error;
    }

    return (await this.getById(id))!;
  }

  async update(
    id: string,
    updates: UpdateExerciseData,
  ): Promise<Exercise | null> {
    const fields: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.equipment !== undefined) {
      fields.push('equipment = ?');
      values.push(updates.equipment);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.is_custom !== undefined) {
      fields.push('is_custom = ?');
      values.push(updates.is_custom);
    }
    if (updates.is_favorite !== undefined) {
      fields.push('is_favorite = ?');
      values.push(updates.is_favorite);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.db.runAsync(
      `UPDATE exercises SET ${fields.join(', ')} WHERE id = ?`,
      ...values,
    );

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM exercises WHERE id = ?', id);
  }

  async toggleFavorite(id: string): Promise<Exercise | null> {
    await this.db.runAsync(
      'UPDATE exercises SET is_favorite = NOT is_favorite WHERE id = ?',
      id,
    );
    return this.getById(id);
  }

  async addMuscle(
    exerciseId: string,
    muscleGroupId: string,
    role: MuscleRole,
  ): Promise<void> {
    const id = generateId();
    await this.db.runAsync(
      'INSERT INTO exercise_muscles (id, exercise_id, muscle_group_id, role) VALUES (?, ?, ?, ?)',
      id,
      exerciseId,
      muscleGroupId,
      role,
    );
  }

  async removeMuscle(
    exerciseId: string,
    muscleGroupId: string,
  ): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM exercise_muscles WHERE exercise_id = ? AND muscle_group_id = ?',
      exerciseId,
      muscleGroupId,
    );
  }
}
