## Context

`ActiveWorkoutModal` currently renders a `@gorhom/bottom-sheet` with snap points `15%` and `95%`. The custom handle is used as the miniplayer row, but because it belongs to the bottom sheet, the minimized state still behaves like a short sheet anchored to the bottom of the screen. The intended interaction is closer to the old YouTube miniplayer: a compact header only, fixed directly above the bottom tab navigation, with the full workout surface expanding from that header.

The app already runs `react-native-reanimated` 4.2.1 and `react-native-gesture-handler`. Reanimated shared element transitions support `sharedTransitionTag` and `SharedTransition`, but the documented shared element transition support is native-only; web needs a fallback based on shared values/layout animation.

## Goals / Non-Goals

**Goals:**

- Render only a compact active workout header when minimized.
- Keep the minimized header visually and interactively above the bottom tab navigation, without showing hidden workout body content.
- Split the UI into focused components so the expanded surface and minimized header can be reasoned about independently.
- Use Reanimated 4.2 transitions for the header identity between minimized and expanded states on native, with a non-breaking fallback for web.
- Preserve active workout data, elapsed timer continuity, tab navigation access, and fast return to the full workout.

**Non-Goals:**

- Changing active workout persistence, repositories, SQLite schema, or workout calculations.
- Redesigning the tab bar or changing the primary tab routes.
- Adding a new animation dependency.
- Moving Active Workout back into a dedicated route-only experience.

## Decisions

### Decision 1: Replace low snap-point minimization with two UI surfaces

Use `ActiveWorkoutModal` as the controller and split the rendering into:

- `ActiveWorkoutMinimizedHeader`: the persistent 56px header shown above the tab bar.
- `ActiveWorkoutExpandedSurface`: the full-screen workout experience containing cancel, rest timer, exercise list, bottom bar, and picker.
- Optionally `ActiveWorkoutHeaderContent`: shared presentational header content used by both surfaces so text, timer, chevron, accessibility labels, and styling stay consistent.

The minimized state SHALL NOT be represented by a partially collapsed bottom sheet. This removes the current visual bug at the root: body content cannot peek above the tab bar if it is not part of the minimized surface.

Alternative considered: keep `BottomSheet` and tune the minimized snap point. That preserves too much coupling between the minimized header and expanded body, and small differences in tab bar height/safe area can keep producing partial-sheet artifacts.

### Decision 2: Keep workout state and timers in the controller

`ActiveWorkoutModal` should continue to own recovery, elapsed timer, exercise expansion, previous performance loading, and store callbacks. The new child components should receive props and callbacks; they should not duplicate store recovery or database reads.

This keeps the implementation close to the existing code while making the visual surfaces easier to test. It also avoids resetting workout data when switching between minimized and expanded states.

Alternative considered: move each surface to independent containers reading directly from the store. That would reduce prop passing but risks duplicated side effects, duplicate timers, and harder recovery behavior.

### Decision 3: Use shared transitions for header identity on native, fallback elsewhere

On native platforms, apply stable `sharedTransitionTag` values to the shared header container and key sub-elements such as session name/timer when moving between `ActiveWorkoutMinimizedHeader` and `ActiveWorkoutExpandedSurface`. Use `SharedTransition.duration(...)` or a comparable timing-based shared transition to keep the movement direct and non-bouncy.

Because Reanimated shared element transitions are not supported on web, gate shared-transition-specific props with platform checks or keep a fallback animated overlay using `useSharedValue`, `withTiming`, and opacity/translate interpolation. The fallback must still satisfy the behavior: only the header is visible while minimized.

Alternative considered: use only manual shared values everywhere. That would be simpler cross-platform, but it would not use the shared element approach requested and would make the native transition less expressive.

### Decision 4: Position the minimized header from tab metrics, not sheet height

Define a shared constant or helper for the active workout header height (`56`) and align the header above the rendered tab bar using safe-area-aware tab metrics. The header should be absolutely positioned with `left: 0`, `right: 0`, and `bottom` equal to the tab bar surface height, including bottom inset/padding.

The tab bar itself should remain fixed at the bottom. Only add or keep spacing adjustments if needed to prevent the header from covering tab hit targets; do not shift the tab bar upward as the primary behavior.

Alternative considered: shift the tab bar upward when a session is active. That creates a less familiar navigation surface and conflicts with the desired YouTube-style header above bottom navigation.

### Decision 5: Keep tab interaction explicit with pointer events

The overlay root should keep `pointerEvents="box-none"`. The minimized header should use `pointerEvents="auto"` only inside its own 56px bounds. The expanded surface should capture input while open. This keeps tab targets tappable while minimized and avoids invisible overlays blocking navigation.

## Risks / Trade-offs

- Shared transitions may behave differently between native platforms -> keep the header layout dimensions stable and provide a manual fallback path.
- Web does not support Reanimated shared element transitions -> gate native-only props and verify Expo web still renders without errors.
- Splitting surfaces can accidentally unmount expanded-only UI state such as picker visibility or scroll position -> keep state in `ActiveWorkoutModal` and only reset transient expanded UI intentionally.
- Header/tab positioning can drift if tab bar dimensions change -> centralize header height/tab bar measurement constants or derive the bottom offset from the same values used by `AppTabs`.
- Removing `BottomSheet` from this component may change gesture behavior -> preserve swipe-down-to-minimize through `GestureDetector` on the expanded header/body and keep the chevron/tap affordances.

## Migration Plan

1. Introduce the minimized header and expanded surface components while keeping `ActiveWorkoutModal` mounted from the root layout.
2. Move the current `BottomSheetView` content into `ActiveWorkoutExpandedSurface` and remove the low snap-point minimized behavior from `ActiveWorkoutModal`.
3. Add Reanimated shared transitions on native and fallback timing animations for web.
4. Verify quick-start, routine start, tab switching, minimize/expand, finish/cancel, and timer continuity.

Rollback is straightforward: revert the new split components and restore the existing `BottomSheet`-based `ActiveWorkoutModal` if the transition introduces blocking issues.