# Routines Screen Bottom Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Rutinas empty screen so bottom content remains reachable and the “Crear primera rutina” CTA opens `/routine/create`.

**Architecture:** Keep the change inside the existing Expo Router + custom tab shell. The Routines screen will use the existing bottom-tab height helper to derive scroll padding and floating control positions, and the empty state will become a real vertical `ScrollView` instead of a fixed `View`.

**Tech Stack:** Expo SDK 55 (`expo-router`, `expo-router/ui`), React Native 0.83, `react-native-safe-area-context`, FlashList, Playwright mobile web smoke tests.

---

## Context Notes

- Project Expo version is `~55.0.26`, matching the project rule to use Expo SDK 55 docs.
- Context7 Expo docs confirm `router.push('/root/settings/media')` and `router.push({ pathname: '/account/settings', params })` are current supported patterns for nested route navigation.
- `.graphify/GRAPH_REPORT.md` is stale: it was built from commit `1d9f588`, while current `HEAD` is `ff09e8a2068efcd205b5c42843f46fe7a03d2156`. Do not rely on graph answers for final verification unless rebuilt.
- Current culprit files:
  - `src/app/routines.tsx`: `emptyScroll` is a fixed `View`, not a scroll container; bottom padding and floating offsets are hardcoded.
  - `src/components/ui/FAB.tsx`: supports a `style` override, so the screen can pass a safe bottom offset without changing the shared component.
  - `e2e/playwright/core-loop.spec.ts`: already owns the core mobile web smoke flow and can cover this regression.

## File Structure

- Modify `src/app/routines.tsx`
  - Import `ScrollView`, `useSafeAreaInsets`, and `getBottomTabBarHeight`.
  - Compute bottom tab height once per render.
  - Replace the empty-state fixed `View` with a vertical `ScrollView`.
  - Replace hardcoded bottom offsets for content, undo bar, error message, and FAB with derived offsets.
  - Use Expo Router’s documented path navigation for `/routine/create`.

- Modify `e2e/playwright/core-loop.spec.ts`
  - Add a regression test that completes/skips onboarding, opens Rutinas, scrolls the empty state bottom content into view, clicks “Crear primera rutina”, and asserts the create form is visible.

---

### Task 1: Add Failing Regression Coverage

**Files:**
- Modify: `e2e/playwright/core-loop.spec.ts`

- [ ] **Step 1: Add the failing Playwright test**

Add this test after `completeOnboardingIfNeeded` and before the existing `agent mobile smoke completes the workout core loop` test:

```ts
test('routines empty state opens routine creation and keeps bottom content reachable', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await completeOnboardingIfNeeded(page);

  await page.getByLabel('Rutinas').click();
  await expect(page.getByText('Mis Rutinas')).toBeVisible();
  await expect(page.getByLabel('Crear primera rutina')).toBeVisible();

  const templatesHeading = page.getByText('Plantillas sugeridas');
  await templatesHeading.scrollIntoViewIfNeeded();
  await expect(templatesHeading).toBeVisible();

  const headingBox = await templatesHeading.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(headingBox!.y).toBeGreaterThanOrEqual(0);

  await page.getByLabel('Crear primera rutina').click();

  await expect(page).toHaveURL(/\/routine\/create/);
  await expect(page.getByLabel('Nombre de la rutina')).toBeVisible();
});
```

- [ ] **Step 2: Run the focused Playwright test and verify it fails**

Run:

```bash
pnpm test:agent:web -- --grep "routines empty state"
```

Expected before the fix:

```text
FAIL e2e/playwright/core-loop.spec.ts
Error: expect(page).toHaveURL(/\/routine\/create/) failed
```

or:

```text
FAIL e2e/playwright/core-loop.spec.ts
Error: locator.scrollIntoViewIfNeeded: element is outside of the visible viewport / target not actionable
```

If the first failure is onboarding timing instead, keep the test and continue; the implementation still targets the Rutinas scroll/navigation regression.

- [ ] **Step 3: Commit the failing test**

```bash
git add e2e/playwright/core-loop.spec.ts
git commit -m "test: cover routines empty state create CTA"
```

---

### Task 2: Fix Routines Empty-State Layout And CTA Navigation

**Files:**
- Modify: `src/app/routines.tsx`

- [ ] **Step 1: Update imports and route constants**

In `src/app/routines.tsx`, replace the React Native import and add the layout/safe-area imports:

```ts
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBottomTabBarHeight } from '@/constants/layout';
```

Replace the route constant with these constants:

```ts
const CREATE_ROUTINE_ROUTE = '/routine/create';
const FLOATING_ACTION_SIZE = 60;
const FLOATING_STACK_GAP = 12;
```

- [ ] **Step 2: Compute safe bottom offsets in `RoutinesScreen`**

Inside `RoutinesScreen`, immediately after `const { colors, radius, spacing } = useZenliftTheme();`, add:

```ts
const insets = useSafeAreaInsets();
const bottomTabBarHeight = getBottomTabBarHeight(insets.bottom);
const floatingBottomOffset = bottomTabBarHeight + spacing.three;
const floatingMessageBottomOffset =
  floatingBottomOffset + FLOATING_ACTION_SIZE + FLOATING_STACK_GAP;
const contentBottomPadding =
  bottomTabBarHeight + FLOATING_ACTION_SIZE + spacing.five;
```

- [ ] **Step 3: Use documented Expo Router path navigation**

Replace `navigateToCreate` with:

```ts
const navigateToCreate = useCallback(() => {
  router.push(CREATE_ROUTINE_ROUTE);
}, []);
```

Keep template navigation as a pathname object, but remove the route constant from the object so the target is explicit:

