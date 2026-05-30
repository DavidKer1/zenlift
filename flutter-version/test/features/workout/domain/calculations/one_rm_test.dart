import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/workout/domain/calculations/one_rep_max.dart';
import 'package:zenlift/features/workout/domain/entities/workout_entities.dart';

void main() {
  test('estimates one-rep max with the Epley formula', () {
    expect(estimateOneRepMax(weight: 100, reps: 5), closeTo(116.67, 0.01));
  });

  test('returns input weight for one rep', () {
    expect(estimateOneRepMax(weight: 140, reps: 1), 140);
  });

  test('returns zero when reps are zero', () {
    expect(estimateOneRepMax(weight: 140, reps: 0), 0);
  });

  test('returns zero when weight is zero', () {
    expect(estimateOneRepMax(weight: 0, reps: 10), 0);
  });

  test('finds best one-rep max from completed non-warmup sets', () {
    final sets = [
      const WorkoutSet(
        id: 'warmup',
        weight: 60,
        reps: 10,
        isCompleted: true,
        setType: WorkoutSetType.warmup,
      ),
      const WorkoutSet(
        id: 'incomplete',
        weight: 120,
        reps: 5,
        isCompleted: false,
      ),
      const WorkoutSet(
        id: 'valid-1',
        weight: 100,
        reps: 5,
        isCompleted: true,
      ),
      const WorkoutSet(
        id: 'valid-2',
        weight: 90,
        reps: 10,
        isCompleted: true,
        setType: WorkoutSetType.amrap,
      ),
    ];

    expect(estimateOneRepMaxFromSets(sets), 120);
  });

  test('returns null when no set can estimate one-rep max', () {
    expect(
      estimateOneRepMaxFromSets([
        const WorkoutSet(
          id: 'warmup',
          weight: 60,
          reps: 10,
          isCompleted: true,
          setType: WorkoutSetType.warmup,
        ),
      ]),
      isNull,
    );
  });

  test('preserves all supported set type text values', () {
    expect(WorkoutSetType.fromText('normal'), WorkoutSetType.normal);
    expect(WorkoutSetType.fromText('warmup'), WorkoutSetType.warmup);
    expect(WorkoutSetType.fromText('drop'), WorkoutSetType.drop);
    expect(WorkoutSetType.fromText('failure'), WorkoutSetType.failure);
    expect(WorkoutSetType.fromText('amrap'), WorkoutSetType.amrap);
    expect(WorkoutSetType.fromText('unknown'), WorkoutSetType.normal);
  });
}
