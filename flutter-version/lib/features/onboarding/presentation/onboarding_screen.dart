import 'package:flutter/material.dart';

import '../../settings/domain/settings_preferences.dart';
import '../../settings/domain/units.dart';
import '../../../widgets/zenlift_button.dart';
import '../../../widgets/zenlift_card.dart';
import '../../../widgets/zenlift_filter_chip.dart';

typedef SaveWeightUnit = Future<void> Function(WeightUnit weightUnit);
typedef SaveWeeklyGoal = Future<void> Function(int weeklyGoal);
typedef CompleteOnboarding = Future<void> Function();

enum _OnboardingStep { welcome, unit, goal, complete }

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({
    super.key,
    this.initialPreferences,
    this.onWeightUnitSaved,
    this.onWeeklyGoalSaved,
    this.onOnboardingCompleted,
  });

  final SettingsPreferences? initialPreferences;
  final SaveWeightUnit? onWeightUnitSaved;
  final SaveWeeklyGoal? onWeeklyGoalSaved;
  final CompleteOnboarding? onOnboardingCompleted;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  late WeightUnit _selectedUnit;
  late int _weeklyGoal;
  var _step = _OnboardingStep.welcome;
  var _isSaving = false;
  String? _saveError;

  @override
  void initState() {
    super.initState();
    final preferences =
        widget.initialPreferences ?? SettingsPreferences.defaults();
    _selectedUnit = preferences.weightUnit;
    _weeklyGoal = SettingsPreferences.clampWeeklyGoal(preferences.weeklyGoal);
  }

  void _goToUnitStep() {
    setState(() {
      _step = _OnboardingStep.unit;
    });
  }

  void _goToGoalStep() {
    setState(() {
      _step = _OnboardingStep.goal;
    });
  }

  void _selectUnit(WeightUnit unit) {
    setState(() {
      _selectedUnit = unit;
    });
  }

  void _adjustGoal(int delta) {
    setState(() {
      _weeklyGoal = SettingsPreferences.clampWeeklyGoal(_weeklyGoal + delta);
    });
  }

  Future<void> _complete() async {
    if (_isSaving) {
      return;
    }

    setState(() {
      _isSaving = true;
      _saveError = null;
    });

    try {
      await widget.onWeightUnitSaved?.call(_selectedUnit);
      await widget.onWeeklyGoalSaved?.call(_weeklyGoal);
      await widget.onOnboardingCompleted?.call();
      if (!mounted) {
        return;
      }
      setState(() {
        _step = _OnboardingStep.complete;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _saveError = 'Setup could not be saved. Try again.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
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
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 520),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Text(
                          'Zenlift',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                color: colors.primary,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 12),
                        _StepIndicator(currentStep: _step),
                        const SizedBox(height: 20),
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 180),
                          child: _buildCurrentStep(context),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildCurrentStep(BuildContext context) {
    return switch (_step) {
      _OnboardingStep.welcome => _WelcomeStep(onStart: _goToUnitStep),
      _OnboardingStep.unit => _UnitStep(
        selectedUnit: _selectedUnit,
        onSelected: _selectUnit,
        onNext: _goToGoalStep,
      ),
      _OnboardingStep.goal => _GoalStep(
        weeklyGoal: _weeklyGoal,
        isSaving: _isSaving,
        errorMessage: _saveError,
        onDecrement: () => _adjustGoal(-1),
        onIncrement: () => _adjustGoal(1),
        onComplete: _complete,
      ),
      _OnboardingStep.complete => const _CompleteStep(),
    };
  }
}

class _WelcomeStep extends StatelessWidget {
  const _WelcomeStep({required this.onStart});

  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ZenliftCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Icon(Icons.fitness_center, size: 36, color: colors.primary),
          const SizedBox(height: 20),
          Text(
            'Welcome to Zenlift',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Set your basics, then get to your first workout.',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: 28),
          ZenliftButton.primary(
            key: const Key('onboarding-start-button'),
            label: 'Start',
            icon: Icons.arrow_forward,
            semanticLabel: 'Start onboarding',
            onPressed: onStart,
          ),
        ],
      ),
    );
  }
}

class _UnitStep extends StatelessWidget {
  const _UnitStep({
    required this.selectedUnit,
    required this.onSelected,
    required this.onNext,
  });

