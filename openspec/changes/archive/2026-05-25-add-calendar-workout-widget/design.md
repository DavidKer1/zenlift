## Context

Home currently renders `Greeting`, two `StartWorkoutButton` CTAs, `LastWorkoutCard`, `WeeklyActivityCard`, `CurrentRoutineCard`, and `RecentPRsCard` from `src/app/index.tsx`. `LastWorkoutCard` fetches the most recent completed session with `WorkoutRepo.getHistory(1, 0)` and then composes details with `getFullSession`, while weekly activity is fetched separately with `getHistoryByDateRange`.

The new widget replaces the Last Workout card and sits immediately after the Start Workout and Quick Workout buttons. It needs a denser, more visual summary: recent completed-workout activity dots grouped by month, a bottom label for the most recent routine/session, a frequency label, and a repeat action that starts the same routine context when possible.

Constraints:

- Keep Zenlift local-first; all data comes from SQLite through repository methods.
- Keep Home thin; UI mapping belongs in small helpers, query composition belongs in `WorkoutRepo`.
- Preserve Active Workout safety by using `startWorkoutFlow` for repeat actions.
- Follow `DESIGN.md`: dark tonal layering, no shadows, 12px card radius, 20px card padding, Inter for labels/body, JetBrains Mono for numeric/count data, and white opacity tiers.
- The visual direction is refined technical minimalism: compact, quiet, information-dense, and clearly inspired by the selected dot-calendar reference without copying its raw HTML/Tailwind implementation.

## Goals / Non-Goals

**Goals:**

- Replace `LastWorkoutCard` with a `WorkoutCalendarWidget` placed after the two Home workout CTAs.
- Render a calendar-style activity grid for recent completed workouts, grouped by the latest three visible months.
- Show the latest completed routine/session label and how frequently that same routine/session has been completed.
- Provide a repeat-start button that calls `startWorkoutFlow({ routineId, routineDayId, name })` when the latest completed workout has repeatable routine context.
- Provide loading and empty states that remain useful for first-run users.
- Add repository-level read coverage and focused unit tests for calendar/frequency data.

**Non-Goals:**

- No backend, sync, analytics, or remote calendar integration.
- No new SQLite tables or migrations.
- No changes to Active Workout set logging or workout completion rules.
- No replacement of Weekly Activity, Current Routine, or Recent PRs cards unless required by layout integration.

## Decisions

1. Add a repository read model for the widget.

   `WorkoutRepo` should expose a method such as `getHomeCalendarSummary(months?: number)` returning a typed object with completed activity dates, latest completed workout metadata, repeat params, and frequency count. This keeps SQL and joins out of `src/app/index.tsx` and avoids coupling the widget to multiple ad hoc queries.

   Alternative considered: compose the widget in Home from `getHistory`, `getHistoryByDateRange`, and `getFullSession`. That reuses existing APIs but repeats date-window and frequency logic in the screen, making it harder to test and easier to drift from repository behavior.

2. Count frequency by repeatable identity.

   If the latest completed session has `routine_day_id`, frequency should count completed sessions with the same `routine_day_id`. If it only has `routine_id`, frequency should count completed sessions with the same `routine_id`. If neither exists, frequency should count completed sessions with the same non-empty session `name`; otherwise it should fall back to total completed workouts only for display copy, with repeat disabled.

   Alternative considered: always count by routine only. That loses precision for multi-day routines, where "Back + bicep + legs" is usually a routine day, not the whole program.

3. Repeat action reuses `startWorkoutFlow`.

   The widget button should call `startWorkoutFlow` with the latest linked `routineId`, `routineDayId`, and a readable `name`. It must not create sessions directly from the component. This preserves active-session recovery prompts and avoids bypassing store/MMKV behavior.

   Alternative considered: call `WorkoutRepo.createSession` directly from Home. That would duplicate safety logic and risk inconsistent active-session handling.

4. Render fixed-size dots from normalized dates.

   The widget component should receive already-normalized activity days and build stable three-month dot grids with fixed dimensions, muted inactive dots, and high-opacity active dots. Use local date helpers in Home/widget code rather than storing derived calendar cells in SQLite.

   Alternative considered: have SQL return calendar cells. SQL can return sessions efficiently, but calendar cell generation is presentation logic and easier to reason about in TypeScript.

5. Preserve graceful first-run and error behavior.

   Loading shows a tonal skeleton or spinner within the widget footprint. Empty state shows inactive dots and copy such as "No workouts yet" with the repeat button hidden or disabled. Repository errors are caught in Home, logged with context, and mapped to the empty state.

   Alternative considered: keep `LastWorkoutCard` empty state around as a fallback. That would leave two concepts in the codepath and weaken the replacement requirement.

## Risks / Trade-offs

- Date boundaries can be wrong around time zones -> Build month/date keys from local `Date` objects for display and compare ISO timestamps through bounded query parameters.
- Frequency copy can be misleading for freestyle sessions -> Prefer routine day/routine identity; only use session name when no linked routine exists and the name is non-empty.
- Repeat action may not restore exercises from a routine day if `startWorkoutFlow` only creates an empty linked session today -> Keep the widget wired through `startWorkoutFlow`, and verify whether existing start flow populates routine exercises; if not, task implementation must extend that flow rather than special-casing the widget.
- Dense dot grids can create tiny touch/contrast issues -> Dots remain decorative/non-interactive, while the repeat button keeps a minimum 48px touch target and explicit accessibility label.
- New repository method could overlap existing history queries -> Keep it focused on Home widget summary data and continue using existing methods for History and Weekly Activity.

No data migration is needed. Rollback is a UI/data-access rollback: remove the new widget, restore `LastWorkoutCard` usage, and remove the new repository read method/tests if the change is abandoned.