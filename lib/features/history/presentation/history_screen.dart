import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../domain/history_dashboard.dart';

typedef HistoryDashboardLoader = Future<HistoryDashboardState> Function();
typedef HistoryAction = Future<void> Function();
typedef HistoryWorkoutAction =
    Future<void> Function(HistoryWorkoutSummary workout);

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({
    required this.loadHistory,
    required this.onStartWorkout,
    required this.onRepeatWorkout,
    super.key,
    this.initialState,
  });

  final HistoryDashboardState? initialState;
  final HistoryDashboardLoader loadHistory;
  final HistoryAction onStartWorkout;
  final HistoryWorkoutAction onRepeatWorkout;

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  HistoryDashboardState? _state;
  var _isLoading = false;
  var _isActionRunning = false;

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
      final nextState = await widget.loadHistory();
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
      setState(() => _state = HistoryDashboardState.empty);
      _showMessage('Could not load workout history.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _runAction(HistoryAction action, String failureMessage) async {
    setState(() => _isActionRunning = true);
    try {
      await action();
    } catch (error) {
      if (mounted) {
        _showMessage(failureMessage);
      }
    } finally {
      if (mounted) {
        setState(() => _isActionRunning = false);
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
    final state = _state ?? HistoryDashboardState.empty;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _reload,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            ZenliftSpacing.lateral,
            ZenliftSpacing.stackMd,
            ZenliftSpacing.lateral,
            ZenliftSpacing.stackLg,
          ),
          children: [
            Text('History', style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 4),
            Text(
              'Completed sessions',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            if (_isLoading && _state == null)
              const _HistoryLoadingCard()
            else if (state.isEmpty)
              _HistoryEmptyCard(
                onStartWorkout: () => _runAction(
                  widget.onStartWorkout,
                  'Could not start a workout.',
                ),
              )
            else
              for (final workout in state.workouts) ...[
                _HistoryWorkoutCard(
                  key: Key('history-workout-${workout.sessionId}'),
                  workout: workout,
                  isActionRunning: _isActionRunning,
                  onRepeatWorkout: () => _runAction(
                    () => widget.onRepeatWorkout(workout),
                    'Could not repeat workout.',
                  ),
                ),
                const SizedBox(height: ZenliftSpacing.stackMd),
              ],
          ],
        ),
      ),
    );
  }
}

class _HistoryLoadingCard extends StatelessWidget {
  const _HistoryLoadingCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _HistoryEmptyCard extends StatelessWidget {
  const _HistoryEmptyCard({required this.onStartWorkout});

  final VoidCallback onStartWorkout;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.history, color: colors.primary),
            const SizedBox(height: ZenliftSpacing.stackSm),
            Text(
              'No workouts yet',
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
            ),
            Text(
              'Finish a workout to build your history.',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            FilledButton(
              key: const Key('history-empty-start-button'),
              onPressed: onStartWorkout,
              child: const Text('Start Workout'),
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryWorkoutCard extends StatelessWidget {
  const _HistoryWorkoutCard({
    required this.workout,
    required this.isActionRunning,
    required this.onRepeatWorkout,
    super.key,
  });

  final HistoryWorkoutSummary workout;
  final bool isActionRunning;
  final VoidCallback onRepeatWorkout;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final subtitle = [
      DateFormat.MMMd().add_jm().format(workout.startedAt),
      if (workout.routineDayName != null) workout.routineDayName!,
      if (workout.routineDayName == null && workout.routineName != null)
        workout.routineName!,
    ].join(' · ');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        workout.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                if (workout.canRepeat)
                  IconButton.filledTonal(
                    key: Key('history-repeat-${workout.sessionId}'),
                    tooltip: 'Repeat workout',
                    onPressed: isActionRunning ? null : onRepeatWorkout,
                    icon: const Icon(Icons.play_arrow_rounded),
                  ),
              ],
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            Wrap(
              spacing: ZenliftSpacing.stackSm,
              runSpacing: ZenliftSpacing.stackSm,
              children: [
                _HistoryMetricChip(
                  icon: Icons.timer_outlined,
                  label: _formatDuration(workout.durationSeconds),
                ),
                _HistoryMetricChip(
                  icon: Icons.fitness_center,
                  label: '${workout.exerciseCount} exercises',
                ),
                _HistoryMetricChip(
                  icon: Icons.check_circle_outline,
                  label: '${workout.completedSetCount} sets',
                ),
                _HistoryMetricChip(
                  icon: Icons.scale_outlined,
                  label: '${_formatNumber(workout.totalVolume)} kg',
                ),
                if (workout.personalRecordCount > 0)
                  _HistoryMetricChip(
                    icon: Icons.emoji_events_outlined,
                    label: '${workout.personalRecordCount} PRs',
                    color: colors.tertiary,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HistoryMetricChip extends StatelessWidget {
  const _HistoryMetricChip({
    required this.icon,
    required this.label,
    this.color,
  });

  final IconData icon;
  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final foreground = color ?? colors.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: ZenliftColors.surfaceContainer,
        borderRadius: BorderRadius.circular(ZenliftRadii.base),
        border: Border.all(color: ZenliftColors.outlineVariant),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: foreground),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: foreground),
          ),
        ],
      ),
    );
  }
}

String _formatDuration(int seconds) {
  if (seconds <= 0) {
    return '0m';
  }
  final duration = Duration(seconds: seconds);
  final hours = duration.inHours;
  final minutes = duration.inMinutes.remainder(60);
  if (hours == 0) {
    return '${minutes}m';
  }
  return '${hours}h ${minutes}m';
}

String _formatNumber(double value) {
  if (value % 1 == 0) {
    return value.toStringAsFixed(0);
  }
  return value.toStringAsFixed(1);
}
