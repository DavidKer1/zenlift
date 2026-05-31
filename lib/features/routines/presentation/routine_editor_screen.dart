import 'package:flutter/material.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../../exercises/domain/exercise.dart';
import '../application/routine_editor_controller.dart';
import '../domain/routine.dart';
import '../domain/routine_editor.dart';
import '../domain/routine_repository.dart';

typedef RoutineEditorLoader = Future<RoutineEditorState> Function();
typedef RoutineDraftSaver = Future<FullRoutine> Function(RoutineDraft draft);
typedef RoutineDraftValidator =
    RoutineEditorValidationResult Function(RoutineDraft draft);
typedef RoutineSavedAction = Future<void> Function(FullRoutine routine);

class RoutineEditorScreen extends StatefulWidget {
  const RoutineEditorScreen({
    required this.mode,
    required this.loadEditor,
    required this.saveDraft,
    required this.validateDraft,
    required this.onSaved,
    required this.onCancel,
    required this.onBackToRoutines,
    super.key,
    this.routineId,
    this.initialState,
  });

  final RoutineEditorMode mode;
  final String? routineId;
  final RoutineEditorState? initialState;
  final RoutineEditorLoader loadEditor;
  final RoutineDraftSaver saveDraft;
  final RoutineDraftValidator validateDraft;
  final RoutineSavedAction onSaved;
  final Future<void> Function() onCancel;
  final Future<void> Function() onBackToRoutines;

  @override
  State<RoutineEditorScreen> createState() => _RoutineEditorScreenState();
}

class _RoutineEditorScreenState extends State<RoutineEditorScreen> {
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  RoutineEditorState? _state;
  RoutineDraft _draft = const RoutineDraft(name: '', days: []);
  List<String> _validationMessages = const [];
  var _isLoading = false;
  var _isSaving = false;
  var _isDirty = false;

