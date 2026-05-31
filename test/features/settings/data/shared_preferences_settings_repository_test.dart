import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:zenlift/features/settings/data/shared_preferences_settings_repository.dart';
import 'package:zenlift/features/settings/domain/settings_preferences.dart';
import 'package:zenlift/features/settings/domain/units.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  late SharedPreferencesSettingsRepository repository;
  AppDatabase? database;

  setUp(() {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    repository = SharedPreferencesSettingsRepository(
      preferences: SharedPreferencesAsync(),
    );
  });

  tearDown(() async {
    await database?.close();
  });

  test('reads default settings when namespaced keys are absent', () async {
    final preferences = await repository.readPreferences();

    expect(preferences, SettingsPreferences.defaults());
  });

  test('persists settings to namespaced shared preferences keys', () async {
    await repository.setWeightUnit(WeightUnit.lb);
    await repository.setThemeMode(ZenliftThemeMode.system);
    await repository.setWeeklyGoal(5);
    await repository.setOnboardingCompleted(true);

    final preferences = await repository.readPreferences();

    expect(preferences.weightUnit, WeightUnit.lb);
    expect(preferences.themeMode, ZenliftThemeMode.system);
    expect(preferences.weeklyGoal, 5);
    expect(preferences.isOnboardingCompleted, isTrue);
  });

  test('clamps weekly goal before saving', () async {
    await repository.setWeeklyGoal(0);
    expect((await repository.readPreferences()).weeklyGoal, 1);

    await repository.setWeeklyGoal(8);
    expect((await repository.readPreferences()).weeklyGoal, 7);
  });

  test('mirrors preferences to app settings for export', () async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = SharedPreferencesSettingsRepository.withDatabase(
      preferences: SharedPreferencesAsync(),
      database: database!,
    );

    await repository.setWeightUnit(WeightUnit.lb);
    await repository.setThemeMode(ZenliftThemeMode.system);
    await repository.setWeeklyGoal(6);
    await repository.setOnboardingCompleted(true);

    final rows = await database!.select(database!.appSettings).get();

    final valuesByKey = {for (final row in rows) row.key: row.value};

    expect(
      valuesByKey[SharedPreferencesSettingsRepository.weightUnitKey],
      'lb',
    );
    expect(
      valuesByKey[SharedPreferencesSettingsRepository.themeModeKey],
      'system',
    );
    expect(valuesByKey[SharedPreferencesSettingsRepository.weeklyGoalKey], '6');
    expect(
      valuesByKey[SharedPreferencesSettingsRepository.onboardingCompletedKey],
      'true',
    );
  });

  test(
    'falls back to app settings imported before preferences exist',
    () async {
      database = AppDatabase(
        DatabaseConnection(
          NativeDatabase.memory(),
          closeStreamsSynchronously: true,
        ),
      );
      await database!
          .into(database!.appSettings)
          .insert(
            AppSettingsCompanion.insert(
              key: SharedPreferencesSettingsRepository.weightUnitKey,
              value: 'lb',
            ),
          );
      await database!
          .into(database!.appSettings)
          .insert(
            AppSettingsCompanion.insert(
              key: SharedPreferencesSettingsRepository.onboardingCompletedKey,
              value: 'true',
            ),
          );
      repository = SharedPreferencesSettingsRepository.withDatabase(
        preferences: SharedPreferencesAsync(),
        database: database!,
      );

      final preferences = await repository.readPreferences();

      expect(preferences.weightUnit, WeightUnit.lb);
      expect(preferences.isOnboardingCompleted, isTrue);
    },
  );

  test('clears settings from shared preferences and app settings', () async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    repository = SharedPreferencesSettingsRepository.withDatabase(
      preferences: SharedPreferencesAsync(),
      database: database!,
    );
    await repository.setWeightUnit(WeightUnit.lb);
    await repository.setThemeMode(ZenliftThemeMode.system);
    await repository.clearPreferences();

    expect(await repository.readPreferences(), SettingsPreferences.defaults());
    expect(await database!.select(database!.appSettings).get(), isEmpty);
  });
}
