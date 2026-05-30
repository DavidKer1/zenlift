# Active Workout Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize Active Workout set logging so newly added exercises, added sets, edited values, and check completion render immediately, while simplifying set rows by removing `+` and `-` controls.

**Architecture:** Implement this as one OpenSpec change split into focused parts: render-state correctness, simplified set row UX, add-exercise focus behavior, and verification. The primary stale-state bug lives in component memo comparators, so the implementation will expose tiny comparator helpers for unit tests and keep storage/store behavior local-first and conservative.

**Tech Stack:** Expo SDK 55, React Native 0.83, React 19, TypeScript, Zustand, expo-sqlite, FlashList v2, Jest/Jest Expo, Playwright agent web smoke.

---

## Audit Summary

The graph report is stale relative to `HEAD` (`1d9f588` vs `ff09e8a`), so implementation should rely on current source files and rebuild Graphify after significant code changes.

Confirmed issues:

1. `src/components/workout/WorkoutExerciseCard.tsx` memo comparator only checks `exercise.id`, `exercise.sets.length`, expansion, and previous performance. Completing a set changes `set.is_completed` without changing length, so the card suppresses the re-render. This matches the reported "click check does not update until another state changes" bug.
2. `src/components/workout/SetRow.tsx` memo comparator ignores `previousWeight`, `previousReps`, `unit`, `setType`, and handler identity. After completing set 1, set 2 can keep stale previous values because its own `weight`, `reps`, and `isCompleted` did not change.
3. `SetRow` includes four stepper buttons, making the row crowded. User requested removing them. Current input and check targets are 40px high, below the documented 48px target.
4. `src/app/workout/active.tsx` expands the newly added exercise only when it is the first exercise. Adding an exercise to an existing workout leaves the new card collapsed and often below the fold, which makes the next "Add Set" path feel broken.
5. Active workout copy is mixed English/Spanish (`Add Exercise`, `Finish Workout`, `Add Set`) while product docs use Spanish. This is visual/UX debt, not the core stale-state bug.
6. The current OpenSpec active specs do not contain the detailed active workout screen requirements because `active-workout-screen` exists only in archive. The fix should add current requirements for render freshness and simplified set rows.

Non-goals for this plan:

1. Do not add a backend, coach flow, CRM, nutrition, social, or web admin behavior.
2. Do not rewrite the Active Workout data model.
3. Do not make routine editing affect existing workout sessions.
4. Do not reintroduce rest/break features.

## OpenSpec Division

Use one change id: `2026-05-30-stabilize-active-workout-set-logging`.

Parts:

1. **Spec Part A: Render Freshness** - Active workout cards and rows must re-render when any visible set state changes.
2. **Spec Part B: Simplified Set Row** - Remove weight/reps stepper buttons, keep numeric inputs and check button at 48px touch targets.
3. **Spec Part C: Add Exercise Continuity** - Selecting an exercise adds it, expands it, and scrolls it into view.
4. **Spec Part D: Verification** - Unit tests, typecheck, lint, and agent/mobile smoke checklist for the core loop.

## File Structure

Create:

- `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/proposal.md` - Why this change exists and scope.
- `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/design.md` - Root cause, architecture, risks, rollback.
- `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md` - OpenSpec execution checklist.
- `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/specs/active-workout-screen/spec.md` - Delta requirements for render freshness, simplified set rows, add exercise continuity.
- `src/components/workout/__tests__/activeWorkoutRenderState.test.ts` - Comparator and render-state unit tests.

Modify:

- `src/components/workout/WorkoutExerciseCard.tsx` - Export comparator helper, compare visible set fields, remove `increment` prop, improve Add Set label.
- `src/components/workout/SetRow.tsx` - Export props/comparator, remove stepper buttons and `increment`, enlarge inputs/check button to 48px.
- `src/app/workout/active.tsx` - Remove `getIncrement`, stop passing `increment`, expand and scroll to newly added exercise.
- `src/features/workout/stores/__tests__/activeWorkoutStore.test.ts` - Add a regression test that completing one set keeps the exercise object new and second row data available.
- `e2e/playwright/core-loop.spec.ts` - Add a focused assertion for newly added exercise -> add set -> check renders completed when web smoke is stable.

Do not modify unless execution proves it necessary:

- `src/storage/repositories/workoutRepo.ts` - Current persistence path is adequate for this bug.
- `src/domain/entities/index.ts` - No type changes needed.
- `src/theme/index.ts` - Existing local changes are present; avoid touching this file in this plan.

---

