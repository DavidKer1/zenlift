import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/settings/application/settings_controller.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/settings_repository.dart';
import 'package:zenlift/features/settings/domain/units.dart';

void main() {
  late InMemorySettingsRepository repository;
  late SettingsController controller;

  setUp(() {
    repository = InMemorySettingsRepository();
    controller = SettingsController(repository);
  });

  test('loads default settings before anything is saved', () async {
    final preferences = await controller.load();

    expect(preferences.weightUnit, WeightUnit.kg);
    expect(preferences.themeMode, ZenliftThemeMode.dark);
    expect(preferences.weeklyGoal, 3);
    expect(preferences.isOnboardingCompleted, isFalse);
    expect(controller.state, preferences);
  });

  test('writes and reads settings through the repository contract', () async {
    await controller.setWeightUnit(WeightUnit.lb);
    await controller.setThemeMode(ZenliftThemeMode.system);
    await controller.setWeeklyGoal(5);

    final preferences = await controller.load();

    expect(preferences.weightUnit, WeightUnit.lb);
    expect(preferences.themeMode, ZenliftThemeMode.system);
    expect(preferences.weeklyGoal, 5);
  });

  test('clamps weekly goal writes into the supported range', () async {
    await controller.setWeeklyGoal(0);
    expect((await controller.load()).weeklyGoal, 1);

    await controller.setWeeklyGoal(99);
    expect((await controller.load()).weeklyGoal, 7);
  });

  test('falls back when stored text values are unknown', () async {
    repository.seedRaw(
      weightUnit: 'stone',
      themeMode: 'neon',
      weeklyGoal: 'not-a-number',
    );

    final preferences = await controller.load();

    expect(preferences.weightUnit, WeightUnit.kg);
    expect(preferences.themeMode, ZenliftThemeMode.dark);
    expect(preferences.weeklyGoal, 3);
  });

  test('marks onboarding as completed', () async {
    await controller.markOnboardingCompleted();

    final preferences = await controller.load();

    expect(preferences.isOnboardingCompleted, isTrue);
  });

  test('clears persisted settings through the repository contract', () async {
    await controller.setWeightUnit(WeightUnit.lb);
    await controller.setThemeMode(ZenliftThemeMode.system);
    await controller.setWeeklyGoal(5);
    await controller.markOnboardingCompleted();

    final preferences = await controller.clearPreferences();

    expect(preferences, SettingsPreferences.defaults());
  });
}

class InMemorySettingsRepository implements SettingsRepository {
  String? _weightUnit;
  String? _themeMode;
  String? _weeklyGoal;
  bool? _isOnboardingCompleted;

  @override
  Future<SettingsPreferences> readPreferences() async {
    return SettingsPreferences.fromStoredValues(
      weightUnit: _weightUnit,
      themeMode: _themeMode,
      weeklyGoal: _weeklyGoal,
      isOnboardingCompleted: _isOnboardingCompleted,
    );
  }

  @override
  Future<void> setOnboardingCompleted(bool isCompleted) async {
    _isOnboardingCompleted = isCompleted;
  }

  @override
  Future<void> setThemeMode(ZenliftThemeMode themeMode) async {
    _themeMode = themeMode.value;
  }

  @override
  Future<void> setWeeklyGoal(int weeklyGoal) async {
    _weeklyGoal = SettingsPreferences.clampWeeklyGoal(weeklyGoal).toString();
  }

  @override
  Future<void> setWeightUnit(WeightUnit weightUnit) async {
    _weightUnit = weightUnit.value;
  }

  @override
  Future<void> clearPreferences() async {
    _weightUnit = null;
    _themeMode = null;
    _weeklyGoal = null;
    _isOnboardingCompleted = null;
  }

  void seedRaw({String? weightUnit, String? themeMode, String? weeklyGoal}) {
    _weightUnit = weightUnit;
    _themeMode = themeMode;
    _weeklyGoal = weeklyGoal;
  }
}
