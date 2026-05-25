## 1. Theme tokens

- [x] 1.1 Add `surfaceElevatedDark` to light palette (`#EBEBEB`) in `src/theme/index.ts`
- [x] 1.2 Add `surfaceElevatedDark` to dark palette (`#1F1E24`) in `src/theme/index.ts`
- [x] 1.3 Add `surfaceElevatedDark` to the `ThemeColor` type union

## 2. Gradient card component

- [x] 2.1 Create `src/components/ui/GradientCard.tsx` with `experimental_backgroundImage` CSS gradient (bottom `surfaceElevatedDark` → top `surfaceElevated`)
- [x] 2.2 Accept `borderRadius`, `padding`, `style`, and `children` props; apply to outer `View`
- [x] 2.3 Add `accessibilityLabel` prop passthrough

## 3. Apply gradient to home widget cards

- [x] 3.1 Wrap `StartWorkoutButton` secondary variant background with `GradientCard`
- [x] 3.2 Wrap `WorkoutCalendarWidget` card container with `GradientCard`
- [x] 3.3 Wrap `WeeklyActivityCard` card container with `GradientCard`
- [x] 3.4 Wrap `CurrentRoutineCard` card container with `GradientCard`
- [x] 3.5 Wrap `RecentPRsCard` card container with `GradientCard`

## 4. Verification

- [x] 4.1 Visual check: gradient is subtle and visible on both light and dark modes
- [x] 4.2 Verify all card content, layout, and interactions are unchanged
- [x] 4.3 Run TypeScript typecheck (`npx tsc --noEmit`) to confirm no regressions
- [x] 4.4 Run existing tests (`npx jest`) to confirm no regressions
