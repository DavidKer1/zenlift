## 1. Tab Icon Metadata

- [x] 1.1 Update the tab configuration in `src/components/app-tabs.tsx` to use modern minimalist rounded Ionicons pairs for all four tabs.
- [x] 1.2 Change the Home tab icon pair to a four-square grid/dashboard icon, such as `grid-outline` and `grid`.
- [x] 1.3 Keep each tab label in the tab metadata for accessibility while removing it from the visual tab content.

## 2. Icon-Only Tab Bar UI

- [x] 2.1 Remove visible `ThemedText` labels from `TabButton` so each bottom tab renders only its icon.
- [x] 2.2 Add or preserve accessible names for Home, Routines, History, and Settings tab targets.
- [x] 2.3 Adjust icon sizing, tab content spacing, and min-height styles so the tab bar feels compact while every tab target remains at least 48px tall.
- [x] 2.4 Preserve Reanimated focus and press feedback with opacity, scale, or subtle translation only.

## 3. Validation

- [x] 3.1 Run lint or typecheck for the touched tab component.
- [x] 3.2 Smoke test the tab bar on a mobile-sized viewport or device to confirm icons render, labels are not visible, touch targets remain usable, and navigation still switches between the four tabs.
- [x] 3.3 Confirm no new icon dependency was added unless the installed icon packages cannot satisfy the required icon set.
