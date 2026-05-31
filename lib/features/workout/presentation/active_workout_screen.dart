import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/optional_field.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../../../widgets/zenlift_button.dart';
import '../../../widgets/zenlift_card.dart';
import '../../exercises/domain/exercise.dart';
import '../../exercises/domain/exercise_form.dart';
import '../../exercises/domain/exercise_library.dart';
import '../application/active_workout_controller.dart';
import '../domain/entities/workout_repository_entities.dart';

typedef ActiveWorkoutLoader = Future<ActiveWorkoutState> Function();
typedef ActiveWorkoutAddSet =
    Future<ActiveWorkoutState> Function(String workoutExerciseId);
typedef ActiveWorkoutUpdateSet =
    Future<ActiveWorkoutState> Function(
      String setId, {
      double? weight,
      int? reps,
      SetType? setType,
      OptionalField<String?>? notes,
    });
typedef ActiveWorkoutToggleSet =
    Future<ActiveWorkoutState> Function(String setId);
typedef ActiveWorkoutExerciseLoader =
    Future<ExerciseLibraryState> Function({String query});
typedef ActiveWorkoutAddExercise =
    Future<ActiveWorkoutState> Function(String exerciseId);
typedef ActiveWorkoutStateFallback = ActiveWorkoutState Function();
typedef ActiveWorkoutFinish = Future<WorkoutSummary> Function();
typedef ActiveWorkoutCancel = Future<void> Function();

class ActiveWorkoutScreen extends StatefulWidget {
  const ActiveWorkoutScreen({
    super.key,
    this.initialState,
    this.loadState,
    this.onAddSet,
    this.onUpdateSet,
    this.onToggleSet,
    this.loadExercises,
    this.onAddExercise,
    this.getLatestState,
    this.onFinish,
    this.onCancel,
  });

  final ActiveWorkoutState? initialState;
  final ActiveWorkoutLoader? loadState;
  final ActiveWorkoutAddSet? onAddSet;
  final ActiveWorkoutUpdateSet? onUpdateSet;
  final ActiveWorkoutToggleSet? onToggleSet;
  final ActiveWorkoutExerciseLoader? loadExercises;
  final ActiveWorkoutAddExercise? onAddExercise;
  final ActiveWorkoutStateFallback? getLatestState;
  final ActiveWorkoutFinish? onFinish;
  final ActiveWorkoutCancel? onCancel;

  @override
  State<ActiveWorkoutScreen> createState() => _ActiveWorkoutScreenState();
}

