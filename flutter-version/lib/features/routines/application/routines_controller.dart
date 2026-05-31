import '../domain/routine.dart';
import '../domain/routine_list.dart';
import '../domain/routine_repository.dart';

class RoutinesController {
  const RoutinesController({required this.routineRepository});

  final RoutineRepository routineRepository;

  Future<RoutineListState> load() async {
    try {
      return RoutineListState(
        routines: await routineRepository.getAllWithDayCount(),
      );
    } catch (error) {
      return const RoutineListState(
        routines: <RoutineWithCounts>[],
        errorMessage: 'Could not load routines.',
      );
    }
  }

  Future<RoutineListState> archive(
    RoutineListState current,
    RoutineWithCounts routine,
  ) async {
    try {
      await routineRepository.archive(routine.routine.id);
      return current.copyWith(
        routines: current.routines
            .where((item) => item.routine.id != routine.routine.id)
            .toList(),
        archivedRoutine: routine,
        clearError: true,
      );
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not archive routine.');
    }
  }

  Future<RoutineListState> undoArchive(RoutineListState current) async {
    final archived = current.archivedRoutine;
    if (archived == null) {
      return current;
    }

    try {
      await routineRepository.unarchive(archived.routine.id);
      return current.copyWith(
        routines: [
          ...current.routines.where(
            (item) => item.routine.id != archived.routine.id,
          ),
          archived,
        ]..sort((a, b) => a.routine.sortOrder.compareTo(b.routine.sortOrder)),
        clearArchivedRoutine: true,
        clearError: true,
      );
    } catch (error) {
      return current.copyWith(errorMessage: 'Could not restore routine.');
    }
  }
}
