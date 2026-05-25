## 1. Repository Read Model

- [x] 1.1 Define exported TypeScript types for the Home calendar summary in `src/storage/repositories/workoutRepo.ts`
- [x] 1.2 Add `WorkoutRepo.getHomeCalendarSummary(months?: number)` that returns completed activity dates and latest completed workout metadata
- [x] 1.3 Join latest workout metadata to `routines` and `routine_days` so the widget can display the best available routine day, routine, or session label
- [x] 1.4 Count frequency by `routine_day_id`, then `routine_id`, then non-empty session `name`, excluding active and cancelled sessions
- [x] 1.5 Ensure all summary SQL uses parameters and wraps database errors with calendar-summary context

## 2. Repository Tests

- [x] 2.1 Add `WorkoutRepo.getHomeCalendarSummary` tests for completed activity dates within the requested month window
- [x] 2.2 Add tests proving active and cancelled sessions are excluded from activity, latest workout metadata, and frequency counts
- [x] 2.3 Add tests for frequency counted by latest `routine_day_id`
- [x] 2.4 Add tests for frequency counted by latest `routine_id` when no routine day exists
- [x] 2.5 Add tests for freestyle name frequency and non-repeatable fallback behavior

## 3. Calendar Widget Component

- [x] 3.1 Create `src/components/home/WorkoutCalendarWidget.tsx` with props for loading state, summary data, and repeat action
- [x] 3.2 Build fixed-size three-month dot grids from normalized activity date keys using local date helpers
- [x] 3.3 Render inactive dots with low-opacity white and active dots with high-opacity white, grouped under compact month labels
- [x] 3.4 Render the bottom label with latest workout name and frequency copy using Inter text and JetBrains Mono for numeric frequency
- [x] 3.5 Add a repeat-start button with a minimum 48px touch target, accessible label, and disabled/hidden handling when no repeat params exist
- [x] 3.6 Add loading and empty states that keep the widget footprint stable and follow the dark tonal design system

## 4. Home Screen Integration

- [x] 4.1 Replace `LastWorkoutCard` state, imports, mapping helpers, and rendering in `src/app/index.tsx` with Calendar Workout Widget state
- [x] 4.2 Fetch widget data through `WorkoutRepo.getHomeCalendarSummary` inside a memoized Home callback
- [x] 4.3 Place the Calendar Workout Widget immediately after the Start Workout and Quick Workout buttons
- [x] 4.4 Wire the repeat-start button to `startWorkoutFlow` with the latest workout's `routineId`, `routineDayId`, and readable `name`
- [x] 4.5 Preserve graceful error handling by logging widget fetch failures and rendering the widget empty state
- [x] 4.6 Remove `LastWorkoutCard` if no other screen imports it, or leave it untouched if still referenced elsewhere

## 5. Start Flow Verification

- [x] 5.1 Verify whether `startWorkoutFlow({ routineId, routineDayId })` preloads routine day exercises into Active Workout
- [x] 5.2 If routine exercises are not preloaded, extend the existing start workout flow/store path so routine-based starts create the expected workout exercises
- [x] 5.3 Add or update tests for routine-based start behavior if the start flow changes

## 6. Visual Polish & Accessibility

- [x] 6.1 Confirm the widget uses `colors.surface`, `colors.surfaceElevated`, `colors.surfaceSecondary`, existing radius, spacing, and typography tokens instead of hardcoded styling where possible
- [x] 6.2 Confirm the widget has no shadows, gradients, decorative color accents, or green usage outside success/completed states
- [x] 6.3 Add accessibility labels/states for the widget and repeat action, while keeping decorative dots non-interactive
- [x] 6.4 Verify text does not overlap or truncate poorly on narrow mobile widths

## 7. Validation

- [x] 7.1 Run repository and unit tests covering workout repository and start workflow changes
- [x] 7.2 Run TypeScript typecheck and lint for touched files
- [ ] 7.3 Smoke test Home in Expo or web preview with completed workout data, no workout data, and latest freestyle workout data
- [x] 7.4 Verify the Home section order is Greeting, Start Workout, Quick Workout, Calendar Workout Widget, Weekly Activity, Current Routine, Recent PRs