import 'package:uuid/uuid.dart';

abstract interface class IdGenerator {
  String generate();
}

class UuidIdGenerator implements IdGenerator {
  const UuidIdGenerator({Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final Uuid _uuid;

  @override
  String generate() => _uuid.v4();
}

class SequenceIdGenerator implements IdGenerator {
  SequenceIdGenerator(this._ids);

  final List<String> _ids;
  var _index = 0;

  @override
  String generate() {
    if (_index >= _ids.length) {
      throw StateError('No more deterministic IDs available.');
    }
    final id = _ids[_index];
    _index += 1;
    return id;
  }
}
