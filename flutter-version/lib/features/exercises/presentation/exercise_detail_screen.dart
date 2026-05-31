import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../../workout/domain/entities/workout_repository_entities.dart';
import '../domain/exercise.dart';
import '../domain/exercise_detail.dart';

typedef ExerciseDetailLoader =
    Future<ExerciseDetailState> Function(String exerciseId);
typedef ExerciseAction = Future<void> Function(ExerciseEntity exercise);

class ExerciseDetailScreen extends StatefulWidget {
  const ExerciseDetailScreen({
    required this.exerciseId,
    required this.loadExercise,
    required this.onQuickWorkout,
    required this.onEditExercise,
    required this.onDeleteExercise,
    required this.onBack,
    super.key,
    this.initialState,
  });

  final String exerciseId;
  final ExerciseDetailState? initialState;
  final ExerciseDetailLoader loadExercise;
  final ExerciseAction onQuickWorkout;
  final ExerciseAction onEditExercise;
  final ExerciseAction onDeleteExercise;
  final Future<void> Function() onBack;

  @override
  State<ExerciseDetailScreen> createState() => _ExerciseDetailScreenState();
}

class _ExerciseDetailScreenState extends State<ExerciseDetailScreen> {
  ExerciseDetailState? _state;
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
    final nextState = await widget.loadExercise(widget.exerciseId);
    if (!mounted) {
      return;
    }
    setState(() {
      _state = nextState;
      _isLoading = false;
    });
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  Future<void> _deleteExercise(ExerciseEntity exercise) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete exercise?'),
        content: Text('This will delete ${exercise.name}.'),
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
    if (confirmed == true) {
      await _runAction(
        () => widget.onDeleteExercise(exercise),
        'Could not delete exercise.',
      );
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
    final state = _state ?? ExerciseDetailState.empty;
    final exercise = state.exercise;
    final body = _isLoading && _state == null
        ? const Center(child: CircularProgressIndicator())
        : exercise == null
        ? _MissingExercise(onBack: widget.onBack)
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
                _Header(
                  exercise: exercise,
                  muscles: state.muscles,
                  onQuickWorkout: () => _runAction(
                    () => widget.onQuickWorkout(exercise),
                    'Could not start workout.',
                  ),
                  onEdit: exercise.isCustom
                      ? () => _runAction(
                          () => widget.onEditExercise(exercise),
                          'Could not open exercise editor.',
                        )
                      : null,
                  onDelete: exercise.isCustom
                      ? () => _deleteExercise(exercise)
                      : null,
                ),
                const SizedBox(height: ZenliftSpacing.stackMd),
                _BestPerformanceCard(best: state.bestPerformance),
                const SizedBox(height: ZenliftSpacing.stackMd),
                _HistoryCard(history: state.history),
                const SizedBox(height: ZenliftSpacing.stackMd),
                _PersonalRecordsCard(records: state.personalRecords),
              ],
            ),
          );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Exercise'),
        leading: IconButton(
          tooltip: 'Back to exercises',
          onPressed: () => _runAction(widget.onBack, 'Could not go back.'),
          icon: const Icon(Icons.chevron_left),
        ),
      ),
      body: SafeArea(child: body),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.exercise,
    required this.muscles,
    required this.onQuickWorkout,
    required this.onEdit,
    required this.onDelete,
  });

  final ExerciseEntity exercise;
  final List<MuscleGroupEntity> muscles;
  final VoidCallback onQuickWorkout;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(exercise.name, style: Theme.of(context).textTheme.headlineLarge),
        const SizedBox(height: 6),
        Text(
          '${exercise.equipment} • ${exercise.category}',
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
        ),
        const SizedBox(height: ZenliftSpacing.stackMd),
        Wrap(
          spacing: ZenliftSpacing.stackSm,
          runSpacing: ZenliftSpacing.stackSm,
          children: [
            for (var index = 0; index < muscles.length; index += 1)
              Chip(
                avatar: CircleAvatar(
                  backgroundColor: _parseColor(muscles[index].color),
                ),
                label: Text(
                  index == 0
                      ? '${muscles[index].displayNameEs} primary'
                      : muscles[index].displayNameEs,
                ),
              ),
          ],
        ),
        const SizedBox(height: ZenliftSpacing.stackMd),
        FilledButton.icon(
          key: const Key('exercise-detail-quick-workout'),
          onPressed: onQuickWorkout,
          icon: const Icon(Icons.play_arrow),
          label: const Text('Iniciar entrenamiento rápido'),
        ),
        if (onEdit != null || onDelete != null) ...[
          const SizedBox(height: ZenliftSpacing.stackSm),
          Wrap(
            spacing: ZenliftSpacing.stackSm,
            children: [
              if (onEdit != null)
                OutlinedButton.icon(
                  key: const Key('exercise-detail-edit-button'),
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined),
                  label: const Text('Edit'),
                ),
              if (onDelete != null)
                OutlinedButton.icon(
                  key: const Key('exercise-detail-delete-button'),
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('Delete'),
                ),
            ],
          ),
        ],
      ],
    );
  }
}

