abstract interface class ZenliftClock {
  DateTime now();
}

class SystemZenliftClock implements ZenliftClock {
  const SystemZenliftClock();

  @override
  DateTime now() => DateTime.now().toUtc();
}

class FixedZenliftClock implements ZenliftClock {
  const FixedZenliftClock(this.fixedNow);

  final DateTime fixedNow;

  @override
  DateTime now() => fixedNow.toUtc();
}
