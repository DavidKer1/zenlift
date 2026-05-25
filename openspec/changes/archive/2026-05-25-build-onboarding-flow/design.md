## Context

Zenlift is a local-first React Native + Expo app with file-based routing (Expo Router SDK 55). The app already has a Settings screen (`src/app/settings.tsx`) that manages `weight_unit` and `weekly_goal` via MMKV. A ThemeProvider wraps the root layout. The `_layout.tsx` file provides the root navigation scaffold. There is no onboarding flow yet — new users land directly on the home screen with no configured preferences.

The onboarding must be fast (3 screens), skippable from any step, and persist unit + goal to MMKV. Once completed, the flag `onboarding_completed` must prevent re-showing the flow.

Design reference compliance: implementation MUST review `DESIGN.md` plus `tmp/design/screens/welcome_hero-html.html`, `tmp/design/screens/goal_selector-html.html`, `tmp/design/screens/experience_level-html.html`, and `tmp/design/screens/weekly_commitment-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- 3-step onboarding: welcome, unit (kg/lb), weekly goal (1-7 workouts/week)
- Horizontal swipe navigation with progress dots
- Skip button on every screen that finishes onboarding immediately
- Persist `weight_unit`, `weekly_goal`, and `onboarding_completed` to MMKV on finish
- Guard in `_layout.tsx` that reads `onboarding_completed` and redirects to Home if true
- Onboarding screen is a thin route that delegates UI to a feature component

**Non-Goals:**
- No account creation, email, or auth
- No social features, nutrition, or body measurements
- No coach dashboard or CRM features
- No complex multi-page forms — 3 screens only
- No back-navigation to onboarding after completion

## Decisions

### 1. Swipe navigation: FlatList horizontal with `pagingEnabled`

Using a horizontal FlatList with `pagingEnabled` gives swipe gestures for free. Alternative considered: `react-native-pager-view`. Rejected because it adds a dependency for a 3-screen flow where FlatList is sufficient and lighter.

### 2. Progress dots: custom row of 3 View circles

A simple row of colored circles (`primary` for active, `border` for inactive) keeps it lightweight. No library needed for 3 dots.

### 3. MMKV keys shared with Settings screen

The onboarding writes `weight_unit` and `weekly_goal` to the same MMKV keys that `src/features/settings/useSettings.ts` already reads/writes. This avoids key duplication. The settings screen already handles these keys, so onboarding just seeds the initial values.

### 4. Layout guard in `_layout.tsx`

The root layout reads `onboarding_completed` from MMKV synchronously on mount. If `false`, it renders the onboarding route; if `true`, it renders the normal tab/screen layout. This avoids a redirect flash. The flag is set to `"true"` (string) on onboarding completion.

### 5. Thin screen + feature component pattern

`src/app/onboarding.tsx` is a thin route that renders `<OnboardingScreen />` from `src/features/onboarding/OnboardingScreen.tsx`. This matches the existing pattern used across the project (e.g., `src/app/settings.tsx` renders `src/features/settings/SettingsScreen.tsx`).

### 6. Default values when skipped

If the user taps Skip before selecting a unit or goal, sensible defaults are written: `weight_unit = "kg"`, `weekly_goal = "3"`. This ensures settings are never undefined.

### 7. No `useWindowDimensions` for pagination width

Use `Dimensions.get('window').width` once and memoize. Avoid recomputing on every keyboard show/hide since onboarding has no text inputs.

## Risks / Trade-offs

- **Risk**: MMKV key `onboarding_completed` is a string `"true"`/`"false"`, not boolean. If another part of the app writes a boolean accidentally, the guard will break. **Mitigation**: Use `"true"`/`"false"` strings consistently; document in constants.
- **Risk**: If `_layout.tsx` guard is implemented incorrectly, the onboarding may show repeatedly or never show. **Mitigation**: The guard checks `mmkv.getString('onboarding_completed') === 'true'` once on mount; no re-rendering loop possible.
- **Trade-off**: No animation library for page transitions. FlatList horizontal swipe is functional but doesn't have custom spring animations. Acceptable for MVP — polish can come later.

## Open Questions

- Should the onboarding show a "Create first routine" CTA on the last screen? Not in scope — the welcome step ends with "Empezar" and navigates to Home where the user can create a routine from the main UI.