### Task 1: Create OpenSpec Change Shell

**Files:**
- Create: `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/proposal.md`
- Create: `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/design.md`
- Create: `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md`
- Create: `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/specs/active-workout-screen/spec.md`

- [ ] **Step 1: Create directories**

Run:

```bash
mkdir -p openspec/changes/2026-05-30-stabilize-active-workout-set-logging/specs/active-workout-screen
```

Expected: command exits with status `0`.

- [ ] **Step 2: Write proposal**

Create `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/proposal.md`:

```markdown
# Stabilize Active Workout Set Logging

## Why

Active Workout is Zenlift's core loop. Completing a set in a newly added exercise can appear stale: tapping the check button persists the action, but the UI does not update until another state change forces a render. The current set row also spends horizontal space on `+` and `-` buttons that are not needed for the current product direction.

## What Changes

- Ensure workout exercise cards re-render when visible set state changes: completion, weight, reps, type, notes, and previous-value display.
- Remove weight/reps stepper buttons from Active Workout set rows.
- Keep numeric weight/reps inputs and completion check button large enough for gym use.
- Expand and scroll to newly added exercises so the next action is obvious.
- Add regression tests for stale render comparators and store set completion.

## Non-Goals

- No database schema changes.
- No backend, sync, coach dashboard, marketplace, nutrition, or social features.
- No rest timer or break behavior.
- No routine editing changes.

## Impact

- Affected specs: `active-workout-screen`.
- Affected code: `src/app/workout/active.tsx`, `src/components/workout/WorkoutExerciseCard.tsx`, `src/components/workout/SetRow.tsx`, active workout tests.
- Data/storage impact: existing SQLite autosave remains unchanged.
```

- [ ] **Step 3: Write design**

Create `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/design.md`:

```markdown
# Design: Stabilize Active Workout Set Logging

## Root Cause

`WorkoutExerciseCard` is wrapped in `React.memo`, but its comparator only checks `exercise.sets.length`. Completing a set updates `is_completed` on an existing set id without changing length, so React receives new store state while the card returns `true` from the comparator and skips rendering. `SetRow` has a related issue: it ignores previous-value props, so adjacent rows can show stale previous labels after the prior set is completed.

## Approach

Expose pure comparator helpers from `WorkoutExerciseCard.tsx` and `SetRow.tsx`, then unit test them directly. The card comparator will compare the fields that affect visible output: exercise identity/name, set id, set number, weight, reps, set type, completion, completed timestamp, notes, expansion state, unit, and previous performance. The row comparator will compare every prop that affects visible output after removing steppers.

Simplify `SetRow` to: set number, previous label, weight input, reps input, check button. Inputs and the check button use 48px height. This keeps the one-handed gym interaction fast and creates enough horizontal room after removing steppers.

After `addExercise()` resolves, `active.tsx` will use the returned workout exercise id to expand that card and scroll to its index. This makes the flow deterministic for newly added exercises in existing workouts.

## Risks

- Comparing every set field can increase renders. Mitigation: the list is small during a workout, and correctness matters more than over-aggressive memoization in the core logging path.
- Removing steppers changes the archived `active-workout-screen` expectation. Mitigation: current change adds an active spec delta documenting the simplified row.
- Programmatic scroll can fail if FlashList has not measured the item. Mitigation: call `requestAnimationFrame` and catch `scrollToIndex` errors without blocking the exercise addition.

## Rollback

Rollback is local to UI files. Restore previous comparator behavior and stepper controls if necessary. No migration or data cleanup is needed.
```

- [ ] **Step 4: Write OpenSpec tasks**

Create `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md`:

```markdown
## 1. Render Freshness

- [ ] 1.1 Add failing comparator tests proving `WorkoutExerciseCard` re-renders when `is_completed`, `weight`, `reps`, or `set_number` changes without changing `sets.length`.
- [ ] 1.2 Export and use `areWorkoutExerciseCardPropsEqual()` from `WorkoutExerciseCard.tsx`.
- [ ] 1.3 Add failing comparator tests proving `SetRow` re-renders when previous values or unit change.
- [ ] 1.4 Export and use `areSetRowPropsEqual()` from `SetRow.tsx`.

## 2. Simplified Set Row

- [ ] 2.1 Remove weight and reps `+` / `-` stepper buttons from `SetRow`.
- [ ] 2.2 Remove `increment` from `SetRow`, `WorkoutExerciseCard`, and `active.tsx`.
- [ ] 2.3 Increase weight input, reps input, and check button touch targets to 48px.
- [ ] 2.4 Keep numeric keyboard, next/done return keys, and fast check button behavior.

## 3. Add Exercise Continuity

- [ ] 3.1 After exercise selection, expand the newly added workout exercise even when the workout already has exercises.
- [ ] 3.2 Scroll to the newly added exercise after FlashList receives the new item.
- [ ] 3.3 Keep the ExercisePicker closed after successful selection and show the existing alert on failure.

## 4. Verification

- [ ] 4.1 Run focused Jest tests for active workout render state.
- [ ] 4.2 Run active workout store Jest tests.
- [ ] 4.3 Run TypeScript typecheck.
- [ ] 4.4 Run lint.
- [ ] 4.5 Smoke test: create or continue workout, add exercise, add set, edit weight/reps, tap check, verify completed state renders immediately.
```

