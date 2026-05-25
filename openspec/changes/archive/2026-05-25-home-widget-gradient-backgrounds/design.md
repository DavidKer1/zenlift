## Context

The home screen renders five widget cards, all using `backgroundColor: colors.surfaceElevated` as their background. The current design achieves depth through surface layering alone. Adding a subtle CSS linear gradient provides a modern, premium feel with minimal effort.

The project uses React Native's New Architecture (Fabric), which supports `experimental_backgroundImage` with CSS gradient strings. The `expo-linear-gradient` package is also installed, but the project convention (per skill docs) prefers CSS gradients over the native module.

Current `surfaceElevated` values:
- Light mode: `#F0F0F0`
- Dark mode: `#242329`

## Goals / Non-Goals

**Goals:**
- Add a subtle, modern linear gradient to home screen widget card backgrounds
- Gradient goes from `surfaceElevated` at the top to a slightly darker variant at the bottom (~3-5% darker)
- Keep the change minimal: a reusable wrapper component and one new color token per mode
- Preserve existing solid background as fallback for environments without CSS gradient support

**Non-Goals:**
- Changing card content, layout, spacing, or typography
- Adding gradients to non-card UI elements (buttons, modals, tabs)
- Introducing heavy animation or parallax effects
- Changing the overall design philosophy—this is a subtle refinement, not a redesign

## Decisions

**Decision 1: Use CSS gradients (`experimental_backgroundImage`) instead of `expo-linear-gradient`**

- **Rationale**: The project skill docs explicitly recommend CSS gradients over `expo-linear-gradient` for New Architecture projects. CSS gradients are strings, simpler to compose, and have zero native module overhead.
- **Alternatives considered**: `expo-linear-gradient` — rejected because it adds a native view wrapper, making card composition trickier (children must be wrapped inside the gradient view).

**Decision 2: Create a `GradientCard` wrapper component instead of inlining gradient styles**

- **Rationale**: All five cards share the same gradient pattern. A single wrapper eliminates duplication, ensures consistency, and makes future adjustments trivial (one file to edit).
- **Alternatives considered**: Inline `experimental_backgroundImage` on each card — rejected due to DRY violation and harder maintenance.

**Decision 3: Define gradient endpoint as a new theme token (`surfaceElevatedDark`) rather than computing it dynamically**

- **Rationale**: Keeps the theme as the single source of truth. Tokens are testable and visible in one place. Dynamic darkening would require a color manipulation library, adding complexity and potential edge cases.
- **Alternatives considered**: Computing via opacity overlay (e.g., black at 5% opacity over surfaceElevated) — rejected because `experimental_backgroundImage` doesn't support layering a solid color over a gradient cleanly without two stacked views.

**Decision 4: Gradient direction: bottom-to-top, darker at bottom**

- **Rationale**: User's explicit requirement. The subtle darkening at the bottom grounds the card visually, creating a sense of weight and depth without shadows.

## Risks / Trade-offs

- **[CSS gradients require New Architecture]** → The project already targets New Architecture (Fabric). No impact. If a fallback is ever needed, the `GradientCard` component can detect support and fall back to solid `surfaceElevated`.

- **[`experimental_backgroundImage` is experimental]** → The API may change in future React Native versions. Mitigation: the `GradientCard` component abstracts this, so any API migration only touches one file.

- **[Subtle gradient may be imperceptible on some screens]** → The 3-5% darkness delta is intentionally subtle. On low-quality or poorly calibrated screens, the effect may be invisible. This is acceptable—the solid background still works perfectly.

## Migration Plan

1. Add `surfaceElevatedDark` tokens to `src/theme/index.ts`
2. Create `src/components/ui/GradientCard.tsx`
3. Update each of the five home widget cards to use `GradientCard` instead of `View` + `backgroundColor: colors.surfaceElevated`
4. No database migration, no API changes, no breaking changes
5. Rollback: revert each card to use `View` with solid background
