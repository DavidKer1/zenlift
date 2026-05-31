# Exercise Library Seed Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Ejercicios section render the seeded exercise library even when an existing local SQLite database has only partially seeded reference data.

**Architecture:** Keep the fix inside the local-first SQLite startup path so every screen that depends on exercises benefits from the same repair. `getDatabase()` already runs migrations and then seed logic; update the seed guard to inspect all exercise reference tables instead of only `muscle_groups`. Add one Playwright regression that opens the Ejercicios tab and expects known seed exercises to be visible.

**Tech Stack:** Expo SDK 55, Expo Router, React Native, TypeScript, expo-sqlite async APIs, Jest, Playwright.

---

## Context And Findings

- Project docs read: `docs/README.md`, `docs/ux_workflows.md`, `docs/architecture.md`, `docs/data_model.md`.
- Expo docs checked through Context7 for `/websites/expo_dev_versions_v55_0_0`; installed `expo` is `~55.0.26`, so it matches the project rule to use Expo SDK 55 docs.
- `.graphify/needs_update` is absent, but `.graphify/GRAPH_REPORT.md` was built from commit `1d9f588`; current `HEAD` is `b8023d9b343994f55b4a30c37db4d6f4737f2127`, so use graph results only as orientation.
- Likely cause: `src/storage/repositories/seedData.ts` only runs `seedDatabase()` when `muscle_groups` count is `0`. If a developer/user database already has muscle groups but has `0` exercises or missing `exercise_muscles`, the Exercise Library loads successfully but displays `No se encontraron ejercicios`.
- Adjacent issue found but not fixed by this plan: `src/app/exercise/index.tsx` routes the FAB to `/exercise/create`, and `src/app/exercise/[id].tsx` routes edit to `/exercise/edit/[id]`; those route files do not currently exist. This plan focuses on the blank library first.

## File Structure

- Modify: `src/storage/repositories/seedData.ts`
  - Responsibility: seed and repair reference data for `muscle_groups`, `exercises`, and `exercise_muscles`.
- Modify: `src/storage/repositories/__tests__/seedData.test.ts`
  - Responsibility: prove partially seeded databases are repaired and complete databases are left alone.
- Modify: `e2e/playwright/core-loop.spec.ts`
  - Responsibility: smoke-test that the Ejercicios tab renders seeded exercises after onboarding.

---

### Task 1: Add Failing Seed Recovery Tests

**Files:**
- Modify: `src/storage/repositories/__tests__/seedData.test.ts`

- [ ] **Step 1: Replace `makeMockDb` with a queued count mock**

In `src/storage/repositories/__tests__/seedData.test.ts`, replace the existing `makeMockDb()` function with this version:

```ts
function makeMockDb() {
  const runCalls: { sql: string; params: unknown[] }[] = [];
  const execCalls: string[] = [];
  const countRows: Array<{ count: number } | null> = [];

  const runAsync = jest.fn().mockImplementation(async (sql: string, ...params: unknown[]) => {
    runCalls.push({ sql, params });
  });

  const execAsync = jest.fn().mockImplementation(async (sql: string) => {
    execCalls.push(sql);
  });

  const getFirstAsync = jest.fn().mockImplementation(async () => {
    if (countRows.length > 0) {
      return countRows.shift() ?? null;
    }

    return null;
  });

  return {
    db: {
      runAsync,
      execAsync,
      getFirstAsync,
    } as unknown as SQLiteDatabase,
    runCalls,
    execCalls,
    queueCountRows(...rows: Array<{ count: number } | null>) {
      countRows.push(...rows);
    },
  };
}
```

- [ ] **Step 2: Update existing seedIfEmpty tests to use `queueCountRows`**

In the `describe('seedIfEmpty')` block, replace the three existing tests with:

```ts
describe('seedIfEmpty', () => {
  it('calls seedDatabase when every reference table is empty', async () => {
    const { db, runCalls, queueCountRows } = makeMockDb();

    queueCountRows({ count: 0 }, { count: 0 }, { count: 0 });

    await seedIfEmpty(db);

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM muscle_groups',
    );
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM exercises',
    );
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM exercise_muscles',
    );

    const muscleInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO muscle_groups'),
    );
    const exerciseInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    const relationshipInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercise_muscles'),
    );

    expect(muscleInsertCalls.length).toBe(13);
    expect(exerciseInsertCalls.length).toBe(25);
    expect(relationshipInsertCalls.length).toBeGreaterThan(25);
  });

  it('repairs a database that has muscle groups but no exercises', async () => {
    const { db, runCalls, queueCountRows } = makeMockDb();

    queueCountRows({ count: 13 }, { count: 0 }, { count: 0 });

    await seedIfEmpty(db);

    const exerciseInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercises'),
    );
    const relationshipInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercise_muscles'),
    );

    expect(exerciseInsertCalls.length).toBe(25);
    expect(relationshipInsertCalls.length).toBeGreaterThan(25);
  });

  it('repairs a database that has exercises but no exercise muscle relationships', async () => {
    const { db, runCalls, queueCountRows } = makeMockDb();

    queueCountRows({ count: 13 }, { count: 25 }, { count: 0 });

    await seedIfEmpty(db);

    const relationshipInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO exercise_muscles'),
    );

    expect(relationshipInsertCalls.length).toBeGreaterThan(25);
  });

  it('skips seedDatabase when all reference tables are populated', async () => {
    const { db, runCalls, queueCountRows } = makeMockDb();

    queueCountRows({ count: 13 }, { count: 25 }, { count: 33 });

    await seedIfEmpty(db);

    expect(runCalls.length).toBe(0);
  });

  it('seeds defensively when a count row is null', async () => {
    const { db, runCalls, queueCountRows } = makeMockDb();

    queueCountRows(null, { count: 25 }, { count: 33 });

    await seedIfEmpty(db);

    const muscleInsertCalls = runCalls.filter(
      (c) => c.sql.includes('INSERT OR IGNORE INTO muscle_groups'),
    );

    expect(muscleInsertCalls.length).toBe(13);
  });
});
```

