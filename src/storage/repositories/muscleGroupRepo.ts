import type { SQLiteDatabase } from 'expo-sqlite';
import type { MuscleGroup } from '@/domain/entities';

export class MuscleGroupRepo {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async getAll(): Promise<MuscleGroup[]> {
    return this.db.getAllAsync<MuscleGroup>(
      'SELECT * FROM muscle_groups ORDER BY name',
    );
  }

  async getById(id: string): Promise<MuscleGroup | null> {
    return this.db.getFirstAsync<MuscleGroup>(
      'SELECT * FROM muscle_groups WHERE id = ?',
      id,
    );
  }
}