  bool get _isEditing => widget.mode == RoutineEditorMode.edit;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState;
    if (_state != null) {
      _applyDraft(_state!.draft, dirty: false);
    } else {
      _load();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final nextState = await widget.loadEditor();
    if (!mounted) {
      return;
    }
    setState(() {
      _state = nextState;
      _isLoading = false;
    });
    _applyDraft(nextState.draft, dirty: false);
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  void _applyDraft(RoutineDraft draft, {required bool dirty}) {
    _draft = draft;
    _nameController.text = draft.name;
    _descriptionController.text = draft.description ?? '';
    _isDirty = dirty;
  }

  void _setDraft(RoutineDraft draft) {
    setState(() {
      _draft = draft;
      _isDirty = true;
      _validationMessages = const [];
    });
  }

  Future<void> _save() async {
    final draft = _draftWithTextFields();
    final validation = widget.validateDraft(draft);
    if (!validation.isValid) {
      setState(() => _validationMessages = validation.messages);
      return;
    }

    setState(() => _isSaving = true);
    try {
      final saved = await widget.saveDraft(draft);
      if (!mounted) {
        return;
      }
      setState(() {
        _isSaving = false;
        _isDirty = false;
      });
      await widget.onSaved(saved);
    } on RoutineEditorValidationException catch (error) {
      if (mounted) {
        setState(() {
          _validationMessages = error.messages;
          _isSaving = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() => _isSaving = false);
        _showMessage('No se pudo guardar la rutina');
      }
    }
  }

  Future<void> _cancel() async {
    if (!_isDirty) {
      await widget.onCancel();
      return;
    }
    final discard = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('¿Descartar cambios?'),
        content: const Text('Los cambios no guardados se perderán.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Seguir editando'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Descartar'),
          ),
        ],
      ),
    );
    if (discard == true) {
      await widget.onCancel();
    }
  }

  RoutineDraft _draftWithTextFields() {
    return RoutineDraft(
      id: _draft.id,
      name: _nameController.text,
      description: _descriptionController.text,
      goal: _draft.goal,
      days: _draft.days,
    );
  }

  void _addDay() {
    final nextIndex = _draft.days.length + 1;
    _setDraft(
      RoutineDraft(
        id: _draft.id,
        name: _nameController.text,
        description: _descriptionController.text,
        goal: _draft.goal,
        days: [
          ..._draft.days,
          RoutineDayDraft(name: 'Día $nextIndex', exercises: const []),
        ],
      ),
    );
  }

  void _removeDay(int index) {
    if (_draft.days.length <= 1) {
      return;
    }
    _setDraft(_draft.copyWithDays(_draft.days.withoutIndex(index)));
  }

  void _moveDay(int index, int direction) {
    final target = index + direction;
    if (target < 0 || target >= _draft.days.length) {
      return;
    }
    _setDraft(_draft.copyWithDays(_draft.days.swapped(index, target)));
  }

  void _updateDayName(int index, String name) {
    _setDraft(
      _draft.copyWithDays([
        for (var dayIndex = 0; dayIndex < _draft.days.length; dayIndex += 1)
          if (dayIndex == index)
            _draft.days[dayIndex].copyWith(name: name)
          else
            _draft.days[dayIndex],
      ]),
    );
  }

  void _addExercise(int dayIndex, ExerciseEntity exercise) {
    final day = _draft.days[dayIndex];
    final updatedDay = day.copyWith(
      exercises: [
        ...day.exercises,
        RoutineExerciseDraft(exerciseId: exercise.id, targetSets: 3),
      ],
    );
    _setDraft(_draft.replaceDay(dayIndex, updatedDay));
  }

  void _removeExercise(int dayIndex, int exerciseIndex) {
    final day = _draft.days[dayIndex];
    _setDraft(
      _draft.replaceDay(
        dayIndex,
        day.copyWith(exercises: day.exercises.withoutIndex(exerciseIndex)),
      ),
    );
  }

  void _moveExercise(int dayIndex, int exerciseIndex, int direction) {
    final day = _draft.days[dayIndex];
    final target = exerciseIndex + direction;
    if (target < 0 || target >= day.exercises.length) {
      return;
    }
    _setDraft(
      _draft.replaceDay(
        dayIndex,
        day.copyWith(exercises: day.exercises.swapped(exerciseIndex, target)),
      ),
    );
  }

  void _updateExercise(
    int dayIndex,
    int exerciseIndex,
    RoutineExerciseDraft exercise,
  ) {
    final day = _draft.days[dayIndex];
    _setDraft(
      _draft.replaceDay(
        dayIndex,
        day.copyWith(
          exercises: [
            for (var index = 0; index < day.exercises.length; index += 1)
              if (index == exerciseIndex) exercise else day.exercises[index],
          ],
        ),
      ),
    );
  }

  Future<void> _openExercisePicker(int dayIndex) async {
    final selected = await showModalBottomSheet<ExerciseEntity>(
      context: context,
      isScrollControlled: true,
      builder: (context) =>
          _ExercisePickerSheet(exercises: _state?.exerciseOptions ?? const []),
    );
    if (selected != null) {
      _addExercise(dayIndex, selected);
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final missingEdit = _isEditing && (_state?.hasError ?? false);

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit routine' : 'Create routine'),
        leading: IconButton(
          tooltip: 'Back',
          onPressed: _cancel,
          icon: const Icon(Icons.chevron_left),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : missingEdit
            ? _MissingRoutine(onBackToRoutines: widget.onBackToRoutines)
            : ListView(
                padding: const EdgeInsets.fromLTRB(
                  ZenliftSpacing.lateral,
                  ZenliftSpacing.stackMd,
                  ZenliftSpacing.lateral,
                  ZenliftSpacing.stackLg,
                ),
                children: [
                  if (_validationMessages.isNotEmpty) ...[
                    _ValidationSummary(messages: _validationMessages),
                    const SizedBox(height: ZenliftSpacing.stackMd),
                  ],
                  _RoutineFields(
                    nameController: _nameController,
                    descriptionController: _descriptionController,
                    goal: _draft.goal,
                    onChanged: () => setState(() => _isDirty = true),
                    onGoalChanged: (goal) =>
                        _setDraft(_draft.copyWithGoal(goal)),
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  for (
                    var index = 0;
                    index < _draft.days.length;
                    index += 1
                  ) ...[
                    _DayEditorCard(
                      day: _draft.days[index],
                      dayIndex: index,
                      exerciseOptions: _state?.exerciseOptions ?? const [],
                      canRemove: _draft.days.length > 1,
                      onNameChanged: (name) => _updateDayName(index, name),
                      onRemove: () => _removeDay(index),
                      onMoveUp: index == 0 ? null : () => _moveDay(index, -1),
                      onMoveDown: index == _draft.days.length - 1
                          ? null
                          : () => _moveDay(index, 1),
                      onAddExercise: () => _openExercisePicker(index),
                      onRemoveExercise: (exerciseIndex) =>
                          _removeExercise(index, exerciseIndex),
                      onMoveExercise: (exerciseIndex, direction) =>
                          _moveExercise(index, exerciseIndex, direction),
                      onUpdateExercise: (exerciseIndex, exercise) =>
                          _updateExercise(index, exerciseIndex, exercise),
                    ),
                    const SizedBox(height: ZenliftSpacing.stackMd),
                  ],
                  OutlinedButton.icon(
                    key: const Key('routine-editor-add-day'),
                    onPressed: _addDay,
                    icon: const Icon(Icons.add),
                    label: const Text('Agregar día'),
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  FilledButton(
                    key: const Key('routine-editor-submit'),
                    onPressed: _isSaving ? null : _save,
                    child: _isSaving
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(_isEditing ? 'Guardar cambios' : 'Crear rutina'),
                  ),
                ],
              ),
      ),
    );
  }
}

class _RoutineFields extends StatelessWidget {
  const _RoutineFields({
    required this.nameController,
    required this.descriptionController,
    required this.goal,
    required this.onChanged,
    required this.onGoalChanged,
  });

  final TextEditingController nameController;
  final TextEditingController descriptionController;
  final String? goal;
  final VoidCallback onChanged;
  final ValueChanged<String?> onGoalChanged;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            key: const Key('routine-editor-name'),
            controller: nameController,
            onChanged: (_) => onChanged(),
            decoration: const InputDecoration(
              labelText: 'Nombre',
              hintText: 'Push Day',
              prefixIcon: Icon(Icons.drive_file_rename_outline),
            ),
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          TextField(
            key: const Key('routine-editor-description'),
            controller: descriptionController,
            onChanged: (_) => onChanged(),
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Descripción',
              prefixIcon: Icon(Icons.notes_outlined),
            ),
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Wrap(
            spacing: ZenliftSpacing.stackSm,
            children: [
              ChoiceChip(
                label: const Text('Sin objetivo'),
                selected: goal == null,
                onSelected: (_) => onGoalChanged(null),
              ),
              for (final option in const [
                'strength',
                'hypertrophy',
                'endurance',
              ])
                ChoiceChip(
                  label: Text(option),
                  selected: goal == option,
                  onSelected: (_) => onGoalChanged(option),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DayEditorCard extends StatelessWidget {
  const _DayEditorCard({
    required this.day,
    required this.dayIndex,
    required this.exerciseOptions,
    required this.canRemove,
    required this.onNameChanged,
    required this.onRemove,
    required this.onMoveUp,
    required this.onMoveDown,
    required this.onAddExercise,
    required this.onRemoveExercise,
    required this.onMoveExercise,
    required this.onUpdateExercise,
  });

  final RoutineDayDraft day;
  final int dayIndex;
  final List<ExerciseEntity> exerciseOptions;
  final bool canRemove;
  final ValueChanged<String> onNameChanged;
  final VoidCallback onRemove;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;
  final VoidCallback onAddExercise;
  final ValueChanged<int> onRemoveExercise;
  final void Function(int exerciseIndex, int direction) onMoveExercise;
  final void Function(int exerciseIndex, RoutineExerciseDraft exercise)
  onUpdateExercise;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  key: Key('routine-editor-day-$dayIndex-name'),
                  initialValue: day.name,
                  onChanged: onNameChanged,
                  decoration: const InputDecoration(labelText: 'Día'),
                ),
              ),
              IconButton(
                tooltip: 'Move day up',
                onPressed: onMoveUp,
                icon: const Icon(Icons.keyboard_arrow_up),
              ),
              IconButton(
                tooltip: 'Move day down',
                onPressed: onMoveDown,
                icon: const Icon(Icons.keyboard_arrow_down),
              ),
              IconButton(
                key: Key('routine-editor-day-$dayIndex-remove'),
                tooltip: 'Remove day',
                onPressed: canRemove ? onRemove : null,
                icon: const Icon(Icons.delete_outline),
              ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          if (day.exercises.isEmpty)
            Text(
              'Cada día necesita al menos 1 ejercicio',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            )
          else
            for (
              var exerciseIndex = 0;
              exerciseIndex < day.exercises.length;
              exerciseIndex += 1
            ) ...[
              _ExerciseConfigurator(
                exercise: day.exercises[exerciseIndex],
                exerciseName: exerciseOptions
                    .where(
                      (option) =>
                          option.id == day.exercises[exerciseIndex].exerciseId,
                    )
                    .firstOrNull
                    ?.name,
                isFirst: exerciseIndex == 0,
                isLast: exerciseIndex == day.exercises.length - 1,
                onRemove: () => onRemoveExercise(exerciseIndex),
                onMoveUp: () => onMoveExercise(exerciseIndex, -1),
                onMoveDown: () => onMoveExercise(exerciseIndex, 1),
                onChanged: (exercise) =>
                    onUpdateExercise(exerciseIndex, exercise),
              ),
              const SizedBox(height: ZenliftSpacing.stackSm),
            ],
          OutlinedButton.icon(
            key: Key('routine-editor-day-$dayIndex-add-exercise'),
            onPressed: onAddExercise,
            icon: const Icon(Icons.add),
            label: const Text('Agregar ejercicio'),
          ),
        ],
      ),
    );
  }
}

