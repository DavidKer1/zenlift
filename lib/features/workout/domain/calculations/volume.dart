import '../entities/workout_entities.dart';

double calculateSetVolume({required double weight, required int reps}) {
  if (weight == 0 || reps == 0) {
    return 0;
  }

  return weight * reps;
}

double calculateExerciseVolume(Iterable<WorkoutSet> sets) {
  return sets.where((set) => set.contributesToCalculations).fold<double>(
    0,
    (total, set) =>
        total + calculateSetVolume(weight: set.weight, reps: set.reps),
  );
}

double calculateSessionVolume(Iterable<WorkoutExercise> exercises) {
  return exercises.fold<double>(
    0,
    (total, exercise) => total + calculateExerciseVolume(exercise.sets),
  );
}
