import 'package:flutter/material.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../application/exercise_form_controller.dart';
import '../domain/exercise.dart';
import '../domain/exercise_form.dart';

typedef ExerciseFormLoader = Future<ExerciseFormState> Function();
typedef ExerciseDraftSaver =
    Future<ExerciseEntity> Function(ExerciseDraft draft);
typedef ExerciseDraftValidator =
    ExerciseFormValidationResult Function(ExerciseDraft draft);
typedef ExerciseSavedAction = Future<void> Function(ExerciseEntity exercise);

class ExerciseFormScreen extends StatefulWidget {
  const ExerciseFormScreen({
    required this.mode,
    required this.loadForm,
    required this.saveDraft,
    required this.validateDraft,
    required this.onSaved,
    required this.onCancel,
    required this.onBackToExercises,
    super.key,
    this.exerciseId,
    this.initialState,
  });

  final ExerciseFormMode mode;
  final String? exerciseId;
  final ExerciseFormState? initialState;
  final ExerciseFormLoader loadForm;
  final ExerciseDraftSaver saveDraft;
  final ExerciseDraftValidator validateDraft;
  final ExerciseSavedAction onSaved;
  final Future<void> Function() onCancel;
  final Future<void> Function() onBackToExercises;

  @override
  State<ExerciseFormScreen> createState() => _ExerciseFormScreenState();
}

class _ExerciseFormScreenState extends State<ExerciseFormScreen> {
  final _nameController = TextEditingController();
  final _notesController = TextEditingController();
  ExerciseFormState? _state;
  ExerciseDraft _draft = ExerciseFormState.createEmpty.draft;
  List<String> _validationMessages = const <String>[];
  var _isLoading = false;
  var _isSaving = false;
  var _isDirty = false;