class _ExerciseConfigurator extends StatelessWidget {
  const _ExerciseConfigurator({
    required this.exercise,
    required this.exerciseName,
    required this.isFirst,
    required this.isLast,
    required this.onRemove,
    required this.onMoveUp,
    required this.onMoveDown,
    required this.onChanged,
  });

  final RoutineExerciseDraft exercise;
  final String? exerciseName;
  final bool isFirst;
  final bool isLast;
  final VoidCallback onRemove;
  final VoidCallback onMoveUp;
  final VoidCallback onMoveDown;
  final ValueChanged<RoutineExerciseDraft> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(ZenliftSpacing.stackMd),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainerHigh,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(exerciseName ?? exercise.exerciseId)),
              IconButton(
                tooltip: 'Remove exercise',
                onPressed: onRemove,
                icon: const Icon(Icons.delete_outline),
              ),
              IconButton(
                tooltip: 'Move exercise up',
                onPressed: isFirst ? null : onMoveUp,
                icon: const Icon(Icons.keyboard_arrow_up),
              ),
              IconButton(
                tooltip: 'Move exercise down',
                onPressed: isLast ? null : onMoveDown,
                icon: const Icon(Icons.keyboard_arrow_down),
              ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.stackSm),
          Row(
            children: [
              Expanded(
                child: _NumberField(
                  label: 'Series',
                  value: exercise.targetSets,
                  onChanged: (value) =>
                      onChanged(exercise.copyWith(targetSets: value)),
                ),
              ),
              const SizedBox(width: ZenliftSpacing.stackSm),
              Expanded(
                child: _NumberField(
                  label: 'Reps min',
                  value: exercise.targetRepsMin,
                  onChanged: (value) =>
                      onChanged(exercise.copyWith(targetRepsMin: value)),
                ),
              ),
              const SizedBox(width: ZenliftSpacing.stackSm),
              Expanded(
                child: _NumberField(
                  label: 'Reps max',
                  value: exercise.targetRepsMax,
                  onChanged: (value) =>
                      onChanged(exercise.copyWith(targetRepsMax: value)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _NumberField extends StatelessWidget {
  const _NumberField({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final int? value;
  final ValueChanged<int?> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value?.toString() ?? '',
      keyboardType: TextInputType.number,
      onChanged: (text) => onChanged(int.tryParse(text)),
      decoration: InputDecoration(labelText: label),
    );
  }
}

class _ExercisePickerSheet extends StatefulWidget {
  const _ExercisePickerSheet({required this.exercises});

  final List<ExerciseEntity> exercises;

  @override
  State<_ExercisePickerSheet> createState() => _ExercisePickerSheetState();
}

class _ExercisePickerSheetState extends State<_ExercisePickerSheet> {
  var _query = '';
  String? _equipment;

  @override
  Widget build(BuildContext context) {
    final equipmentOptions = {
      for (final exercise in widget.exercises) exercise.equipment,
    }.toList()..sort();
    final filtered = widget.exercises.where((exercise) {
      final matchesQuery =
          _query.trim().isEmpty ||
          exercise.name.toLowerCase().contains(_query.trim().toLowerCase());
      final matchesEquipment =
          _equipment == null || exercise.equipment == _equipment;
      return matchesQuery && matchesEquipment;
    }).toList();

    return SafeArea(
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.78,
        builder: (context, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(ZenliftSpacing.lateral),
          children: [
            Text(
              'Seleccionar ejercicio',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            TextField(
              key: const Key('routine-editor-exercise-search'),
              onChanged: (value) => setState(() => _query = value),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'Buscar ejercicio',
              ),
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
            Wrap(
              spacing: ZenliftSpacing.stackSm,
              children: [
                ChoiceChip(
                  label: const Text('Todos'),
                  selected: _equipment == null,
                  onSelected: (_) => setState(() => _equipment = null),
                ),
                for (final equipment in equipmentOptions)
                  ChoiceChip(
                    label: Text(equipment),
                    selected: _equipment == equipment,
                    onSelected: (_) => setState(() => _equipment = equipment),
                  ),
              ],
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            if (filtered.isEmpty)
              const Text('No se encontraron ejercicios')
            else
              for (final exercise in filtered)
                ListTile(
                  title: Text(exercise.name),
                  subtitle: Text(
                    '${exercise.equipment} • ${exercise.category}',
                  ),
                  onTap: () => Navigator.of(context).pop(exercise),
                ),
          ],
        ),
      ),
    );
  }
}

class _ValidationSummary extends StatelessWidget {
  const _ValidationSummary({required this.messages});

  final List<String> messages;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.errorContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final message in messages)
            Row(
              children: [
                const Icon(Icons.error_outline, size: 18),
                const SizedBox(width: ZenliftSpacing.stackSm),
                Expanded(child: Text(message)),
              ],
            ),
        ],
      ),
    );
  }
}

class _MissingRoutine extends StatelessWidget {
  const _MissingRoutine({required this.onBackToRoutines});

  final Future<void> Function() onBackToRoutines;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: FilledButton(
        key: const Key('routine-editor-back-to-routines'),
        onPressed: onBackToRoutines,
        child: const Text('Routine not found'),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: child,
    );
  }
}

