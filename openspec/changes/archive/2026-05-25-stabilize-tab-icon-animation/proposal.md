## Why

The bottom tab icons currently risk communicating active state through size changes, which can feel jumpy and make the navigation less stable during quick gym use. The active and inactive icon footprint should remain consistent so tab changes feel calm, predictable, and aligned with Zenlift's minimal dark design system.

## What Changes

- Keep bottom tab icons the same visual size whether active, inactive, focused, or pressed.
- Move the active-state animation away from icon scaling and toward color or opacity transitions.
- Prefer opacity-based state changes if fixed tint colors would fight the monochrome tab design or existing design tokens.
- Preserve subtle, finite Reanimated motion without changing tab bar height, tab item layout, or neighboring tab positions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-tab-navigation`: Active and inactive tab icon states must use a stable icon size and animate selection through color and/or opacity rather than active-state scaling.

## Impact

- Affected specs: `base-tab-navigation`.
- Affected code: bottom tab icon components and tab animation logic under the Expo Router tab layout/navigation components.
- No API, persistence, database, or dependency changes are expected.
