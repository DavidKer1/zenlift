import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../drift/app_database.dart';

const exerciseSeedAssetPath = 'assets/data/exercise.json';

class SeedMuscleGroup {
  const SeedMuscleGroup({
    required this.id,
    required this.name,
    required this.displayNameEs,
    required this.color,
  });

  final String id;
  final String name;
  final String displayNameEs;
  final String color;

  factory SeedMuscleGroup.fromJson(Map<String, Object?> json) {
    return SeedMuscleGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      displayNameEs: json['displayNameEs'] as String,
      color: json['color'] as String,
    );
  }
}

class SeedExerciseMuscle {
  const SeedExerciseMuscle({required this.muscleGroupId, required this.role});

  final String muscleGroupId;
  final String role;

  factory SeedExerciseMuscle.fromJson(Map<String, Object?> json) {
    return SeedExerciseMuscle(
      muscleGroupId: json['muscleGroupId'] as String,
      role: json['role'] as String,
    );
  }
}

class SeedExercise {
  const SeedExercise({
    required this.id,
    required this.name,
    required this.equipment,
    required this.category,
    required this.muscles,
  });

  final String id;
  final String name;
  final String equipment;
  final String category;
  final List<SeedExerciseMuscle> muscles;

  factory SeedExercise.fromJson(Map<String, Object?> json) {
    return SeedExercise(
      id: json['id'] as String,
      name: json['name'] as String,
      equipment: json['equipment'] as String,
      category: json['category'] as String,
      muscles: (json['muscles'] as List<Object?>)
          .cast<Map<String, Object?>>()
          .map(SeedExerciseMuscle.fromJson)
          .toList(),
    );
  }
}

class ExerciseSeedData {
  const ExerciseSeedData({
    required this.version,
    required this.muscleGroups,
    required this.exercises,
  });

  final int version;
  final List<SeedMuscleGroup> muscleGroups;
  final List<SeedExercise> exercises;

  factory ExerciseSeedData.fromJson(Map<String, Object?> json) {
    final muscleGroups = json['muscleGroups'];
    final exercises = json['exercises'];
    if (muscleGroups is! List<Object?> ||
        muscleGroups.isEmpty ||
        exercises is! List<Object?> ||
        exercises.isEmpty) {
      throw const FormatException('Exercise seed JSON has invalid structure.');
    }

    return ExerciseSeedData(
      version: json['version'] as int? ?? 1,
      muscleGroups: muscleGroups
          .cast<Map<String, Object?>>()
          .map(SeedMuscleGroup.fromJson)
          .toList(),
      exercises: exercises
          .cast<Map<String, Object?>>()
          .map(SeedExercise.fromJson)
          .toList(),
    );
  }
}

Future<ExerciseSeedData> loadExerciseSeedData({AssetBundle? bundle}) async {
  try {
    final raw = await (bundle ?? rootBundle).loadString(exerciseSeedAssetPath);
    return ExerciseSeedData.fromJson(jsonDecode(raw) as Map<String, Object?>);
  } on Object catch (error) {
    debugPrint('[ExerciseSeedData] Falling back to embedded seed data: $error');
    return fallbackExerciseSeedData;
  }
}

Future<void> seedDatabase(
  AppDatabase database, {
  ExerciseSeedData? seedData,
  DateTime? now,
}) async {
  final data = seedData ?? await loadExerciseSeedData();
  final timestamp = (now ?? DateTime.now().toUtc()).toUtc().toIso8601String();

  await database.transaction(() async {
    for (final group in data.muscleGroups) {
      await database
          .into(database.muscleGroups)
          .insert(
            MuscleGroupsCompanion.insert(
              id: group.id,
              name: group.name,
              displayNameEs: group.displayNameEs,
              color: group.color,
            ),
            mode: InsertMode.insertOrIgnore,
          );
    }

    for (final exercise in data.exercises) {
      await database
          .into(database.exercises)
          .insert(
            ExercisesCompanion.insert(
              id: exercise.id,
              name: exercise.name,
              equipment: exercise.equipment,
              category: exercise.category,
              isCustom: const Value(false),
              isFavorite: const Value(false),
              notes: const Value(null),
              createdAt: Value(timestamp),
              updatedAt: Value(timestamp),
            ),
            mode: InsertMode.insertOrIgnore,
          );
    }

    for (final exercise in data.exercises) {
      for (final muscle in exercise.muscles) {
        await database
            .into(database.exerciseMuscles)
            .insert(
              ExerciseMusclesCompanion.insert(
                id: generateSeedId(
                  'em',
                  '${exercise.name}:${muscle.muscleGroupId}',
                ),
                exerciseId: exercise.id,
                muscleGroupId: muscle.muscleGroupId,
                role: muscle.role,
              ),
              mode: InsertMode.insertOrIgnore,
            );
      }
    }
  });
}

Future<void> seedIfEmpty(AppDatabase database) async {
  final row = await database
      .customSelect('SELECT COUNT(*) AS count FROM muscle_groups')
      .getSingle();
  final count = row.read<int>('count');
  if (count == 0) {
    await seedDatabase(database);
  }
}

String generateSeedId(String prefix, String name) {
  final h1 = _simpleHash('$prefix:$name');
  final h2 = _simpleHash('$prefix:$name:h2');
  final h3 = _simpleHash('$prefix:$name:h3');
  final h4 = _simpleHash('$prefix:$name:h4');
  final h5 = _simpleHash('$prefix:$name:h5');

  final p1 = _toHex(h1, 8);
  final p2 = _toHex(h2 & 0xffff, 4);
  final p3 = _toHex((h3 & 0x0fff) | 0x4000, 4);
  final p4 = _toHex((h4 & 0x3fff) | 0x8000, 4);
  final p5 = _toHex(h5, 12);

  return '$p1-$p2-$p3-$p4-$p5';
}

