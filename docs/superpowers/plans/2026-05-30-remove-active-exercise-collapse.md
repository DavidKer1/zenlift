# Remove Active Exercise Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the per-exercise collapse/minimize system from Active Workout and replace it with a low-cost static opacity treatment for exercises whose sets are complete.

**Architecture:** Exercise cards become always-expanded, data-driven rows inside the existing FlashList. Completion is derived from set state with a pure helper, then applied as static per-component opacity so controls remain mounted, editable, and uncheckable without extra animation work. The workout-level minimized modal/header stays unchanged; this plan only removes the individual exercise collapse system.

**Tech Stack:** Expo SDK 55 (`expo ~55.0.26`), React Native 0.83, React 19, FlashList 2, Zustand, Jest, Playwright.

---

## Context Notes

- Expo docs checked through Context7: `/websites/expo_dev_versions_v55_0_0`. Standard React Native `style` props on `View`/`Pressable` are appropriate for this change; no Expo-specific filter or animation API is needed.
- `.graphify/GRAPH_REPORT.md` is stale: graph built from `1d9f588`, current HEAD is `ff09e8a2068efcd205b5c42843f46fe7a03d2156`. Use direct file inspection for this change.
- Current collapse state lives in both `src/app/workout/active.tsx` and `src/components/workout/ActiveWorkoutModal.tsx` as `expandedExerciseId`, `handleToggleExercise`, first-exercise auto-expand, and auto-expand-next-on-complete.
- Current exercise collapse rendering lives in `src/components/workout/WorkoutExerciseCard.tsx` through `isExpanded`, `onToggle`, a header `Pressable`, a chevron, and conditional rendering of `expandedContent`.
- Keep the workout modal minimize/expand system in `ActiveWorkoutModal` and `ActiveWorkoutExpandedSurface`. The user asked about minimizing an exercise, not minimizing the whole workout overlay.

## File Structure

- Modify: `openspec/changes/remove-active-exercise-collapse/proposal.md`  
  Describes the UX bug and the always-expanded/completed-opacity change.
- Modify: `openspec/changes/remove-active-exercise-collapse/design.md`  
  Records the lightweight rendering approach and non-goals.
- Modify: `openspec/changes/remove-active-exercise-collapse/tasks.md`  
  Tracks implementation and verification tasks.
- Modify: `openspec/changes/remove-active-exercise-collapse/specs/active-workout-screen/spec.md`  
  Adds requirements for always-visible exercise rows and completed opacity treatment.
- Modify: `src/components/workout/WorkoutExerciseCard.tsx`  
  Removes per-card expand/collapse props, exports completion helper, always renders sets, and applies static completed opacity.
- Modify: `src/app/workout/active.tsx`  
  Removes `expandedExerciseId` state and auto-expand behavior from the standalone active workout route.
- Modify: `src/components/workout/ActiveWorkoutModal.tsx`  
  Removes per-exercise collapse state from the modal active workout surface while keeping workout-level minimize.
- Modify: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`  
  Updates card prop factory and adds completion helper coverage.
- Modify: `e2e/playwright/core-loop.spec.ts`  
  Keeps the smoke path focused on visible set logging; no expand clicks should be required.

---

### Task 1: Create OpenSpec Change

**Files:**
- Create: `openspec/changes/remove-active-exercise-collapse/proposal.md`
- Create: `openspec/changes/remove-active-exercise-collapse/design.md`
- Create: `openspec/changes/remove-active-exercise-collapse/tasks.md`
- Create: `openspec/changes/remove-active-exercise-collapse/specs/active-workout-screen/spec.md`

- [ ] **Step 1: Create the OpenSpec folders**

Run:

```bash
mkdir -p openspec/changes/remove-active-exercise-collapse/specs/active-workout-screen
```

Expected: command exits with status `0`.

- [ ] **Step 2: Add proposal**

Write `openspec/changes/remove-active-exercise-collapse/proposal.md` with:

```markdown
# Remove Active Exercise Collapse

## Why

The Active Workout exercise card collapse/minimize behavior feels inconsistent while logging sets. It can hide newly relevant controls, compete with automatic scrolling, and adds state that is not necessary for the core gym flow.

## What Changes

- Remove per-exercise expand/collapse from Active Workout.
- Always render every exercise card's set rows and add-set control.
- Visually de-emphasize exercises only when all of their sets are complete.
- Use static React Native opacity styles, not blur, filters, timers, or animations.
- Keep completed exercises editable: users can uncheck sets, edit weight/reps, and add more sets.

