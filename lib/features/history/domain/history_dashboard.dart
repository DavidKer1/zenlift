class HistoryDashboardState {
  const HistoryDashboardState({required this.workouts, this.errorMessage});

  final List<HistoryWorkoutSummary> workouts;
  final String? errorMessage;

  bool get hasError => errorMessage != null;
  bool get isEmpty => workouts.isEmpty;

  static const empty = HistoryDashboardState(
    workouts: <HistoryWorkoutSummary>[],
  );
}

class HistoryWorkoutSummary {
  const HistoryWorkoutSummary({
    required this.sessionId,
    required this.title,
    required this.startedAt,
    required this.durationSeconds,
    required this.exerciseCount,
    required this.completedSetCount,
    required this.totalVolume,
    required this.personalRecordCount,
    required this.routineId,
    required this.routineDayId,
    required this.routineName,
    required this.routineDayName,
  });

  final String sessionId;
  final String title;
  final DateTime startedAt;
  final int durationSeconds;
  final int exerciseCount;
  final int completedSetCount;
  final double totalVolume;
  final int personalRecordCount;
  final String? routineId;
  final String? routineDayId;
  final String? routineName;
  final String? routineDayName;

  bool get canRepeat => routineId != null || routineDayId != null;
}