  final WeightUnit selectedUnit;
  final ValueChanged<WeightUnit> onSelected;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ZenliftCard(
      key: const ValueKey('unit-step'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'Choose units',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Use the weight unit you see on plates at your gym.',
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              ZenliftFilterChip(
                key: const Key('onboarding-unit-kg'),
                label: 'kg',
                selected: selectedUnit == WeightUnit.kg,
                semanticLabel: 'Use kilograms',
                onPressed: () => onSelected(WeightUnit.kg),
              ),
              ZenliftFilterChip(
                key: const Key('onboarding-unit-lb'),
                label: 'lb',
                selected: selectedUnit == WeightUnit.lb,
                semanticLabel: 'Use pounds',
                onPressed: () => onSelected(WeightUnit.lb),
              ),
            ],
          ),
          const SizedBox(height: 28),
          ZenliftButton.primary(
            key: const Key('onboarding-unit-next-button'),
            label: 'Continue',
            icon: Icons.arrow_forward,
            semanticLabel: 'Continue to weekly goal',
            onPressed: onNext,
          ),
        ],
      ),
    );
  }
}

class _GoalStep extends StatelessWidget {
  const _GoalStep({
    required this.weeklyGoal,
    required this.isSaving,
    required this.errorMessage,
    required this.onDecrement,
    required this.onIncrement,
    required this.onComplete,
  });

  final int weeklyGoal;
  final bool isSaving;
  final String? errorMessage;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ZenliftCard(
      key: const ValueKey('goal-step'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'Weekly goal',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Pick a target for training days. You can change it later.',
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: colors.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              _GoalControlButton(
                key: const Key('onboarding-goal-decrement'),
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
              _GoalControlButton(
                key: const Key('onboarding-goal-increment'),
                icon: Icons.add,
                semanticLabel: 'Increase weekly goal',
                onPressed: onIncrement,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            weeklyGoal == 1 ? 'workout per week' : 'workouts per week',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
          if (errorMessage != null) ...[
            const SizedBox(height: 16),
            Semantics(
              liveRegion: true,
              child: Text(
                errorMessage!,
                textAlign: TextAlign.center,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: colors.error),
              ),
            ),
          ],
          const SizedBox(height: 28),
          ZenliftButton.primary(
            key: const Key('onboarding-complete-button'),
            label: isSaving ? 'Saving...' : 'Finish setup',
            icon: Icons.check,
            semanticLabel: isSaving
                ? 'Saving onboarding settings'
                : 'Complete onboarding',
            onPressed: isSaving ? null : onComplete,
          ),
        ],
      ),
    );
  }
}

class _GoalControlButton extends StatelessWidget {
  const _GoalControlButton({
    super.key,
    required this.icon,
    required this.semanticLabel,
    required this.onPressed,
  });

  final IconData icon;
  final String semanticLabel;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Semantics(
      label: semanticLabel,
      button: true,
      child: Material(
        color: colors.surfaceContainerHigh,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox.square(
            dimension: 56,
            child: ExcludeSemantics(
              child: Icon(icon, size: 22, color: colors.onSurface),
            ),
          ),
        ),
      ),
    );
  }
}

class _CompleteStep extends StatelessWidget {
  const _CompleteStep();

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return ZenliftCard(
      key: const ValueKey('complete-step'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Icon(Icons.check_circle_outline, size: 40, color: colors.primary),
          const SizedBox(height: 20),
          Text(
            'You are ready',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Create a routine or start from a template when you land home.',
            textAlign: TextAlign.center,
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: colors.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  const _StepIndicator({required this.currentStep});

  final _OnboardingStep currentStep;

  @override
  Widget build(BuildContext context) {
    final activeIndex = switch (currentStep) {
      _OnboardingStep.welcome => 0,
      _OnboardingStep.unit => 1,
      _OnboardingStep.goal || _OnboardingStep.complete => 2,
    };
    final colors = Theme.of(context).colorScheme;

    return Semantics(
      label: 'Onboarding step ${activeIndex + 1} of 3',
      child: ExcludeSemantics(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List<Widget>.generate(3, (index) {
            final isActive = index <= activeIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: isActive ? 28 : 10,
              height: 6,
              decoration: BoxDecoration(
                color: isActive
                    ? colors.primary
                    : colors.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(99),
              ),
            );
          }),
        ),
      ),
    );
  }
}
