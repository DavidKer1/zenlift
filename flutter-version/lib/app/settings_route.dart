import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:share_plus/share_plus.dart';

import '../features/data_portability/application/data_portability_controller.dart';
import '../features/data_portability/data/drift_data_portability_repository.dart';
import '../features/data_portability/data/path_provider_data_portability_file_store.dart';
import '../features/settings/application/settings_controller.dart';
import '../features/settings/data/shared_preferences_settings_repository.dart';
import '../features/settings/domain/settings_preferences.dart';
import '../features/settings/presentation/settings_screen.dart';
import '../storage/drift/app_database.dart';

class SettingsRoute extends StatefulWidget {
  const SettingsRoute({super.key});

  @override
  State<SettingsRoute> createState() => _SettingsRouteState();
}

class _SettingsRouteState extends State<SettingsRoute> {
  late final AppDatabase _database;
  late final SettingsController _settingsController;
  late final DataPortabilityController _dataPortabilityController;
  SettingsPreferences? _preferences;
  var _isLoading = true;

  @override
  void initState() {
    super.initState();
    _database = AppDatabase();
    _settingsController = SettingsController(
      SharedPreferencesSettingsRepository(),
    );
    _dataPortabilityController = DataPortabilityController(
      repository: DriftDataPortabilityRepository(_database),
      fileStore: PathProviderDataPortabilityFileStore(),
      appVersion: '1.0.0',
      sourcePlatform: 'flutter',
    );
    _load();
  }

  @override
  void dispose() {
    _database.close();
    super.dispose();
  }

  Future<void> _load() async {
    final preferences = await _settingsController.load();
    if (!mounted) {
      return;
    }
    setState(() {
      _preferences = preferences;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _preferences == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return SettingsScreen(
      initialPreferences: _preferences,
      onWeightUnitSaved: (weightUnit) async {
        final preferences = await _settingsController.setWeightUnit(weightUnit);
        if (mounted) {
          setState(() => _preferences = preferences);
        }
      },
      onThemeModeSaved: (themeMode) async {
        final preferences = await _settingsController.setThemeMode(themeMode);
        if (mounted) {
          setState(() => _preferences = preferences);
        }
      },
      onWeeklyGoalSaved: (weeklyGoal) async {
        final preferences = await _settingsController.setWeeklyGoal(weeklyGoal);
        if (mounted) {
          setState(() => _preferences = preferences);
        }
      },
      onExportData: _exportData,
      onImportData: _importData,
      onDeleteData: _dataPortabilityController.deleteAllDataAfterFreshBackup,
    );
  }

  Future<void> _exportData() async {
    final path = await _dataPortabilityController.exportToFile();
    await SharePlus.instance.share(
      ShareParams(files: [XFile(path)], text: 'Zenlift backup export'),
    );
  }

  Future<void> _importData() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['zenlift'],
    );
    final path = result?.files.single.path;
    if (path == null) {
      return;
    }
    await _dataPortabilityController.importFromFile(path);
  }
}
