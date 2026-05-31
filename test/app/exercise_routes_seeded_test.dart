import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/app/exercise_form_route.dart';
import 'package:zenlift/app/exercise_library_route.dart';
import 'package:zenlift/storage/drift/app_database.dart';
import 'package:zenlift/storage/seed/exercise_seed_data.dart';
import 'package:zenlift/theme/zenlift_theme.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppDatabase database;

  setUp(() async {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
    await ensureExerciseCatalogSeeded(
      database,
      now: DateTime.utc(2026, 5, 30, 12),
    );
  });

  tearDown(() async {
    await database.close();
  });

  testWidgets('exercise library route renders seeded exercises', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: ExerciseLibraryRoute(database: database),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Bench Press'), findsOneWidget);
    expect(find.text('Pecho · Barra'), findsOneWidget);
    expect(
      find.byKey(
        const Key(
          'exercise-library-muscle-a1b2c3d4-0001-4000-8000-000000000001',
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('exercise create route renders seeded muscle options', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildZenliftDarkTheme(),
        home: ExerciseFormRoute.create(database: database),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Create exercise'), findsOneWidget);
    expect(find.text('Pecho'), findsOneWidget);
    expect(
      find.byKey(
        const Key('exercise-form-primary-a1b2c3d4-0001-4000-8000-000000000001'),
      ),
      findsOneWidget,
    );
  });
}