int _simpleHash(String value) {
  var hash = 5381;
  for (final codeUnit in value.codeUnits) {
    hash = (((hash << 5) + hash) + codeUnit).toSigned(32);
  }
  return hash.toUnsigned(32);
}

String _toHex(int value, int width) {
  final mask = width >= 8 ? 0xffffffff : (1 << (width * 4)) - 1;
  return (value & mask).toRadixString(16).padLeft(width, '0');
}

const fallbackExerciseSeedData = ExerciseSeedData(
  version: 1,
  muscleGroups: [
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      name: 'Chest',
      displayNameEs: 'Pecho',
      color: '#EF4444',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000002',
      name: 'Back',
      displayNameEs: 'Espalda',
      color: '#3B82F6',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000003',
      name: 'Shoulders',
      displayNameEs: 'Hombros',
      color: '#F59E0B',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000004',
      name: 'Biceps',
      displayNameEs: 'Biceps',
      color: '#8B5CF6',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000005',
      name: 'Triceps',
      displayNameEs: 'Triceps',
      color: '#EC4899',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000006',
      name: 'Forearms',
      displayNameEs: 'Antebrazos',
      color: '#14B8A6',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000007',
      name: 'Abs',
      displayNameEs: 'Abdominales',
      color: '#F97316',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000008',
      name: 'Quads',
      displayNameEs: 'Cuadriceps',
      color: '#22C55E',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-000000000009',
      name: 'Hamstrings',
      displayNameEs: 'Isquiotibiales',
      color: '#6366F1',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-00000000000a',
      name: 'Glutes',
      displayNameEs: 'Gluteos',
      color: '#A855F7',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-00000000000b',
      name: 'Calves',
      displayNameEs: 'Gemelos',
      color: '#84CC16',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-00000000000c',
      name: 'Full Body',
      displayNameEs: 'Cuerpo Completo',
      color: '#6B7280',
    ),
    SeedMuscleGroup(
      id: 'a1b2c3d4-0001-4000-8000-00000000000d',
      name: 'Cardio',
      displayNameEs: 'Cardio',
      color: '#0EA5E9',
    ),
  ],
  exercises: [
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000001',
      name: 'Bench Press',
      equipment: 'Barbell',
      category: 'Chest',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000002',
      name: 'Incline Bench Press',
      equipment: 'Barbell',
      category: 'Chest',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000003',
      name: 'Dumbbell Fly',
      equipment: 'Dumbbell',
      category: 'Chest',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000004',
      name: 'Cable Crossover',
      equipment: 'Cable',
      category: 'Chest',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000001',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000005',
      name: 'Pull Up',
      equipment: 'Bodyweight',
      category: 'Back',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000006',
      name: 'Barbell Row',
      equipment: 'Barbell',
      category: 'Back',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000007',
      name: 'Lat Pulldown',
      equipment: 'Cable',
      category: 'Back',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000008',
      name: 'Deadlift',
      equipment: 'Barbell',
      category: 'Full Body',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000002',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009',
          role: 'secondary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000009',
      name: 'Squat',
      equipment: 'Barbell',
      category: 'Quads',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000a',
      name: 'Leg Press',
      equipment: 'Machine',
      category: 'Quads',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000b',
      name: 'Romanian Deadlift',
      equipment: 'Barbell',
      category: 'Hamstrings',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000c',
      name: 'Leg Curl',
      equipment: 'Machine',
      category: 'Hamstrings',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000d',
      name: 'Leg Extension',
      equipment: 'Machine',
      category: 'Quads',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000008',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000e',
      name: 'Shoulder Press',
      equipment: 'Dumbbell',
      category: 'Shoulders',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-00000000000f',
      name: 'Lateral Raise',
      equipment: 'Dumbbell',
      category: 'Shoulders',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000010',
      name: 'Face Pull',
      equipment: 'Cable',
      category: 'Shoulders',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000003',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000011',
      name: 'Barbell Curl',
      equipment: 'Barbell',
      category: 'Biceps',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000012',
      name: 'Hammer Curl',
      equipment: 'Dumbbell',
      category: 'Biceps',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000004',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000006',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000013',
      name: 'Tricep Pushdown',
      equipment: 'Cable',
      category: 'Triceps',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000014',
      name: 'Overhead Tricep Extension',
      equipment: 'Dumbbell',
      category: 'Triceps',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000005',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000015',
      name: 'Calf Raise',
      equipment: 'Machine',
      category: 'Calves',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000b',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000016',
      name: 'Hip Thrust',
      equipment: 'Barbell',
      category: 'Glutes',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000a',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000009',
          role: 'secondary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000017',
      name: 'Plank',
      equipment: 'Bodyweight',
      category: 'Abs',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000007',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000018',
      name: 'Hanging Leg Raise',
      equipment: 'Bodyweight',
      category: 'Abs',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000007',
          role: 'primary',
        ),
      ],
    ),
    SeedExercise(
      id: 'e5f6a7b8-0001-4000-8000-000000000019',
      name: 'Farmers Walk',
      equipment: 'Dumbbell',
      category: 'Forearms',
      muscles: [
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-000000000006',
          role: 'primary',
        ),
        SeedExerciseMuscle(
          muscleGroupId: 'a1b2c3d4-0001-4000-8000-00000000000c',
          role: 'secondary',
        ),
      ],
    ),
  ],
);
