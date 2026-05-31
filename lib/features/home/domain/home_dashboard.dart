import '../../workout/domain/entities/workout_repository_entities.dart';

class HomeDashboardState {
  const HomeDashboardState({
    required this.calendar,
    required this.weeklyActivity,
    required this.currentRoutine,
    required this.recentPersonalRecords,
    this.errorMessage,
  });

  final HomeCalendarSummary calendar;
  final HomeWeeklyActivity weeklyActivity;
  final HomeRoutineSummary? currentRoutine;
  final List<HomePersonalRecordSummary> recentPersonalRecords;
  final String? errorMessage;

  bool get hasError => errorMessage != null;

  static const empty = HomeDashboardState(
    calendar: HomeCalendarSummary.empty,
    weeklyActivity: HomeWeeklyActivity.empty,
    currentRoutine: null,
    recentPersonalRecords: <HomePersonalRecordSummary>[],
  );
}

class HomeCalendarSummary {
  const HomeCalendarSummary({
    required this.activityDates,
    required this.latestWorkout,
  });

  final List<DateTime> activityDates;
  final HomeLatestWorkout? latestWorkout;

  static const empty = HomeCalendarSummary(
    activityDates: <DateTime>[],
    latestWorkout: null,
  );
}

class HomeLatestWorkout {
  const HomeLatestWorkout({
    required this.sessionId,
    required this.title,
    required this.frequencyCount,
    required this.frequencyKind,
    required this.routineId,
    required this.routineDayId,
    required this.startedAt,
  });

  final String sessionId;
  final String title;
  final int frequencyCount;
  final HomeWorkoutFrequencyKind frequencyKind;
  final String? routineId;
  final String? routineDayId;
  final DateTime startedAt;

  bool get canRepeat => routineId != null || routineDayId != null;
}

enum HomeWorkoutFrequencyKind { matchingRoutineContext, total }

class HomeWeeklyActivity {
  const HomeWeeklyActivity({
    required this.activeDays,
    required this.workoutCount,
  });

  final List<bool> activeDays;
  final int workoutCount;

  bool get hasActivity => activeDays.any((day) => day);

  static const empty = HomeWeeklyActivity(
    activeDays: <bool>[false, false, false, false, false, false, false],
    workoutCount: 0,
  );
}

class HomeRoutineSummary {
  const HomeRoutineSummary({
    required this.id,
    required this.name,
    required this.dayCount,
    required this.exerciseCount,
  });

  final String id;
  final String name;
  final int dayCount;
  final int exerciseCount;
}

class HomePersonalRecordSummary {
  const HomePersonalRecordSummary({
    required this.id,
    required this.exerciseName,
    required this.type,
    required this.value,
    required this.weight,
    required this.reps,
    required this.achievedAt,
  });

  final String id;
  final String exerciseName;
  final PersonalRecordType type;
  final double value;
  final double? weight;
  final int? reps;
  final DateTime achievedAt;
}
