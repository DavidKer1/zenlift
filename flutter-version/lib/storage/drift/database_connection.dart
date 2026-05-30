import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

const zenliftDatabaseFileName = 'zenlift.db';

QueryExecutor openZenliftDatabaseConnection() {
  return LazyDatabase(() async {
    final directory = await getApplicationDocumentsDirectory();
    final file = File(p.join(directory.path, zenliftDatabaseFileName));

    return NativeDatabase.createInBackground(file);
  });
}
