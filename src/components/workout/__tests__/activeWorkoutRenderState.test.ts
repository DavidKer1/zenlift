import type { Exercise, SetLog, WorkoutExerciseWithSets } from '@/domain/entities';
import {
  areWorkoutExerciseCardPropsEqual,
  isWorkoutExerciseComplete,
  type WorkoutExerciseCardProps,
} from '@/components/workout/WorkoutExerciseCard';
import {
  areSetRowPropsEqual,
  type SetRowProps,
} from '@/components/workout/SetRow';

jest.mock('@/components/themed-text', () => ({
  ThemedText: 'ThemedText',
}));

jest.mock('@/providers/ThemeProvider', () => ({
  useZenliftTheme: () => ({
    colors: {
      border: '#49454F',
      mutedText: 'rgba(255, 255, 255, 0.50)',
      surface: '#18191D',
      surfaceElevated: '#242329',
      text: '#FFFFFF',
    },
    radius: { sm: 8, md: 12, xl: 24 },
    spacing: { one: 4, two: 8, three: 16 },
  }),
}));

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    is_custom: 0,
    is_favorite: 0,
    notes: null,
    created_at: '2026-05-30T10:00:00.000Z',
    updated_at: '2026-05-30T10:00:00.000Z',
    ...overrides,
  };
}

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 100,
    reps: 8,
    set_type: 'normal',
    is_completed: 0,
    completed_at: null,
    notes: null,
    ...overrides,
  };
}

function makeWorkoutExercise(
  sets: SetLog[],
  overrides: Partial<WorkoutExerciseWithSets> = {},
): WorkoutExerciseWithSets {
  return {
    id: 'we-1',
    workout_session_id: 'ws-1',
    exercise_id: 'ex-1',
    sort_order: 1,
    notes: null,
    exercise: makeExercise(),
    sets,
    ...overrides,
  };
}

const noop = () => undefined;

function makeCardProps(
  exercise: WorkoutExerciseWithSets,
  overrides: Partial<WorkoutExerciseCardProps> = {},
): WorkoutExerciseCardProps {
  return {
    exercise,
    onAddSet: noop,
    onCompleteSet: noop,
    onWeightChange: noop,
    onRepsChange: noop,
    unit: 'kg',
    previousPerformance: null,
    primaryMuscleName: null,
    primaryMuscleColor: null,
    ...overrides,
  };
}

function makeRowProps(overrides: Partial<SetRowProps> = {}): SetRowProps {
  return {
    setId: 'set-1',
    setNumber: 1,
    previousWeight: 90,
    previousReps: 10,
    weight: 100,
    reps: 8,
    setType: 'normal',
    isCompleted: false,
    unit: 'kg',
    onComplete: noop,
    onWeightChange: noop,
    onRepsChange: noop,
    ...overrides,
  };
}

describe('active workout render state', () => {
  it('does not treat an exercise with no sets as complete', () => {
    expect(isWorkoutExerciseComplete(makeWorkoutExercise([]))).toBe(false);
  });

  it('treats an exercise as complete when every set is completed', () => {
    const exercise = makeWorkoutExercise([
      makeSet({ id: 'set-1', is_completed: 1 }),
      makeSet({ id: 'set-2', set_number: 2, is_completed: 1 }),
    ]);

    expect(isWorkoutExerciseComplete(exercise)).toBe(true);
  });

  it('treats an exercise as incomplete when one set is unchecked', () => {
    const exercise = makeWorkoutExercise([
      makeSet({ id: 'set-1', is_completed: 1 }),
      makeSet({ id: 'set-2', set_number: 2, is_completed: 0 }),
    ]);

    expect(isWorkoutExerciseComplete(exercise)).toBe(false);
  });

  it('re-renders an exercise card when a set completion changes without set length changing', () => {
    const before = makeCardProps(makeWorkoutExercise([makeSet({ is_completed: 0 })]));
    const after = makeCardProps(
      makeWorkoutExercise([
        makeSet({
          is_completed: 1,
          completed_at: '2026-05-30T10:05:00.000Z',
        }),
      ]),
    );

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(false);
  });

  it('re-renders an exercise card when set values change without set length changing', () => {
    const before = makeCardProps(makeWorkoutExercise([makeSet({ weight: 100, reps: 8 })]));
    const after = makeCardProps(makeWorkoutExercise([makeSet({ weight: 102.5, reps: 9 })]));

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(false);
  });

  it('re-renders an exercise card when set numbering changes without set length changing', () => {
    const before = makeCardProps(makeWorkoutExercise([makeSet({ set_number: 1 })]));
    const after = makeCardProps(makeWorkoutExercise([makeSet({ set_number: 2 })]));

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(false);
  });

  it('keeps exercise card memoization when visible data is unchanged', () => {
    const set = makeSet({ is_completed: 1, completed_at: '2026-05-30T10:05:00.000Z' });
    const before = makeCardProps(makeWorkoutExercise([set]));
    const after = makeCardProps(makeWorkoutExercise([{ ...set }]));

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(true);
  });

  it('re-renders a set row when previous values change', () => {
    const before = makeRowProps({ previousWeight: 90, previousReps: 10 });
    const after = makeRowProps({ previousWeight: 100, previousReps: 8 });

    expect(areSetRowPropsEqual(before, after)).toBe(false);
  });

  it('re-renders a set row when weight unit changes', () => {
    const before = makeRowProps({ unit: 'kg' });
    const after = makeRowProps({ unit: 'lb' });

    expect(areSetRowPropsEqual(before, after)).toBe(false);
  });
});