- [ ] **Step 5: Write spec delta**

Create `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/specs/active-workout-screen/spec.md`:

```markdown
## ADDED Requirements

### Requirement: Active set completion renders immediately
The Active Workout screen SHALL update visible set completion state immediately after a set is completed and persisted.

#### Scenario: Complete set without changing set count
- **GIVEN** an active workout exercise card is expanded
- **AND** the exercise has an incomplete set row
- **WHEN** the user taps the set check button
- **THEN** the store SHALL persist the completed set
- **AND** the set row SHALL render completed state without requiring another input edit, add-set action, or navigation event
- **AND** the exercise card completed count SHALL update in the same render cycle

### Requirement: Previous set labels stay current
The Active Workout screen SHALL keep previous-value labels aligned with the latest visible set state.

#### Scenario: Complete first set updates next row previous label
- **GIVEN** an expanded exercise has at least two set rows
- **WHEN** the first row is completed
- **THEN** the second row SHALL be eligible to re-render with the first row as its previous set
- **AND** stale previous session values SHALL NOT remain solely because the second row's own weight and reps did not change

### Requirement: Set rows use simplified input controls
The Active Workout set row SHALL prioritize direct numeric entry and a check button.

#### Scenario: Render simplified set row
- **WHEN** a set row renders
- **THEN** it SHALL show set number, previous value, weight input, reps input, and completion check button
- **AND** it SHALL NOT render weight or reps `+` / `-` stepper buttons
- **AND** weight input, reps input, and check button SHALL each have a minimum 48px touch target
- **AND** weight and reps inputs SHALL use numeric keyboards

### Requirement: Newly added exercise becomes actionable
The Active Workout screen SHALL make a newly added exercise immediately actionable.

#### Scenario: Add exercise to existing workout
- **GIVEN** an active workout already has at least one exercise
- **WHEN** the user selects an exercise from the add-exercise picker
- **THEN** the picker SHALL close
- **AND** the new workout exercise SHALL appear in the list
- **AND** the new workout exercise card SHALL expand
- **AND** the list SHALL attempt to scroll the new workout exercise into view
```

- [ ] **Step 6: Validate OpenSpec shape**

Run:

```bash
find openspec/changes/2026-05-30-stabilize-active-workout-set-logging -maxdepth 4 -type f | sort
```

Expected output includes exactly:

```text
openspec/changes/2026-05-30-stabilize-active-workout-set-logging/design.md
openspec/changes/2026-05-30-stabilize-active-workout-set-logging/proposal.md
openspec/changes/2026-05-30-stabilize-active-workout-set-logging/specs/active-workout-screen/spec.md
openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md
```

- [ ] **Step 7: Commit OpenSpec shell**

```bash
git add openspec/changes/2026-05-30-stabilize-active-workout-set-logging
git commit -m "docs: propose active workout set logging stabilization"
```

Expected: commit succeeds with only OpenSpec files staged.

---

### Task 2: Add Failing Render-State Tests

**Files:**
- Create: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`

- [ ] **Step 1: Write failing tests for memo comparators**

Create `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`:

```typescript
import type { Exercise, SetLog, WorkoutExerciseWithSets } from '@/domain/entities';
import {
  areWorkoutExerciseCardPropsEqual,
  type WorkoutExerciseCardProps,
} from '@/components/workout/WorkoutExerciseCard';
import {
  areSetRowPropsEqual,
  type SetRowProps,
} from '@/components/workout/SetRow';

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Bench Press',
    equipment: 'barbell',
    category: 'strength',
    is_custom: 0,
    is_favorite: 0,
    notes: null,
    created_at: '2026-05-30T10:00:00.000Z',
    updated_at: '2026-05-30T10:00:00.000Z',
    ...overrides,
  };
}

