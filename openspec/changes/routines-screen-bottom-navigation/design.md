## Context

Zenlift's Routines tab is the entry point for the core loop when a user has not yet created a workout routine. The current empty state is rendered in a fixed `View` with hardcoded bottom padding, while the bottom tab bar, FAB, undo bar, and inline error message are absolute-positioned near the bottom of the screen. On small mobile viewports this can clip suggested templates or leave controls competing for the same bottom area.

The route for routine creation already exists at `/routine/create` and renders `RoutineForm`. Expo Router supports direct path navigation with `router.push('/routine/create')` and object navigation with `router.push({ pathname, params })`, so the fix does not need a new route or a navigation restructure.

## Goals / Non-Goals

**Goals:**

- Keep all Routines empty-state content reachable on mobile viewports.
- Keep the empty-state CTA and FAB tappable above the safe-area-aware bottom tab bar.
- Navigate create CTAs to the existing `/routine/create` screen.
- Add regression coverage for the first-routine creation path from the Routines empty state.

**Non-Goals:**

- Do not add new routine templates or implement template prefill behavior.
- Do not change routine repository behavior, SQLite schema, or saved workout data.
- Do not redesign the bottom tab bar or active workout modal.
- Do not introduce new navigation libraries or UI kit dependencies.

## Decisions

1. Use a `ScrollView` for the zero-routine empty state.

   Rationale: the empty state includes header copy, the primary CTA, and suggested templates. A vertical `ScrollView` is the smallest change that allows the whole stack to remain reachable on short mobile screens. Using a static `View` with larger padding would still fail when the viewport is shorter than the content.

   Alternative considered: reduce vertical spacing and card heights. Rejected because it would only hide the symptom for some devices and would make the empty state less readable.

2. Derive bottom spacing from `getBottomTabBarHeight(insets.bottom)`.

   Rationale: `AppTabs` already uses safe-area-aware bottom spacing through shared constants. Reusing the same helper keeps the Routines screen aligned with the actual tab height on iOS, Android, and web mobile emulation.

   Alternative considered: keep hardcoded values such as `188`, `174`, and `104`. Rejected because those values drift from the tab bar implementation and can break when safe-area insets differ.

3. Keep FAB positioning screen-local through the existing `style` prop.

   Rationale: `FAB` is shared but already accepts a `ViewStyle` override. Passing the computed `bottom` value from `RoutinesScreen` avoids changing unrelated FAB consumers and keeps screen-specific layout ownership where the competing overlays exist.

   Alternative considered: move safe-area logic inside `FAB`. Rejected because a generic FAB cannot know which bottom overlays are present on each screen.

4. Use Expo Router direct path navigation for the plain create CTA.

   Rationale: `/routine/create` is the existing create route and direct `router.push('/routine/create')` is documented. Template taps can keep object navigation because they pass params.

   Alternative considered: introduce a new `/routines/new` route to match an older spec line. Rejected because the implemented create form already lives at `/routine/create`, and adding an alias would expand scope without solving the layout bug.

## Risks / Trade-offs

- [Risk] The regression test assumes the database has zero active routines after onboarding in the web smoke environment. → Mitigation: if seeded or persisted routines make the empty state unavailable, reset the web test database in the test setup or navigate directly to a fresh test context before asserting empty-state behavior.
- [Risk] Playwright mobile web does not perfectly represent native Android/iOS safe-area behavior. → Mitigation: use it for regression coverage of scrollability and navigation, and keep native hardware validation as a separate release check.
- [Risk] Floating error and undo bars may still overlap each other if both are visible at once. → Mitigation: use one shared computed message offset above the FAB; a future change can stack transient messages if the product needs simultaneous display.
- [Risk] TypeScript route typings may reject the string constant. → Mitigation: fall back to `router.push({ pathname: '/routine/create' } as never)` while preserving the same runtime target.
