import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../theme/zenlift_colors.dart';
import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../../workout/domain/entities/workout_repository_entities.dart';
import '../domain/home_dashboard.dart';

typedef HomeDashboardLoader = Future<HomeDashboardState> Function();
typedef HomeAction = Future<void> Function();
typedef HomeRoutineAction = Future<void> Function(HomeRoutineSummary routine);
typedef HomeRepeatWorkoutAction = Future<void> Function(HomeLatestWorkout workout);
typedef HomeNow = DateTime Function();

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    required this.loadDashboard,
    required this.onStartWorkout,
    required this.onQuickWorkout,
    required this.onCreateRoutine,
    required this.onOpenRoutine,
    required this.onRepeatWorkout,
    super.key,
    this.initialState,
    this.now,
  });

  final HomeDashboardState? initialState;
  final HomeDashboardLoader loadDashboard;
  final HomeAction onStartWorkout;
  final HomeAction onQuickWorkout;
  final HomeAction onCreateRoutine;
  final HomeRoutineAction onOpenRoutine;
  final HomeRepeatWorkoutAction onRepeatWorkout;
  final HomeNow? now;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  HomeDashboardState? _state;
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
      final nextState = await widget.loadDashboard();
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
      setState(() => _state = HomeDashboardState.empty);
      _showMessage('Could not load Home.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _runAction(HomeAction action, String failureMessage) async {
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
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message), behavior: SnackBarBehavior.floating));
  }

  @override
  Widget build(BuildContext context) {
    final state = _state ?? HomeDashboardState.empty;

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
            _Greeting(now: widget.now ?? DateTime.now),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _StartWorkoutButton(
              key: const Key('home-start-workout-button'),
              label: 'Start Workout',
              isPrimary: true,
              isBusy: _isActionRunning,
              onPressed: () => _runAction(widget.onStartWorkout, 'Could not open routines.'),
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
            _StartWorkoutButton(
              key: const Key('home-quick-workout-button'),
              label: 'Quick Workout',
              isPrimary: false,
              isBusy: _isActionRunning,
              onPressed: () =>
                  _runAction(widget.onQuickWorkout, 'Could not start a quick workout.'),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _CalendarWorkoutCard(
              key: const Key('home-calendar-card'),
              summary: state.calendar,
              isLoading: _isLoading && _state == null,
              now: widget.now ?? DateTime.now,
              onRepeatWorkout: (workout) => _runAction(
                () => widget.onRepeatWorkout(workout),
                'Could not repeat this workout.',
              ),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _WeeklyActivityCard(
              key: const Key('home-weekly-activity-card'),
              activity: state.weeklyActivity,
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _CurrentRoutineCard(
              key: const Key('home-current-routine-card'),
              routine: state.currentRoutine,
              onCreateRoutine: () =>
                  _runAction(widget.onCreateRoutine, 'Could not open routine creation.'),
              onOpenRoutine: (routine) =>
                  _runAction(() => widget.onOpenRoutine(routine), 'Could not open routine.'),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _RecentPersonalRecordsCard(
              key: const Key('home-recent-prs-card'),
              records: state.recentPersonalRecords,
            ),
          ],
        ),
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting({required this.now});

  final HomeNow now;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      label: 'Zenlift greeting',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ready when you are',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: 4),
          Text(
            _greetingFor(now()),
            key: const Key('home-greeting-title'),
            style: Theme.of(context).textTheme.headlineLarge,
          ),
        ],
      ),
    );
  }
}

class _StartWorkoutButton extends StatelessWidget {
  const _StartWorkoutButton({
    required this.label,
    required this.isPrimary,
    required this.isBusy,
    required this.onPressed,
    super.key,
  });

  final String label;
  final bool isPrimary;
  final bool isBusy;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final foreground = isPrimary ? colors.onPrimary : colors.onSurface;
    final background = isPrimary ? colors.primary : ZenliftColors.surfaceContainer;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: FilledButton(
        style: FilledButton.styleFrom(
          backgroundColor: background,
          foregroundColor: foreground,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(ZenliftRadii.pill)),
        ),
        onPressed: isBusy ? null : onPressed,
        child: Text(label),
      ),
    );
  }
}

class _CalendarWorkoutCard extends StatelessWidget {
  const _CalendarWorkoutCard({
    required this.summary,
    required this.isLoading,
    required this.now,
    required this.onRepeatWorkout,
    super.key,
  });

  final HomeCalendarSummary summary;
  final bool isLoading;
  final HomeNow now;
  final HomeRepeatWorkoutAction onRepeatWorkout;