## Impact

- Active Workout route and active workout modal card rendering become simpler.
- Tests must assert completion state is derived from set data, not from collapse state.
- The workout-level minimized overlay remains unchanged.
```

- [ ] **Step 3: Add design**

Write `openspec/changes/remove-active-exercise-collapse/design.md` with:

```markdown
# Design: Remove Active Exercise Collapse

## Current Problem

`WorkoutExerciseCard` receives `isExpanded` and `onToggle`, then conditionally renders set rows. Both active workout entry points maintain `expandedExerciseId`, auto-expand the first exercise, and auto-expand the next exercise when all sets are complete. That state is extra work for a flow whose fastest path is seeing and logging sets immediately.

## Proposed Design

Exercise cards are always expanded. Completion is derived locally:

```ts
export function isWorkoutExerciseComplete(exercise: WorkoutExerciseWithSets): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.is_completed === 1);
}
```

When an exercise is complete, the card applies a static opacity style to non-structural content. The card remains mounted and interactive. The check button remains pressable so a completed set can be unchecked.

## Visual Treatment

- Use `opacity: 0.58` as a single static style for completed exercise content.
- Keep the card border, add-set button, and touch targets active.
- Keep the completion counter visible and add a textual `Completado` badge so completion is not communicated by opacity alone.
- Do not use `BlurView`, gradients, Reanimated, timers, or layout animation for this state.

## Non-Goals

- Do not remove the workout-level minimized header/modal behavior.
- Do not change set persistence, finish workout validation, or rest timer behavior.
- Do not introduce a new global UI state for completed exercises.
```

- [ ] **Step 4: Add tasks**

Write `openspec/changes/remove-active-exercise-collapse/tasks.md` with:

```markdown
# Tasks

## 1. OpenSpec

- [ ] 1.1 Add proposal, design, tasks, and delta spec for removing per-exercise collapse.

## 2. Tests First

- [ ] 2.1 Add tests for exercise completion derivation.
- [ ] 2.2 Update exercise card memoization test helpers to remove collapse props.

## 3. Exercise Card

- [ ] 3.1 Remove `isExpanded` and `onToggle` from `WorkoutExerciseCardProps`.
- [ ] 3.2 Always render set rows and the add-set control.
- [ ] 3.3 Remove the chevron and header tap-to-collapse behavior.
- [ ] 3.4 Apply static completed opacity and a `Completado` badge.

## 4. Active Workout Screens

- [ ] 4.1 Remove `expandedExerciseId` state and first-exercise auto-expand from `src/app/workout/active.tsx`.
- [ ] 4.2 Remove auto-expand-next-on-complete from `src/app/workout/active.tsx`.
- [ ] 4.3 Remove per-exercise collapse state from `src/components/workout/ActiveWorkoutModal.tsx`.
- [ ] 4.4 Keep add-exercise scroll-to-new-card behavior.

## 5. Verification

- [ ] 5.1 Run focused Jest tests.
- [ ] 5.2 Run typecheck.
- [ ] 5.3 Run lint and document any pre-existing unrelated failures separately.
- [ ] 5.4 Run or update Playwright active workout smoke.
```

- [ ] **Step 5: Add delta spec**

Write `openspec/changes/remove-active-exercise-collapse/specs/active-workout-screen/spec.md` with:

```markdown
## ADDED Requirements

### Requirement: Active workout exercise cards remain expanded

Active workout exercise cards SHALL render their set rows and add-set control without requiring an exercise-level expand/collapse action.

#### Scenario: User opens an active workout with exercises

- **WHEN** the Active Workout screen or modal renders exercises
- **THEN** each exercise card shows its set rows immediately
- **AND** the user can edit weight/reps and complete/uncomplete sets without expanding the exercise

#### Scenario: User adds an exercise during an active workout

- **WHEN** the user adds an exercise from the picker
- **THEN** the new exercise appears with its set rows visible
- **AND** the app may scroll to the new exercise
- **AND** no expand state is required to make the exercise actionable

### Requirement: Completed exercises are de-emphasized without disabling actions

When all sets in an exercise are completed, the active workout UI SHALL visually de-emphasize the exercise with a static opacity treatment while keeping all controls interactive.

#### Scenario: All sets in an exercise are completed

