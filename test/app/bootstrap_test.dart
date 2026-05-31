import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/app/bootstrap.dart';
import 'package:zenlift/storage/drift/app_database.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late AppDatabase database;

  setUp(() {
    database = AppDatabase(
      DatabaseConnection(
        NativeDatabase.memory(),
        closeStreamsSynchronously: true,
      ),
    );
  });

  tearDown(() async {
    await database.close();
  });

  Future<int> countRows(String tableName) async {
    final row = await database
        .customSelect('SELECT COUNT(*) AS count FROM $tableName')
        .getSingle();
    return row.read<int>('count');
  }

  test('initializeZenlift seeds the exercise catalog', () async {
    await initializeZenlift(database: database);

    expect(await countRows('muscle_groups'), 13);
    expect(await countRows('exercises'), 25);
    expect(await countRows('exercise_muscles'), 37);
  });
}
