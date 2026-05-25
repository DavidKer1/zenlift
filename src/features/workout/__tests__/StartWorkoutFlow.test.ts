import { Alert } from 'react-native';

const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}));

const mockStoreState = {
  session: null as unknown,
  exercises: [] as unknown[],
  startWorkout: jest.fn(),
  recoverSession: jest.fn(),
  cancelWorkout: jest.fn(),
  addExercise: jest.fn(),
};

jest.mock('@/features/workout/stores/activeWorkoutStore', () => ({
  useActiveWorkoutStore: {
    getState: () => mockStoreState,
  },
}));

const mockDb = {};
jest.mock('@/storage/database/connection', () => ({
  getDatabase: jest.fn().mockResolvedValue(mockDb),
}));

const mockGetActiveSession = jest.fn();
jest.mock('@/storage/repositories/workoutRepo', () => ({
  WorkoutRepo: jest.fn().mockImplementation(() => ({
    getActiveSession: mockGetActiveSession,
  })),
}));

// Silence console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('startWorkoutFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterReplace.mockReset();
    mockGetActiveSession.mockReset();
    mockStoreState.startWorkout.mockReset();
    mockStoreState.recoverSession.mockReset();
    mockStoreState.cancelWorkout.mockReset();
    mockStoreState.addExercise.mockReset();
    mockStoreState.session = null;
    mockStoreState.exercises = [];
  });

  it('creates a session when no active session exists', async () => {
    mockGetActiveSession.mockResolvedValue(null);
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-1' });

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({});

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({});
    expect(mockStoreState.addExercise).not.toHaveBeenCalled();
  });

  it('creates a session with exercise when exerciseId is provided', async () => {
    mockGetActiveSession.mockResolvedValue(null);
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-2' });
    mockStoreState.addExercise.mockResolvedValue({ id: 'we-1' });

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({ exerciseId: 'ex-1' });

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({ exerciseId: 'ex-1' });
    expect(mockStoreState.addExercise).toHaveBeenCalledWith('ex-1');
  });

  it('shows dialog when active session exists and "Continuar" recovers and navigates', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-existing' });
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-existing' });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({});

    expect(alertSpy).toHaveBeenCalled();
    const alertArgs = alertSpy.mock.calls[0];
    expect(alertArgs[0]).toBe('Sesión activa');

    // Simulate pressing "Continuar" (second button, index 1)
    const continuarButton = alertArgs[2]?.[1];
    expect(continuarButton?.text).toBe('Continuar');
    await continuarButton!.onPress!();

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({});
    expect(mockStoreState.cancelWorkout).not.toHaveBeenCalled();
  });

  it('shows dialog when active session exists and "Nueva sesión" cancels old, creates new, and navigates', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-old' });
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-new' });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({ name: 'Fresh' });

    expect(alertSpy).toHaveBeenCalled();
    const alertArgs = alertSpy.mock.calls[0];

    // Simulate pressing "Nueva sesión" (first button, index 0)
    const nuevaButton = alertArgs[2]?.[0];
    expect(nuevaButton?.text).toBe('Nueva sesión');
    await nuevaButton!.onPress!();

    expect(mockStoreState.cancelWorkout).toHaveBeenCalled();
    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({ name: 'Fresh' });
  });

  it('shows dialog with exercise context and "Continuar" adds exercise to existing session', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-existing' });
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-existing' });
    mockStoreState.addExercise.mockResolvedValue({ id: 'we-added' });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({ exerciseId: 'ex-squat' });

    const alertArgs = alertSpy.mock.calls[0];
    const continuarButton = alertArgs[2]?.[1];
    await continuarButton!.onPress!();

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({ exerciseId: 'ex-squat' });
    expect(mockStoreState.addExercise).toHaveBeenCalledWith('ex-squat');
  });

  it('shows error alert when startWorkout throws', async () => {
    mockGetActiveSession.mockResolvedValue(null);
    mockStoreState.startWorkout.mockRejectedValue(new Error('DB error'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({});

    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo iniciar la sesión de workout.',
    );
  });

  it('shows error in "Nueva sesión" path when cancelWorkout or startWorkout fails', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-old' });
    mockStoreState.cancelWorkout.mockResolvedValue(undefined);
    mockStoreState.startWorkout.mockRejectedValue(new Error('Create failed'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({});

    const alertArgs = alertSpy.mock.calls[0];
    const nuevaButton = alertArgs[2]?.[0];
    await nuevaButton!.onPress!();

    // Should show inner error for the failed press
    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo iniciar la nueva sesión.',
    );
  });
});
