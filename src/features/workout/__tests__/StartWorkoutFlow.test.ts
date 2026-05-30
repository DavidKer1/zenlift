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

const flowCopy = {
  activeBody: 'You already have an active workout session. Continue it or start a new one?',
  activeTitle: 'Active session',
  continueLabel: 'Continue',
  errorTitle: 'Error',
  newSession: 'New session',
  recoverFailed: 'Could not recover the active session.',
  startFailed: 'Could not start the workout session.',
  startNewFailed: 'Could not start the new session.',
};

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
    await startWorkoutFlow({}, flowCopy);

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({});
    expect(mockStoreState.addExercise).not.toHaveBeenCalled();
  });

  it('creates a session with exercise when exerciseId is provided', async () => {
    mockGetActiveSession.mockResolvedValue(null);
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-2' });
    mockStoreState.addExercise.mockResolvedValue({ id: 'we-1' });

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({ exerciseId: 'ex-1' }, flowCopy);

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({ exerciseId: 'ex-1' });
    expect(mockStoreState.addExercise).toHaveBeenCalledWith('ex-1');
  });

  it('shows dialog when active session exists and "Continue" recovers and navigates', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-existing' });
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-existing' });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({}, flowCopy);

    expect(alertSpy).toHaveBeenCalled();
    const alertArgs = alertSpy.mock.calls[0];
    expect(alertArgs[0]).toBe('Active session');

    // Simulate pressing "Continue" (second button, index 1)
    const continuarButton = alertArgs[2]?.[1];
    expect(continuarButton?.text).toBe('Continue');
    await continuarButton!.onPress!();

    expect(mockStoreState.startWorkout).toHaveBeenCalledWith({});
    expect(mockStoreState.cancelWorkout).not.toHaveBeenCalled();
  });

  it('shows dialog when active session exists and "New session" cancels old, creates new, and navigates', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-old' });
    mockStoreState.startWorkout.mockResolvedValue({ id: 'ws-new' });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({ name: 'Fresh' }, flowCopy);

    expect(alertSpy).toHaveBeenCalled();
    const alertArgs = alertSpy.mock.calls[0];

    // Simulate pressing "New session" (first button, index 0)
    const nuevaButton = alertArgs[2]?.[0];
    expect(nuevaButton?.text).toBe('New session');
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
    await startWorkoutFlow({ exerciseId: 'ex-squat' }, flowCopy);

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
    await startWorkoutFlow({}, flowCopy);

    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'Could not start the workout session.',
    );
  });

  it('shows error in "New session" path when cancelWorkout or startWorkout fails', async () => {
    mockGetActiveSession.mockResolvedValue({ id: 'ws-old' });
    mockStoreState.cancelWorkout.mockResolvedValue(undefined);
    mockStoreState.startWorkout.mockRejectedValue(new Error('Create failed'));

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { startWorkoutFlow } = require('@/features/workout/StartWorkoutFlow');
    await startWorkoutFlow({}, flowCopy);

    const alertArgs = alertSpy.mock.calls[0];
    const nuevaButton = alertArgs[2]?.[0];
    await nuevaButton!.onPress!();

    // Should show inner error for the failed press
    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'Could not start the new session.',
    );
  });
});
