import 'package:flutter/material.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../domain/routine.dart';
import '../domain/routine_list.dart';

typedef RoutineListLoader = Future<RoutineListState> Function();
typedef RoutineArchiveAction =
    Future<RoutineListState> Function(
      RoutineListState state,
      RoutineWithCounts routine,
    );
typedef RoutineUndoArchiveAction =
    Future<RoutineListState> Function(RoutineListState state);
typedef RoutineAction = Future<void> Function();
typedef RoutineItemAction = Future<void> Function(RoutineWithCounts routine);
typedef RoutineTemplateAction =
    Future<void> Function(RoutineTemplateSummary template);

class RoutinesScreen extends StatefulWidget {
  const RoutinesScreen({
    required this.loadRoutines,
    required this.onArchiveRoutine,
    required this.onUndoArchive,
    required this.onOpenRoutine,
    required this.onCreateRoutine,
    required this.onOpenTemplate,
    super.key,
    this.initialState,
  });

  final RoutineListState? initialState;
  final RoutineListLoader loadRoutines;
  final RoutineArchiveAction onArchiveRoutine;
  final RoutineUndoArchiveAction onUndoArchive;
  final RoutineItemAction onOpenRoutine;
  final RoutineAction onCreateRoutine;
  final RoutineTemplateAction onOpenTemplate;

  @override
  State<RoutinesScreen> createState() => _RoutinesScreenState();
}

