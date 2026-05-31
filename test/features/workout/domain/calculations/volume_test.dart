import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/workout/domain/calculations/volume.dart';
import 'package:zenlift/features/workout/domain/entities/workout_entities.dart';

void main() {
  test('calculates set volume from weight and reps', () {
    expect(calculateSetVolume(weight: 62.5, reps: 8), 500);
  });

  test('returns zero volume when weight or reps are zero', () {
    expect(calculateSetVolume(weight: 0, reps: 8), 0);
    expect(calculateSetVolume(weight: 62.5, reps: 0), 0);
  });

  test('session volume ignores incomplete and warmup sets', () {
    final exercises = [
      WorkoutExercise(
        id: 'session-exercise-1',
        exerciseId: 'bench-press',
        sets: [
          const WorkoutSet(
            id: 'set-1',
            weight: 62.5,
            reps: 8,
            isCompleted: true,
          ),
          const WorkoutSet(
            id: 'set-2',
            weight: 80,
            reps: 3,
            isCompleted: false,
          ),
          const WorkoutSet(
            id: 'set-3',
            weight: 40,
            reps: 12,
            isCompleted: true,
            setType: WorkoutSetType.warmup,
          ),
        ],
      ),
      WorkoutExercise(
        id: 'session-exercise-2',
        exerciseId: 'row',
        sets: [
          const WorkoutSet(
            id: 'set-4',
            weight: 50,
            reps: 6,
            isCompleted: true,
          ),
        ],
      ),
    ];

    expect(calculateSessionVolume(exercises), 800);
  });
}
