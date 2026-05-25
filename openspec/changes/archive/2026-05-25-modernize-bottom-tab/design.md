## Context

Zenlift currently renders its app shell through `src/components/app-tabs.tsx` using `expo-router/ui` headless tabs (`Tabs`, `TabSlot`, `TabList`, and `TabTrigger`). The existing tab bar is an absolutely positioned floating pill with a translucent `#18191D` surface, `24px` border radius, horizontal padding, and simple press opacity.

The requested direction is a modern minimal bottom tab with a black background, straight edges, clean icons, appropriate proportions, and a restrained Reanimated animation. The project already includes `react-native-reanimated` 4.2.1 and `react-native-worklets`, so no new animation dependency is needed.

## Goals / Non-Goals

**Goals:**

- Keep the current four-tab route contract and `expo-router/ui` custom tab architecture.
- Replace the floating rounded pill with a full-width, straight-edged black bottom navigation surface.
- Use minimalist icon presentation with active/inactive states based on white opacity, not accent colors.
- Add subtle Reanimated-driven focus and press feedback that feels responsive without distracting users during workouts.
- Preserve touch target size, safe-area comfort, and layout proportions across iOS, Android, and web.

**Non-Goals:**

- Do not add or remove tabs.
- Do not introduce a new navigation library, UI kit, or icon package.
- Do not change route files, screen content, domain logic, storage, or workout data behavior.
- Do not add rounded corners, shadows, borders, gradient styling, or bright accent indicators to the tab bar.

## Decisions

1. Keep `expo-router/ui` headless tabs as the navigation foundation.

   The current implementation already uses the Expo Router custom tab primitives and they are the right fit for a custom visual shell. Replacing them with React Navigation's default bottom tab UI would add style constraints and churn without changing the product behavior.

2. Implement the visual change in `src/components/app-tabs.tsx` only.

   The change is presentation-level and does not require route or screen changes. Keeping it localized reduces risk to the core app loop and avoids touching workout flows.

3. Use a straight, full-width bottom bar with a pure black or deepest theme background.

   The bar should sit at the bottom edge, include safe-area padding, and avoid border radius entirely. Its proportions should feel like a permanent app chrome element rather than a floating card: compact vertical padding, four equal-width tab targets, and at least 48px effective touch height per tab.

4. Use Reanimated for focused and pressed states inside each tab button.

   Convert the tab button visual container to an animated component and derive styles from `isFocused` and press state. Use `useSharedValue`, `useAnimatedStyle`, and `withTiming` or a tightly damped `withSpring` for small changes such as icon scale, label opacity, and a minimal vertical translation. Configure animations with system reduced-motion behavior where the API supports it.

5. Keep animation minimal and stateful, not decorative.

   The active tab can subtly lift by 1-2px, scale the icon from 1.0 to about 1.08, and move text/icon opacity between inactive and active values. Avoid bouncing, pulsing loops, glowing, large sliding indicators, or animations that could distract during set logging.

6. Keep icon source stable, but simplify icon choices where available.

   Continue using `MaterialCommunityIcons` to avoid a dependency change. Prefer outline icons for inactive states and filled or slightly stronger variants for active states only when the icon family provides a clean pair. If a filled/outline pair is visually noisy for a route, keep one glyph and rely on opacity/scale for state.

## Risks / Trade-offs

- Reanimated hook use inside tab items can become noisy if placed directly in the mapped render body -> Keep animation logic encapsulated in `TabButton`.
- Press and focus animations could fight each other -> Maintain separate shared values for focus progress and press progress, then compose small transforms predictably.
- A pure black bar may visually merge with dark screens -> Use spacing, opacity hierarchy, and content inset/safe-area padding rather than borders or shadows.
- Removing the floating pill changes the app's perceived visual identity -> Keep the typography, opacity system, and monochrome discipline consistent with `DESIGN.md` so the change feels intentional.
- Reduced-motion users may still receive unnecessary movement -> Use Reanimated reduced-motion options where possible and keep movement distances tiny.

## Migration Plan

1. Update `src/components/app-tabs.tsx` styles so the tab list is a straight bottom surface with no radius, border, shadow, blur, or floating margin.
2. Add Reanimated imports and encapsulate animated focus/press feedback in `TabButton`.
3. Tune icon sizes, label spacing, bar height, safe-area padding, and inactive opacity to maintain quick recognition and 48px touch targets.
4. Run lint/type checks and smoke test tab switching on the Expo target available in the workspace.
5. Rollback is limited to reverting `src/components/app-tabs.tsx` if the new shell causes layout or interaction regressions.

## Open Questions

None. The request explicitly defines the intended visual direction and animation library.