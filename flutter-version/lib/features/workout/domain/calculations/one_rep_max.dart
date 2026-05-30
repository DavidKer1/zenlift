import '../entities/workout_entities.dart';

double estimateOneRepMax({required double weight, required int reps}) {
  if (weight == 0 || reps == 0) {
    return 0;
  }

  if (reps == 1) {
    return weight;
  }

  return _roundTwoDecimals(weight * (1 + reps / 30));
}

double? estimateOneRepMaxFromSets(Iterable<WorkoutSet> sets) {
  double? best;

  for (final set in sets) {
    if (!set.contributesToCalculations) {
      continue;
    }

    final estimated = estimateOneRepMax(weight: set.weight, reps: set.reps);
    if (best == null || estimated > best) {
      best = estimated;
    }
  }

  return best;
}

double _roundTwoDecimals(double value) {
  return (value * 100).roundToDouble() / 100;
}