  bool get _isEditing => widget.mode == ExerciseFormMode.edit;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState;
    if (_state == null) {
      _load();
    } else {
      _applyDraft(_state!.draft, dirty: false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final nextState = await widget.loadForm();
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

  void _applyDraft(ExerciseDraft draft, {required bool dirty}) {
    _draft = draft;
    _nameController.text = draft.name;
    _notesController.text = draft.notes ?? '';
    _isDirty = dirty;
  }

  void _setDraft(ExerciseDraft draft) {
    setState(() {
      _draft = draft;
      _isDirty = true;
      _validationMessages = const <String>[];
    });
  }

  ExerciseDraft _draftWithTextFields() {
    return ExerciseDraft(
      id: _draft.id,
      name: _nameController.text,
      primaryMuscleGroupId: _draft.primaryMuscleGroupId,
      equipment: _draft.equipment,
      category: _draft.category,
      secondaryMuscleGroupIds: _draft.secondaryMuscleGroupIds,
      notes: _notesController.text,
    );
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
    } on ExerciseFormValidationException catch (error) {
      if (mounted) {
        setState(() {
          _validationMessages = error.messages;
          _isSaving = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() => _isSaving = false);
        _showMessage('No se pudo guardar el ejercicio');
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

  void _selectPrimary(String id) {
    _setDraft(
      _draft.copyWith(
        primaryMuscleGroupId: id,
        secondaryMuscleGroupIds: _draft.secondaryMuscleGroupIds
            .where((secondaryId) => secondaryId != id)
            .toList(),
      ),
    );
  }

  void _toggleSecondary(String id) {
    if (id == _draft.primaryMuscleGroupId) {
      return;
    }
    final nextIds = _draft.secondaryMuscleGroupIds.contains(id)
        ? _draft.secondaryMuscleGroupIds
              .where((muscleId) => muscleId != id)
              .toList()
        : [..._draft.secondaryMuscleGroupIds, id];
    _setDraft(_draft.copyWith(secondaryMuscleGroupIds: nextIds));
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final missingEdit = _isEditing && (_state?.hasError ?? false);
    final state = _state ?? ExerciseFormState.createEmpty;
    final missingMuscleOptions =
        !_isEditing && state.muscleGroups.isEmpty && state.hasError;

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit exercise' : 'Create exercise'),
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
            ? _MissingExercise(onBackToExercises: widget.onBackToExercises)
            : missingMuscleOptions
            ? _ExerciseFormUnavailable(
                message: state.errorMessage!,
                onBackToExercises: widget.onBackToExercises,
              )
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
                  _Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextField(
                          key: const Key('exercise-form-name'),
                          controller: _nameController,
                          onChanged: (_) => setState(() => _isDirty = true),
                          textInputAction: TextInputAction.next,
                          decoration: const InputDecoration(
                            labelText: 'Nombre',
                            hintText: 'Press inclinado',
                            prefixIcon: Icon(Icons.fitness_center),
                          ),
                        ),
                        const SizedBox(height: ZenliftSpacing.stackMd),
                        TextField(
                          key: const Key('exercise-form-notes'),
                          controller: _notesController,
                          onChanged: (_) => setState(() => _isDirty = true),
                          minLines: 3,
                          maxLines: 5,
                          decoration: const InputDecoration(
                            labelText: 'Notas',
                            hintText: 'Opcional',
                            alignLabelWithHint: true,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  _OptionSection(
                    title: 'Músculo principal',
                    children: [
                      for (final muscle in state.muscleGroups)
                        _SelectableChip(
                          key: Key('exercise-form-primary-${muscle.id}'),
                          label: muscle.displayNameEs,
                          color: _parseColor(muscle.color),
                          selected: _draft.primaryMuscleGroupId == muscle.id,
                          onSelected: () => _selectPrimary(muscle.id),
                        ),
                    ],
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  _OptionSection(
                    title: 'Músculos secundarios',
                    horizontal: true,
                    children: [
                      for (final muscle in state.muscleGroups)
                        if (muscle.id != _draft.primaryMuscleGroupId)
                          _SelectableChip(
                            key: Key('exercise-form-secondary-${muscle.id}'),
                            label: muscle.displayNameEs,
                            color: _parseColor(muscle.color),
                            selected: _draft.secondaryMuscleGroupIds.contains(
                              muscle.id,
                            ),
                            onSelected: () => _toggleSecondary(muscle.id),
                          ),
                    ],
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  _OptionSection(
                    title: 'Equipamiento',
                    children: [
                      for (final option in exerciseEquipmentOptions)
                        _SelectableChip(
                          key: Key('exercise-form-equipment-${option.value}'),
                          label: option.label,
                          selected: _draft.equipment == option.value,
                          onSelected: () => _setDraft(
                            _draft.copyWith(equipment: option.value),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  _OptionSection(
                    title: 'Categoría',
                    children: [
                      for (final option in exerciseCategoryOptions)
                        _SelectableChip(
                          key: Key('exercise-form-category-${option.value}'),
                          label: option.label,
                          selected: _draft.category == option.value,
                          onSelected: () => _setDraft(
                            _draft.copyWith(category: option.value),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: ZenliftSpacing.stackMd),
                  FilledButton(
                    key: const Key('exercise-form-submit'),
                    onPressed: _isSaving ? null : _save,
                    child: _isSaving
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            _isEditing ? 'Guardar cambios' : 'Crear ejercicio',
                          ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _OptionSection extends StatelessWidget {
  const _OptionSection({
    required this.title,
    required this.children,
    this.horizontal = false,
  });

  final String title;
  final List<Widget> children;
  final bool horizontal;

  @override
  Widget build(BuildContext context) {
    final content = Wrap(
      spacing: ZenliftSpacing.stackSm,
      runSpacing: ZenliftSpacing.stackSm,
      children: children,
    );
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: ZenliftSpacing.stackSm),
          horizontal
              ? SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: content,
                )
              : content,
        ],
      ),
    );
  }
}

class _SelectableChip extends StatelessWidget {
  const _SelectableChip({
    required this.label,
    required this.selected,
    required this.onSelected,
    super.key,
    this.color,
  });

  final String label;
  final bool selected;
  final VoidCallback onSelected;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      avatar: color == null
          ? null
          : CircleAvatar(backgroundColor: color, radius: 6),
      label: Text(label),
      selected: selected,
      onSelected: (_) => onSelected(),
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

class _ExerciseFormUnavailable extends StatelessWidget {
  const _ExerciseFormUnavailable({
    required this.message,
    required this.onBackToExercises,
  });

  final String message;
  final Future<void> Function() onBackToExercises;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.lateral),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 40, color: colors.onSurfaceVariant),
            const SizedBox(height: ZenliftSpacing.stackMd),
            Text(message, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: ZenliftSpacing.stackMd),
            FilledButton(
              key: const Key('exercise-form-back-to-exercises'),
              onPressed: onBackToExercises,
              child: const Text('Volver a ejercicios'),
            ),
          ],
        ),
      ),
    );
  }
}

class _MissingExercise extends StatelessWidget {
  const _MissingExercise({required this.onBackToExercises});

  final Future<void> Function() onBackToExercises;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.lateral),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Exercise not found',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            FilledButton(
              key: const Key('exercise-form-back-to-exercises'),
              onPressed: onBackToExercises,
              child: const Text('Back to exercises'),
            ),
          ],
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
      ),
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: child,
      ),
    );
  }
}

Color _parseColor(String hex) {
  final clean = hex.replaceFirst('#', '');
  return Color(int.parse('FF$clean', radix: 16));
}
