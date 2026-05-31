import '../../workout/domain/entities/workout_repository_entities.dart';
import '../../workout/domain/workout_repository.dart';
import '../domain/history_dashboard.dart';

class HistoryDashboardController {
  HistoryDashboardController({required this.workoutRepository});

  final WorkoutRepository workoutRepository;

  Future<HistoryDashboardState> load({int limit = 50}) async {
    try {
      final sessions = await workoutRepository.getHistory(limit: limit);
      final summaries = <HistoryWorkoutSummary>[];

      for (final session in sessions) {
        if (session.status != WorkoutStatus.completed) {
          continue;
        }
        final fullSession = await workoutRepository.getFullSession(session.id);
        summaries.add(_summaryFrom(session, fullSession));
      }

      summaries.sort((a, b) => b.startedAt.compareTo(a.startedAt));
      return HistoryDashboardState(
        workouts: List<HistoryWorkoutSummary>.unmodifiable(summaries),
      );
    } catch (error) {
      return const HistoryDashboardState(
        workouts: <HistoryWorkoutSummary>[],
        errorMessage: 'Could not load workout history.',
      );
    }
  }

  HistoryWorkoutSummary _summaryFrom(
    WorkoutSessionEntity session,
    FullWorkoutSession? fullSession,
  ) {
    final exercises =
        fullSession?.exercises ?? const <WorkoutExerciseWithSets>[];
    var completedSetCount = 0;
    var totalVolume = 0.0;

    for (final exercise in exercises) {
      for (final set in exercise.sets) {
        if (!set.isCompleted || set.setType == SetType.warmup) {
          continue;
        }
        completedSetCount += 1;
        totalVolume += set.weight * set.reps;
      }
    }

    return HistoryWorkoutSummary(
      sessionId: session.id,
      title: _sessionTitle(session, fullSession),
      startedAt: session.startedAt,
      durationSeconds:
          session.durationSeconds ??
          session.endedAt?.difference(session.startedAt).inSeconds ??
          0,
      exerciseCount: exercises.length,
      completedSetCount: completedSetCount,
      totalVolume: totalVolume,
      personalRecordCount: fullSession?.personalRecords.length ?? 0,
      routineId: session.routineId,
      routineDayId: session.routineDayId,
      routineName: fullSession?.routine?.name,
      routineDayName: fullSession?.routineDay?.name,
    );
  }

  String _sessionTitle(
    WorkoutSessionEntity session,
    FullWorkoutSession? fullSession,
  ) {
    final explicitName = session.name?.trim();
    if (explicitName != null && explicitName.isNotEmpty) {
      return explicitName;
    }
    final routineDayName = fullSession?.routineDay?.name.trim();
    if (routineDayName != null && routineDayName.isNotEmpty) {
      return routineDayName;
    }
    final routineName = fullSession?.routine?.name.trim();
    if (routineName != null && routineName.isNotEmpty) {
      return routineName;
    }
    return 'Workout';
  }
}
