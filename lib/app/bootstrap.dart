import '../storage/drift/app_database.dart';
import '../storage/seed/exercise_seed_data.dart';

Future<void> initializeZenlift({AppDatabase? database}) async {
  final appDatabase = database ?? AppDatabase();
  final shouldCloseDatabase = database == null;

  try {
    await ensureExerciseCatalogSeeded(appDatabase);
  } finally {
    if (shouldCloseDatabase) {
      await appDatabase.close();
    }
  }
}
