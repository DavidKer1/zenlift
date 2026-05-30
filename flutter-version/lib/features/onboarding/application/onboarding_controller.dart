import '../../settings/domain/settings_repository.dart';

class OnboardingController {
  OnboardingController(this._settingsRepository);

  final SettingsRepository _settingsRepository;

  Future<bool> isCompleted() async {
    final preferences = await _settingsRepository.readPreferences();
    return preferences.isOnboardingCompleted;
  }

  Future<void> complete() {
    return _settingsRepository.setOnboardingCompleted(true);
  }
}
