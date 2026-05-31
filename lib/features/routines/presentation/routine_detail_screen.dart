import 'package:flutter/material.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../../exercises/domain/exercise.dart';
import '../domain/routine.dart';
import '../domain/routine_detail.dart';

typedef RoutineDetailLoader =
    Future<RoutineDetailState> Function(String routineId);
typedef RoutineDetailStateAction =
    Future<RoutineDetailState> Function(RoutineDetailState state);
typedef RoutineNameUpdater =
    Future<RoutineDetailState> Function(RoutineDetailState state, String name);
typedef RoutineExerciseRemover =
    Future<RoutineDetailState> Function(
      RoutineDetailState state,
      String routineExerciseId,
    );
typedef RoutineExerciseMover =
    Future<RoutineDetailState> Function(
      RoutineDetailState state, {
      required String dayId,
      required String routineExerciseId,
      required int direction,
    });
typedef FullRoutineAction = Future<void> Function(FullRoutine routine);
typedef RoutineDayAction =
    Future<void> Function(FullRoutine routine, RoutineDayEntity day);

class RoutineDetailScreen extends StatefulWidget {
  const RoutineDetailScreen({
    required this.routineId,
    required this.loadRoutine,
    required this.onUpdateName,
    required this.onDuplicateRoutine,
    required this.onArchiveRoutine,
    required this.onDeleteRoutine,
    required this.onRemoveExercise,
    required this.onMoveExercise,
    required this.onEditRoutine,
    required this.onAddExercise,
    required this.onStartWorkout,
    required this.onBackToRoutines,
    super.key,
    this.initialState,
  });

  final String routineId;
  final RoutineDetailState? initialState;
  final RoutineDetailLoader loadRoutine;
  final RoutineNameUpdater onUpdateName;
  final RoutineDetailStateAction onDuplicateRoutine;
  final FullRoutineAction onArchiveRoutine;
  final FullRoutineAction onDeleteRoutine;
  final RoutineExerciseRemover onRemoveExercise;
  final RoutineExerciseMover onMoveExercise;
  final FullRoutineAction onEditRoutine;
  final RoutineDayAction onAddExercise;
  final RoutineDayAction onStartWorkout;
  final Future<void> Function() onBackToRoutines;

  @override
  State<RoutineDetailScreen> createState() => _RoutineDetailScreenState();
}

