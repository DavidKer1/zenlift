import 'package:flutter/material.dart';

import '../../../widgets/zenlift_button.dart';
import '../../../widgets/zenlift_card.dart';
import '../../../widgets/zenlift_filter_chip.dart';
import '../domain/settings_preferences.dart';
import '../domain/units.dart';

typedef SaveSettingsWeightUnit = Future<void> Function(WeightUnit weightUnit);
typedef SaveSettingsThemeMode =
    Future<void> Function(ZenliftThemeMode themeMode);
typedef SaveSettingsWeeklyGoal = Future<void> Function(int weeklyGoal);
typedef SettingsDataAction = Future<void> Function();

class SettingsDataActionFailure implements Exception {
  const SettingsDataActionFailure(this.message);

  final String message;
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({
    super.key,
    this.initialPreferences,
    this.onWeightUnitSaved,
    this.onThemeModeSaved,
    this.onWeeklyGoalSaved,
    this.onExportData,
    this.onImportData,
    this.onDeleteData,
  });

  final SettingsPreferences? initialPreferences;
  final SaveSettingsWeightUnit? onWeightUnitSaved;
  final SaveSettingsThemeMode? onThemeModeSaved;
  final SaveSettingsWeeklyGoal? onWeeklyGoalSaved;
  final SettingsDataAction? onExportData;
  final SettingsDataAction? onImportData;
  final SettingsDataAction? onDeleteData;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late WeightUnit _weightUnit;
  late ZenliftThemeMode _themeMode;
  late int _weeklyGoal;
  String? _message;
  var _isPreferenceSaving = false;
  var _isDataActionRunning = false;
  var _deleteArmed = false;

  @override
  void initState() {
    super.initState();
    final preferences =
        widget.initialPreferences ?? SettingsPreferences.defaults();
    _weightUnit = preferences.weightUnit;
    _themeMode = preferences.themeMode;
    _weeklyGoal = SettingsPreferences.clampWeeklyGoal(preferences.weeklyGoal);
  }

  Future<void> _saveWeightUnit(WeightUnit weightUnit) async {
    if (_weightUnit == weightUnit || _isPreferenceSaving) {
      return;
    }
    setState(() {
      _weightUnit = weightUnit;
      _isPreferenceSaving = true;
      _message = null;
      _deleteArmed = false;
    });
    try {
      await widget.onWeightUnitSaved?.call(weightUnit);
    } finally {
      if (mounted) {
        setState(() {
          _isPreferenceSaving = false;
        });
      }
    }
  }

  Future<void> _saveThemeMode(ZenliftThemeMode themeMode) async {
    if (_themeMode == themeMode || _isPreferenceSaving) {
      return;
    }
    setState(() {
      _themeMode = themeMode;
      _isPreferenceSaving = true;
      _message = null;
      _deleteArmed = false;
    });
    try {
      await widget.onThemeModeSaved?.call(themeMode);
    } finally {
      if (mounted) {
        setState(() {
          _isPreferenceSaving = false;
        });
      }
    }
  }

  Future<void> _saveWeeklyGoal(int nextGoal) async {
    final clampedGoal = SettingsPreferences.clampWeeklyGoal(nextGoal);
    if (_weeklyGoal == clampedGoal || _isPreferenceSaving) {
      return;
    }
    setState(() {
      _weeklyGoal = clampedGoal;
      _isPreferenceSaving = true;
      _message = null;
      _deleteArmed = false;
    });
    try {
      await widget.onWeeklyGoalSaved?.call(clampedGoal);
    } finally {
      if (mounted) {
        setState(() {
          _isPreferenceSaving = false;
        });
      }
    }
  }

