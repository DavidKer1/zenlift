## Context

Zenlift uses a custom Expo Router tab shell in `src/components/app-tabs.tsx` built with `expo-router/ui`, `react-native-reanimated`, `react-native-safe-area-context`, and `@expo/vector-icons`. The current tab bar renders four evenly spaced tabs with both icons and visible labels. The product direction calls for quieter, more minimal navigation that still works quickly in gym conditions and remains accessible.

The project already includes `@expo/vector-icons` and `expo-symbols`, so implementation should first use the installed icon stack before introducing another dependency.

## Goals / Non-Goals

**Goals:**

- Remove visible tab labels from the bottom navigation surface.
- Preserve accessible tab names through `accessibilityLabel`, route semantics, or equivalent React Native accessibility props.
- Use a modern minimalist, softly rounded icon set with paired active/inactive variants where available.
- Use a four-square grid/dashboard icon for Home.
- Keep the current custom tab shell, safe-area handling, equal tab widths, Reanimated feedback, and dark monochrome styling.

**Non-Goals:**

- Do not change the app routes, tab count, or navigation hierarchy.
- Do not redesign Home, Routines, History, or Settings content.
- Do not change theme tokens, data storage, workout flows, or onboarding.
- Do not add a new icon dependency unless existing installed packages cannot satisfy the required icon set.

## Decisions

1. Keep `src/components/app-tabs.tsx` as the implementation boundary.

   The tab bar behavior is already isolated in one custom component. Keeping the change there avoids route churn and preserves the current Expo Router setup.

   Alternative considered: migrate to React Navigation bottom tabs. This would add unnecessary surface area for a visual update and risk breaking existing route rendering.

2. Remove the visible `ThemedText` label but keep label data in the tab model.

   The `label` should remain as metadata for `accessibilityLabel`, test expectations, and future analytics or screen-reader copy. The visual tab content should render only the icon.

   Alternative considered: render the text offscreen. That is more fragile and unnecessary if the pressable/trigger exposes an accessible label directly.

3. Prefer `Ionicons` for the first implementation pass.

   `Ionicons` is already available through `@expo/vector-icons` and provides a softer, rounder visual language than the previous tab icons. Suitable pairs are `grid-outline`/`grid` for Home, `barbell-outline`/`barbell` for Routines, `time-outline`/`time` for History, and `settings-outline`/`settings` for Settings. This satisfies the request without increasing bundle size.

   Alternatives considered: keep `MaterialCommunityIcons`, which is available but reads squarer and heavier; add `lucide-react-native` for a thinner outline system, which would add a dependency for a change that the installed icon library can cover.

4. Preserve active-state behavior through icon variant, opacity, and subtle motion.

   Active tabs should remain distinguishable without color accents. The implementation should keep Reanimated opacity/scale/translation feedback and should not introduce badges, gradients, glows, shadows, or brand-color selection states.

5. Tighten vertical layout around icon-only tabs without shrinking touch targets.

   Removing labels allows a more compact visual center, but each tab press target must remain at least 48px tall and safe-area padding must still protect the icons on devices with home indicators.

## Risks / Trade-offs

- Icon-only tabs can be less obvious for first-time users -> Keep accessible labels and choose conventional icons for each destination.
- Some Ionicons filled/outline pairs may vary slightly in optical weight -> Use the same icon family for all tabs and tune size/opacity consistently.
- Removing visual labels may affect existing tests or snapshots -> Update tests to assert accessibility labels and visible icon behavior instead of text labels in the tab bar.
- Over-compacting the tab bar could hurt touch ergonomics -> Preserve min-height constraints and verify on mobile-sized viewports.
