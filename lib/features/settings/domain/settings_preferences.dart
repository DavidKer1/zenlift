import 'units.dart';

enum ZenliftThemeMode {
  light('light'),
  dark('dark'),
  system('system');

  const ZenliftThemeMode(this.value);

  final String value;

  static ZenliftThemeMode fromText(String? value) {
    return switch (value) {
      'light' => ZenliftThemeMode.light,
      'system' => ZenliftThemeMode.system,
      'dark' => ZenliftThemeMode.dark,
      _ => ZenliftThemeMode.dark,
    };
  }
}

class SettingsPreferences {
  const SettingsPreferences({
    required this.weightUnit,
    required this.themeMode,
    required this.weeklyGoal,
    required this.isOnboardingCompleted,
  });

  factory SettingsPreferences.defaults() {
    return const SettingsPreferences(
      weightUnit: WeightUnit.kg,
      themeMode: ZenliftThemeMode.dark,
      weeklyGoal: defaultWeeklyGoal,
      isOnboardingCompleted: false,
    );
  }

  factory SettingsPreferences.fromStoredValues({
    String? weightUnit,
    String? themeMode,
    String? weeklyGoal,
    bool? isOnboardingCompleted,
  }) {
    return SettingsPreferences(
      weightUnit: WeightUnit.fromText(weightUnit ?? ''),
      themeMode: ZenliftThemeMode.fromText(themeMode),
      weeklyGoal: _parseWeeklyGoal(weeklyGoal),
      isOnboardingCompleted: isOnboardingCompleted ?? false,
    );
  }

  static const defaultWeeklyGoal = 3;
  static const minWeeklyGoal = 1;
  static const maxWeeklyGoal = 7;

  final WeightUnit weightUnit;
  final ZenliftThemeMode themeMode;
  final int weeklyGoal;
  final bool isOnboardingCompleted;

  SettingsPreferences copyWith({
    WeightUnit? weightUnit,
    ZenliftThemeMode? themeMode,
    int? weeklyGoal,
    bool? isOnboardingCompleted,
  }) {
    return SettingsPreferences(
      weightUnit: weightUnit ?? this.weightUnit,
      themeMode: themeMode ?? this.themeMode,
      weeklyGoal: weeklyGoal == null
          ? this.weeklyGoal
          : clampWeeklyGoal(weeklyGoal),
      isOnboardingCompleted:
          isOnboardingCompleted ?? this.isOnboardingCompleted,
    );
  }

  static int clampWeeklyGoal(int weeklyGoal) {
    return weeklyGoal.clamp(minWeeklyGoal, maxWeeklyGoal);
  }

  static int _parseWeeklyGoal(String? value) {
    final parsedValue = int.tryParse(value ?? '');
    if (parsedValue == null) {
      return defaultWeeklyGoal;
    }

    return clampWeeklyGoal(parsedValue);
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        other is SettingsPreferences &&
            runtimeType == other.runtimeType &&
            weightUnit == other.weightUnit &&
            themeMode == other.themeMode &&
            weeklyGoal == other.weeklyGoal &&
            isOnboardingCompleted == other.isOnboardingCompleted;
  }

  @override
  int get hashCode {
    return Object.hash(
      weightUnit,
      themeMode,
      weeklyGoal,
      isOnboardingCompleted,
    );
  }
}