  Future<void> _runAction(
    String doneMessage,
    String fallbackErrorMessage,
    SettingsDataAction? action,
  ) async {
    if (action == null || _isDataActionRunning) {
      return;
    }
    setState(() {
      _isDataActionRunning = true;
      _message = null;
      _deleteArmed = false;
    });
    try {
      await action();
      if (!mounted) {
        return;
      }
      setState(() {
        _message = doneMessage;
      });
    } on SettingsDataActionFailure catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _message = error.message;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _message = fallbackErrorMessage;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isDataActionRunning = false;
        });
      }
    }
  }

  Future<void> _requestDelete() async {
    if (widget.onDeleteData == null || _isDataActionRunning) {
      return;
    }
    if (!_deleteArmed) {
      setState(() {
        _deleteArmed = true;
        _message = 'Tap Confirm delete to permanently delete local data.';
      });
      return;
    }
    await _runAction(
      'Delete action queued.',
      'Delete failed. Try again.',
      widget.onDeleteData,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Text(
                    'Settings',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      color: colors.onSurface,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tune units, appearance, goals, and local data actions.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colors.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _SettingsSection(
                    title: 'Training',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        _SettingsRow(
                          label: 'Weight unit',
                          child: Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: <Widget>[
                              ZenliftFilterChip(
                                key: const Key('settings-unit-kg'),
                                label: 'kg',
                                selected: _weightUnit == WeightUnit.kg,
                                semanticLabel: 'Use kilograms',
                                onPressed: _isPreferenceSaving
                                    ? null
                                    : () => _saveWeightUnit(WeightUnit.kg),
                              ),
                              ZenliftFilterChip(
                                key: const Key('settings-unit-lb'),
                                label: 'lb',
                                selected: _weightUnit == WeightUnit.lb,
                                semanticLabel: 'Use pounds',
                                onPressed: _isPreferenceSaving
                                    ? null
                                    : () => _saveWeightUnit(WeightUnit.lb),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        _SettingsRow(
                          label: 'Weekly goal',
                          child: _WeeklyGoalControl(
                            weeklyGoal: _weeklyGoal,
                            onDecrement:
                                _weeklyGoal <=
                                        SettingsPreferences.minWeeklyGoal ||
                                    _isPreferenceSaving
                                ? null
                                : () => _saveWeeklyGoal(_weeklyGoal - 1),
                            onIncrement:
                                _weeklyGoal >=
                                        SettingsPreferences.maxWeeklyGoal ||
                                    _isPreferenceSaving
                                ? null
                                : () => _saveWeeklyGoal(_weeklyGoal + 1),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _SettingsSection(
                    title: 'Appearance',
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: <Widget>[
                        ZenliftFilterChip(
                          key: const Key('settings-theme-light'),
                          label: 'Light',
                          selected: _themeMode == ZenliftThemeMode.light,
                          semanticLabel: 'Use light theme',
                          onPressed: _isPreferenceSaving
                              ? null
                              : () => _saveThemeMode(ZenliftThemeMode.light),
                        ),
                        ZenliftFilterChip(
                          key: const Key('settings-theme-dark'),
                          label: 'Dark',
                          selected: _themeMode == ZenliftThemeMode.dark,
                          semanticLabel: 'Use dark theme',
                          onPressed: _isPreferenceSaving
                              ? null
                              : () => _saveThemeMode(ZenliftThemeMode.dark),
                        ),
                        ZenliftFilterChip(
                          key: const Key('settings-theme-system'),
                          label: 'System',
                          selected: _themeMode == ZenliftThemeMode.system,
                          semanticLabel: 'Use system theme',
                          onPressed: _isPreferenceSaving
                              ? null
                              : () => _saveThemeMode(ZenliftThemeMode.system),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _SettingsSection(
                    title: 'Data',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        ZenliftButton.secondary(
                          key: const Key('settings-export-button'),
                          label: 'Export data',
                          icon: Icons.ios_share,
                          semanticLabel: 'Export Zenlift data',
                          onPressed:
                              widget.onExportData == null ||
                                  _isDataActionRunning
                              ? null
                              : () => _runAction(
                                  'Export action queued.',
                                  'Export failed. Try again.',
                                  widget.onExportData,
                                ),
                        ),
                        const SizedBox(height: 12),
                        ZenliftButton.secondary(
                          key: const Key('settings-import-button'),
                          label: 'Import data',
                          icon: Icons.file_upload_outlined,
                          semanticLabel: 'Import Zenlift data',
                          onPressed:
                              widget.onImportData == null ||
                                  _isDataActionRunning
                              ? null
                              : () => _runAction(
                                  'Import action queued.',
                                  'Import failed. Try again.',
                                  widget.onImportData,
                                ),
                        ),
                        const SizedBox(height: 12),
                        ZenliftButton.ghost(
                          key: const Key('settings-delete-button'),
                          label: _deleteArmed
                              ? 'Confirm delete'
                              : 'Delete all data',
                          icon: Icons.delete_outline,
                          semanticLabel: _deleteArmed
                              ? 'Confirm delete all Zenlift data'
                              : 'Delete all Zenlift data',
                          onPressed:
                              widget.onDeleteData == null ||
                                  _isDataActionRunning
                              ? null
                              : _requestDelete,
                        ),
                      ],
                    ),
                  ),
                  if (_message != null) ...[
                    const SizedBox(height: 16),
                    Semantics(
                      liveRegion: true,
                      child: Text(
                        _message!,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  const _SettingsSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ZenliftCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 18),
          child,
        ],
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: colors.onSurfaceVariant,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),
        child,
      ],
    );
  }
}

class _WeeklyGoalControl extends StatelessWidget {
  const _WeeklyGoalControl({
    required this.weeklyGoal,
    required this.onDecrement,
    required this.onIncrement,
  });

  final int weeklyGoal;
  final VoidCallback? onDecrement;
  final VoidCallback? onIncrement;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: <Widget>[
        _GoalButton(
          key: const Key('settings-weekly-goal-decrement'),
          icon: Icons.remove,
          semanticLabel: 'Decrease weekly goal',
          onPressed: onDecrement,
        ),
        const SizedBox(width: 18),
        Flexible(
          child: Semantics(
            label: '$weeklyGoal workouts per week',
            liveRegion: true,
            child: ExcludeSemantics(
              child: Text(
                '$weeklyGoal',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: colors.onSurface,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 18),
        _GoalButton(
          key: const Key('settings-weekly-goal-increment'),
          icon: Icons.add,
          semanticLabel: 'Increase weekly goal',
          onPressed: onIncrement,
        ),
      ],
    );
  }
}

class _GoalButton extends StatelessWidget {
  const _GoalButton({
    super.key,
    required this.icon,
    required this.semanticLabel,
    required this.onPressed,
  });

  final IconData icon;
  final String semanticLabel;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final enabled = onPressed != null;

    return Semantics(
      label: semanticLabel,
      button: true,
      enabled: enabled,
      child: Material(
        color: enabled
            ? colors.surfaceContainerHigh
            : colors.onSurface.withValues(alpha: 0.12),
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox.square(
            dimension: 56,
            child: ExcludeSemantics(
              child: Icon(
                icon,
                size: 22,
                color: enabled
                    ? colors.onSurface
                    : colors.onSurface.withValues(alpha: 0.38),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