- **WHEN** every set for an exercise has `is_completed = 1`
- **THEN** the exercise card shows a completed visual treatment
- **AND** the visual treatment uses static component opacity rather than blur, filters, timers, or animations
- **AND** the user can still uncheck sets, edit values, and add a set

#### Scenario: A completed exercise is unchecked

- **WHEN** the user unchecks one completed set in a completed exercise
- **THEN** the completed visual treatment is removed
- **AND** the exercise remains fully visible and editable
```

- [ ] **Step 6: Commit OpenSpec artifacts**

Run:

```bash
git add openspec/changes/remove-active-exercise-collapse
git commit -m "spec: propose active exercise collapse removal"
```

Expected: commit succeeds. If this repository is intentionally keeping changes uncommitted, skip the commit and leave the files staged or unstaged according to the current workflow.

---

### Task 2: Add Failing Completion Tests

**Files:**
- Modify: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`
- Test: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`

- [ ] **Step 1: Update imports**

Replace the import from `WorkoutExerciseCard` in `src/components/workout/__tests__/activeWorkoutRenderState.test.ts` with:

```ts
import {
  areWorkoutExerciseCardPropsEqual,
  isWorkoutExerciseComplete,
  type WorkoutExerciseCardProps,
} from '@/components/workout/WorkoutExerciseCard';
```

- [ ] **Step 2: Remove collapse props from the test factory**

Replace `makeCardProps` with:

```ts
function makeCardProps(
  exercise: WorkoutExerciseWithSets,
  overrides: Partial<WorkoutExerciseCardProps> = {},
): WorkoutExerciseCardProps {
  return {
    exercise,
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
```

- [ ] **Step 3: Add completion helper tests**

Add this block inside the existing `describe('active workout render memoization', () => { ... })`:

```ts
  it('does not treat an exercise with no sets as complete', () => {
    expect(isWorkoutExerciseComplete(makeWorkoutExercise([]))).toBe(false);
  });

  it('treats an exercise as complete when every set is completed', () => {
    const exercise = makeWorkoutExercise([
      makeSet({ id: 'set-1', is_completed: 1 }),
      makeSet({ id: 'set-2', set_number: 2, is_completed: 1 }),
    ]);

    expect(isWorkoutExerciseComplete(exercise)).toBe(true);
  });

  it('treats an exercise as incomplete when one set is unchecked', () => {
    const exercise = makeWorkoutExercise([
      makeSet({ id: 'set-1', is_completed: 1 }),
      makeSet({ id: 'set-2', set_number: 2, is_completed: 0 }),
    ]);

    expect(isWorkoutExerciseComplete(exercise)).toBe(false);
  });
```

- [ ] **Step 4: Run the failing test**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts
```

Expected: FAIL with a TypeScript/Jest error that `isWorkoutExerciseComplete` is not exported, or with prop type errors because `WorkoutExerciseCardProps` still requires `isExpanded` and `onToggle`.

---

### Task 3: Make WorkoutExerciseCard Always Expanded

**Files:**
- Modify: `src/components/workout/WorkoutExerciseCard.tsx`
- Test: `src/components/workout/__tests__/activeWorkoutRenderState.test.ts`

- [ ] **Step 1: Remove collapse props from the card type**

In `WorkoutExerciseCardProps`, remove:

```ts
  isExpanded: boolean;
  onToggle: (exerciseId: string) => void;
```

The type should now begin:

```ts
export type WorkoutExerciseCardProps = {
  exercise: WorkoutExerciseWithSets;
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

- [ ] **Step 2: Add the completion helper**

Add this after `getSetRenderSignature`:

```ts
export function isWorkoutExerciseComplete(exercise: WorkoutExerciseWithSets): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.is_completed === 1);
}
```

- [ ] **Step 3: Remove collapse from the comparator**

Replace `areWorkoutExerciseCardPropsEqual` with:

```ts
export function areWorkoutExerciseCardPropsEqual(
  prev: WorkoutExerciseCardProps,
  next: WorkoutExerciseCardProps,
): boolean {
  return (
    prev.exercise.id === next.exercise.id &&
    prev.exercise.exercise?.id === next.exercise.exercise?.id &&
    prev.exercise.exercise?.name === next.exercise.exercise?.name &&
    getSetRenderSignature(prev.exercise) === getSetRenderSignature(next.exercise) &&
    prev.unit === next.unit &&
    prev.previousPerformance?.weight === next.previousPerformance?.weight &&
    prev.previousPerformance?.reps === next.previousPerformance?.reps &&
    prev.primaryMuscleName === next.primaryMuscleName &&
    prev.primaryMuscleColor === next.primaryMuscleColor
  );
}
```

- [ ] **Step 4: Remove collapse props from the component signature**

Replace the start of `WorkoutExerciseCardComponent` with:

```ts
function WorkoutExerciseCardComponent({
  exercise,
  onAddSet,
  onCompleteSet,
  onWeightChange,
  onRepsChange,
  unit,
  previousPerformance,
  primaryMuscleName,
  primaryMuscleColor,
}: WorkoutExerciseCardProps) {
```

- [ ] **Step 5: Compute completed visual state**

After `const totalSets = sortedSets.length;`, add:

```ts
  const isExerciseComplete = isWorkoutExerciseComplete(exercise);
  const completedContentStyle = isExerciseComplete ? styles.completedContent : null;
```

- [ ] **Step 6: Remove the header toggle callback**

Delete this block:

```ts
  const handleHeaderPress = useCallback(() => {
    onToggle(exercise.id);
  }, [exercise.id, onToggle]);
```

- [ ] **Step 7: Replace the header Pressable with a non-collapsing View**

Replace the `<Pressable ...>` header opening block with:

```tsx
      <View
        accessibilityLabel={`${exercise.exercise?.name ?? 'Ejercicio'}, ${completedCount}/${totalSets} sets completados`}
        testID={`active-workout-exercise-${exercise.id}-header`}
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            padding: spacing.three,
          },
        ]}
      >