function makeSet(overrides: Partial<SetLog> = {}): SetLog {
  return {
    id: 'set-1',
    workout_exercise_id: 'we-1',
    set_number: 1,
    weight: 100,
    reps: 8,
    set_type: 'normal',
    is_completed: 0,
    completed_at: null,
    notes: null,
    ...overrides,
  };
}

function makeWorkoutExercise(
  sets: SetLog[],
  overrides: Partial<WorkoutExerciseWithSets> = {},
): WorkoutExerciseWithSets {
  return {
    id: 'we-1',
    workout_session_id: 'ws-1',
    exercise_id: 'ex-1',
    sort_order: 1,
    notes: null,
    exercise: makeExercise(),
    sets,
    ...overrides,
  };
}

const noop = () => undefined;

function makeCardProps(
  exercise: WorkoutExerciseWithSets,
  overrides: Partial<WorkoutExerciseCardProps> = {},
): WorkoutExerciseCardProps {
  return {
    exercise,
    isExpanded: true,
    onToggle: noop,
    onAddSet: noop,
    onCompleteSet: noop,
    onWeightChange: noop,
    onRepsChange: noop,
    unit: 'kg',
    previousPerformance: null,
    primaryMuscleName: null,
    primaryMuscleColor: null,
    ...overrides,
  };
}

function makeRowProps(overrides: Partial<SetRowProps> = {}): SetRowProps {
  return {
    setId: 'set-1',
    setNumber: 1,
    previousWeight: 90,
    previousReps: 10,
    weight: 100,
    reps: 8,
    setType: 'normal',
    isCompleted: false,
    unit: 'kg',
    onComplete: noop,
    onWeightChange: noop,
    onRepsChange: noop,
    ...overrides,
  };
}

