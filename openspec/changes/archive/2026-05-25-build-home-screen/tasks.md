## 1. Setup & Scaffold

- [x] 1.1 Create `src/components/home/` directory structure
- [x] 1.2 Create `app/index.tsx` as Expo Router route (Home Screen entry point)
- [x] 1.3 Verify `WorkoutRepo.getLatestPRs` includes exercise name JOIN; if not, add query or modify

## 2. Greeting Component

- [x] 2.1 Create `src/components/home/Greeting.tsx` with time-of-day logic (6-11: buenos días, 12-18: buenas tardes, 19-5: buenas noches) using `new Date().getHours()`
- [x] 2.2 Style greeting with theme typography (size: xl, weight: bold, color: text) and proper spacing

## 3. Start Workout Button

- [x] 3.1 Create `src/components/home/StartWorkoutButton.tsx` as primary CTA button
- [x] 3.2 Style with primary color `#F97316`, white text, rounded corners (`radius.lg`), minimum 48px height
- [x] 3.3 Wire `onPress` to Expo Router navigation to routines screen
- [x] 3.4 Add `accessibilityLabel` and `accessibilityRole="button"`

## 4. Last Workout Card

- [x] 4.1 Create `src/components/home/LastWorkoutCard.tsx` accepting workout data props
- [x] 4.2 Render with data: session name, routine name, date (formatted), duration, exercise count
- [x] 4.3 Implement empty state: dumbbell icon, "No workouts yet", subtitle, secondary "Start Workout" CTA
- [x] 4.4 Implement loading state while data is being fetched
- [x] 4.5 Style card with `surface` background, `shadow.sm`, `radius.md`, and proper padding

## 5. Weekly Activity Card

- [x] 5.1 Create `src/components/home/WeeklyActivityCard.tsx` with days of week data prop
- [x] 5.2 Implement 7-segment day bar (L M X J V S D) with active segments colored `primary` and inactive `border`
- [x] 5.3 Calculate current week range (Monday 00:00 to Sunday 23:59)
- [x] 5.4 Implement empty state: all inactive segments, "No activity this week", subtitle text
- [x] 5.5 Add weekday labels below each segment using `typography.size.xs`

## 6. Current Routine Card

- [x] 6.1 Create `src/components/home/CurrentRoutineCard.tsx` accepting routine data prop
- [ ] 6.2 Render with data: routine name, day count, "Start" button navigating to routine detail
- [x] 6.3 Implement empty state: icon, "No routine set", subtitle, "Create Routine" CTA
- [x] 6.4 Style card consistently with other cards (surface, shadow, radius)

## 7. Recent PRs Card

- [x] 7.1 Create `src/components/home/RecentPRsCard.tsx` accepting PR array prop
- [x] 7.2 Render up to 3 PRs showing: exercise name, PR type label (human-readable), value with unit, date
- [x] 7.3 Map PR types to user-friendly labels: `max_weight` → "Max Weight", `max_volume` → "Max Volume", `max_reps` → "Max Reps", `estimated_1rm` → "Est. 1RM", `max_session_volume` → "Session Volume"
- [x] 7.4 Implement empty state: trophy icon, "No personal records yet", subtitle
- [x] 7.5 Use `success` color `#22C55E` for PR value text to indicate achievement

## 8. Data Fetching in Home Screen

- [x] 8.1 In `app/index.tsx`, create `useCallback` fetch functions for: last workout, weekly activity, current routine, recent PRs
- [x] 8.2 Implement `useEffect` on mount that calls all fetch functions
- [x] 8.3 Fetch last workout via `WorkoutRepo.getHistory(1, 0)` (most recent completed)
- [x] 8.4 Fetch weekly activity via `WorkoutRepo.getHistoryByDateRange(weekStart, today)`
- [x] 8.5 Fetch current routine via `RoutineRepo.getAll()` (first non-archived)
- [x] 8.6 Fetch PRs via `WorkoutRepo.getLatestPRs(3)`
- [x] 8.7 Add error boundaries: wrap each section fetch in try/catch, log errors, render empty state on failure

## 9. Home Screen Layout Integration

- [x] 9.1 Compose `app/index.tsx` with `SafeAreaView` + `ScrollView` containing all sections in order
- [x] 9.2 Apply consistent vertical spacing between sections using `spacing.three` (16px)
- [x] 9.3 Apply horizontal padding using `spacing.three` (16px)
- [x] 9.4 Set screen background to `colors.background` (#F7F8FA)

## 10. Polish & Accessibility

- [x] 10.1 Add `accessibilityLabel` to all cards and interactive elements
- [x] 10.2 Ensure all touch targets are minimum 48px
- [ ] 10.3 Verify contrast ratios meet 4.5:1 minimum for text
- [ ] 10.4 Test scroll behavior with all empty states and with all populated states
- [x] 10.5 Verify no green is used except for PR achievement values (success states)
