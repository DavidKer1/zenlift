## Context

Zenlift already has the full data layer: `RoutineRepo` with transactional CRUD for routines, days, and exercises; `ExerciseRepo` with search/filter; domain entities with typed interfaces; and theme tokens with light-theme defaults and athletic orange primary color. The routines screen (`app/routines.tsx`) is a placeholder. This change introduces the form screens that allow users to create and edit full routine templates.

The create/edit flow is a P0 requirement because it unblocks the core loop: Crear rutina → Iniciar workout → Registrar sets → Finalizar sesión → Ver progreso.

Design reference compliance: implementation MUST review `DESIGN.md` and `tmp/design/screens/routine_editor-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Provide a single shared form component for create and edit flows, avoiding duplicated logic
- Support dynamic day management (add, remove, reorder) with at least 1 day and 1 exercise per day
- Integrate exercise library search/filter via ExerciseRepo
- Configure sets, reps min/max, and rest seconds per exercise
- Validate with Zod before persisting (name min 1 char, ≥1 day, ≥1 exercise/day, target sets ≥1)
- Save atomically via RoutineRepo transaction (create new UUIDs on create; preserve existing UUIDs on edit)
- Navigate to routine detail after save
- Editing routines MUST NOT mutate past workout sessions — only the routine template changes

**Non-Goals:**
- Offline-specific handling beyond existing repository patterns (repos are local-first already)
- Exercise creation from this screen (exercise library is read-only from here)
- Drag-to-reorder (use up/down buttons for MVP simplicity)
- Routine duplication or archiving (existing RoutineRepo methods, separate UI)
- Templates or preset routines (separate feature)

## Decisions

### 1. Shared `RoutineForm` component for create and edit

Both `app/routine/create.tsx` and `app/routine/edit/[id].tsx` render the same `<RoutineForm />` component. Create mode starts with empty defaults; edit mode loads the full routine via `RoutineRepo.getFullRoutine(id)` and populates the form. The form component receives an `onSubmit` callback and optional `initialData`.

**Rationale:** Avoids duplicated form logic, validation, and UI between create/edit. The thin route files handle data loading and navigation only.

### 2. React Hook Form + Zod for state and validation

Use `react-hook-form` with `@hookform/resolvers` and a Zod schema. The form state holds all days and exercises as nested field arrays using `useFieldArray`. Each day is an expandable card; each exercise within a day has a configuration modal.

**Schema design:**
```typescript
const routineFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  goal: z.enum(["hipertrofia", "fuerza", "resistencia"]).optional(),
  days: z.array(z.object({
    key: z.string(), // temporary client-side key for field array identity
    id: z.string().optional(), // existing UUID when editing
    name: z.string().min(1, "El día necesita un nombre"),
    exercises: z.array(z.object({
      key: z.string(),
      id: z.string().optional(),
      exerciseId: z.string().min(1, "Selecciona un ejercicio"),
      exerciseName: z.string(), // denormalized for display
      targetSets: z.number().int().min(1, "Mínimo 1 serie"),
      targetRepsMin: z.number().int().min(1).optional(),
      targetRepsMax: z.number().int().min(1).optional(),
      restSeconds: z.number().int().min(0).optional(),
    })).min(1, "Cada día necesita al menos 1 ejercicio"),
  })).min(1, "La rutina necesita al menos 1 día"),
});
```

**Rationale:** Zod provides runtime validation matching the acceptance criteria. React Hook Form handles field arrays natively, avoiding custom state management for dynamic lists.

### 3. Component decomposition

Three new components under `src/components/routine/`:

- **`DayEditor`**: Expandable card showing day name, exercise count, and exercise list. Provides edit name, remove day, add exercise, remove exercise, reorder exercises (up/down). Accepts `useFieldArray` methods for the nested exercises array.
- **`ExercisePicker`**: Bottom sheet or modal with search input and filter chips (by muscle group, equipment, category). Calls `ExerciseRepo.search()` and filter methods. Returns selected exercise on tap.
- **`ExerciseConfigurator`**: Modal for configuring target sets, reps min/max, and rest seconds for a selected exercise. Uses numeric inputs with 48px minimum touch targets.

**Rationale:** Each component has a single responsibility. ExercisePicker can be reused in the active workout "add exercise" flow later.

### 4. Transactional save strategy

**Create mode:** Open a transaction, INSERT routine with new UUID, INSERT each day with new UUID, INSERT each exercise with new UUID referencing the new day IDs. Return the created `FullRoutine` for navigation.

**Edit mode:** Open a transaction, UPDATE routine fields. For days/exercises: delete all existing children and re-insert with preserved UUIDs (from edit form) or new UUIDs (for newly added items). This "delete-and-reinsert" approach is simpler than diffing and avoids orphan cleanup. The alternative (diffing additions/removals/updates) adds complexity with no benefit for this scale.

Since past workout sessions reference exercises by `exercise_id` (not `routine_exercise_id`), editing routine templates does not affect historical data. The `routine_id` in `WorkoutSession` is a snapshot reference — we do not update past sessions when the template changes.

**Rationale:** Simpler implementation, atomic via transaction, and safe for past sessions. The trade-off of re-inserting on every edit is negligible for the expected data volume (routines have <10 days with <15 exercises each).

### 5. Navigation

After saving, use `router.replace()` to navigate to a routine detail screen (`/routine/[id]`). The detail screen is a separate change; for now, navigate to `/routines` as fallback if detail route doesn't exist yet.

On cancel/back, show a confirmation dialog if the form is dirty (has unsaved changes).

### 6. UI patterns

Follow existing conventions:
- `useZenliftTheme()` for colors, spacing, radius, typography
- `StyleSheet.create()` for styles (no Tailwind/NativeWind)
- `ThemedView` with `type="surface"` for cards
- `ThemedText` with `type` variants for headings and body
- Primary orange for save/submit CTAs
- Touch targets ≥48px per accessibility rules
- `accessibilityLabel` on all interactive elements

## Risks / Trade-offs

- **Delete-and-reinsert on edit:** Re-creates routine_exercise rows instead of updating in place. This means routine_exercise UUIDs change on edit for existing items unless we preserve them. → Preserve UUIDs for existing items; only generate new UUIDs for newly added items.
- **No drag-to-reorder:** Up/down buttons are less tactile than drag handles. → Acceptable for MVP; drag-to-reorder can be added in a follow-up.
- **Large form with many exercises:** React Hook Form `useFieldArray` performance with 50+ exercises across days. → Use `React.memo` on exercise rows and measure. If needed, switch to FlashList for the exercise list within DayEditor.
- **ExercisePicker re-renders:** Searching/filtering triggers re-renders. → Debounce search input (300ms), memoize filter results with `useMemo`.
- **Edit route loads full routine on mount:** Could be slow for routines with 100+ exercises (unlikely). → Already acceptable; RoutineRepo.getFullRoutine is a single query per day + exercise join.