  @override
  Widget build(BuildContext context) {
    final latestWorkout = summary.latestWorkout;
    final months = _visibleMonths(now());
    final activeDates = summary.activityDates.map(_dateKey).toSet();
    final title = latestWorkout?.title ?? 'No workouts completed yet';
    final frequency = latestWorkout == null
        ? 'Start a workout to fill your calendar'
        : latestWorkout.frequencyKind == HomeWorkoutFrequencyKind.matchingRoutineContext
        ? '${latestWorkout.frequencyCount} matching workouts'
        : '${latestWorkout.frequencyCount} total workouts';

    return _SectionCard(
      semanticLabel: 'Workout calendar',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle('Workout calendar'),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              for (final month in months)
                Expanded(
                  child: Text(
                    month.label.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final month in months)
                Expanded(
                  child: Column(
                    children: [
                      for (final week in month.weeks)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 5),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              for (var i = 0; i < week.length; i++) ...[
                                if (i > 0) const SizedBox(width: 5),
                                if (week[i] == null)
                                  const SizedBox(width: 5, height: 5)
                                else
                                  _CalendarDot(isActive: activeDates.contains(week[i])),
                              ],
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: ZenliftSpacing.cardPadding),
          const Divider(height: 1),
          const SizedBox(height: ZenliftSpacing.stackMd),
          ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 48),
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : Row(
                    children: [
                      _FrequencyRing(value: latestWorkout?.frequencyCount ?? 0),
                      const SizedBox(width: ZenliftSpacing.stackMd),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(
                                context,
                              ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              frequency,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (latestWorkout?.canRepeat == true)
                        IconButton.filled(
                          key: const Key('home-repeat-workout-button'),
                          tooltip: 'Repeat workout',
                          onPressed: () => onRepeatWorkout(latestWorkout!),
                          icon: const Icon(Icons.play_arrow_rounded),
                        ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _WeeklyActivityCard extends StatelessWidget {
  const _WeeklyActivityCard({required this.activity, super.key});

  final HomeWeeklyActivity activity;

  @override
  Widget build(BuildContext context) {
    const weekdays = <String>['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    final colors = Theme.of(context).colorScheme;

    return _SectionCard(
      semanticLabel: 'Weekly activity',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle('Weekly activity'),
          const SizedBox(height: 4),
          Text(
            activity.hasActivity
                ? '${activity.workoutCount} workouts logged this week'
                : 'No activity this week',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Row(
            children: [
              for (var index = 0; index < weekdays.length; index += 1)
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(right: index == weekdays.length - 1 ? 0 : 8),
                    child: Column(
                      children: [
                        Container(
                          key: Key('home-weekday-segment-$index'),
                          height: 12,
                          decoration: BoxDecoration(
                            color: activity.activeDays[index]
                                ? colors.primary
                                : ZenliftColors.outlineVariant,
                            borderRadius: BorderRadius.circular(ZenliftRadii.small),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          weekdays[index],
                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: activity.activeDays[index]
                                ? colors.onSurface
                                : colors.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          if (!activity.hasActivity) ...[
            const SizedBox(height: ZenliftSpacing.stackMd),
            Text(
              'Start a workout to see your progress',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
            ),
          ],
        ],
      ),
    );
  }
}

class _CurrentRoutineCard extends StatelessWidget {
  const _CurrentRoutineCard({
    required this.routine,
    required this.onCreateRoutine,
    required this.onOpenRoutine,
    super.key,
  });

  final HomeRoutineSummary? routine;
  final HomeAction onCreateRoutine;
  final HomeRoutineAction onOpenRoutine;

  @override
  Widget build(BuildContext context) {
    final routine = this.routine;
    final colors = Theme.of(context).colorScheme;

    return _SectionCard(
      semanticLabel: 'Current routine',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle('Current routine'),
          const SizedBox(height: ZenliftSpacing.stackMd),
          if (routine == null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.add_circle, color: colors.onSurfaceVariant),
                const SizedBox(height: ZenliftSpacing.stackSm),
                Text(
                  'No routine set',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Create a routine to track your progress',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
                ),
                const SizedBox(height: ZenliftSpacing.stackMd),
                OutlinedButton(
                  key: const Key('home-create-routine-button'),
                  onPressed: onCreateRoutine,
                  child: const Text('Create Routine'),
                ),
              ],
            )
          else
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        routine.name,
                        style: Theme.of(
                          context,
                        ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${routine.dayCount} days · ${routine.exerciseCount} exercises',
                        style: Theme.of(
                          context,
                        ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                FilledButton(
                  key: const Key('home-open-routine-button'),
                  onPressed: () => onOpenRoutine(routine),
                  child: const Text('Start'),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _RecentPersonalRecordsCard extends StatelessWidget {
  const _RecentPersonalRecordsCard({required this.records, super.key});

  final List<HomePersonalRecordSummary> records;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return _SectionCard(
      semanticLabel: 'Recent personal records',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionTitle('Recent PRs'),
          const SizedBox(height: ZenliftSpacing.stackMd),
          if (records.isEmpty)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.emoji_events, color: colors.primary),
                const SizedBox(height: ZenliftSpacing.stackSm),
                Text(
                  'No personal records yet',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                ),
                Text(
                  'Complete workouts to set new records',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
                ),
              ],
            )
          else
            for (final record in records) ...[
              _PrRow(record: record),
              if (record != records.last) const SizedBox(height: ZenliftSpacing.stackMd),
            ],
        ],
      ),
    );
  }
}

class _PrRow extends StatelessWidget {
  const _PrRow({required this.record});

  final HomePersonalRecordSummary record;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                record.exerciseName,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              Text(
                '${_prTypeLabel(record.type)} · ${DateFormat.MMMd().format(record.achievedAt)}',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
              ),
            ],
          ),
        ),
        Text(
          _prValue(record),
          textAlign: TextAlign.right,
          style: Theme.of(
            context,
          ).textTheme.labelMedium?.copyWith(color: colors.primary, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.semanticLabel, required this.child});

  final String semanticLabel;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel,
      container: true,
      child: Card(
        child: Padding(padding: const EdgeInsets.all(ZenliftSpacing.cardPadding), child: child),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(label, style: Theme.of(context).textTheme.headlineMedium);
  }
}

class _CalendarDot extends StatelessWidget {
  const _CalendarDot({required this.isActive});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 5,
      height: 5,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.onSurface.withValues(alpha: isActive ? 0.85 : 0.12),
        borderRadius: BorderRadius.circular(ZenliftRadii.full),
      ),
    );
  }
}

class _FrequencyRing extends StatelessWidget {
  const _FrequencyRing({required this.value});

  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 48,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: Border.all(color: ZenliftColors.outlineVariant, width: 3),
        borderRadius: BorderRadius.circular(ZenliftRadii.full),
      ),
      child: Text('$value', style: Theme.of(context).textTheme.labelMedium),
    );
  }
}

class _MonthGrid {
  const _MonthGrid({required this.label, required this.weeks});

  final String label;
  final List<List<String?>> weeks;
}

List<_MonthGrid> _visibleMonths(DateTime anchorDate) {
  return List<_MonthGrid>.generate(3, (index) {
    final monthDate = DateTime(anchorDate.year, anchorDate.month - 2 + index);
    final daysInMonth = DateTime(monthDate.year, monthDate.month + 1, 0).day;
    // DateTime.weekday: 1=Monday … 7=Sunday
    final firstWeekday = DateTime(monthDate.year, monthDate.month, 1).weekday;

    final weeks = <List<String?>>[];
    var currentWeek = List<String?>.filled(7, null);
    var dayOfWeek = firstWeekday - 1; // 0 = Monday

    for (var day = 1; day <= daysInMonth; day++) {
      final date = DateTime(monthDate.year, monthDate.month, day);
      currentWeek[dayOfWeek] = _dateKey(date);
      dayOfWeek++;
      if (dayOfWeek == 7) {
        weeks.add(currentWeek);
        currentWeek = List<String?>.filled(7, null);
        dayOfWeek = 0;
      }
    }
    // Push the final partial week if any
    if (dayOfWeek > 0) {
      weeks.add(currentWeek);
    }

    return _MonthGrid(label: DateFormat.MMM().format(monthDate), weeks: weeks);
  });
}

String _dateKey(DateTime date) {
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}

String _greetingFor(DateTime date) {
  final hour = date.hour;
  if (hour >= 6 && hour <= 11) {
    return 'Buenos días';
  }
  if (hour >= 12 && hour <= 18) {
    return 'Buenas tardes';
  }
  return 'Buenas noches';
}

String _prTypeLabel(PersonalRecordType type) => switch (type) {
  PersonalRecordType.maxWeight => 'Max Weight',
  PersonalRecordType.maxVolume => 'Max Volume',
  PersonalRecordType.maxReps => 'Max Reps',
  PersonalRecordType.estimatedOneRepMax => 'Estimated 1RM',
  PersonalRecordType.maxSessionVolume => 'Session Volume',
};

String _prValue(HomePersonalRecordSummary record) {
  final value = record.value % 1 == 0
      ? record.value.toStringAsFixed(0)
      : record.value.toStringAsFixed(1);
  return switch (record.type) {
    PersonalRecordType.maxReps => '$value reps',
    PersonalRecordType.maxWeight || PersonalRecordType.estimatedOneRepMax => '$value kg',
    PersonalRecordType.maxVolume || PersonalRecordType.maxSessionVolume => '$value kg',
  };
}