- [ ] **Step 3: Run the seed tests to verify failure**

Run:

```bash
pnpm test -- src/storage/repositories/__tests__/seedData.test.ts
```

Expected: FAIL. The first updated test should show that `seedIfEmpty()` only queried `muscle_groups`, and the partial-data tests should fail because no exercise inserts happen when `muscle_groups` already has rows.

- [ ] **Step 4: Commit the failing tests**

```bash
git add src/storage/repositories/__tests__/seedData.test.ts
git commit -m "test: cover exercise seed recovery"
```

---

### Task 2: Repair Partial Seed Detection

**Files:**
- Modify: `src/storage/repositories/seedData.ts`
- Test: `src/storage/repositories/__tests__/seedData.test.ts`

- [ ] **Step 1: Replace the current `seedIfEmpty` implementation**

In `src/storage/repositories/seedData.ts`, replace only the current `seedIfEmpty` function with this implementation:

```ts
async function getTableCount(db: SQLiteDatabase, tableName: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${tableName}`,
  );

  return row?.count ?? 0;
}

export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const [muscleGroupCount, exerciseCount, exerciseMuscleCount] = await Promise.all([
    getTableCount(db, 'muscle_groups'),
    getTableCount(db, 'exercises'),
    getTableCount(db, 'exercise_muscles'),
  ]);

  if (muscleGroupCount === 0 || exerciseCount === 0 || exerciseMuscleCount === 0) {
    await seedDatabase(db);
  }
}
```

- [ ] **Step 2: Run the focused test**

Run:

```bash
pnpm test -- src/storage/repositories/__tests__/seedData.test.ts
```

Expected: PASS. All `seedIfEmpty` partial recovery tests and existing `seedDatabase` tests pass.

- [ ] **Step 3: Run repository tests that depend on exercises**

Run:

```bash
pnpm test -- src/storage/repositories/__tests__/exerciseRepo.test.ts src/storage/repositories/__tests__/RoutineRepo.test.ts
```

Expected: PASS. No repository contract breaks from the seed guard change.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/storage/repositories/seedData.ts
git commit -m "fix: recover missing exercise seed data"
```

---

### Task 3: Add Exercise Library Smoke Coverage

**Files:**
- Modify: `e2e/playwright/core-loop.spec.ts`

- [ ] **Step 1: Add a Playwright regression test**

Append this test after `completeOnboardingIfNeeded` and before the existing routine test in `e2e/playwright/core-loop.spec.ts`:

```ts
test('exercise library tab renders seeded exercises', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await completeOnboardingIfNeeded(page);

  await page.getByLabel('Ejercicios').click();

  await expect(page.getByText('Ejercicios').first()).toBeVisible();
  await expect(page.getByLabel(/Abrir Bench Press/)).toBeVisible();
  await expect(page.getByLabel(/Abrir Squat/)).toBeVisible();

  await page.getByLabel('Buscar ejercicios').fill('Bench');
  await expect(page.getByLabel(/Abrir Bench Press/)).toBeVisible();
  await expect(page.getByLabel(/Abrir Squat/)).toHaveCount(0);
});
```

- [ ] **Step 2: Run the new smoke test**

Run:

```bash
pnpm test:agent:web -- --grep "exercise library tab renders seeded exercises"
```

Expected: PASS. The web smoke app opens, onboarding is skipped if needed, the Ejercicios tab becomes visible, seeded exercises render, and search narrows the list.

- [ ] **Step 3: Commit the smoke test**

```bash
git add e2e/playwright/core-loop.spec.ts
git commit -m "test: smoke exercise library tab"
```

---

### Task 4: Final Verification

**Files:**
- No new files.
- Verify: `src/storage/repositories/seedData.ts`, `src/storage/repositories/__tests__/seedData.test.ts`, `e2e/playwright/core-loop.spec.ts`

- [ ] **Step 1: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 2: Run focused Jest coverage**

Run:

```bash
pnpm test -- src/storage/repositories/__tests__/seedData.test.ts src/storage/repositories/__tests__/exerciseRepo.test.ts src/storage/repositories/__tests__/RoutineRepo.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run exercise library web smoke**

Run:

```bash
pnpm test:agent:web -- --grep "exercise library tab renders seeded exercises"
```

Expected: PASS.

- [ ] **Step 4: Run the existing core loop smoke when time allows**

Run:

```bash
pnpm test:agent:web
```

Expected: PASS. This confirms the new Ejercicios test and the existing create routine/start workout/log sets/finish workflow still work.

- [ ] **Step 5: Rebuild Graphify after implementation**

Run:

```bash
/graphify src
```

Expected: graph rebuild completes successfully. Do not commit `.graphify/branch.json`, `.graphify/worktree.json`, `.graphify/needs_update`, or `.graphify/cache/`.

---

## Self-Review

- Spec coverage: The blank Ejercicios section is covered by repairing partial seed data and adding a smoke test that exercises the tab.
- Placeholder scan: No placeholder markers or generic "handle edge cases" steps remain.
- Type consistency: The plan keeps the existing `seedIfEmpty(db: SQLiteDatabase): Promise<void>` API so `getDatabase()` does not need changes.
- Scope: Custom exercise create/edit route failures are recorded as an adjacent issue, not included in this seed recovery plan.
