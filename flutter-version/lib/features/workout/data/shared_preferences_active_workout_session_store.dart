import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../application/active_workout_controller.dart';
import '../domain/entities/workout_repository_entities.dart';

class SharedPreferencesActiveWorkoutSessionStore
    implements ActiveWorkoutSessionStore {
  SharedPreferencesActiveWorkoutSessionStore({
    SharedPreferencesAsync? preferences,
  }) : _preferences = preferences ?? SharedPreferencesAsync();

  static const activeSessionIdKey = 'zenlift.workout.active_session_id';

  final SharedPreferencesAsync _preferences;

  @override
  Future<void> clearActiveSessionId() {
    return _preferences.remove(activeSessionIdKey);
  }

  @override
  Future<String?> readActiveSessionId() {
    return _preferences.getString(activeSessionIdKey);
  }

  @override
  Future<void> saveActiveSessionId(String id) {
    return _preferences.setString(activeSessionIdKey, id);
  }
}

class SharedPreferencesPendingSetWriteStore
    implements ActiveWorkoutPendingSetWriteStore {
  SharedPreferencesPendingSetWriteStore({SharedPreferencesAsync? preferences})
    : _preferences = preferences ?? SharedPreferencesAsync();

  static const pendingCompletedSetWritesKey =
      'zenlift.workout.pending_completed_set_writes';

  final SharedPreferencesAsync _preferences;

  @override
  Future<List<PendingCompletedSetWrite>> readPendingCompletedSetWrites() async {
    final encoded = await _preferences.getString(pendingCompletedSetWritesKey);
    if (encoded == null || encoded.isEmpty) {
      return const <PendingCompletedSetWrite>[];
    }

    final decoded = jsonDecode(encoded);
    if (decoded is! List) {
      return const <PendingCompletedSetWrite>[];
    }

    return decoded
        .whereType<Map<String, Object?>>()
        .map(_pendingCompletedSetWriteFromJson)
        .toList();
  }

  @override
  Future<void> savePendingCompletedSetWrite(
    PendingCompletedSetWrite write,
  ) async {
    final writes = await readPendingCompletedSetWrites();
    final nextWrites = <PendingCompletedSetWrite>[
      ...writes.where((item) => item.setId != write.setId),
      write,
    ];
    await _preferences.setString(
      pendingCompletedSetWritesKey,
      jsonEncode(nextWrites.map(_pendingCompletedSetWriteToJson).toList()),
    );
  }

  @override
  Future<void> removePendingCompletedSetWrite(String setId) async {
    final writes = await readPendingCompletedSetWrites();
    final nextWrites = writes.where((item) => item.setId != setId).toList();
    if (nextWrites.isEmpty) {
      await _preferences.remove(pendingCompletedSetWritesKey);
      return;
    }
    await _preferences.setString(
      pendingCompletedSetWritesKey,
      jsonEncode(nextWrites.map(_pendingCompletedSetWriteToJson).toList()),
    );
  }
}

PendingCompletedSetWrite _pendingCompletedSetWriteFromJson(
  Map<String, Object?> json,
) {
  return PendingCompletedSetWrite(
    setId: json['setId']! as String,
    workoutExerciseId: json['workoutExerciseId']! as String,
    weight: (json['weight']! as num).toDouble(),
    reps: json['reps']! as int,
    setType: SetType.fromStorage(json['setType']! as String),
    isCompleted: json['isCompleted']! as bool,
    completedAt: DateTime.parse(json['completedAt']! as String),
  );
}

Map<String, Object?> _pendingCompletedSetWriteToJson(
  PendingCompletedSetWrite write,
) {
  return <String, Object?>{
    'setId': write.setId,
    'workoutExerciseId': write.workoutExerciseId,
    'weight': write.weight,
    'reps': write.reps,
    'setType': write.setType.value,
    'isCompleted': write.isCompleted,
    'completedAt': write.completedAt.toIso8601String(),
  };
}
