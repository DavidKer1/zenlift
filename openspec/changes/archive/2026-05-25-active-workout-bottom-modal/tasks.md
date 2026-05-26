## 1. Core Modal Component

- [x] 1.1 Create `src/components/workout/ActiveWorkoutModal.tsx` with shared animated value for expand/minimize (0 = minimized, 1 = expanded) and `useAnimatedStyle` for position, size, and opacity interpolation
- [x] 1.2 Implement expanded state: render WorkoutHeader, FlashList of WorkoutExerciseCard, RestTimer overlay, BottomBar, and ExercisePicker — reusing existing components from `src/app/workout/active.tsx` logic
- [x] 1.3 Implement minimized state (miniplayer): compact row showing workout name + elapsed timer, rendered above the tab bar with `pointerEvents="auto"`
- [x] 1.4 Add tap gesture on miniplayer to animate to expanded state using `withSpring` on the shared value
- [x] 1.5 Add swipe-down gesture on modal header area using `react-native-gesture-handler` PanGestureHandler or Reanimated gesture to animate to minimized state
- [x] 1.6 Add minimize button (chevron-down icon) in the WorkoutHeader area that triggers minimize animation
- [x] 1.7 Ensure elapsed timer (`setInterval` based on `session.started_at`) runs continuously in both expanded and minimized states without re-mounting the interval

## 2. Root Layout Integration

- [x] 2.1 Mount `ActiveWorkoutModal` in `src/app/_layout.tsx` (inside `RootNavigation`, conditionally when `useActiveWorkoutStore.session` is non-null)
- [x] 2.2 Position the modal absolutely over the full screen with `pointerEvents="box-none"` on the outer container so non-interactive areas don't block tab navigation
- [x] 2.3 Ensure the modal renders above the `AppTabs` component (higher z-index / later in render order)

## 3. Home Screen Cleanup

- [x] 3.1 Remove `import ActiveWorkoutScreen from '@/app/workout/active'` from `src/app/index.tsx`
- [x] 3.2 Remove the conditional render block `if (activeSession) return <ActiveWorkoutScreen />` (the entire early-return branch)
- [x] 3.3 Remove `const activeSession = useActiveWorkoutStore((s) => s.session)` selector from HomeScreen if no longer used for rendering decisions

## 4. Tab Bar Miniplayer Spacing

- [x] 4.1 In `src/components/app-tabs.tsx`, observe `useActiveWorkoutStore.session` to detect when miniplayer is present
- [x] 4.2 When session is active, add `marginBottom` or adjust `paddingBottom` on the `tabListContainer` by the miniplayer height (~56px) to shift the tab bar upward
- [x] 4.3 Verify all four tab targets remain fully tappable and safe-area spacing is preserved after the shift

## 5. Verification

- [x] 5.1 Run `pnpm typecheck` and `pnpm lint` to confirm no TypeScript or ESLint errors
- [ ] 5.2 Verify active workout modal appears when starting a workout from Home quick-start, Routine start, or Exercise detail quick-start
- [ ] 5.3 Verify modal persists (expanded or minimized) when switching between Home, Routines, History, and Settings tabs
- [ ] 5.4 Verify miniplayer tap expands modal, and swipe-down/minimize-button collapses it back
- [ ] 5.5 Verify timer continues updating in miniplayer without jumps or resets
- [ ] 5.6 Verify finishing or canceling workout removes modal and restores tab bar position
