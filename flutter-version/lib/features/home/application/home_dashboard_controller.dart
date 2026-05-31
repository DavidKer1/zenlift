import '../../exercises/domain/exercise_repository.dart';
import '../../routines/domain/routine.dart';
import '../../routines/domain/routine_repository.dart';
import '../../workout/domain/entities/workout_repository_entities.dart';
import '../../workout/domain/workout_repository.dart';
import '../domain/home_dashboard.dart';

typedef HomeNow = DateTime Function();

const _calendarMonthWindow = 3;

class HomeDashboardController {
  HomeDashboardController({
    required this.workoutRepository,
    required this.routineRepository,
    required this.exerciseRepository,
    HomeNow? now,
  }) : _now = now ?? DateTime.now;

  final WorkoutRepository workoutRepository;
  final RoutineRepository routineRepository;
  final ExerciseRepository exerciseRepository;
  final HomeNow _now;

  Future<HomeDashboardState> load() async {
    final errors = <String>[];

    final history = await _loadHistory(errors);
    final routines = await _loadRoutines(errors);
    final prs = await _loadPersonalRecords(errors);

    final currentRoutine = routines.isEmpty ? null : routines.first;

    return HomeDashboardState(
      calendar: _buildCalendarSummary(history),
      weeklyActivity: _buildWeeklyActivity(history),
      currentRoutine: currentRoutine == null
          ? null
          : HomeRoutineSummary(
              id: currentRoutine.routine.id,
              name: currentRoutine.routine.name,
              dayCount: currentRoutine.dayCount,
              exerciseCount: currentRoutine.exerciseCount,
            ),
      recentPersonalRecords: prs,
      errorMessage: errors.isEmpty ? null : errors.join('\n'),
    );
  }

  Future<List<WorkoutSessionEntity>> _loadHistory(List<String> errors) async {
    try {
      final sessions = await workoutRepository.getHistory(limit: 1000);
      return sessions
          .where((session) => session.status == WorkoutStatus.completed)
          .toList()
        ..sort((a, b) => b.startedAt.compareTo(a.startedAt));
    } catch (error) {
      errors.add('Could not load workout activity.');
      return const <WorkoutSessionEntity>[];
    }
  }

  Future<List<RoutineWithCounts>> _loadRoutines(List<String> errors) async {
    try {
      return await routineRepository.getAllWithDayCount();
    } catch (error) {
      errors.add('Could not load current routine.');
      return const <RoutineWithCounts>[];
    }
  }

  Future<List<HomePersonalRecordSummary>> _loadPersonalRecords(
    List<String> errors,
  ) async {
    try {
      final records = await workoutRepository.getLatestPRs(limit: 3);
      final summaries = <HomePersonalRecordSummary>[];
      for (final record in records.take(3)) {
        final exercise = await exerciseRepository.getById(record.exerciseId);
        summaries.add(
          HomePersonalRecordSummary(
            id: record.id,
            exerciseName: exercise?.name ?? 'Exercise',
            type: record.type,
            value: record.value,
            weight: record.weight,
            reps: record.reps,
            achievedAt: record.achievedAt,
          ),
        );
      }
      return summaries;
    } catch (error) {
      errors.add('Could not load recent personal records.');
      return const <HomePersonalRecordSummary>[];
    }
  }

  HomeCalendarSummary _buildCalendarSummary(
    List<WorkoutSessionEntity> history,
  ) {
    if (history.isEmpty) {
      return HomeCalendarSummary.empty;
    }

    final now = _now();
    final windowStart = DateTime(
      now.year,
      now.month - _calendarMonthWindow + 1,
    );
    final activityDates =
        history
            .where((session) => !session.startedAt.isBefore(windowStart))
            .map(
              (session) => DateTime(
                session.startedAt.year,
                session.startedAt.month,
                session.startedAt.day,
              ),
            )
            .toSet()
            .toList()
          ..sort();

    final latest = history.first;
    final repeatableRoutineDayId = latest.routineDayId;
    final repeatableRoutineId = latest.routineId;
    final matchingFrequency = history.where((session) {
      if (repeatableRoutineDayId != null) {
        return session.routineDayId == repeatableRoutineDayId;
      }
      if (repeatableRoutineId != null) {
        return session.routineId == repeatableRoutineId;
      }
      return false;
    }).length;

    return HomeCalendarSummary(
      activityDates: activityDates,
      latestWorkout: HomeLatestWorkout(
        sessionId: latest.id,
        title: latest.name?.trim().isNotEmpty == true
            ? latest.name!.trim()
            : 'Latest workout',
        frequencyCount: matchingFrequency == 0
            ? history.length
            : matchingFrequency,
        frequencyKind: matchingFrequency == 0
            ? HomeWorkoutFrequencyKind.total
            : HomeWorkoutFrequencyKind.matchingRoutineContext,
        routineId: latest.routineId,
        routineDayId: latest.routineDayId,
        startedAt: latest.startedAt,
      ),
    );
  }

  HomeWeeklyActivity _buildWeeklyActivity(List<WorkoutSessionEntity> history) {
    final now = _now();
    final weekStart = DateTime(
      now.year,
      now.month,
      now.day,
    ).subtract(Duration(days: (now.weekday + 6) % 7));
    final nextWeekStart = weekStart.add(const Duration(days: 7));
    final activeDays = List<bool>.filled(7, false);
    var workoutCount = 0;

    for (final session in history) {
      final sessionDate = DateTime(
        session.startedAt.year,
        session.startedAt.month,
        session.startedAt.day,
      );
      if (sessionDate.isBefore(weekStart) ||
          !sessionDate.isBefore(nextWeekStart)) {
        continue;
      }
      activeDays[(sessionDate.weekday + 6) % 7] = true;
      workoutCount += 1;
    }

    return HomeWeeklyActivity(
      activeDays: List<bool>.unmodifiable(activeDays),
      workoutCount: workoutCount,
    );
  }
}
