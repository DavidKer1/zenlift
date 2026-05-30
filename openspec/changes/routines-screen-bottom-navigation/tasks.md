## 1. Regression Coverage

- [x] 1.1 Add a Playwright mobile web regression test in `e2e/playwright/core-loop.spec.ts` that completes/skips onboarding, opens the Rutinas tab, confirms the empty-state CTA is visible, scrolls suggested templates into view, taps “Crear primera rutina”, and asserts `/routine/create` plus the routine name input are visible.
- [ ] 1.2 Run `pnpm test:agent:web -- --grep "routines empty state"` and confirm the test fails before implementation because navigation or empty-state reachability is broken.

## 2. Routines Screen Layout And Navigation

- [x] 2.1 Update `src/app/routines.tsx` imports to include `ScrollView`, `useSafeAreaInsets`, and `getBottomTabBarHeight`.
- [x] 2.2 Add screen-local constants for the create route, floating action size, and floating stack gap.
- [x] 2.3 Compute `bottomTabBarHeight`, `floatingBottomOffset`, `floatingMessageBottomOffset`, and `contentBottomPadding` inside `RoutinesScreen` from the safe-area inset and existing theme spacing.
- [x] 2.4 Update the plain create CTA handler to navigate to `/routine/create`, keeping template navigation as an object with `pathname: '/routine/create'` and `params`.
- [x] 2.5 Replace the zero-routine fixed empty-state `View` with a vertical `ScrollView` whose content container uses `contentBottomPadding`, `keyboardShouldPersistTaps="handled"`, and no vertical scroll indicator.
- [x] 2.6 Apply `contentBottomPadding` to the non-empty `RoutineFlashList` content container so list items are not hidden by bottom overlays.
- [x] 2.7 Apply computed bottom offsets to the inline error message, undo bar, and `FAB` so each floats above the bottom tab bar safe area.
- [x] 2.8 Remove hardcoded bottom offsets and padding from `emptyScroll`, `inlineMessage`, and `undoBar` styles, replacing them with `emptyContent` and computed inline values.

## 3. Verification

- [x] 3.1 Run `pnpm typecheck` and confirm TypeScript passes.
- [ ] 3.2 Run `pnpm test:agent:web -- --grep "routines empty state"` and confirm the regression test passes.
- [x] 3.3 Run `pnpm test -- src/features/routine/routineFormSchema.test.ts` and confirm routine form validation still passes.
- [ ] 3.4 Run `pnpm test:agent:web` and confirm the mobile web core-loop smoke suite passes.
