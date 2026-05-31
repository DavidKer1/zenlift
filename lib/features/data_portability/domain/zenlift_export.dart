const supportedZenliftExportVersion = 1;
const supportedZenliftSchemaVersion = 1;
const maxZenliftImportSizeBytes = 50 * 1024 * 1024;

typedef ZenliftExportRow = Map<String, Object?>;

enum ZenliftExportTable {
  muscleGroups('muscle_groups'),
  exercises('exercises'),
  exerciseMuscles('exercise_muscles'),
  routines('routines'),
  routineDays('routine_days'),
  routineExercises('routine_exercises'),
  workoutSessions('workout_sessions'),
  workoutExercises('workout_exercises'),
  setLogs('set_logs'),
  personalRecords('personal_records'),
  appSettings('app_settings');

  const ZenliftExportTable(this.jsonKey);

  final String jsonKey;
}

const zenliftTableColumns = <ZenliftExportTable, List<String>>{
  ZenliftExportTable.muscleGroups: [
    'id',
    'name',
    'display_name_es',
    'color',
  ],
  ZenliftExportTable.exercises: [
    'id',
    'name',
    'equipment',
    'category',
    'is_custom',
    'is_favorite',
    'notes',
    'created_at',
    'updated_at',
  ],
  ZenliftExportTable.exerciseMuscles: [
    'id',
    'exercise_id',
    'muscle_group_id',
    'role',
  ],
  ZenliftExportTable.routines: [
    'id',
    'name',
    'description',
    'goal',
    'is_archived',
    'sort_order',
    'created_at',
    'updated_at',
  ],
  ZenliftExportTable.routineDays: [
    'id',
    'routine_id',
    'name',
    'day_of_week',
    'sort_order',
  ],
  ZenliftExportTable.routineExercises: [
    'id',
    'routine_day_id',
    'exercise_id',
    'target_sets',
    'target_reps_min',
    'target_reps_max',
    'notes',
    'sort_order',
  ],
  ZenliftExportTable.workoutSessions: [
    'id',
    'routine_id',
    'routine_day_id',
    'name',
    'started_at',
    'ended_at',
    'duration_seconds',
    'status',
    'notes',
    'created_at',
    'updated_at',
  ],
  ZenliftExportTable.workoutExercises: [
    'id',
    'workout_session_id',
    'exercise_id',
    'sort_order',
    'notes',
  ],
  ZenliftExportTable.setLogs: [
    'id',
    'workout_exercise_id',
    'set_number',
    'weight',
    'reps',
    'set_type',
    'is_completed',
    'completed_at',
    'notes',
  ],
  ZenliftExportTable.personalRecords: [
    'id',
    'exercise_id',
    'workout_session_id',
    'type',
    'value',
    'weight',
    'reps',
    'achieved_at',
  ],
  ZenliftExportTable.appSettings: [
    'key',
    'value',
  ],
};

const zenliftTableIdentityColumns = <ZenliftExportTable, String>{
  ZenliftExportTable.muscleGroups: 'id',
  ZenliftExportTable.exercises: 'id',
  ZenliftExportTable.exerciseMuscles: 'id',
  ZenliftExportTable.routines: 'id',
  ZenliftExportTable.routineDays: 'id',
  ZenliftExportTable.routineExercises: 'id',
  ZenliftExportTable.workoutSessions: 'id',
  ZenliftExportTable.workoutExercises: 'id',
  ZenliftExportTable.setLogs: 'id',
  ZenliftExportTable.personalRecords: 'id',
  ZenliftExportTable.appSettings: 'key',
};

const requiredZenliftExportTables = <ZenliftExportTable>[
  ZenliftExportTable.muscleGroups,
  ZenliftExportTable.exercises,
  ZenliftExportTable.exerciseMuscles,
  ZenliftExportTable.routines,
  ZenliftExportTable.routineDays,
  ZenliftExportTable.routineExercises,
  ZenliftExportTable.workoutSessions,
  ZenliftExportTable.workoutExercises,
  ZenliftExportTable.setLogs,
  ZenliftExportTable.personalRecords,
  ZenliftExportTable.appSettings,
];

const orderedZenliftImportTables = <ZenliftExportTable>[
  ZenliftExportTable.muscleGroups,
  ZenliftExportTable.exercises,
  ZenliftExportTable.exerciseMuscles,
  ZenliftExportTable.routines,
  ZenliftExportTable.routineDays,
  ZenliftExportTable.routineExercises,
  ZenliftExportTable.workoutSessions,
  ZenliftExportTable.workoutExercises,
  ZenliftExportTable.setLogs,
  ZenliftExportTable.personalRecords,
  ZenliftExportTable.appSettings,
];

const orderedZenliftDeleteTables = <ZenliftExportTable>[
  ZenliftExportTable.setLogs,
  ZenliftExportTable.personalRecords,
  ZenliftExportTable.workoutExercises,
  ZenliftExportTable.workoutSessions,
  ZenliftExportTable.routineExercises,
  ZenliftExportTable.routineDays,
  ZenliftExportTable.routines,
  ZenliftExportTable.exerciseMuscles,
  ZenliftExportTable.exercises,
  ZenliftExportTable.muscleGroups,
  ZenliftExportTable.appSettings,
];

class ZenliftExportMetadata {
  const ZenliftExportMetadata({
    required this.version,
    required this.exportedAt,
    required this.appVersion,
    required this.sourcePlatform,
    required this.schemaVersion,
  });

  final int version;
  final String exportedAt;
  final String appVersion;
  final String sourcePlatform;
  final int schemaVersion;
}

class ZenliftExportData {
  const ZenliftExportData({
    required this.metadata,
    required this.rowsByTable,
  });

  final ZenliftExportMetadata metadata;
  final Map<ZenliftExportTable, List<ZenliftExportRow>> rowsByTable;

  List<ZenliftExportRow> rowsFor(ZenliftExportTable table) {
    return rowsByTable[table] ?? const <ZenliftExportRow>[];
  }
}
