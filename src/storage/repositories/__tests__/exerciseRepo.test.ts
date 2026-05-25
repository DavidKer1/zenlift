import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise, MuscleGroup } from '@/domain/entities';
import { ExerciseRepo } from '../exerciseRepo';

function makeMockDb() {
  return {
    db: {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn().mockResolvedValue(undefined),
      execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as SQLiteDatabase,
  };
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    is_custom: 0 as const,
    is_favorite: 0 as const,
    notes: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeMuscleGroup(overrides: Partial<MuscleGroup> = {}): MuscleGroup {
  return {
    id: 'mg-1',
    name: 'Chest',
    display_name_es: 'Pecho',
    color: '#FF0000',
    ...overrides,
  };
}

describe('ExerciseRepo', () => {
  // -- Read operations ---------------------------------------------------

  describe('getAll', () => {
    it('returns all exercises ordered by name', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise(), makeExercise({ id: 'ex-2', name: 'Squat' })];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.getAll();

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises ORDER BY name',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('getById', () => {
    it('returns exercise when found', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercise = makeExercise();

      (db.getFirstAsync as jest.Mock).mockResolvedValue(exercise);

      const result = await repo.getById('ex-1');

      expect(db.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE id = ?',
        'ex-1',
      );
      expect(result).toEqual(exercise);
    });

    it('returns null when not found', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);

      (db.getFirstAsync as jest.Mock).mockResolvedValue(null);

      const result = await repo.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getByMuscle', () => {
    it('returns exercises for a muscle group via JOIN', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise()];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.getByMuscle('mg-1');

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT DISTINCT e.* FROM exercises e JOIN exercise_muscles em ON e.id = em.exercise_id WHERE em.muscle_group_id = ?',
        'mg-1',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('getByCategory', () => {
    it('returns exercises filtered by category', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise({ category: 'strength' })];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.getByCategory('strength');

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE category = ? ORDER BY name',
        'strength',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('getByEquipment', () => {
    it('returns exercises filtered by equipment', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise({ equipment: 'dumbbell' })];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.getByEquipment('dumbbell');

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE equipment = ? ORDER BY name',
        'dumbbell',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('search', () => {
    it('performs case-insensitive substring search', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise()];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.search('bench');

      expect(db.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM exercises WHERE name LIKE '%' || ? || '%' COLLATE NOCASE",
        'bench',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('getFavorites', () => {
    it('returns favorited exercises', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const exercises = [makeExercise({ is_favorite: 1 })];

      (db.getAllAsync as jest.Mock).mockResolvedValue(exercises);

      const result = await repo.getFavorites();

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM exercises WHERE is_favorite = 1 ORDER BY name',
      );
      expect(result).toEqual(exercises);
    });
  });

  describe('getMuscles', () => {
    it('returns muscle groups for an exercise via JOIN', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const muscles = [makeMuscleGroup()];

      (db.getAllAsync as jest.Mock).mockResolvedValue(muscles);

      const result = await repo.getMuscles('ex-1');

      expect(db.getAllAsync).toHaveBeenCalledWith(
        'SELECT mg.* FROM muscle_groups mg JOIN exercise_muscles em ON mg.id = em.muscle_group_id WHERE em.exercise_id = ?',
        'ex-1',
      );
      expect(result).toEqual(muscles);
    });
  });

  // -- Write operations ---------------------------------------------------

  describe('create', () => {
    it('inserts exercise and muscle associations in a transaction', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const created = makeExercise();

      (db.getFirstAsync as jest.Mock).mockResolvedValue(created);

      const data = {
        name: 'Bench Press',
        equipment: 'barbell' as const,
        category: 'strength' as const,
      };
      const muscleIds = [
        { muscleGroupId: 'mg-1', role: 'primary' as const },
        { muscleGroupId: 'mg-2', role: 'secondary' as const },
      ];

      const result = await repo.create(data, muscleIds);

      expect(db.execAsync).toHaveBeenCalledWith('BEGIN;');

      const runCalls = (db.runAsync as jest.Mock).mock.calls;
      expect(runCalls[0][0]).toBe(
        'INSERT INTO exercises (id, name, equipment, category, is_custom, is_favorite, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      );
      expect(runCalls[0][1]).toEqual(expect.any(String)); // generated id
      expect(runCalls[0][2]).toBe('Bench Press');
      expect(runCalls[0][3]).toBe('barbell');
      expect(runCalls[0][4]).toBe('strength');
      expect(runCalls[0][5]).toBe(0);
      expect(runCalls[0][6]).toBe(0);
      expect(runCalls[0][7]).toBeNull();

      expect(runCalls[1][0]).toBe(
        'INSERT INTO exercise_muscles (id, exercise_id, muscle_group_id, role) VALUES (?, ?, ?, ?)',
      );
      expect(runCalls[1][3]).toBe('mg-1');
      expect(runCalls[1][4]).toBe('primary');

      expect(runCalls[2][3]).toBe('mg-2');
      expect(runCalls[2][4]).toBe('secondary');

      expect(db.execAsync).toHaveBeenCalledWith('COMMIT;');
      expect(result).toEqual(created);
    });

    it('rolls back transaction on failed muscle insert', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);

      (db.runAsync as jest.Mock)
        .mockResolvedValueOnce(undefined) // exercise insert succeeds
        .mockRejectedValueOnce(new Error('FK constraint')); // muscle insert fails

      const data = {
        name: 'Bench Press',
        equipment: 'barbell' as const,
        category: 'strength' as const,
      };
      const muscleIds = [{ muscleGroupId: 'invalid', role: 'primary' as const }];

      await expect(repo.create(data, muscleIds)).rejects.toThrow('FK constraint');

      expect(db.execAsync).toHaveBeenCalledWith('BEGIN;');
      expect(db.execAsync).toHaveBeenCalledWith('ROLLBACK;');
      expect(db.execAsync).not.toHaveBeenCalledWith('COMMIT;');
    });
  });

  describe('update', () => {
    it('updates only provided fields and sets updated_at', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const updated = makeExercise({ name: 'Incline Bench', updated_at: '2025-02-01T00:00:00.000Z' });

      (db.getFirstAsync as jest.Mock).mockResolvedValue(updated);

      const result = await repo.update('ex-1', { name: 'Incline Bench' });

      const runCall = (db.runAsync as jest.Mock).mock.calls[0];
      expect(runCall[0]).toBe(
        'UPDATE exercises SET name = ?, updated_at = ? WHERE id = ?',
      );
      expect(runCall[1]).toBe('Incline Bench');
      expect(runCall[2]).toEqual(expect.any(String));
      expect(runCall[3]).toBe('ex-1');
      expect(result).toEqual(updated);
    });

    it('returns current exercise when no fields to update', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const existing = makeExercise();

      (db.getFirstAsync as jest.Mock).mockResolvedValue(existing);

      const result = await repo.update('ex-1', {});

      expect(db.runAsync).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });
  });

  describe('delete', () => {
    it('deletes exercise by id with CASCADE cleanup', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);

      await repo.delete('ex-1');

      expect(db.runAsync).toHaveBeenCalledWith(
        'DELETE FROM exercises WHERE id = ?',
        'ex-1',
      );
    });
  });

  // -- Favorites and muscle management ------------------------------------

  describe('toggleFavorite', () => {
    it('flips the is_favorite flag and returns updated exercise', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);
      const toggled = makeExercise({ is_favorite: 1 });

      (db.getFirstAsync as jest.Mock).mockResolvedValue(toggled);

      const result = await repo.toggleFavorite('ex-1');

      expect(db.runAsync).toHaveBeenCalledWith(
        'UPDATE exercises SET is_favorite = NOT is_favorite WHERE id = ?',
        'ex-1',
      );
      expect(result).toEqual(toggled);
    });
  });

  describe('addMuscle', () => {
    it('inserts an exercise_muscles row', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);

      await repo.addMuscle('ex-1', 'mg-1', 'secondary');

      const runCall = (db.runAsync as jest.Mock).mock.calls[0];
      expect(runCall[0]).toBe(
        'INSERT INTO exercise_muscles (id, exercise_id, muscle_group_id, role) VALUES (?, ?, ?, ?)',
      );
      expect(runCall[1]).toEqual(expect.any(String)); // generated id
      expect(runCall[2]).toBe('ex-1');
      expect(runCall[3]).toBe('mg-1');
      expect(runCall[4]).toBe('secondary');
    });
  });

  describe('removeMuscle', () => {
    it('deletes an exercise_muscles row', async () => {
      const { db } = makeMockDb();
      const repo = new ExerciseRepo(db);

      await repo.removeMuscle('ex-1', 'mg-1');

      expect(db.runAsync).toHaveBeenCalledWith(
        'DELETE FROM exercise_muscles WHERE exercise_id = ? AND muscle_group_id = ?',
        'ex-1',
        'mg-1',
      );
    });
  });
});