class _RoutineDetailScreenState extends State<RoutineDetailScreen> {
  final _nameController = TextEditingController();
  RoutineDetailState? _state;
  var _isLoading = false;
  var _isEditingName = false;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState;
    _syncName();
    if (_state == null) {
      _reload();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    setState(() => _isLoading = true);
    final nextState = await widget.loadRoutine(widget.routineId);
    if (!mounted) {
      return;
    }
    setState(() {
      _state = nextState;
      _isLoading = false;
    });
    _syncName();
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  void _syncName() {
    final name = _state?.routine?.routine.name;
    if (name != null && _nameController.text != name) {
      _nameController.text = name;
    }
  }

  Future<void> _saveName() async {
    final current = _state ?? RoutineDetailState.empty;
    final nextState = await widget.onUpdateName(current, _nameController.text);
    if (!mounted) {
      return;
    }
    setState(() {
      _state = nextState;
      _isEditingName = false;
    });
    _syncName();
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  Future<void> _duplicateRoutine() async {
    final current = _state ?? RoutineDetailState.empty;
    final nextState = await widget.onDuplicateRoutine(current);
    if (!mounted) {
      return;
    }
    setState(() => _state = nextState);
    _showMessage(
      nextState.hasError ? nextState.errorMessage! : 'Routine duplicated.',
    );
  }

  Future<void> _deleteRoutine(FullRoutine routine) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete routine?'),
        content: Text('This will delete ${routine.routine.name}.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) {
      return;
    }
    await _runAction(
      () => widget.onDeleteRoutine(routine),
      'Could not delete routine.',
    );
  }

  Future<void> _removeExercise(String routineExerciseId) async {
    final current = _state ?? RoutineDetailState.empty;
    final nextState = await widget.onRemoveExercise(current, routineExerciseId);
    if (!mounted) {
      return;
    }
    setState(() => _state = nextState);
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  Future<void> _moveExercise({
    required String dayId,
    required String routineExerciseId,
    required int direction,
  }) async {
    final current = _state ?? RoutineDetailState.empty;
    final nextState = await widget.onMoveExercise(
      current,
      dayId: dayId,
      routineExerciseId: routineExerciseId,
      direction: direction,
    );
    if (!mounted) {
      return;
    }
    setState(() => _state = nextState);
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  Future<void> _runAction(
    Future<void> Function() action,
    String failureMessage,
  ) async {
    try {
      await action();
    } catch (error) {
      if (mounted) {
        _showMessage(failureMessage);
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = _state ?? RoutineDetailState.empty;
    final routine = state.routine;
    final body = _isLoading && _state == null
        ? const _LoadingState()
        : routine == null
        ? _MissingRoutineState(
            message: state.errorMessage ?? 'Routine not found.',
            onBackToRoutines: () => _runAction(
              widget.onBackToRoutines,
              'Could not return to routines.',
            ),
          )
        : RefreshIndicator(
            onRefresh: _reload,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                ZenliftSpacing.lateral,
                ZenliftSpacing.stackMd,
                ZenliftSpacing.lateral,
                ZenliftSpacing.stackLg,
              ),
              children: [
                _RoutineHeader(
                  routine: routine,
                  nameController: _nameController,
                  isEditingName: _isEditingName,
                  onBeginEditName: () => setState(() => _isEditingName = true),
                  onCancelEditName: () {
                    setState(() => _isEditingName = false);
                    _syncName();
                  },
                  onSaveName: _saveName,
                  onDuplicate: _duplicateRoutine,
                  onArchive: () => _runAction(
                    () => widget.onArchiveRoutine(routine),
                    'Could not archive routine.',
                  ),
                  onDelete: () => _deleteRoutine(routine),
                  onEdit: () => _runAction(
                    () => widget.onEditRoutine(routine),
                    'Could not open routine editor.',
                  ),
                ),
                const SizedBox(height: ZenliftSpacing.stackLg),
                if (routine.days.isEmpty)
                  const _EmptyRoutine()
                else
                  for (final day in routine.days) ...[
                    _DaySection(
                      routine: routine,
                      day: day,
                      primaryMusclesByExerciseId:
                          state.primaryMusclesByExerciseId,
                      onAddExercise: () => _runAction(
                        () => widget.onAddExercise(routine, day.day),
                        'Could not open routine editor.',
                      ),
                      onStartWorkout: () => _runAction(
                        () => widget.onStartWorkout(routine, day.day),
                        'Could not start workout.',
                      ),
                      onRemoveExercise: _removeExercise,
                      onMoveExercise:
                          ({required routineExerciseId, required direction}) =>
                              _moveExercise(
                                dayId: day.day.id,
                                routineExerciseId: routineExerciseId,
                                direction: direction,
                              ),
                    ),
                    const SizedBox(height: ZenliftSpacing.stackLg),
                  ],
              ],
            ),
          );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Routine'),
        leading: IconButton(
          tooltip: 'Back to routines',
          onPressed: () => _runAction(
            widget.onBackToRoutines,
            'Could not return to routines.',
          ),
          icon: const Icon(Icons.chevron_left),
        ),
      ),
      body: SafeArea(child: body),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(child: CircularProgressIndicator());
  }
}

class _MissingRoutineState extends StatelessWidget {
  const _MissingRoutineState({
    required this.message,
    required this.onBackToRoutines,
  });

  final String message;
  final VoidCallback onBackToRoutines;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.lateral),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 42, color: colors.onSurfaceVariant),
            const SizedBox(height: ZenliftSpacing.stackMd),
            Text(
              'Routine not found',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            FilledButton(
              key: const Key('routine-detail-back-to-routines'),
              onPressed: onBackToRoutines,
              child: const Text('Back to routines'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoutineHeader extends StatelessWidget {
  const _RoutineHeader({
    required this.routine,
    required this.nameController,
    required this.isEditingName,
    required this.onBeginEditName,
    required this.onCancelEditName,
    required this.onSaveName,
    required this.onDuplicate,
    required this.onArchive,
    required this.onDelete,
    required this.onEdit,
  });

  final FullRoutine routine;
  final TextEditingController nameController;
  final bool isEditingName;
  final VoidCallback onBeginEditName;
  final VoidCallback onCancelEditName;
  final VoidCallback onSaveName;
  final VoidCallback onDuplicate;
  final VoidCallback onArchive;
  final VoidCallback onDelete;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final description = routine.routine.description?.trim();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isEditingName)
          TextField(
            key: const Key('routine-detail-name-field'),
            controller: nameController,
            autofocus: true,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => onSaveName(),
            decoration: InputDecoration(
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    tooltip: 'Cancel name edit',
                    onPressed: onCancelEditName,
                    icon: const Icon(Icons.close),
                  ),
                  IconButton(
                    key: const Key('routine-detail-save-name'),
                    tooltip: 'Save routine name',
                    onPressed: onSaveName,
                    icon: const Icon(Icons.check),
                  ),
                ],
              ),
              border: const OutlineInputBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(ZenliftRadii.medium),
                ),
              ),
            ),
          )
        else
          InkWell(
            key: const Key('routine-detail-name-button'),
            borderRadius: const BorderRadius.all(ZenliftRadii.card),
            onTap: onBeginEditName,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(
                routine.routine.name,
                style: Theme.of(context).textTheme.headlineLarge,
              ),
            ),
          ),
        if (description != null && description.isNotEmpty) ...[
          const SizedBox(height: ZenliftSpacing.stackSm),
          Text(
            description,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
        ],
        const SizedBox(height: ZenliftSpacing.stackMd),
        Wrap(
          spacing: ZenliftSpacing.stackSm,
          runSpacing: ZenliftSpacing.stackSm,
          children: [
            OutlinedButton.icon(
              key: const Key('routine-detail-edit-button'),
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined),
              label: const Text('Edit'),
            ),
            OutlinedButton.icon(
              key: const Key('routine-detail-duplicate-button'),
              onPressed: onDuplicate,
              icon: const Icon(Icons.copy_outlined),
              label: const Text('Duplicate'),
            ),
            OutlinedButton.icon(
              key: const Key('routine-detail-archive-button'),
              onPressed: onArchive,
              icon: const Icon(Icons.archive_outlined),
              label: const Text('Archive'),
            ),
            OutlinedButton.icon(
              key: const Key('routine-detail-delete-button'),
              onPressed: onDelete,
              icon: const Icon(Icons.delete_outline),
              label: const Text('Delete'),
            ),
          ],
        ),
      ],
    );
  }
}

