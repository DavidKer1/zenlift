import 'package:flutter/material.dart';

abstract final class ZenliftRadii {
  static const small = 4.0;
  static const base = 8.0;
  static const medium = 12.0;
  static const large = 16.0;
  static const extraLarge = 24.0;
  static const full = 9999.0;

  static const card = Radius.circular(medium);
  static const compactControl = Radius.circular(base);
  static const pill = Radius.circular(full);
}
