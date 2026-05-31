import 'package:flutter/material.dart';

import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../application/active_workout_controller.dart';
import '../domain/entities/workout_repository_entities.dart';

typedef WorkoutSummaryAction = Future<void> Function();
typedef WorkoutSummaryNotesSaver = Future<void> Function(String value);

class WorkoutSummaryScreen extends StatefulWidget {
  const WorkoutSummaryScreen({
    required this.summary,
    required this.onGoHome,
    required this.onGoHistory,
    super.key,
    this.onSaveNotes,
  });

  final WorkoutSummary? summary;
  final WorkoutSummaryAction onGoHome;
  final WorkoutSummaryAction onGoHistory;
  final WorkoutSummaryNotesSaver? onSaveNotes;

  @override
  State<WorkoutSummaryScreen> createState() => _WorkoutSummaryScreenState();
}

class _WorkoutSummaryScreenState extends State<WorkoutSummaryScreen> {
  final _notesController = TextEditingController();
  var _message = '';
  var _isSavingNotes = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveNotes() async {
    if (widget.onSaveNotes == null || _isSavingNotes) {
      return;
    }
    setState(() {
      _isSavingNotes = true;
      _message = '';
    });
    try {
      await widget.onSaveNotes!(_notesController.text);
      if (mounted) {
        setState(() => _message = 'Notes saved.');
      }
    } catch (error) {
      if (mounted) {
        setState(() => _message = 'Could not save notes.');
      }
    } finally {
      if (mounted) {
        setState(() => _isSavingNotes = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final summary = widget.summary;
    if (summary == null) {
      return _UnavailableSummary(onGoHome: widget.onGoHome);
    }

    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Summary')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            ZenliftSpacing.lateral,
            ZenliftSpacing.stackMd,
            ZenliftSpacing.lateral,
            ZenliftSpacing.stackLg,
          ),
          children: [
            Icon(
              Icons.check_circle,
              key: const Key('workout-summary-complete-icon'),
              color: colors.primary,
              size: 64,
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
            Text(
              'Workout complete',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              _formatDuration(summary.durationSeconds),
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.displayLarge?.copyWith(color: colors.primary),
            ),
            if (summary.name?.trim().isNotEmpty == true)
              Text(
                summary.name!.trim(),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            const SizedBox(height: ZenliftSpacing.stackLg),
            _StatsGrid(summary: summary),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _PersonalRecordsCard(
              key: const Key('workout-summary-pr-card'),
              records: summary.personalRecords,
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            _NotesCard(
              controller: _notesController,
              isSaving: _isSavingNotes,
              onSave: widget.onSaveNotes == null ? null : _saveNotes,
            ),
            if (_message.isNotEmpty) ...[
              const SizedBox(height: ZenliftSpacing.stackSm),
              Text(
                _message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ],
            const SizedBox(height: ZenliftSpacing.stackLg),
            FilledButton(
              key: const Key('workout-summary-home-button'),
              onPressed: widget.onGoHome,
              child: const Text('Home'),
            ),
            const SizedBox(height: ZenliftSpacing.stackSm),
            OutlinedButton(
              key: const Key('workout-summary-history-button'),
              onPressed: widget.onGoHistory,
              child: const Text('History'),
            ),
          ],
        ),
      ),
    );
  }
}

class _UnavailableSummary extends StatelessWidget {
  const _UnavailableSummary({required this.onGoHome});

  final WorkoutSummaryAction onGoHome;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Summary')),
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(ZenliftSpacing.lateral),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline, color: colors.error, size: 48),
                const SizedBox(height: ZenliftSpacing.stackMd),
                Text(
                  'Summary unavailable',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: ZenliftSpacing.stackSm),
                Text(
                  'Finish a workout to review duration, volume, sets, and PRs.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: colors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: ZenliftSpacing.stackMd),
                FilledButton(
                  key: const Key('workout-summary-unavailable-home-button'),
                  onPressed: onGoHome,
                  child: const Text('Home'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.summary});

  final WorkoutSummary summary;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      childAspectRatio: 1.7,
      crossAxisSpacing: ZenliftSpacing.stackSm,
      mainAxisSpacing: ZenliftSpacing.stackSm,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _StatTile(
          label: 'Volume',
          value: '${_formatNumber(summary.totalVolume)} kg',
        ),
        _StatTile(label: 'Exercises', value: '${summary.exerciseCount}'),
        _StatTile(label: 'Sets', value: '${summary.completedSetCount}'),
        _StatTile(label: 'PRs', value: '${summary.personalRecordCount}'),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.stackMd),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: colors.primary),
            ),
            Text(
              label,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}

class _PersonalRecordsCard extends StatelessWidget {
  const _PersonalRecordsCard({required this.records, super.key});

  final List<DetectedPersonalRecord> records;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Personal records',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            if (records.isEmpty)
              Text(
                'No new records this session.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              )
            else
              for (final record in records) ...[
                _PersonalRecordRow(record: record),
                if (record != records.last)
                  const SizedBox(height: ZenliftSpacing.stackMd),
              ],
          ],
        ),
      ),
    );
  }
}

class _PersonalRecordRow extends StatelessWidget {
  const _PersonalRecordRow({required this.record});

  final DetectedPersonalRecord record;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(Icons.emoji_events, color: colors.tertiary),
        const SizedBox(width: ZenliftSpacing.stackSm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                record.exerciseName,
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
              ),
              Text(
                _recordTypeLabel(record.type),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        Text(
          _recordValue(record),
          style: Theme.of(
            context,
          ).textTheme.labelMedium?.copyWith(color: colors.primary),
        ),
      ],
    );
  }
}

class _NotesCard extends StatelessWidget {
  const _NotesCard({
    required this.controller,
    required this.isSaving,
    required this.onSave,
  });

  final TextEditingController controller;
  final bool isSaving;
  final VoidCallback? onSave;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZenliftSpacing.cardPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Notes', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: ZenliftSpacing.stackMd),
            TextField(
              key: const Key('workout-summary-notes-field'),
              controller: controller,
              minLines: 3,
              maxLines: 5,
              textInputAction: TextInputAction.newline,
              decoration: const InputDecoration(
                hintText: 'How did the workout feel?',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(
                    Radius.circular(ZenliftRadii.medium),
                  ),
                ),
              ),
            ),
            const SizedBox(height: ZenliftSpacing.stackMd),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton.tonal(
                key: const Key('workout-summary-save-notes-button'),
                onPressed: isSaving ? null : onSave,
                child: Text(isSaving ? 'Saving...' : 'Save Notes'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatDuration(int seconds) {
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

String _recordTypeLabel(PersonalRecordType type) => switch (type) {
  PersonalRecordType.maxWeight => 'Max Weight',
  PersonalRecordType.maxVolume => 'Max Volume',
  PersonalRecordType.maxReps => 'Max Reps',
  PersonalRecordType.estimatedOneRepMax => 'Estimated 1RM',
  PersonalRecordType.maxSessionVolume => 'Session Volume',
};

String _recordValue(DetectedPersonalRecord record) {
  final value = _formatNumber(record.value);
  return switch (record.type) {
    PersonalRecordType.maxReps => '$value reps',
    PersonalRecordType.maxWeight ||
    PersonalRecordType.estimatedOneRepMax => '$value kg',
    PersonalRecordType.maxVolume ||
    PersonalRecordType.maxSessionVolume => '$value kg',
  };
}
