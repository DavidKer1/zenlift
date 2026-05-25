## Context

Zenlift is a B2C mobile-first workout tracker. The app stores all weight values internally in kilograms (kg) and converts to pounds (lb) only for display. This is a new utility module with no existing code to modify. The functions must be pure, stateless, and usable from any part of the app.

## Goals / Non-Goals

**Goals:**
- Provide deterministic, pure conversion functions with the standard factor 1 kg = 2.20462 lb
- Round results to 2 decimal places for display consistency
- Support both short and full weight formatting
- Return standard gym plate increments per unit system (2.5 kg, 5 lb)
- Handle edge cases: zero, negative values, NaN, Infinity

**Non-Goals:**
- Unit preference storage (that belongs in settings/MMKV)
- UI components for unit toggling
- Historical conversion recalculations
- Plate math calculations (beyond increment lookup)

## Decisions

1. **Conversion factor: 2.20462** — Standard international pound definition. This is more precise than the common approximation 2.2 and matches what serious lifters expect.

2. **Rounding: Math.round(value * 100) / 100** — Simple, predictable, avoids floating-point surprises. No library needed.

3. **Pure functions only** — No classes, no state, no side effects. Each function takes inputs and returns a deterministic output. Easy to test and tree-shake.

4. **Edge case handling:**
   - `NaN` input → return `NaN` (propagate)
   - `Infinity` input → return `Infinity` (propagate)
   - Negative values → convert/formatted normally (caller decides validity)
   - Zero → `"0.00"` or `"0 kg"` as appropriate

5. **Function signatures:**
   - `kgToLb(kg: number): number`
   - `lbToKg(lb: number): number`
   - `convertWeight(value: number, from: WeightUnit, to: WeightUnit): number`
   - `formatWeight(value: number, unit: WeightUnit): string` — e.g. `"62.5 kg"`
   - `formatWeightShort(value: number, unit: WeightUnit): string` — e.g. `"62.5"` (no unit label)
   - `getIncrement(unit: WeightUnit): number` — returns 2.5 for kg, 5 for lb

6. **Type: `WeightUnit = 'kg' | 'lb'`** — String union, no enum. Lighter bundle, simpler serialization.

## Risks / Trade-offs

- **Floating-point precision**: Some conversions may produce tiny rounding errors at extreme values (e.g., converting 0.1 kg to lb and back). Mitigation: round to 2 decimal places at every conversion boundary.
- **No i18n formatter**: Using template literals instead of `Intl.NumberFormat`. This is acceptable for MVP since weight display is numeric-only, but could be revisited if localizing formats.

## Open Questions

- None at this phase.