```

Replace the matching `</Pressable>` closing tag for the header with:

```tsx
      </View>
```

- [ ] **Step 8: Apply static opacity to content, not layout**

Replace:

```tsx
        <View style={styles.headerContent}>
```

with:

```tsx
        <View style={[styles.headerContent, completedContentStyle]}>
```

Replace:

```tsx
          <View style={styles.headerRight}>
```

with:

```tsx
          <View style={styles.headerRight}>
            {isExerciseComplete ? (
              <ThemedText
                type="small"
                style={[styles.completedBadge, { color: colors.success }]}
              >
                Completado
              </ThemedText>
            ) : null}
```

- [ ] **Step 9: Remove the chevron**

Delete this block:

```tsx
            <ThemedText
              style={{
                fontSize: 14,
                color: colors.mutedText,
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            >
              ▼
            </ThemedText>
```

- [ ] **Step 10: Always render expanded content**

Replace:

```tsx
      {isExpanded ? (
        <View style={styles.expandedContent}>
```

with:

```tsx
      <View style={styles.expandedContent}>
```

Replace the matching final conditional close:

```tsx
        </View>
      ) : null}
```

with:

```tsx
      </View>
```

- [ ] **Step 11: De-emphasize the set area**

Replace:

```tsx
          <View
            style={[
              styles.setHeaderRow,
```

with:

```tsx
          <View
            style={[
              styles.setHeaderRow,
              completedContentStyle,
```

Wrap the mapped set rows with a completed-content container by replacing:

```tsx
          {sortedSets.map((set) => {
```

with:

```tsx
          <View style={completedContentStyle}>
            {sortedSets.map((set) => {
```

Replace the end of the mapped block:

```tsx
          })}
```

with:

```tsx
            })}
          </View>
```

- [ ] **Step 12: Add opacity styles**

Add these styles to the `StyleSheet.create` object:

```ts
  completedBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedContent: {
    opacity: 0.58,
  },
```

- [ ] **Step 13: Run focused test**

Run:

```bash
pnpm test -- src/components/workout/__tests__/activeWorkoutRenderState.test.ts
```

Expected: PASS.

---

### Task 4: Remove Per-Exercise Collapse State From Active Workout Route

**Files:**
- Modify: `src/app/workout/active.tsx`
- Test: `pnpm typecheck`

- [ ] **Step 1: Remove unused React state import**

Keep `useState` because other state is still used. No import removal is needed in this file.

- [ ] **Step 2: Delete the expanded exercise state**

Delete:

```ts
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
```

- [ ] **Step 3: Delete first-exercise auto-expand**

Delete this effect:

```ts
  useEffect(() => {
    if (exercises.length > 0 && expandedExerciseId === null) {
      setExpandedExerciseId(exercises[0].id);
    }
  }, [exercises, expandedExerciseId]);
```

- [ ] **Step 4: Delete the toggle callback**

Delete:

```ts
  const handleToggleExercise = useCallback((exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }, []);
```

- [ ] **Step 5: Simplify set completion**

Replace `handleCompleteSet` with:

```ts
  const handleCompleteSet = useCallback(
    async (exerciseId: string, setId: string) => {
      await completeSet(exerciseId, setId);
    },
    [completeSet],
  );
```

- [ ] **Step 6: Keep add-exercise scroll, remove expansion**

Inside `handleExerciseSelected`, delete:

```ts
        setExpandedExerciseId(addedExercise.id);
```

Replace this catch comment:

```ts
              // FlashList may not have measured the new row yet; expansion still makes it actionable.
```

with:

```ts
              // FlashList may not have measured the new row yet; the card is still visible in the list.
```

- [ ] **Step 7: Remove collapse props from renderItem**

Replace the `WorkoutExerciseCard` usage in `renderItem` with:

```tsx
      <WorkoutExerciseCard
        exercise={item}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        unit={weightUnit}
        previousPerformance={prevPerfMap.get(item.id) ?? null}
      />
```

- [ ] **Step 8: Update renderItem dependencies**

Replace the dependency array for `renderItem` with:

```ts
    [
      handleAddSet,
      handleCompleteSet,
      handleWeightChange,
      handleRepsChange,
      weightUnit,
      prevPerfMap,
    ],
```

- [ ] **Step 9: Typecheck route changes**

Run:

```bash
pnpm typecheck
```

Expected: PASS, or only failures from unrelated files already outside this change.

---

### Task 5: Remove Per-Exercise Collapse State From Active Workout Modal

**Files:**
- Modify: `src/components/workout/ActiveWorkoutModal.tsx`
- Test: `pnpm typecheck`

- [ ] **Step 1: Delete per-exercise expanded state**

Delete:

```ts
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
```

- [ ] **Step 2: Delete first-exercise auto-expand effect**

Delete:

```ts
  // ---- Auto-expand first exercise ----
  useEffect(() => {
    if (exercises.length > 0 && expandedExerciseId === null) {
      setExpandedExerciseId(exercises[0].id);
    }
  }, [exercises, expandedExerciseId]);
```

- [ ] **Step 3: Delete exercise toggle callback**

Delete:

```ts
  const handleToggleExercise = useCallback((exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }, []);
```

- [ ] **Step 4: Simplify set completion**

Replace `handleCompleteSet` with:

```ts
  const handleCompleteSet = useCallback(
    async (exerciseId: string, setId: string) => {
      await completeSet(exerciseId, setId);
    },
    [completeSet],
  );
```

- [ ] **Step 5: Keep add-exercise scroll, remove expansion**

Inside `handleExerciseSelected`, delete:

```ts
        setExpandedExerciseId(addedExercise.id);
```

Replace this catch comment:

```ts
              // FlashList may not have measured the new row yet; expansion still makes it actionable.
```

with:

```ts
              // FlashList may not have measured the new row yet; the card is still visible in the list.
```

- [ ] **Step 6: Remove collapse props from modal renderItem**

Replace the `WorkoutExerciseCard` usage in `renderItem` with:

```tsx
      <WorkoutExerciseCard
        exercise={item}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        unit={weightUnit}
        previousPerformance={prevPerfMap.get(item.id) ?? null}
      />
```

- [ ] **Step 7: Update renderItem dependencies**

Replace the dependency array for modal `renderItem` with:

```ts
    [
      handleAddSet, handleCompleteSet, handleWeightChange, handleRepsChange,
      weightUnit, prevPerfMap,
    ],
```

- [ ] **Step 8: Typecheck modal changes**

Run:

```bash
pnpm typecheck
```

Expected: PASS, or only failures from unrelated files already outside this change.

---

### Task 6: Update Smoke Test Assumptions

**Files:**
- Modify: `e2e/playwright/core-loop.spec.ts`
- Test: `e2e/playwright/core-loop.spec.ts`

- [ ] **Step 1: Search for exercise header expand wiring**

Run:

```bash
rg "active-workout-exercise-.*header|isExpanded|expandedExerciseId|onToggle" e2e src/components src/app
```

Expected after implementation:

```text
src/components/workout/WorkoutExerciseCard.tsx:testID={`active-workout-exercise-${exercise.id}-header`}
```

The search must not show `isExpanded`, `expandedExerciseId`, or `onToggle` in active workout card wiring.

- [ ] **Step 2: Keep visible set assertions**

In `e2e/playwright/core-loop.spec.ts`, keep or add assertions that completed set labels remain visible without expanding an exercise:

```ts
await expect(page.getByLabel(/Set 1 completado/).first()).toBeVisible();
await expect(page.getByLabel(/Set 2 completado/).first()).toBeVisible();
```

- [ ] **Step 3: Add no-collapse regression assertion**

After this line:

```ts
await expect(page.getByLabel('Finalizar entrenamiento')).toBeVisible();
```

add:

```ts
await expect(page.getByLabel('Agregar set').first()).toBeVisible();
```

Expected: the add-set control is visible immediately.

- [ ] **Step 4: Run Playwright smoke when web server is available**

Run:

```bash
pnpm test:agent:web
```

Expected: PASS. If Expo web prompts for a port or the local server cannot start non-interactively, record the exact prompt/error in the implementation notes and rely on Jest/typecheck plus manual app smoke.

---

### Task 7: Final Verification And OpenSpec Task Checkoff

**Files:**
- Modify: `openspec/changes/remove-active-exercise-collapse/tasks.md`

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

Expected: PASS for files touched by this change. Current known unrelated risk: lint may still report `src/i18n/__tests__/locales.test.ts` cannot resolve `@/i18n/locales`; do not fix that in this change unless the user explicitly asks.

- [ ] **Step 4: Manual smoke on device or Expo preview**

Manual steps:

```text
1. Start or recover an active workout with at least two exercises.
2. Confirm every exercise shows set rows immediately.
3. Complete all sets in the first exercise.
4. Confirm the completed exercise becomes visually de-emphasized and shows "Completado".
5. Tap the completed check on one set again.
6. Confirm the set becomes unchecked and the completed visual treatment is removed.
7. Add a set to the same exercise.
8. Confirm the new set is visible immediately and editable.
9. Add a new exercise.
10. Confirm the new exercise appears with set rows visible and no expand tap is required.
11. Minimize the whole active workout modal.
12. Confirm the workout-level minimized header still works.
```

Expected: all steps pass.

- [ ] **Step 5: Check off OpenSpec tasks**

After verification, update `openspec/changes/remove-active-exercise-collapse/tasks.md` so completed items use checked boxes:

```markdown
- [x] 1.1 Add proposal, design, tasks, and delta spec for removing per-exercise collapse.
- [x] 2.1 Add tests for exercise completion derivation.
- [x] 2.2 Update exercise card memoization test helpers to remove collapse props.
- [x] 3.1 Remove `isExpanded` and `onToggle` from `WorkoutExerciseCardProps`.
- [x] 3.2 Always render set rows and the add-set control.
- [x] 3.3 Remove the chevron and header tap-to-collapse behavior.
- [x] 3.4 Apply static completed opacity and a `Completado` badge.
- [x] 4.1 Remove `expandedExerciseId` state and first-exercise auto-expand from `src/app/workout/active.tsx`.
- [x] 4.2 Remove auto-expand-next-on-complete from `src/app/workout/active.tsx`.
- [x] 4.3 Remove per-exercise collapse state from `src/components/workout/ActiveWorkoutModal.tsx`.
- [x] 4.4 Keep add-exercise scroll-to-new-card behavior.
- [x] 5.1 Run focused Jest tests.
- [x] 5.2 Run typecheck.
- [x] 5.3 Run lint and document any pre-existing unrelated failures separately.
- [x] 5.4 Run or update Playwright active workout smoke.
```

- [ ] **Step 6: Commit implementation**

Run:

```bash
git add openspec/changes/remove-active-exercise-collapse src/components/workout/WorkoutExerciseCard.tsx src/components/workout/__tests__/activeWorkoutRenderState.test.ts src/app/workout/active.tsx src/components/workout/ActiveWorkoutModal.tsx e2e/playwright/core-loop.spec.ts
git commit -m "fix: remove active exercise collapse"
```

Expected: commit succeeds. If this workspace is intentionally accumulating uncommitted OpenSpec work, leave the final commit to the user and report the exact changed files instead.

---

## Self-Review

- Spec coverage: The plan covers always-expanded exercise cards, completed opacity, unchecking completed exercises, add-exercise visibility, and preserving workout-level minimize.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: `WorkoutExerciseCardProps` no longer includes `isExpanded` or `onToggle`; active route and modal render snippets match that shape; completion helper name is consistent across test and implementation.