extension on RoutineDraft {
  RoutineDraft copyWithDays(List<RoutineDayDraft> days) {
    return RoutineDraft(
      id: id,
      name: name,
      description: description,
      goal: goal,
      days: days,
    );
  }

  RoutineDraft copyWithGoal(String? goal) {
    return RoutineDraft(
      id: id,
      name: name,
      description: description,
      goal: goal,
      days: days,
    );
  }

  RoutineDraft replaceDay(int index, RoutineDayDraft day) {
    return copyWithDays([
      for (var dayIndex = 0; dayIndex < days.length; dayIndex += 1)
        if (dayIndex == index) day else days[dayIndex],
    ]);
  }
}

extension on RoutineDayDraft {
  RoutineDayDraft copyWith({
    String? name,
    List<RoutineExerciseDraft>? exercises,
  }) {
    return RoutineDayDraft(
      id: id,
      name: name ?? this.name,
      dayOfWeek: dayOfWeek,
      exercises: exercises ?? this.exercises,
    );
  }
}

extension on RoutineExerciseDraft {
  RoutineExerciseDraft copyWith({
    int? targetSets,
    int? targetRepsMin,
    int? targetRepsMax,
  }) {
    return RoutineExerciseDraft(
      id: id,
      exerciseId: exerciseId,
      targetSets: targetSets,
      targetRepsMin: targetRepsMin,
      targetRepsMax: targetRepsMax,
      notes: notes,
    );
  }
}

extension<T> on List<T> {
  List<T> withoutIndex(int index) => [
    for (var itemIndex = 0; itemIndex < length; itemIndex += 1)
      if (itemIndex != index) this[itemIndex],
  ];

  List<T> swapped(int a, int b) {
    final next = [...this];
    final item = next[a];
    next[a] = next[b];
    next[b] = item;
    return next;
  }
}