describe('active workout render memoization', () => {
  it('re-renders an exercise card when a set completion changes without set length changing', () => {
    const before = makeCardProps(makeWorkoutExercise([makeSet({ is_completed: 0 })]));
    const after = makeCardProps(
      makeWorkoutExercise([
        makeSet({
          is_completed: 1,
          completed_at: '2026-05-30T10:05:00.000Z',
        }),
      ]),
    );

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(false);
  });

  it('re-renders an exercise card when set values change without set length changing', () => {
    const before = makeCardProps(makeWorkoutExercise([makeSet({ weight: 100, reps: 8 })]));
    const after = makeCardProps(makeWorkoutExercise([makeSet({ weight: 102.5, reps: 9 })]));

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(false);
  });

  it('keeps exercise card memoization when visible data is unchanged', () => {
    const set = makeSet({ is_completed: 1, completed_at: '2026-05-30T10:05:00.000Z' });
    const before = makeCardProps(makeWorkoutExercise([set]));
    const after = makeCardProps(makeWorkoutExercise([{ ...set }]));

    expect(areWorkoutExerciseCardPropsEqual(before, after)).toBe(true);
  });

  it('re-renders a set row when previous values change', () => {
    const before = makeRowProps({ previousWeight: 90, previousReps: 10 });
    const after = makeRowProps({ previousWeight: 100, previousReps: 8 });

    expect(areSetRowPropsEqual(before, after)).toBe(false);
  });

  it('re-renders a set row when weight unit changes', () => {
    const before = makeRowProps({ unit: 'kg' });
    const after = makeRowProps({ unit: 'lb' });

    expect(areSetRowPropsEqual(before, after)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts
```

Expected: FAIL because `areWorkoutExerciseCardPropsEqual`, `WorkoutExerciseCardProps`, `areSetRowPropsEqual`, and `SetRowProps` are not exported yet.

- [ ] **Step 3: Commit failing tests**

```bash
git add src/components/workout/__tests__/activeWorkoutRenderState.test.ts
git commit -m "test: cover active workout render memoization"
```

Expected: commit succeeds with the failing test file only.

---

### Task 3: Fix WorkoutExerciseCard Memoization

**Files:**
- Modify: `src/components/workout/WorkoutExerciseCard.tsx`
- Test: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`

- [ ] **Step 1: Export props and add comparator helper**

Modify `src/components/workout/WorkoutExerciseCard.tsx` so the props type and comparator are exported. Replace the local `type WorkoutExerciseCardProps = { ... }` with:

```typescript
export type WorkoutExerciseCardProps = {
  exercise: WorkoutExerciseWithSets;
  isExpanded: boolean;
  onToggle: (exerciseId: string) => void;
  onAddSet: (workoutExerciseId: string) => void;
  onCompleteSet: (exerciseId: string, setId: string) => void;
  onWeightChange: (setId: string, weight: number) => void;
  onRepsChange: (setId: string, reps: number) => void;
  unit: string;
  previousPerformance: PreviousPerformance;
  primaryMuscleName?: string | null;
  primaryMuscleColor?: string | null;
};
```

Then add this helper above `function WorkoutExerciseCardComponent`:

```typescript
function getSetRenderSignature(exercise: WorkoutExerciseWithSets): string {
  return exercise.sets
    .map((set) =>
      [
        set.id,
        set.set_number,
        set.weight,
        set.reps,
        set.set_type,
        set.is_completed,
        set.completed_at ?? '',
        set.notes ?? '',
      ].join(':'),
    )
    .join('|');
}

export function areWorkoutExerciseCardPropsEqual(
  prev: WorkoutExerciseCardProps,
  next: WorkoutExerciseCardProps,
): boolean {
  return (
    prev.exercise.id === next.exercise.id &&
    prev.exercise.exercise?.id === next.exercise.exercise?.id &&
    prev.exercise.exercise?.name === next.exercise.exercise?.name &&
    getSetRenderSignature(prev.exercise) === getSetRenderSignature(next.exercise) &&
    prev.isExpanded === next.isExpanded &&
    prev.unit === next.unit &&
    prev.previousPerformance?.weight === next.previousPerformance?.weight &&
    prev.previousPerformance?.reps === next.previousPerformance?.reps &&
    prev.primaryMuscleName === next.primaryMuscleName &&
    prev.primaryMuscleColor === next.primaryMuscleColor
  );
}
```

- [ ] **Step 2: Use comparator helper in React.memo**

Replace the existing `export const WorkoutExerciseCard = memo(...)` block with:

```typescript
export const WorkoutExerciseCard = memo(
  WorkoutExerciseCardComponent,
  areWorkoutExerciseCardPropsEqual,
);
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts
```

Expected: still FAIL only on missing `SetRow` exports/comparator; `WorkoutExerciseCard` assertions pass.

- [ ] **Step 4: Commit card fix**

```bash
git add src/components/workout/WorkoutExerciseCard.tsx
git commit -m "fix: rerender active workout cards on set changes"
```

Expected: commit succeeds with `WorkoutExerciseCard.tsx` only.

---

### Task 4: Remove SetRow Steppers And Fix Row Memoization

**Files:**
- Modify: `src/components/workout/SetRow.tsx`
- Modify: `src/components/workout/WorkoutExerciseCard.tsx`
- Modify: `src/app/workout/active.tsx`
- Test: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`

- [ ] **Step 1: Export SetRow props and remove increment prop**

In `src/components/workout/SetRow.tsx`, replace `type SetRowProps = { ... }` with:

```typescript
export type SetRowProps = {
  setId: string;
  setNumber: number;
  previousWeight?: number;
  previousReps?: number;
  weight: number;
  reps: number;
  setType: string;
  isCompleted: boolean;
  unit: string;
  onComplete: (setId: string) => void;
  onWeightChange: (setId: string, weight: number) => void;
  onRepsChange: (setId: string, reps: number) => void;
};
```

Remove `increment` from the `SetRowComponent` destructuring.

- [ ] **Step 2: Remove stepper handlers**

Delete these functions from `SetRow.tsx`:

```typescript
const handleWeightStep = useCallback(
  (delta: number) => {
    const next = Math.max(0, weight + delta);
    onWeightChange(setId, Math.round(next * 100) / 100);
  },
  [setId, weight, onWeightChange],
);

const handleRepsStep = useCallback(
  (delta: number) => {
    const next = Math.max(0, reps + delta);
    onRepsChange(setId, next);
  },
  [setId, reps, onRepsChange],
);
```

- [ ] **Step 3: Replace input groups with direct inputs**

In `SetRow.tsx`, replace the first `styles.inputGroup` block that contains weight `-`, `TextInput`, and `+` with:

```tsx
<View style={styles.inputGroup}>
  <TextInput
    ref={weightInputRef}
    accessibilityLabel={`Peso set ${setNumber}`}
    testID={`active-set-${setNumber}-weight-input`}
    keyboardType="numeric"
    returnKeyType="next"
    onSubmitEditing={() => repsInputRef.current?.focus()}
    value={weight === 0 ? '' : String(weight)}
    onChangeText={handleWeightChange}
    style={[
      styles.input,
      {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        color: colors.text,
        borderRadius: radius.sm,
      },
    ]}
    placeholderTextColor={colors.mutedText}
  />
</View>
```

Replace the second `styles.inputGroup` block that contains reps `-`, `TextInput`, and `+` with:

```tsx
<View style={styles.inputGroup}>
  <TextInput
    ref={repsInputRef}
    accessibilityLabel={`Repeticiones set ${setNumber}`}
    testID={`active-set-${setNumber}-reps-input`}
    keyboardType="numeric"
    returnKeyType="done"
    value={reps === 0 ? '' : String(reps)}
    onChangeText={handleRepsChange}
    style={[
      styles.input,
      {
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        color: colors.text,
        borderRadius: radius.sm,
      },
    ]}
    placeholderTextColor={colors.mutedText}
  />
</View>
```

- [ ] **Step 4: Update SetRow styles**

In `SetRow.tsx`, update styles to:

```typescript
checkButton: {
  alignItems: 'center',
  borderWidth: 2,
  height: 48,
  justifyContent: 'center',
  width: 48,
},
input: {
  borderWidth: 1,
  flex: 1,
  fontSize: 18,
  fontWeight: '700',
  height: 48,
  minWidth: 64,
  paddingHorizontal: 8,
  textAlign: 'center',
},
inputGroup: {
  alignItems: 'center',
  flex: 1,
  flexDirection: 'row',
  maxWidth: 112,
},
```

Delete the `stepper` style entirely.

In the row container inline style, change `minHeight: 56` to:

```typescript
minHeight: 64,
```

- [ ] **Step 5: Add SetRow comparator helper**

Replace the existing `export const SetRow = memo(...)` with:

```typescript
export function areSetRowPropsEqual(
  prev: SetRowProps,
  next: SetRowProps,
): boolean {
  return (
    prev.setId === next.setId &&
    prev.setNumber === next.setNumber &&
    prev.previousWeight === next.previousWeight &&
    prev.previousReps === next.previousReps &&
    prev.weight === next.weight &&
    prev.reps === next.reps &&
    prev.setType === next.setType &&
    prev.isCompleted === next.isCompleted &&
    prev.unit === next.unit
  );
}

export const SetRow = memo(SetRowComponent, areSetRowPropsEqual);
```

- [ ] **Step 6: Remove increment from WorkoutExerciseCard**

In `src/components/workout/WorkoutExerciseCard.tsx`, remove `increment: number;` from `WorkoutExerciseCardProps`, remove `increment` from `WorkoutExerciseCardComponent` destructuring, and remove this prop from `<SetRow />`:

```tsx
increment={increment}
```

- [ ] **Step 7: Remove increment from active screen**

In `src/app/workout/active.tsx`, delete:

```typescript
import { getIncrement } from '@/utils/units';
```

Delete:

```typescript
const increment = useMemo(() => getIncrement(weightUnit), [weightUnit]);
```

Remove this prop from `<WorkoutExerciseCard />`:

```tsx
increment={increment}
```

Remove `increment` from the `renderItem` dependency array.

- [ ] **Step 8: Run focused render tests**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit set row simplification**

```bash
git add src/components/workout/SetRow.tsx src/components/workout/WorkoutExerciseCard.tsx src/app/workout/active.tsx src/components/workout/__tests__/activeWorkoutRenderState.test.ts
git commit -m "fix: simplify active workout set rows"
```

Expected: commit succeeds with row, card, active screen, and render-state test changes.

---

### Task 5: Expand And Scroll Newly Added Exercises

**Files:**
- Modify: `src/app/workout/active.tsx`

- [ ] **Step 1: Update exercise selection handler**

In `src/app/workout/active.tsx`, replace `handleExerciseSelected` with:

```typescript
const handleExerciseSelected = useCallback(
  async (selected: { id: string; name: string }) => {
    setPickerVisible(false);
    try {
      const addedExercise = await addExercise(selected.id);
      const updated = useActiveWorkoutStore.getState().exercises;
      const addedIndex = updated.findIndex((exercise) => exercise.id === addedExercise.id);

      setExpandedExerciseId(addedExercise.id);

      if (addedIndex >= 0) {
        requestAnimationFrame(() => {
          try {
            flashListRef.current?.scrollToIndex({
              index: addedIndex,
              animated: true,
              viewPosition: 0.1,
            });
          } catch {
            flashListRef.current?.scrollToEnd({ animated: true });
          }
        });
      }
    } catch {
      Alert.alert('Error', 'No se pudo agregar el ejercicio.');
    }
  },
  [addExercise],
);
```

- [ ] **Step 2: Keep initial expansion behavior intact**

Leave this existing effect unchanged:

```typescript
useEffect(() => {
  if (exercises.length > 0 && expandedExerciseId === null) {
    setExpandedExerciseId(exercises[0].id);
  }
}, [exercises, expandedExerciseId]);
```

Expected: first workout exercise still expands on recovery/start, and newly added exercises override expansion after selection.

- [ ] **Step 3: Run typecheck for requestAnimationFrame and FlashList refs**

Run:

```bash
pnpm typecheck
```

Expected: PASS. If TypeScript reports `scrollToEnd` is unavailable on `FlashListRef`, replace the catch block with:

```typescript
catch {
  // FlashList may not have measured the new item yet; expansion still makes it actionable.
}
```

Then rerun:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit add exercise continuity**

```bash
git add src/app/workout/active.tsx
git commit -m "fix: expand newly added workout exercises"
```

Expected: commit succeeds with `active.tsx` only unless Step 3 required no additional files.

---

### Task 6: Add Store Regression Around Completed Set State

**Files:**
- Modify: `src/features/workout/stores/__tests__/activeWorkoutStore.test.ts`

- [ ] **Step 1: Add regression test**

Inside the existing `describe('completeSet', () => { ... })` block in `src/features/workout/stores/__tests__/activeWorkoutStore.test.ts`, add:

```typescript
it('replaces exercise and set references when completing a set', async () => {
  const session = makeSession();
  const firstSet = makeSetLog({ id: 'sl-1', set_number: 1, is_completed: 0 });
  const secondSet = makeSetLog({ id: 'sl-2', set_number: 2, is_completed: 0, weight: 90, reps: 10 });
  const exercise = makeWorkoutExerciseWithSets({ id: 'we-1' }, [firstSet, secondSet]);

  const { useActiveWorkoutStore } = require('@/features/workout/stores/activeWorkoutStore');
  useActiveWorkoutStore.setState({ session, exercises: [exercise] });

  jest.spyOn(WorkoutRepo.prototype, 'completeSet').mockResolvedValue(undefined);

  await useActiveWorkoutStore.getState().completeSet('we-1', 'sl-1');

  const updatedExercise = useActiveWorkoutStore.getState().exercises[0];
  expect(updatedExercise).not.toBe(exercise);
  expect(updatedExercise.sets[0]).not.toBe(firstSet);
  expect(updatedExercise.sets[0].is_completed).toBe(1);
  expect(updatedExercise.sets[1]).toBe(secondSet);
});
```

- [ ] **Step 2: Run store tests**

Run:

```bash
pnpm test -- src/features/workout/stores/__tests__/activeWorkoutStore.test.ts
```

Expected: PASS.

- [ ] **Step 3: Commit store regression**

```bash
git add src/features/workout/stores/__tests__/activeWorkoutStore.test.ts
git commit -m "test: guard active workout completed set state"
```

Expected: commit succeeds with the store test only.

---

### Task 7: Align Active Workout Copy And Touch Targets

**Files:**
- Modify: `src/components/workout/WorkoutExerciseCard.tsx`
- Modify: `src/components/workout/BottomBar.tsx`
- Test: manual UI smoke

Warning: `src/components/workout/BottomBar.tsx` had pre-existing local changes when this plan was written. Before editing it, run `git diff -- src/components/workout/BottomBar.tsx` and preserve user changes.

- [ ] **Step 1: Change Add Set copy**

In `src/components/workout/WorkoutExerciseCard.tsx`, change:

```tsx
+ Add Set
```

to:

```tsx
+ Agregar set
```

- [ ] **Step 2: Change bottom bar copy only if compatible with local diff**

In `src/components/workout/BottomBar.tsx`, if the local diff does not already handle copy, change:

```tsx
<ThemedText style={styles.addLabel}>Add Exercise</ThemedText>
```

to:

```tsx
<ThemedText style={styles.addLabel}>Agregar ejercicio</ThemedText>
```

Change:

```tsx
<ThemedText style={styles.finishLabel}>Finish Workout</ThemedText>
```

to:

```tsx
<ThemedText style={styles.finishLabel}>Finalizar</ThemedText>
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Commit copy cleanup**

If `BottomBar.tsx` was safe to edit:

```bash
git add src/components/workout/WorkoutExerciseCard.tsx src/components/workout/BottomBar.tsx
git commit -m "fix: localize active workout actions"
```

If `BottomBar.tsx` contains unrelated user work that should not be included:

```bash
git add src/components/workout/WorkoutExerciseCard.tsx
git commit -m "fix: localize active workout add set action"
```

Expected: commit succeeds without overwriting unrelated user changes.

---

### Task 8: Add Agent Smoke Assertion For The Reported Flow

**Files:**
- Modify: `e2e/playwright/core-loop.spec.ts`

- [ ] **Step 1: Inspect existing smoke flow**

Run:

```bash
sed -n '1,260p' e2e/playwright/core-loop.spec.ts
```

Expected: identify the active workout smoke path and available test IDs.

- [ ] **Step 2: Add assertion near active workout set completion**

If the smoke test already reaches Active Workout and has an incomplete set, add this assertion after tapping the check button:

```typescript
await page.getByTestId('active-set-1-complete').click();
await expect(page.getByTestId('active-set-1-complete')).toHaveAccessibleName(/completado/i);
```

If the smoke test includes adding an exercise first, add this assertion immediately after selecting the exercise:

```typescript
await expect(page.getByTestId(/active-workout-exercise-.*-add-set/)).toBeVisible();
```

- [ ] **Step 3: Run web smoke if Expo web is available**

Run:

```bash
pnpm test:agent:web
```

Expected: PASS.

If Expo web is blocked by a known `expo-sqlite` web/WASM issue, record the exact error in the OpenSpec `tasks.md` verification item and continue with Jest, typecheck, lint, and manual native smoke.

- [ ] **Step 4: Commit smoke assertion**

```bash
git add e2e/playwright/core-loop.spec.ts openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md
git commit -m "test: smoke active workout set completion"
```

Expected: commit succeeds with smoke test and any verification note.

---

### Task 9: Full Verification And OpenSpec Task Updates

**Files:**
- Modify: `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md`

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts src/features/workout/stores/__tests__/activeWorkoutStore.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Manual smoke path**

Run the app on the most convenient target and verify:

```text
1. Start or continue an active workout.
2. Tap Agregar ejercicio.
3. Select any exercise.
4. Confirm the new exercise card expands.
5. Tap Agregar set.
6. Enter weight and reps.
7. Tap the check button.
8. Confirm the check turns completed immediately.
9. Confirm the exercise header count updates immediately.
10. Add another set and confirm previous value labels are current.
11. Finish the workout and confirm the summary opens.
```

Expected: no stale UI after tapping check; no `+` / `-` buttons in set rows.

- [ ] **Step 5: Update OpenSpec tasks with results**

In `openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md`, check off every completed verification item. If a smoke test is blocked, write the concrete blocker after the item, for example:

```markdown
- [ ] 4.5 Smoke test: blocked by Expo web sqlite WASM resolution error: `<exact error text>`. Verified via focused Jest, typecheck, lint, and manual native smoke.
```

- [ ] **Step 6: Rebuild Graphify after significant code changes**

Run:

```bash
/graphify src
```

Expected: Graphify refreshes AST extraction. If `/graphify` is unavailable in the shell, note that in the final handoff and do not commit `.graphify/branch.json`, `.graphify/worktree.json`, `.graphify/needs_update`, or `.graphify/cache/`.

- [ ] **Step 7: Commit verification updates**

```bash
git add openspec/changes/2026-05-30-stabilize-active-workout-set-logging/tasks.md .graphify/GRAPH_REPORT.md .graphify/graph.json
git commit -m "docs: record active workout verification"
```

Expected: commit succeeds. If Graphify was unavailable or generated only ignored files, commit only `tasks.md`.

---

## Self-Review

Spec coverage:

- Reported stale check button state is covered by Task 2, Task 3, Task 4, and the "Active set completion renders immediately" spec.
- Removing `+` and `-` buttons is covered by Task 4 and the "Set rows use simplified input controls" spec.
- Newly added exercise flow is covered by Task 5 and the "Newly added exercise becomes actionable" spec.
- Visual/touch target bugs are covered by Task 4 and Task 7.
- Verification is covered by Task 8 and Task 9.

Placeholder scan:

- No `TBD`, `TODO`, "implement later", or "add appropriate" placeholders are used.
- Each code-changing task includes exact code snippets or exact replacements.
- Each test task includes concrete assertions and commands.

Type consistency:

- `WorkoutExerciseCardProps` removes `increment`, and Task 4 removes the prop from `active.tsx` and `SetRow`.
- `SetRowProps` removes `increment`; tests use the new prop shape.
- Comparator names are consistent: `areWorkoutExerciseCardPropsEqual` and `areSetRowPropsEqual`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-30-active-workout-audit-openspec-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
