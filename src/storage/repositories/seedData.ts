import type { SQLiteDatabase } from 'expo-sqlite';

type JsonMuscleGroup = {
  id: string;
  name: string;
  displayNameEs: string;
  color: string;
};

type JsonExerciseMuscle = {
  muscleGroupId: string;
  role: 'primary' | 'secondary';
};

type JsonExercise = {
  id: string;
  name: string;
  equipment: string;
  category: string;
  muscles: JsonExerciseMuscle[];
};

type SeedDataJson = {
  version: number;
  muscleGroups: JsonMuscleGroup[];
  exercises: JsonExercise[];
};

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function toHex(value: number, width: number): string {
  return value.toString(16).padStart(width, '0');
}

export function generateSeedId(prefix: string, name: string): string {
  const h1 = simpleHash(`${prefix}:${name}`);
  const h2 = simpleHash(`${prefix}:${name}:h2`);
  const h3 = simpleHash(`${prefix}:${name}:h3`);
  const h4 = simpleHash(`${prefix}:${name}:h4`);
  const h5 = simpleHash(`${prefix}:${name}:h5`);

  const p1 = toHex(h1, 8);
  const p2 = toHex(h2 & 0xffff, 4);
  const p3 = toHex((h3 & 0x0fff) | 0x4000, 4);
  const p4 = toHex((h4 & 0x3fff) | 0x8000, 4);
  const p5 = toHex(h5, 12);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

function normalizeEquipment(raw: string): string {
  return raw.toLowerCase();
}

function normalizeCategory(raw: string): string {
  return raw.toLowerCase();
}

// ---------------------------------------------------------------------------
// Hardcoded fallback data (mirrors assets/exercise.json)
// ---------------------------------------------------------------------------

const FALLBACK_MUSCLE_GROUPS: JsonMuscleGroup[] = [
  { id: 'a1b2c3d4-0001-4000-8000-000000000001', name: 'Chest', displayNameEs: 'Pecho', color: '#EF4444' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000002', name: 'Back', displayNameEs: 'Espalda', color: '#3B82F6' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000003', name: 'Shoulders', displayNameEs: 'Hombros', color: '#F59E0B' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000004', name: 'Biceps', displayNameEs: 'Biceps', color: '#8B5CF6' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000005', name: 'Triceps', displayNameEs: 'Triceps', color: '#EC4899' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000006', name: 'Forearms', displayNameEs: 'Antebrazos', color: '#14B8A6' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000007', name: 'Abs', displayNameEs: 'Abdominales', color: '#F97316' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000008', name: 'Quads', displayNameEs: 'Cuadriceps', color: '#22C55E' },
  { id: 'a1b2c3d4-0001-4000-8000-000000000009', name: 'Hamstrings', displayNameEs: 'Isquiotibiales', color: '#6366F1' },
  { id: 'a1b2c3d4-0001-4000-8000-00000000000a', name: 'Glutes', displayNameEs: 'Gluteos', color: '#A855F7' },
  { id: 'a1b2c3d4-0001-4000-8000-00000000000b', name: 'Calves', displayNameEs: 'Gemelos', color: '#84CC16' },
  { id: 'a1b2c3d4-0001-4000-8000-00000000000c', name: 'Full Body', displayNameEs: 'Cuerpo Completo', color: '#6B7280' },
  { id: 'a1b2c3d4-0001-4000-8000-00000000000d', name: 'Cardio', displayNameEs: 'Cardio', color: '#0EA5E9' },
];

const FALLBACK_EXERCISES: JsonExercise[] = [
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000001',
    name: 'Bench Press',
    equipment: 'Barbell',
    category: 'Chest',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000002',
    name: 'Incline Bench Press',
    equipment: 'Barbell',
    category: 'Chest',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000003',
    name: 'Dumbbell Fly',
    equipment: 'Dumbbell',
    category: 'Chest',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000004',
    name: 'Cable Crossover',
    equipment: 'Cable',
    category: 'Chest',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000005',
    name: 'Pull Up',
    equipment: 'Bodyweight',
    category: 'Back',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000006',
    name: 'Barbell Row',
    equipment: 'Barbell',
    category: 'Back',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000007',
    name: 'Lat Pulldown',
    equipment: 'Cable',
    category: 'Back',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000008',
    name: 'Deadlift',
    equipment: 'Barbell',
    category: 'Full Body',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009', role: 'secondary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000009',
    name: 'Squat',
    equipment: 'Barbell',
    category: 'Quads',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000a',
    name: 'Leg Press',
    equipment: 'Machine',
    category: 'Quads',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000b',
    name: 'Romanian Deadlift',
    equipment: 'Barbell',
    category: 'Hamstrings',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000c',
    name: 'Leg Curl',
    equipment: 'Machine',
    category: 'Hamstrings',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000d',
    name: 'Leg Extension',
    equipment: 'Machine',
    category: 'Quads',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000e',
    name: 'Shoulder Press',
    equipment: 'Dumbbell',
    category: 'Shoulders',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-00000000000f',
    name: 'Lateral Raise',
    equipment: 'Dumbbell',
    category: 'Shoulders',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000010',
    name: 'Face Pull',
    equipment: 'Cable',
    category: 'Shoulders',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000011',
    name: 'Barbell Curl',
    equipment: 'Barbell',
    category: 'Biceps',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000012',
    name: 'Hammer Curl',
    equipment: 'Dumbbell',
    category: 'Biceps',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000006', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000013',
    name: 'Tricep Pushdown',
    equipment: 'Cable',
    category: 'Triceps',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000014',
    name: 'Overhead Tricep Extension',
    equipment: 'Dumbbell',
    category: 'Triceps',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000015',
    name: 'Calf Raise',
    equipment: 'Machine',
    category: 'Calves',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000b', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000016',
    name: 'Hip Thrust',
    equipment: 'Barbell',
    category: 'Glutes',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009', role: 'secondary' },
    ],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000017',
    name: 'Plank',
    equipment: 'Bodyweight',
    category: 'Abs',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000007', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000018',
    name: 'Hanging Leg Raise',
    equipment: 'Bodyweight',
    category: 'Abs',
    muscles: [{ muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000007', role: 'primary' }],
  },
  {
    id: 'e5f6a7b8-0001-4000-8000-000000000019',
    name: 'Farmers Walk',
    equipment: 'Dumbbell',
    category: 'Forearms',
    muscles: [
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000006', role: 'primary' },
      { muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000c', role: 'secondary' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Load seed data (Plan A: JSON, Plan B: hardcoded)
// ---------------------------------------------------------------------------

function loadSeedData(): SeedDataJson {
  try {
    const raw = require('../../../assets/exercise.json') as SeedDataJson;

    if (
      raw &&
      Array.isArray(raw.muscleGroups) &&
      raw.muscleGroups.length > 0 &&
      Array.isArray(raw.exercises) &&
      raw.exercises.length > 0
    ) {
      return raw;
    }

    console.warn('[SeedData] exercise.json loaded but structure is invalid, using hardcoded fallback');
  } catch (error) {
    console.warn('[SeedData] Could not load exercise.json, using hardcoded fallback:', error);
  }

  return {
    version: 1,
    muscleGroups: FALLBACK_MUSCLE_GROUPS,
    exercises: FALLBACK_EXERCISES,
  };
}

// ---------------------------------------------------------------------------
// seedDatabase
// ---------------------------------------------------------------------------

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const { muscleGroups, exercises } = loadSeedData();
  const now = new Date().toISOString();

  await db.execAsync('BEGIN;');

  try {
    // 1. Insert muscle groups
    for (const mg of muscleGroups) {
      await db.runAsync(
        'INSERT OR IGNORE INTO muscle_groups (id, name, display_name_es, color) VALUES (?, ?, ?, ?)',
        mg.id,
        mg.name,
        mg.displayNameEs,
        mg.color,
      );
    }

    // 2. Insert exercises
    for (const ex of exercises) {
      await db.runAsync(
        'INSERT OR IGNORE INTO exercises (id, name, equipment, category, is_custom, is_favorite, notes, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0, NULL, ?, ?)',
        ex.id,
        ex.name,
        normalizeEquipment(ex.equipment),
        normalizeCategory(ex.category),
        now,
        now,
      );
    }

    // 3. Insert exercise_muscles relationships
    for (const ex of exercises) {
      for (const muscle of ex.muscles) {
        const emId = generateSeedId('em', `${ex.name}:${muscle.muscleGroupId}`);
        await db.runAsync(
          'INSERT OR IGNORE INTO exercise_muscles (id, exercise_id, muscle_group_id, role) VALUES (?, ?, ?, ?)',
          emId,
          ex.id,
          muscle.muscleGroupId,
          muscle.role,
        );
      }
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

// ---------------------------------------------------------------------------
// seedIfEmpty
// ---------------------------------------------------------------------------

export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM muscle_groups',
  );

  if (row && row.count === 0) {
    await seedDatabase(db);
  }
}