class _RoutinesScreenState extends State<RoutinesScreen> {
  RoutineListState? _state;
  var _isLoading = false;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState;
    if (_state == null) {
      _reload();
    }
  }

  Future<void> _reload() async {
    setState(() => _isLoading = true);
    try {
      final nextState = await widget.loadRoutines();
      if (!mounted) {
        return;
      }
      setState(() => _state = nextState);
      if (nextState.hasError) {
        _showMessage(nextState.errorMessage!);
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(
        () => _state = const RoutineListState(
          routines: <RoutineWithCounts>[],
          errorMessage: 'Could not load routines.',
        ),
      );
      _showMessage('Could not load routines.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _archive(RoutineWithCounts routine) async {
    final current = _state ?? RoutineListState.empty;
    final nextState = await widget.onArchiveRoutine(current, routine);
    if (!mounted) {
      return;
    }
    setState(() => _state = nextState);
    if (nextState.archivedRoutine?.routine.id == routine.routine.id) {
      _showUndoMessage(nextState.archivedRoutine!);
    } else if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  Future<void> _undoArchive() async {
    final current = _state ?? RoutineListState.empty;
    final nextState = await widget.onUndoArchive(current);
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

  void _showUndoMessage(RoutineWithCounts routine) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${routine.routine.name} archived.'),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(label: 'Undo', onPressed: _undoArchive),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = _state ?? RoutineListState.empty;
    final routines = state.routines;

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        key: const Key('routines-create-button'),
        tooltip: 'Create routine',
        onPressed: () => _runAction(
          widget.onCreateRoutine,
          'Could not open routine creation.',
        ),
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _reload,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              ZenliftSpacing.lateral,
              ZenliftSpacing.stackMd,
              ZenliftSpacing.lateral,
              96,
            ),
            children: [
              Text(
                'Routines',
                key: const Key('routines-title'),
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 4),
              Text(
                'Build, edit, and repeat your training plans.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: ZenliftSpacing.stackMd),
              if (_isLoading && _state == null)
                const _LoadingState()
              else if (routines.isEmpty)
                _EmptyRoutinesState(
                  onCreateRoutine: () => _runAction(
                    widget.onCreateRoutine,
                    'Could not open routine creation.',
                  ),
                )
              else
                _RoutineList(
                  routines: routines,
                  onArchiveRoutine: _archive,
                  onOpenRoutine: (routine) => _runAction(
                    () => widget.onOpenRoutine(routine),
                    'Could not open routine.',
                  ),
                ),
              if (routines.length < 2) ...[
                const SizedBox(height: ZenliftSpacing.stackLg),
                _SuggestedTemplates(
                  onOpenTemplate: (template) => _runAction(
                    () => widget.onOpenTemplate(template),
                    'Could not open routine template.',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 48),
      child: Center(child: CircularProgressIndicator()),
    );
  }
}

class _RoutineList extends StatelessWidget {
  const _RoutineList({
    required this.routines,
    required this.onArchiveRoutine,
    required this.onOpenRoutine,
  });

  final List<RoutineWithCounts> routines;
  final ValueChanged<RoutineWithCounts> onArchiveRoutine;
  final ValueChanged<RoutineWithCounts> onOpenRoutine;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (final routine in routines) ...[
          Dismissible(
            key: ValueKey('routine-card-${routine.routine.id}'),
            direction: DismissDirection.endToStart,
            background: const _ArchiveBackground(),
            confirmDismiss: (_) async {
              onArchiveRoutine(routine);
              return false;
            },
            child: _RoutineCard(
              routine: routine,
              onArchiveRoutine: onArchiveRoutine,
              onOpenRoutine: onOpenRoutine,
            ),
          ),
          const SizedBox(height: ZenliftSpacing.stackSm),
        ],
      ],
    );
  }
}

class _RoutineCard extends StatelessWidget {
  const _RoutineCard({
    required this.routine,
    required this.onArchiveRoutine,
    required this.onOpenRoutine,
  });

  final RoutineWithCounts routine;
  final ValueChanged<RoutineWithCounts> onArchiveRoutine;
  final ValueChanged<RoutineWithCounts> onOpenRoutine;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final daysLabel = routine.dayCount == 1
        ? '1 día'
        : '${routine.dayCount} días';
    final exercisesLabel = routine.exerciseCount == 1
        ? '1 ejercicio'
        : '${routine.exerciseCount} ejercicios';

    return Card(
      margin: EdgeInsets.zero,
      color: ZenliftColors.surfaceContainer,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(ZenliftRadii.card),
      ),
      child: InkWell(
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        onTap: () => onOpenRoutine(routine),
        child: Padding(
          padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      routine.routine.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '$daysLabel • $exercisesLabel',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                key: Key('routine-archive-${routine.routine.id}'),
                tooltip: 'Archive routine',
                onPressed: () => onArchiveRoutine(routine),
                icon: const Icon(Icons.archive_outlined),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ArchiveBackground extends StatelessWidget {
  const _ArchiveBackground();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: ZenliftColors.errorContainer,
        borderRadius: BorderRadius.all(ZenliftRadii.card),
      ),
      child: Align(
        alignment: Alignment.centerRight,
        child: Padding(
          padding: const EdgeInsets.only(right: ZenliftSpacing.cardPadding),
          child: Text(
            'Archive',
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: ZenliftColors.onErrorContainer,
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyRoutinesState extends StatelessWidget {
  const _EmptyRoutinesState({required this.onCreateRoutine});

  final VoidCallback onCreateRoutine;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      key: const Key('routines-empty-state'),
      padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        border: Border.all(color: colors.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.assignment_outlined, size: 40),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Text(
            'No tienes rutinas aún',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 6),
          Text(
            'Crea tu primer plan para iniciar un workout en un toque.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          FilledButton.icon(
            key: const Key('routines-empty-create-button'),
            onPressed: onCreateRoutine,
            icon: const Icon(Icons.add),
            label: const Text('Crear primera rutina'),
          ),
        ],
      ),
    );
  }
}

class _SuggestedTemplates extends StatelessWidget {
  const _SuggestedTemplates({required this.onOpenTemplate});

  final ValueChanged<RoutineTemplateSummary> onOpenTemplate;

  @override
  Widget build(BuildContext context) {
    return Column(
      key: const Key('routines-suggested-templates'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Suggested templates',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: ZenliftSpacing.stackSm),
        for (final template in routineTemplateSuggestions) ...[
          _TemplateCard(template: template, onOpenTemplate: onOpenTemplate),
          const SizedBox(height: ZenliftSpacing.stackSm),
        ],
      ],
    );
  }
}

class _TemplateCard extends StatelessWidget {
  const _TemplateCard({required this.template, required this.onOpenTemplate});

  final RoutineTemplateSummary template;
  final ValueChanged<RoutineTemplateSummary> onOpenTemplate;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return OutlinedButton(
      key: Key('routine-template-${template.kind.name}'),
      style: OutlinedButton.styleFrom(
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(ZenliftRadii.card),
        ),
      ),
      onPressed: () => onOpenTemplate(template),
      child: Row(
        children: [
          const Icon(Icons.auto_awesome_outlined),
          const SizedBox(width: ZenliftSpacing.stackMd),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(template.title),
                const SizedBox(height: 4),
                Text(
                  template.subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right),
        ],
      ),
    );
  }
}