class _ActiveWorkoutScreenState extends State<ActiveWorkoutScreen> {
  late ActiveWorkoutState _state;
  Timer? _timer;
  var _elapsedSeconds = 0;
  var _isLoading = true;
  var _isBusy = false;
  String? _message;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState ?? ActiveWorkoutState.empty;
    _elapsedSeconds = _calculateElapsedSeconds(_state.session);
    unawaited(_load());
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || _state.session == null) {
        return;
      }
      setState(() {
        _elapsedSeconds = _calculateElapsedSeconds(_state.session);
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final loaded = await widget.loadState?.call();
      if (!mounted) {
        return;
      }
      setState(() {
        if (loaded != null) {
          _state = loaded;
        }
        _elapsedSeconds = _calculateElapsedSeconds(_state.session);
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _message = 'Could not recover the active workout.';
        _isLoading = false;
      });
    }
  }

  Future<void> _runStateAction(
    Future<ActiveWorkoutState> Function() action,
  ) async {
    if (_isBusy) {
      return;
    }
    setState(() {
      _isBusy = true;
      _message = null;
    });
    try {
      final nextState = await action();
      if (!mounted) {
        return;
      }
      setState(() {
        _state = nextState;
        _elapsedSeconds = _calculateElapsedSeconds(nextState.session);
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        final latestState = widget.getLatestState?.call();
        if (latestState != null) {
          _state = latestState;
        }
        _message = 'Workout changes could not be saved.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
        });
      }
    }
  }

  Future<void> _addExercise() async {
    final loadExercises = widget.loadExercises;
    final onAddExercise = widget.onAddExercise;
    if (_isBusy || loadExercises == null || onAddExercise == null) {
      return;
    }

    final selectedExerciseId = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.82,
          minChildSize: 0.45,
          maxChildSize: 0.95,
          builder: (context, scrollController) {
            return _ExercisePickerSheet(
              loadExercises: loadExercises,
              scrollController: scrollController,
            );
          },
        );
      },
    );

    if (!mounted || selectedExerciseId == null) {
      return;
    }

    await _runStateAction(() => onAddExercise(selectedExerciseId));
  }

  Future<void> _finish() async {
    if (_isBusy || widget.onFinish == null) {
      return;
    }
    setState(() {
      _isBusy = true;
      _message = null;
    });
    try {
      final summary = await widget.onFinish!();
      if (!mounted) {
        return;
      }
      setState(() {
        _state = ActiveWorkoutState.empty;
        _message =
            'Workout saved: ${summary.completedSetCount} sets, ${_formatVolume(summary.totalVolume)} volume.';
      });
    } on ActiveWorkoutException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _message = error.message;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
        });
      }
    }
  }

  Future<void> _cancel() async {
    if (_isBusy) {
      return;
    }
    setState(() {
      _isBusy = true;
      _message = null;
    });
    try {
      await widget.onCancel?.call();
      if (!mounted) {
        return;
      }
      setState(() {
        _state = ActiveWorkoutState.empty;
        _message = 'Workout cancelled.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SafeArea(
        child: Column(
          children: <Widget>[
            _WorkoutHeader(
              title: _state.session?.name ?? 'Active workout',
              elapsedSeconds: _elapsedSeconds,
              onCancel: widget.onCancel == null || _state.session == null
                  ? null
                  : _cancel,
            ),
            Expanded(child: _buildBody(colors)),
            _WorkoutBottomBar(
              isBusy: _isBusy,
              canFinish: _state.exercises.isNotEmpty && widget.onFinish != null,
              onFinish: _finish,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(ColorScheme colors) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(key: Key('active-workout-loading')),
      );
    }

    if (_state.session == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(ZenliftSpacing.lateral),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                Icons.fitness_center_outlined,
                color: colors.onSurfaceVariant,
                size: 32,
              ),
              const SizedBox(height: ZenliftSpacing.stackMd),
              Text(
                'No active workout',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: colors.onSurface,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: ZenliftSpacing.stackSm),
              Text(
                _message ?? 'Start a routine or quick workout to log sets.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final bannerCount =
        (_message == null ? 0 : 1) + (_state.hasPendingSetWrites ? 1 : 0);
    final itemCount = bannerCount + _state.exercises.length + 1;

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      itemBuilder: (context, index) {
        if (index == 0 && _message != null) {
          return _InlineMessage(message: _message!);
        }
        final pendingBannerIndex = _message == null ? 0 : 1;
        if (index == pendingBannerIndex && _state.hasPendingSetWrites) {
          return const _InlineMessage(
            message: 'A completed set is pending save. Zenlift will retry it.',
          );
        }

        final adjustedIndex = index - bannerCount;
        if (adjustedIndex == _state.exercises.length) {
          return _AddExerciseButton(
            isBusy: _isBusy,
            onPressed:
                widget.loadExercises == null || widget.onAddExercise == null
                ? null
                : _addExercise,
          );
        }

        final exercise = _state.exercises[adjustedIndex];
        return _WorkoutExerciseCard(
          exercise: exercise,
          isBusy: _isBusy,
          onAddSet: widget.onAddSet == null
              ? null
              : () => _runStateAction(
                  () => widget.onAddSet!(exercise.workoutExercise.id),
                ),
          onToggleSet: widget.onToggleSet == null
              ? null
              : (setId) => _runStateAction(() => widget.onToggleSet!(setId)),
          onWeightChanged: widget.onUpdateSet == null
              ? null
              : (setId, weight) => _runStateAction(
                  () => widget.onUpdateSet!(setId, weight: weight),
                ),
          onRepsChanged: widget.onUpdateSet == null
              ? null
              : (setId, reps) => _runStateAction(
                  () => widget.onUpdateSet!(setId, reps: reps),
                ),
          onSetTypeChanged: widget.onUpdateSet == null
              ? null
              : (setId, setType) => _runStateAction(
                  () => widget.onUpdateSet!(setId, setType: setType),
                ),
          onNotesChanged: widget.onUpdateSet == null
              ? null
              : (setId, notes) => _runStateAction(
                  () => widget.onUpdateSet!(
                    setId,
                    notes: OptionalField(notes.isEmpty ? null : notes),
                  ),
                ),
          previousPerformance:
              _state.previousPerformanceByWorkoutExerciseId[exercise
                  .workoutExercise
                  .id],
        );
      },
      separatorBuilder: (context, index) =>
          const SizedBox(height: ZenliftSpacing.stackMd),
      itemCount: itemCount,
    );
  }
}

class _ExercisePickerSheet extends StatefulWidget {
  const _ExercisePickerSheet({
    required this.loadExercises,
    required this.scrollController,
  });

  final ActiveWorkoutExerciseLoader loadExercises;
  final ScrollController scrollController;

  @override
  State<_ExercisePickerSheet> createState() => _ExercisePickerSheetState();
}

class _ExercisePickerSheetState extends State<_ExercisePickerSheet> {
  final _searchController = TextEditingController();
  Timer? _debounce;
  ExerciseLibraryState _state = ExerciseLibraryState.empty;
  var _isLoading = true;
  var _loadSequence = 0;
  String? _message;

  @override
  void initState() {
    super.initState();
    unawaited(_reload());
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    final requestSequence = ++_loadSequence;
    final query = _searchController.text;

    setState(() {
      _isLoading = true;
      _message = null;
    });

    try {
      final state = await widget.loadExercises(query: query);
      if (!mounted || requestSequence != _loadSequence) {
        return;
      }
      setState(() {
        _state = state;
        _message = state.errorMessage;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted || requestSequence != _loadSequence) {
        return;
      }
      setState(() {
        _message = 'Could not load exercises.';
        _isLoading = false;
      });
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), _reload);
    setState(() {});
  }

  void _clearSearch() {
    _debounce?.cancel();
    _searchController.clear();
    unawaited(_reload());
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Padding(
      padding: EdgeInsets.only(
        left: ZenliftSpacing.lateral,
        right: ZenliftSpacing.lateral,
        top: ZenliftSpacing.stackMd,
        bottom: MediaQuery.viewInsetsOf(context).bottom,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  'Choose exercise',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: colors.onSurface,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              IconButton(
                tooltip: 'Close exercise picker',
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.stackSm),
          TextField(
            key: const Key('active-workout-exercise-search-field'),
            controller: _searchController,
            onChanged: _onSearchChanged,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              hintText: 'Search exercises',
              suffixIcon: _searchController.text.trim().isEmpty
                  ? null
                  : IconButton(
                      key: const Key('active-workout-clear-exercise-search'),
                      tooltip: 'Clear search',
                      onPressed: _clearSearch,
                      icon: const Icon(Icons.close),
                    ),
              border: const OutlineInputBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(ZenliftRadii.medium),
                ),
              ),
            ),
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          if (_message != null) ...[
            _InlineMessage(message: _message!),
            const SizedBox(height: ZenliftSpacing.stackMd),
          ],
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      key: Key('active-workout-exercise-picker-loading'),
                    ),
                  )
                : _state.exercises.isEmpty
                ? Center(
                    child: Text(
                      'No exercises found.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                  )
                : ListView.separated(
                    controller: widget.scrollController,
                    itemCount: _state.exercises.length,
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: ZenliftSpacing.stackSm),
                    itemBuilder: (context, index) {
                      final item = _state.exercises[index];
                      return _ExercisePickerTile(item: item);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ExercisePickerTile extends StatelessWidget {
  const _ExercisePickerTile({required this.item});

  final ExerciseLibraryItem item;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final ExerciseEntity exercise = item.exercise;
    final subtitle = <String>[
      if (item.primaryMuscle != null) item.primaryMuscle!.displayNameEs,
      exerciseEquipmentLabel(exercise.equipment),
    ].join(' · ');

    return Material(
      color: colors.surfaceContainerHigh,
      borderRadius: const BorderRadius.all(ZenliftRadii.compactControl),
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        key: Key('active-workout-exercise-option-${item.exercise.id}'),
        minVerticalPadding: 12,
        leading: Icon(Icons.fitness_center, color: colors.primary),
        title: Text(
          exercise.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: colors.onSurface,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          subtitle,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant),
        ),
        trailing: const Icon(Icons.add),
        onTap: () => Navigator.of(context).pop(exercise.id),
      ),
    );
  }
}

class _AddExerciseButton extends StatelessWidget {
  const _AddExerciseButton({required this.isBusy, required this.onPressed});

  final bool isBusy;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ZenliftButton.secondary(
        key: const Key('active-workout-add-exercise-button'),
        label: 'Add exercise',
        icon: Icons.add,
        semanticLabel: 'Add exercise to active workout',
        onPressed: isBusy ? null : onPressed,
      ),
    );
  }
}

class _WorkoutHeader extends StatelessWidget {
  const _WorkoutHeader({
    required this.title,
    required this.elapsedSeconds,
    required this.onCancel,
  });

  final String title;
  final int elapsedSeconds;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(bottom: BorderSide(color: colors.outlineVariant)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: colors.onSurface,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Semantics(
                  label: 'Workout duration ${_formatDuration(elapsedSeconds)}',
                  child: Text(
                    _formatDuration(elapsedSeconds),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: colors.primary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Cancel workout',
            onPressed: onCancel,
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }
}

class _WorkoutExerciseCard extends StatelessWidget {
  const _WorkoutExerciseCard({
    required this.exercise,
    required this.isBusy,
    required this.onAddSet,
    required this.onToggleSet,
    required this.onWeightChanged,
    required this.onRepsChanged,
    required this.onSetTypeChanged,
    required this.onNotesChanged,
    required this.previousPerformance,
  });

  final WorkoutExerciseWithSets exercise;
  final bool isBusy;
  final VoidCallback? onAddSet;
  final ValueChanged<String>? onToggleSet;
  final void Function(String setId, double weight)? onWeightChanged;
  final void Function(String setId, int reps)? onRepsChanged;
  final void Function(String setId, SetType setType)? onSetTypeChanged;
  final void Function(String setId, String notes)? onNotesChanged;
  final ({double weight, int reps})? previousPerformance;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final completed = exercise.sets.where((set) => set.isCompleted).length;

    return ZenliftCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      exercise.exercise.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: colors.onSurface,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$completed/${exercise.sets.length} sets completed',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                    if (previousPerformance != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Previous: ${_formatNumber(previousPerformance!.weight)} x ${previousPerformance!.reps}',
                        key: Key(
                          'active-workout-previous-${exercise.workoutExercise.id}',
                        ),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              ZenliftButton.secondary(
                key: Key(
                  'active-workout-add-set-${exercise.workoutExercise.id}',
                ),
                label: 'Add set',
                icon: Icons.add,
                semanticLabel: 'Add set for ${exercise.exercise.name}',
                onPressed: isBusy ? null : onAddSet,
              ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          if (exercise.sets.isEmpty)
            Text(
              'Add your first set. Previous values will fill in automatically when available.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
            )
          else
            Column(
              children: exercise.sets
                  .map(
                    (set) => Padding(
                      padding: const EdgeInsets.only(
                        bottom: ZenliftSpacing.stackSm,
                      ),
                      child: _SetRow(
                        set: set,
                        isBusy: isBusy,
                        onToggle: onToggleSet == null
                            ? null
                            : () => onToggleSet!(set.id),
                        onWeightChanged: onWeightChanged == null
                            ? null
                            : (weight) => onWeightChanged!(set.id, weight),
                        onRepsChanged: onRepsChanged == null
                            ? null
                            : (reps) => onRepsChanged!(set.id, reps),
                        onSetTypeChanged: onSetTypeChanged == null
                            ? null
                            : (setType) => onSetTypeChanged!(set.id, setType),
                        onNotesChanged: onNotesChanged == null
                            ? null
                            : (notes) => onNotesChanged!(set.id, notes),
                      ),
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
    );
  }
}

class _SetRow extends StatefulWidget {
  const _SetRow({
    required this.set,
    required this.isBusy,
    required this.onToggle,
    required this.onWeightChanged,
    required this.onRepsChanged,
    required this.onSetTypeChanged,
    required this.onNotesChanged,
  });

  final SetLogEntity set;
  final bool isBusy;
  final VoidCallback? onToggle;
  final ValueChanged<double>? onWeightChanged;
  final ValueChanged<int>? onRepsChanged;
  final ValueChanged<SetType>? onSetTypeChanged;
  final ValueChanged<String>? onNotesChanged;

  @override
  State<_SetRow> createState() => _SetRowState();
}

class _SetRowState extends State<_SetRow> {
  late TextEditingController _weightController;
  late TextEditingController _repsController;
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    _weightController = TextEditingController(
      text: _formatNumber(widget.set.weight),
    );
    _repsController = TextEditingController(text: widget.set.reps.toString());
    _notesController = TextEditingController(text: widget.set.notes ?? '');
  }

  @override
  void didUpdateWidget(covariant _SetRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.set.weight != widget.set.weight &&
        _weightController.text != _formatNumber(widget.set.weight)) {
      _weightController.text = _formatNumber(widget.set.weight);
    }
    if (oldWidget.set.reps != widget.set.reps &&
        _repsController.text != widget.set.reps.toString()) {
      _repsController.text = widget.set.reps.toString();
    }
    if (oldWidget.set.notes != widget.set.notes &&
        _notesController.text != (widget.set.notes ?? '')) {
      _notesController.text = widget.set.notes ?? '';
    }
  }

  @override
  void dispose() {
    _weightController.dispose();
    _repsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final completedColor = widget.set.isCompleted
        ? colors.tertiary
        : colors.outline;

    return Semantics(
      container: true,
      label: 'Set ${widget.set.setNumber}',
      child: Container(
        constraints: const BoxConstraints(minHeight: 64),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: colors.surfaceContainerHigh,
          borderRadius: const BorderRadius.all(ZenliftRadii.compactControl),
          border: Border.all(color: colors.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Row(
              children: <Widget>[
                SizedBox(
                  width: 28,
                  child: Text(
                    widget.set.setNumber.toString(),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: colors.onSurface,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: ZenliftSpacing.stackSm),
                Expanded(
                  child: _SetInput(
                    key: Key('active-workout-set-weight-${widget.set.id}'),
                    label: 'Weight',
                    controller: _weightController,
                    enabled: !widget.isBusy && widget.onWeightChanged != null,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    onSubmitted: (value) {
                      final parsed = double.tryParse(value);
                      if (parsed != null) {
                        widget.onWeightChanged?.call(parsed);
                      }
                    },
                  ),
                ),
                const SizedBox(width: ZenliftSpacing.stackSm),
                Expanded(
                  child: _SetInput(
                    key: Key('active-workout-set-reps-${widget.set.id}'),
                    label: 'Reps',
                    controller: _repsController,
                    enabled: !widget.isBusy && widget.onRepsChanged != null,
                    keyboardType: TextInputType.number,
                    onSubmitted: (value) {
                      final parsed = int.tryParse(value);
                      if (parsed != null) {
                        widget.onRepsChanged?.call(parsed);
                      }
                    },
                  ),
                ),
                const SizedBox(width: ZenliftSpacing.stackSm),
                IconButton.filledTonal(
                  key: Key('active-workout-set-toggle-${widget.set.id}'),
                  tooltip: widget.set.isCompleted
                      ? 'Mark incomplete'
                      : 'Complete set',
                  onPressed: widget.isBusy ? null : widget.onToggle,
                  style: IconButton.styleFrom(
                    backgroundColor: completedColor.withValues(alpha: 0.18),
                    foregroundColor: completedColor,
                    minimumSize: const Size.square(48),
                  ),
                  icon: Icon(
                    widget.set.isCompleted
                        ? Icons.check_circle
                        : Icons.radio_button_unchecked,
                  ),
                ),
              ],
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
            Row(
              children: <Widget>[
                Expanded(
                  child: DropdownButtonFormField<SetType>(
                    key: Key('active-workout-set-type-${widget.set.id}'),
                    initialValue: widget.set.setType,
                    decoration: const InputDecoration(
                      labelText: 'Type',
                      isDense: true,
                    ),
                    items: SetType.values
                        .map(
                          (type) => DropdownMenuItem<SetType>(
                            value: type,
                            child: Text(_setTypeLabel(type)),
                          ),
                        )
                        .toList(),
                    onChanged: widget.isBusy || widget.onSetTypeChanged == null
                        ? null
                        : (value) {
                            if (value != null) {
                              widget.onSetTypeChanged?.call(value);
                            }
                          },
                  ),
                ),
                const SizedBox(width: ZenliftSpacing.stackSm),
                Expanded(
                  child: _SetInput(
                    key: Key('active-workout-set-notes-${widget.set.id}'),
                    label: 'Note',
                    controller: _notesController,
                    enabled: !widget.isBusy && widget.onNotesChanged != null,
                    keyboardType: TextInputType.text,
                    onSubmitted: widget.onNotesChanged ?? (_) {},
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SetInput extends StatelessWidget {
  const _SetInput({
    super.key,
    required this.label,
    required this.controller,
    required this.enabled,
    required this.keyboardType,
    required this.onSubmitted,
  });

  final String label;
  final TextEditingController controller;
  final bool enabled;
  final TextInputType keyboardType;
  final ValueChanged<String> onSubmitted;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      textInputAction: TextInputAction.done,
      onSubmitted: onSubmitted,
      onEditingComplete: () => onSubmitted(controller.text),
      decoration: InputDecoration(
        labelText: label,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 10,
          vertical: 10,
        ),
      ),
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
    );
  }
}

class _WorkoutBottomBar extends StatelessWidget {
  const _WorkoutBottomBar({
    required this.isBusy,
    required this.canFinish,
    required this.onFinish,
  });

  final bool isBusy;
  final bool canFinish;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      decoration: BoxDecoration(
        color: colors.surface,
        border: Border(top: BorderSide(color: colors.outlineVariant)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: ZenliftButton.primary(
              key: const Key('active-workout-finish-button'),
              label: 'Finish',
              icon: Icons.flag_outlined,
              semanticLabel: 'Finish workout',
              onPressed: !isBusy && canFinish ? onFinish : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _InlineMessage extends StatelessWidget {
  const _InlineMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      key: const Key('active-workout-message'),
      padding: const EdgeInsets.all(ZenliftSpacing.gutter),
      decoration: BoxDecoration(
        color: colors.surfaceContainerHigh,
        borderRadius: const BorderRadius.all(ZenliftRadii.compactControl),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Text(
        message,
        style: Theme.of(
          context,
        ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
      ),
    );
  }
}

int _calculateElapsedSeconds(WorkoutSessionEntity? session) {
  if (session == null) {
    return 0;
  }
  final elapsed = DateTime.now().difference(session.startedAt).inSeconds;
  return elapsed < 0 ? 0 : elapsed;
}

String _formatDuration(int seconds) {
  final hours = seconds ~/ 3600;
  final minutes = (seconds % 3600) ~/ 60;
  final remainingSeconds = seconds % 60;
  if (hours > 0) {
    return '$hours:${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }
  return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
}

String _formatNumber(double value) {
  if (value == value.roundToDouble()) {
    return value.toStringAsFixed(0);
  }
  return value.toStringAsFixed(1);
}

String _formatVolume(double value) {
  if (value == value.roundToDouble()) {
    return value.toStringAsFixed(0);
  }
  return value.toStringAsFixed(1);
}

String _setTypeLabel(SetType setType) {
  return switch (setType) {
    SetType.normal => 'Normal',
    SetType.warmup => 'Warmup',
    SetType.drop => 'Drop',
    SetType.failure => 'Failure',
    SetType.amrap => 'AMRAP',
  };
}
