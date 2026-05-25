import type { SQLiteDatabase } from 'expo-sqlite';
import type { MuscleGroup } from '@/domain/entities';
import { MuscleGroupRepo } from '../muscleGroupRepo';

function makeMockDb() {
  const calls: { method: string; args: unknown[] }[] = [];

  return {
    db: {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    } as unknown as SQLiteDatabase,
    calls,
  };
}

describe('MuscleGroupRepo', () => {
  describe('getAll', () => {
    it('returns all muscle groups ordered by name', async () => {
      const { db } = makeMockDb();
      const repo = new MuscleGroupRepo(db);
      const expected: MuscleGroup[] = [
        { id: 'mg-1', name: 'Chest', display_name_es: 'Pecho', color: '#FF0000' },
        { id: 'mg-2', name: 'Back', display_name_es: 'Espalda', color: '#00FF00' },
      ];

      (db.getAllAsync as jest.Mock).mockResolvedValue(expected);

      const result = await repo.getAll();

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM muscle_groups ORDER BY name',
      );
      expect(result).toEqual(expected);
    });

    it('returns empty array when no muscle groups exist', async () => {
      const { db } = makeMockDb();
      const repo = new MuscleGroupRepo(db);

      (db.getAllAsync as jest.Mock).mockResolvedValue([]);

      const result = await repo.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns the muscle group when found', async () => {
      const { db } = makeMockDb();
      const repo = new MuscleGroupRepo(db);
      const expected: MuscleGroup = {
        id: 'mg-1',
        name: 'Chest',
        display_name_es: 'Pecho',
        color: '#FF0000',
      };

      (db.getFirstAsync as jest.Mock).mockResolvedValue(expected);

      const result = await repo.getById('mg-1');

      expect(db.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM muscle_groups WHERE id = ?',
        'mg-1',
      );
      expect(result).toEqual(expected);
    });

    it('returns null when not found', async () => {
      const { db } = makeMockDb();
      const repo = new MuscleGroupRepo(db);

      (db.getFirstAsync as jest.Mock).mockResolvedValue(null);

      const result = await repo.getById('nonexistent');

      expect(db.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM muscle_groups WHERE id = ?',
        'nonexistent',
      );
      expect(result).toBeNull();
    });
  });
});