class _DaySection extends StatelessWidget {
  const _DaySection({
    required this.routine,
    required this.day,
    required this.primaryMusclesByExerciseId,
    required this.onAddExercise,
    required this.onStartWorkout,
    required this.onRemoveExercise,
    required this.onMoveExercise,
  });

  final FullRoutine routine;
  final FullRoutineDay day;
  final Map<String, MuscleGroupEntity?> primaryMusclesByExerciseId;
  final VoidCallback onAddExercise;
  final VoidCallback onStartWorkout;
  final ValueChanged<String> onRemoveExercise;
  final Future<void> Function({
    required String routineExerciseId,
    required int direction,
  })
  onMoveExercise;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                day.day.name,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: const BoxDecoration(
                color: ZenliftColors.secondaryContainer,
                borderRadius: BorderRadius.all(ZenliftRadii.pill),
              ),
              child: Text(
                day.exercises.length == 1
                    ? '1 ejercicio'
                    : '${day.exercises.length} ejercicios',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: ZenliftColors.onSecondaryContainer,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: ZenliftSpacing.stackSm),
        if (day.exercises.isEmpty)
          _EmptyDay(onAddExercise: onAddExercise)
        else
          for (var index = 0; index < day.exercises.length; index += 1) ...[
            _RoutineExerciseRow(
              dayId: day.day.id,
              item: day.exercises[index],
              muscleColor: _parseColor(
                primaryMusclesByExerciseId[day.exercises[index].exercise.id]
                    ?.color,
              ),
              isFirst: index == 0,
              isLast: index == day.exercises.length - 1,
              onRemoveExercise: onRemoveExercise,
              onMoveExercise: onMoveExercise,
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
          ],
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                key: Key('routine-day-${day.day.id}-add-exercise'),
                onPressed: onAddExercise,
                icon: const Icon(Icons.add),
                label: const Text('Add exercise'),
              ),
            ),
            const SizedBox(width: ZenliftSpacing.stackSm),
            Expanded(
              child: FilledButton.icon(
                key: Key('routine-day-${day.day.id}-start-workout'),
                onPressed: onStartWorkout,
                icon: const Icon(Icons.play_arrow),
                label: const Text('Start Workout'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _EmptyDay extends StatelessWidget {
  const _EmptyDay({required this.onAddExercise});

  final VoidCallback onAddExercise;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      key: const Key('routine-detail-empty-day'),
      width: double.infinity,
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Text(
        'No exercises added yet.',
        textAlign: TextAlign.center,
        style: Theme.of(
          context,
        ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
      ),
    );
  }
}

class _RoutineExerciseRow extends StatelessWidget {
  const _RoutineExerciseRow({
    required this.dayId,
    required this.item,
    required this.muscleColor,
    required this.isFirst,
    required this.isLast,
    required this.onRemoveExercise,
    required this.onMoveExercise,
  });

  final String dayId;
  final RoutineExerciseWithExercise item;
  final Color? muscleColor;
  final bool isFirst;
  final bool isLast;
  final ValueChanged<String> onRemoveExercise;
  final Future<void> Function({
    required String routineExerciseId,
    required int direction,
  })
  onMoveExercise;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final targets = _targetLabel(item.routineExercise);

    return Container(
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: muscleColor ?? colors.primary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: ZenliftSpacing.stackSm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.exercise.name,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    if (targets.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        targets,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            children: [
              IconButton(
                key: Key('routine-exercise-${item.routineExercise.id}-remove'),
                tooltip: 'Remove exercise',
                onPressed: () => onRemoveExercise(item.routineExercise.id),
                icon: const Icon(Icons.delete_outline),
              ),
              const Spacer(),
              IconButton(
                key: Key('routine-exercise-${item.routineExercise.id}-up'),
                tooltip: 'Move exercise up',
                onPressed: isFirst
                    ? null
                    : () => onMoveExercise(
                        routineExerciseId: item.routineExercise.id,
                        direction: -1,
                      ),
                icon: const Icon(Icons.keyboard_arrow_up),
              ),
              IconButton(
                key: Key('routine-exercise-${item.routineExercise.id}-down'),
                tooltip: 'Move exercise down',
                onPressed: isLast
                    ? null
                    : () => onMoveExercise(
                        routineExerciseId: item.routineExercise.id,
                        direction: 1,
                      ),
                icon: const Icon(Icons.keyboard_arrow_down),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyRoutine extends StatelessWidget {
  const _EmptyRoutine();

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Text(
        'This routine has no days yet.',
        textAlign: TextAlign.center,
        style: Theme.of(
          context,
        ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
      ),
    );
  }
}

String _targetLabel(RoutineExerciseEntity exercise) {
  final labels = <String>[];
  if (exercise.targetSets != null) {
    labels.add(
      exercise.targetSets == 1 ? '1 set' : '${exercise.targetSets} sets',
    );
  }
  if (exercise.targetRepsMin != null || exercise.targetRepsMax != null) {
    labels.add(
      '${exercise.targetRepsMin ?? '-'}-${exercise.targetRepsMax ?? '-'} reps',
    );
  }
  return labels.join(' • ');
}

Color? _parseColor(String? value) {
  if (value == null || value.isEmpty) {
    return null;
  }
  final hex = value.replaceFirst('#', '');
  final normalized = hex.length == 6 ? 'ff$hex' : hex;
  final parsed = int.tryParse(normalized, radix: 16);
  return parsed == null ? null : Color(parsed);
}