```ts
const handleTemplatePress = useCallback((template: SuggestedRoutineTemplate) => {
  router.push({
    pathname: '/routine/create',
    params: { template: template.id },
  } as never);
}, []);
```

- [ ] **Step 4: Replace the empty-state fixed view with a scroll view**

Replace the full `showEmptyState ? (...) : (...)` block inside `SafeAreaView` with this version:

```tsx
{showEmptyState ? (
  <ScrollView
    contentContainerStyle={[
      styles.emptyContent,
      {
        paddingBottom: contentBottomPadding,
      },
    ]}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    style={styles.emptyScroll}>
    <View style={[styles.header, { paddingHorizontal: spacing.four }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Mis Rutinas
      </ThemedText>
      <ThemedText themeColor="mutedText">
        Guarda tus plantillas para empezar workouts sin pensar de más.
      </ThemedText>
    </View>
    <EmptyState onCreatePress={navigateToCreate} />
    <SuggestedTemplates onTemplatePress={handleTemplatePress} />
  </ScrollView>
) : (
  <RoutineFlashList
    contentContainerStyle={{
      paddingBottom: contentBottomPadding,
      paddingHorizontal: spacing.four,
    }}
    data={routines}
    estimatedItemSize={80}
    keyExtractor={keyExtractor}
    ListEmptyComponent={
      <View style={[styles.loadingState, { paddingTop: spacing.six }]}>
        <ThemedText themeColor="mutedText">
          {isLoading ? 'Cargando rutinas...' : 'No hay rutinas activas.'}
        </ThemedText>
      </View>
    }
    ListHeaderComponent={renderListHeader}
    renderItem={renderRoutine}
    showsVerticalScrollIndicator={false}
  />
)}
```

- [ ] **Step 5: Apply safe offsets to floating messages and FAB**

In the `inlineMessage` style array, add a `bottom` value:

```tsx
{
  borderColor: colors.danger,
  borderRadius: radius.md,
  bottom: floatingMessageBottomOffset,
  marginHorizontal: spacing.four,
}
```

In the `undoBar` style array, add a `bottom` value:

```tsx
{
  borderColor: colors.border,
  borderRadius: radius.md,
  bottom: floatingMessageBottomOffset,
  marginHorizontal: spacing.four,
}
```

Replace the FAB render with:

```tsx
<FAB onPress={navigateToCreate} style={{ bottom: floatingBottomOffset }} />
```

- [ ] **Step 6: Remove hardcoded bottom offsets from styles**

Update the relevant styles at the bottom of `src/app/routines.tsx`:

```ts
emptyScroll: {
  flex: 1,
},
emptyContent: {
  gap: 20,
},
inlineMessage: {
  borderWidth: 1,
  left: 0,
  paddingHorizontal: 16,
  paddingVertical: 12,
  position: 'absolute',
  right: 0,
  zIndex: 25,
},
undoBar: {
  alignItems: 'center',
  borderWidth: 1,
  flexDirection: 'row',
  gap: 12,
  justifyContent: 'space-between',
  left: 0,
  minHeight: 52,
  paddingHorizontal: 16,
  position: 'absolute',
  right: 0,
  zIndex: 30,
},
```

Delete the old `paddingBottom: 188` from `emptyScroll`, and delete `bottom: 174` / `bottom: 104` from `inlineMessage` and `undoBar`.

- [ ] **Step 7: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected:

```text
Exit code 0
```

If TypeScript rejects `router.push(CREATE_ROUTINE_ROUTE)`, replace the route call with the current object form:

```ts
router.push({ pathname: '/routine/create' } as never);
```

Then run `pnpm typecheck` again and expect exit code 0.

- [ ] **Step 8: Run the focused regression test**

Run:

```bash
pnpm test:agent:web -- --grep "routines empty state"
```

Expected:

```text
1 passed
```

- [ ] **Step 9: Commit the layout/navigation fix**

```bash
git add src/app/routines.tsx
git commit -m "fix: keep routines empty state actionable"
```

---

### Task 3: Verify The Core Loop Did Not Regress

**Files:**
- No source changes expected.

- [ ] **Step 1: Run the routine form unit tests**

Run:

```bash
pnpm test -- src/features/routine/routineFormSchema.test.ts
```

Expected:

```text
PASS src/features/routine/routineFormSchema.test.ts
```

- [ ] **Step 2: Run the full Playwright core-loop smoke**

Run:

```bash
pnpm test:agent:web
```

Expected:

```text
2 passed
```

The exact count may be higher if other Playwright tests are added later; the key expectation is no failures.

- [ ] **Step 3: Run final static checks**

Run:

```bash
pnpm typecheck
```

Expected:

```text
Exit code 0
```

- [ ] **Step 4: Commit final verification notes only if files changed**

If no files changed during verification, do not commit. If Playwright snapshots, traces, or reports were created, keep them untracked unless the project already tracks them.

---

## Self-Review

- Spec coverage:
  - Bottom of Rutinas not fully visible: covered by Task 2 converting empty state to `ScrollView` and deriving `contentBottomPadding` from the actual bottom tab height.
  - “Crear primera rutina” opens nothing: covered by Task 1 regression test and Task 2 documented `router.push` path navigation.
  - No product-scope expansion: only the core routine creation loop is touched.

- Placeholder scan:
  - No placeholder markers or vague catch-all steps remain.

- Type consistency:
  - `CREATE_ROUTINE_ROUTE`, `FLOATING_ACTION_SIZE`, `FLOATING_STACK_GAP`, `floatingBottomOffset`, `floatingMessageBottomOffset`, and `contentBottomPadding` are defined before use.
  - `style={{ bottom: floatingBottomOffset }}` is valid because `FAB` already accepts a `ViewStyle` override.
