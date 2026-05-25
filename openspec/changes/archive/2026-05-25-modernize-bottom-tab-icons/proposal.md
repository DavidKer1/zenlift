## Why

The bottom tab bar currently spends vertical space on text labels and uses mixed icon metaphors that feel less minimal than the updated Zenlift visual direction. Removing visible labels and standardizing the icons will make the primary navigation quieter, more modern, and easier to scan during quick gym use.

## What Changes

- Remove visible text labels from the bottom tab bar while preserving accessible names for assistive technology.
- Update the tab icons to a modern, minimalist set with clear active and inactive states.
- Change the Home tab icon to a four-square grid/dashboard icon instead of a house.
- Prefer existing installed icon packages where they can meet the visual and platform requirements; add a lightweight icon dependency only if the current packages cannot provide a suitable four-square icon and matching tab set.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-tab-navigation`: bottom tabs no longer show visible labels, while retaining equal touch targets, safe-area spacing, active state feedback, and accessible names.
- `tab-bar-icons`: primary tab icon requirements change to a modern minimalist set, including a four-square grid icon for Home.

## Impact

- Affected code: `src/components/app-tabs.tsx` and any small supporting type/style changes needed for icon rendering.
- Affected specs: `base-tab-navigation` and `tab-bar-icons`.
- Dependencies: no new dependency is expected because `@expo/vector-icons` and `expo-symbols` are already installed; implementation may add one only if necessary and justified.
- No data model, storage, workout flow, API, or migration impact.
