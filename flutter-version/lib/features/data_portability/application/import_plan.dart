import '../domain/zenlift_export.dart';

enum ImportPlanFailureReason {
  invalidJsonShape,
  missingMetadata,
  missingTable,
  unsupportedVersion,
  unsupportedSchema,
  invalidRowShape,
  missingRequiredColumn,
  fileTooLarge,
}

enum ImportPlanWarningReason {
  fileTooLarge,
}

sealed class ImportPlanResult {
  const ImportPlanResult();
}

class ImportPlanSuccess extends ImportPlanResult {
  const ImportPlanSuccess({
    required this.export,
    required this.operations,
    required this.isLargeFile,
    required this.warnings,
  });

  final ZenliftExportData export;
  final List<ZenliftImportTableOperation> operations;
  final bool isLargeFile;
  final List<ImportPlanWarningReason> warnings;
}

class ImportPlanFailure extends ImportPlanResult {
  const ImportPlanFailure({
    required this.reason,
    this.field,
    this.table,
    this.rowIndex,
  });

  final ImportPlanFailureReason reason;
  final String? field;
  final ZenliftExportTable? table;
  final int? rowIndex;
}

class ZenliftImportTableOperation {
  const ZenliftImportTableOperation({
    required this.table,
    required this.rows,
    required this.toInsert,
    required this.toSkipExisting,
  });

  final ZenliftExportTable table;
  final List<ZenliftExportRow> rows;
  final List<ZenliftExportRow> toInsert;
  final List<ZenliftSkippedExistingRow> toSkipExisting;
}

class ZenliftSkippedExistingRow {
  const ZenliftSkippedExistingRow({
    required this.id,
    required this.row,
  });

  final String id;
  final ZenliftExportRow row;
}

ImportPlanResult planZenliftImport({
  required Map<String, Object?> decodedJson,
  required int fileSizeBytes,
  Map<ZenliftExportTable, Set<String>> existingIdsByTable =
      const <ZenliftExportTable, Set<String>>{},
}) {
  final metadata = _readMetadata(decodedJson);
  if (metadata is ImportPlanFailure) {
    return metadata;
  }

  final exportMetadata = metadata as ZenliftExportMetadata;
  if (exportMetadata.version != supportedZenliftExportVersion) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.unsupportedVersion,
      field: 'version',
    );
  }

  if (exportMetadata.schemaVersion != supportedZenliftSchemaVersion) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.unsupportedSchema,
      field: 'schemaVersion',
    );
  }

  final rowsResult = _readRowsByTable(decodedJson);
  if (rowsResult is ImportPlanFailure) {
    return rowsResult;
  }

  final rowsByTable =
      rowsResult as Map<ZenliftExportTable, List<ZenliftExportRow>>;
  final operations = <ZenliftImportTableOperation>[];

  for (final table in orderedZenliftImportTables) {
    final rows = rowsByTable[table] ?? const <ZenliftExportRow>[];
    final existingIds = existingIdsByTable[table] ?? const <String>{};
    final toInsert = <ZenliftExportRow>[];
    final toSkipExisting = <ZenliftSkippedExistingRow>[];

    for (final row in rows) {
      final identityColumn = zenliftTableIdentityColumns[table]!;
      final id = row[identityColumn];
      if (id is String && id.isNotEmpty && existingIds.contains(id)) {
        toSkipExisting.add(ZenliftSkippedExistingRow(id: id, row: row));
      } else {
        toInsert.add(row);
      }
    }

    operations.add(
      ZenliftImportTableOperation(
        table: table,
        rows: rows,
        toInsert: List<ZenliftExportRow>.unmodifiable(toInsert),
        toSkipExisting:
            List<ZenliftSkippedExistingRow>.unmodifiable(toSkipExisting),
      ),
    );
  }

  final isLargeFile = fileSizeBytes > maxZenliftImportSizeBytes;
  final warnings = isLargeFile
      ? const <ImportPlanWarningReason>[ImportPlanWarningReason.fileTooLarge]
      : const <ImportPlanWarningReason>[];

  return ImportPlanSuccess(
    export: ZenliftExportData(
      metadata: exportMetadata,
      rowsByTable: Map<ZenliftExportTable, List<ZenliftExportRow>>.unmodifiable(
        rowsByTable,
      ),
    ),
    operations: List<ZenliftImportTableOperation>.unmodifiable(operations),
    isLargeFile: isLargeFile,
    warnings: warnings,
  );
}

Object _readMetadata(Map<String, Object?> json) {
  final version = json['version'];
  if (version is! int) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.missingMetadata,
      field: 'version',
    );
  }

  final exportedAt = json['exportedAt'];
  if (exportedAt is! String || exportedAt.trim().isEmpty) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.missingMetadata,
      field: 'exportedAt',
    );
  }

  final appVersion = json['appVersion'];
  if (appVersion is! String || appVersion.trim().isEmpty) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.missingMetadata,
      field: 'appVersion',
    );
  }

  final sourcePlatform = json['sourcePlatform'];
  if (sourcePlatform is! String || sourcePlatform.trim().isEmpty) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.missingMetadata,
      field: 'sourcePlatform',
    );
  }

  final schemaVersion = json['schemaVersion'];
  if (schemaVersion is! int) {
    return const ImportPlanFailure(
      reason: ImportPlanFailureReason.missingMetadata,
      field: 'schemaVersion',
    );
  }

  return ZenliftExportMetadata(
    version: version,
    exportedAt: exportedAt,
    appVersion: appVersion,
    sourcePlatform: sourcePlatform,
    schemaVersion: schemaVersion,
  );
}

Object _readRowsByTable(Map<String, Object?> json) {
  final rowsByTable = <ZenliftExportTable, List<ZenliftExportRow>>{};

  for (final table in requiredZenliftExportTables) {
    if (!json.containsKey(table.jsonKey)) {
      return ImportPlanFailure(
        reason: ImportPlanFailureReason.missingTable,
        table: table,
      );
    }

    final rawRows = json[table.jsonKey];
    if (rawRows is! List) {
      return ImportPlanFailure(
        reason: ImportPlanFailureReason.invalidJsonShape,
        table: table,
      );
    }

    final rows = <ZenliftExportRow>[];
    for (var index = 0; index < rawRows.length; index += 1) {
      final rawRow = rawRows[index];
      if (rawRow is! Map) {
        return ImportPlanFailure(
          reason: ImportPlanFailureReason.invalidRowShape,
          table: table,
          rowIndex: index,
        );
      }

      final row = <String, Object?>{};
      for (final entry in rawRow.entries) {
        final key = entry.key;
        if (key is! String) {
          return ImportPlanFailure(
            reason: ImportPlanFailureReason.invalidRowShape,
            table: table,
            rowIndex: index,
          );
        }
        row[key] = entry.value as Object?;
      }

      for (final column in zenliftTableColumns[table]!) {
        if (!row.containsKey(column)) {
          return ImportPlanFailure(
            reason: ImportPlanFailureReason.missingRequiredColumn,
            field: column,
            table: table,
            rowIndex: index,
          );
        }
      }

      rows.add(Map<String, Object?>.unmodifiable(row));
    }

    rowsByTable[table] = List<ZenliftExportRow>.unmodifiable(rows);
  }

  return rowsByTable;
}
