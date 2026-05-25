## 1. Onboarding Screen Component

- [ ] 1.1 Create `src/features/onboarding/OnboardingScreen.tsx` with horizontal FlatList (`pagingEnabled`) rendering three step components: WelcomeStep, UnitStep, GoalStep
- [ ] 1.2 Build WelcomeStep: Zenlift logo text, welcome heading, subheading, "Empezar" CTA button in primary color (`#F97316`)
- [ ] 1.3 Build UnitStep: kg/lb toggle with two pressable options, kg pre-selected, active state in primary color with primary soft background
- [ ] 1.4 Build GoalStep: weekly goal stepper with minus/plus buttons and number display, default value 3, bounds 1-7
- [ ] 1.5 Add progress dots row: 3 circles, active dot in primary color (`#F97316`), inactive dots in border color (`#E5E7EB`)
- [ ] 1.6 Add ScrollView ref to FlatList and wire progress dot taps to `scrollToIndex`
- [ ] 1.7 Add "Saltar" button anchored at top-right on every screen that calls the finish handler directly

## 2. Onboarding Route

- [ ] 2.1 Create `src/app/onboarding.tsx` as a thin route that renders `<OnboardingScreen />` and handles `onComplete` by writing MMKV keys and navigating to Home (`router.replace('/')`)

## 3. MMKV Persistence

- [ ] 3.1 Define MMKV keys constants: `ONBOARDING_COMPLETED`, `WEIGHT_UNIT`, `WEEKLY_GOAL` (shared with settings feature)
- [ ] 3.2 Implement `completeOnboarding` function that writes `weight_unit` (selected or default `"kg"`), `weekly_goal` (selected or default `"3"`), and `onboarding_completed = "true"` to MMKV, then navigates to Home

## 4. Layout Guard

- [ ] 4.1 In `src/app/_layout.tsx`, read `onboarding_completed` from MMKV synchronously on mount
- [ ] 4.2 If flag is not `"true"`, render onboarding route; if `"true"`, render normal tab/screen layout
- [ ] 4.3 Ensure guard prevents flash — no redirect animation, just conditional initial render

## 5. Polish

- [ ] 5.1 Add `accessibilityLabel` props on all interactive elements (toggle, stepper, skip, CTA)
- [ ] 5.2 Ensure touch targets are minimum 48dp on all interactive elements
- [ ] 5.3 Verify light theme is applied: white surface background, primary orange accents, gray text

## 6. Testing

- [ ] 6.1 Write unit test for GoalStep stepper bounds (min 1, max 7)
- [ ] 6.2 Write unit test for `completeOnboarding` correctly persisting defaults and user selections to MMKV
- [ ] 6.3 Smoke test: clean MMKV, launch app → see onboarding → skip → verify Home shown → restart → verify onboarding not shown