class _BestPerformanceCard extends StatelessWidget {
  const _BestPerformanceCard({required this.best});

  final ExerciseBestPerformance best;

  @override
  Widget build(BuildContext context) {
    return _InfoCard(
      title: 'Best Performance',
      child: Row(
        children: [
          Expanded(
            child: _Metric(label: 'Max Weight', value: _kg(best.maxWeight)),
          ),
          Expanded(
            child: _Metric(
              label: 'Best 1RM',
              value: _kg(best.bestEstimatedOneRepMax),
            ),
          ),
          Expanded(
            child: _Metric(label: 'Max Volume', value: _kg(best.maxVolume)),
          ),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.history});

  final List<ExerciseHistoryItem> history;

  @override
  Widget build(BuildContext context) {
    return _InfoCard(
      title: 'Recent History',
      child: history.isEmpty
          ? const Text('Sin historial de uso')
          : Column(
              children: [
                for (final item in history)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(DateFormat.yMMMd().format(item.startedAt)),
                    subtitle: Text(
                      '${item.reps} reps • ${_kg(item.volume)} volume',
                    ),
                    trailing: Text(_kg(item.weight)),
                  ),
              ],
            ),
    );
  }
}

class _PersonalRecordsCard extends StatelessWidget {
  const _PersonalRecordsCard({required this.records});

  final List<PersonalRecordEntity> records;

  @override
  Widget build(BuildContext context) {
    return _InfoCard(
      title: 'Personal Records',
      child: records.isEmpty
          ? const Text('Sin records personales')
          : Column(
              children: [
                for (final record in records)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(_recordType(record.type)),
                    subtitle: Text(
                      DateFormat.yMMMd().format(record.achievedAt),
                    ),
                    trailing: Text(record.value.toStringAsFixed(1)),
                  ),
              ],
            ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.child});

  final String title;
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: ZenliftSpacing.stackMd),
          child,
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: colors.onSurfaceVariant),
        ),
      ],
    );
  }
}

class _MissingExercise extends StatelessWidget {
  const _MissingExercise({required this.onBack});

  final Future<void> Function() onBack;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: FilledButton(
        key: const Key('exercise-detail-back-button'),
        onPressed: onBack,
        child: const Text('Exercise not found'),
      ),
    );
  }
}

String _kg(double value) =>
    value == 0 ? '--' : '${value.toStringAsFixed(1)} kg';

String _recordType(PersonalRecordType type) => switch (type) {
  PersonalRecordType.maxWeight => 'Max weight',
  PersonalRecordType.maxVolume => 'Max volume',
  PersonalRecordType.maxReps => 'Max reps',
  PersonalRecordType.estimatedOneRepMax => 'Estimated 1RM',
  PersonalRecordType.maxSessionVolume => 'Max session volume',
};

Color? _parseColor(String value) {
  final hex = value.replaceFirst('#', '');
  final normalized = hex.length == 6 ? 'ff$hex' : hex;
  final parsed = int.tryParse(normalized, radix: 16);
  return parsed == null ? null : Color(parsed);
}
