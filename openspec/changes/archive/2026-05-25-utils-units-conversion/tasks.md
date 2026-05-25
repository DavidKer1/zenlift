## 1. Core Conversion Functions

- [x] 1.1 Create `src/utils/units.ts` with `WeightUnit` type, `kgToLb`, and `lbToKg` functions
- [x] 1.2 Add `convertWeight` bidirectional conversion function
- [x] 1.3 Add `formatWeight` full format function (value + unit label)
- [x] 1.4 Add `formatWeightShort` compact format function (value only)
- [x] 1.5 Add `getIncrement` function returning standard plate increments

## 2. Tests

- [x] 2.1 Create `src/utils/__tests__/units.test.ts` with tests for all conversion functions
- [x] 2.2 Add edge case tests (zero, negative, NaN, Infinity values)
- [x] 2.3 Add round-trip conversion tests (kg → lb → kg)
- [x] 2.4 Add format function tests for both kg and lb

## 3. Validation

- [x] 3.1 Run TypeScript typecheck to ensure no errors
- [x] 3.2 Run unit tests and confirm all pass
