## Why

The current bottom tab is a floating rounded pill, which conflicts with the requested sharper, modern-minimal direction for Zenlift's dark-first UI. Updating it now keeps the app shell aligned with the black, hardware-like navigation style while preserving fast access to the four primary workout flows.

## What Changes

- Replace the floating frosted pill tab bar with a full-width, straight-edged black bottom bar.
- Remove tab bar border radius, blur-dependent styling, shadows, and visible borders.
- Keep the four existing primary tabs: Home, Rutinas, Historial, and Settings.
- Use cleaner, minimal icon treatment with active and inactive states expressed through opacity and subtle motion.
- Add a modern but restrained Reanimated interaction for focus changes and presses.
- Preserve appropriate mobile proportions, safe-area behavior, and touch targets for quick gym use.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-tab-navigation`: Change the required tab bar presentation from a floating rounded frosted pill to a straight-edged black bottom navigation surface with minimalist icons and Reanimated state transitions.

## Impact

- Affects `src/components/app-tabs.tsx` tab bar layout, styles, icon state rendering, and press/focus feedback.
- Uses existing `react-native-reanimated` and `react-native-worklets` dependencies already present in the project.
- Does not change route structure, data storage, APIs, or the core workout domain model.