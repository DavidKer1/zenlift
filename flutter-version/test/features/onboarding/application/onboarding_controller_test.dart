import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/onboarding/application/onboarding_controller.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/settings_repository.dart';
import 'package:zenlift/features/settings/domain/units.dart';

void main() {
  late InMemorySettingsRepository repository;
  late OnboardingController controller;

  setUp(() {
    repository = InMemorySettingsRepository();
    controller = OnboardingController(repository);
  });

  test('reports onboarding incomplete by default', () async {
    expect(await controller.isCompleted(), isFalse);
  });

  test('marks onboarding completed without exposing settings internals', () async {
    await controller.complete();

    expect(await controller.isCompleted(), isTrue);
  });
}

class InMemorySettingsRepository implements SettingsRepository {
  SettingsPreferences _preferences = SettingsPreferences.defaults();

  @override
  Future<SettingsPreferences> readPreferences() async => _preferences;

  @override
  Future<void> setOnboardingCompleted(bool isCompleted) async {
    _preferences = _preferences.copyWith(isOnboardingCompleted: isCompleted);
  }

  @override
  Future<void> setThemeMode(ZenliftThemeMode themeMode) async {
    _preferences = _preferences.copyWith(themeMode: themeMode);
  }

  @override
  Future<void> setWeeklyGoal(int weeklyGoal) async {
    _preferences = _preferences.copyWith(weeklyGoal: weeklyGoal);
  }

  @override
  Future<void> setWeightUnit(WeightUnit weightUnit) async {
    _preferences = _preferences.copyWith(weightUnit: weightUnit);
  }
}
