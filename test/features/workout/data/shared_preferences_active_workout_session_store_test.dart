import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:zenlift/features/workout/data/shared_preferences_active_workout_session_store.dart';
import 'package:zenlift/features/workout/application/active_workout_controller.dart';
import 'package:zenlift/features/workout/domain/entities/workout_repository_entities.dart';

void main() {
  late SharedPreferencesActiveWorkoutSessionStore store;
  late SharedPreferencesPendingSetWriteStore pendingSetWriteStore;

  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    store = SharedPreferencesActiveWorkoutSessionStore(
      preferences: SharedPreferencesAsync(),
    );
    pendingSetWriteStore = SharedPreferencesPendingSetWriteStore(
      preferences: SharedPreferencesAsync(),
    );
  });

  test('persists and clears the active workout session id', () async {
    expect(await store.readActiveSessionId(), isNull);

    await store.saveActiveSessionId('session-1');
    expect(await store.readActiveSessionId(), 'session-1');

    await store.clearActiveSessionId();
    expect(await store.readActiveSessionId(), isNull);
  });

  test('persists replaces and clears pending completed set writes', () async {
    final write = PendingCompletedSetWrite(
      setId: 'set-1',
      workoutExerciseId: 'workout-exercise-1',
      weight: 100,
      reps: 5,
      setType: SetType.failure,
      isCompleted: true,
      completedAt: DateTime.utc(2026, 5, 30, 12),
    );

    await pendingSetWriteStore.savePendingCompletedSetWrite(write);
    await pendingSetWriteStore.savePendingCompletedSetWrite(
      PendingCompletedSetWrite(
        setId: 'set-1',
        workoutExerciseId: 'workout-exercise-1',
        weight: 102.5,
        reps: 4,
        setType: SetType.failure,
        isCompleted: true,
        completedAt: DateTime.utc(2026, 5, 30, 12, 1),
      ),
    );

    final writes = await pendingSetWriteStore.readPendingCompletedSetWrites();
    expect(writes, hasLength(1));
    expect(writes.single.weight, 102.5);
    expect(writes.single.reps, 4);
    expect(writes.single.setType, SetType.failure);

    await pendingSetWriteStore.removePendingCompletedSetWrite('set-1');

    expect(await pendingSetWriteStore.readPendingCompletedSetWrites(), isEmpty);
  });
}
