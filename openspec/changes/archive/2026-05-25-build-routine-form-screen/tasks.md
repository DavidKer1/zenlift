## 1. Domain and Validation Setup

- [x] 1.1 Define Zod validation schema in `src/features/routine/routineFormSchema.ts` covering name (min 1), description (optional), goal (enum), days array (min 1) with nested exercises array (min 1 per day), and per-exercise fields (targetSets ≥1, reps min/max, restSeconds)
- [x] 1.2 Define TypeScript types inferred from the Zod schema (`RoutineFormValues`, `DayFormValues`, `ExerciseFormValues`) for form state

## 2. Exercise Picker Component

- [x] 2.1 Create `src/components/routine/ExercisePicker.tsx` — bottom sheet or modal with search TextInput (debounced 300ms, `ExerciseRepo.search()`), filter chips for muscle group, equipment, and category (all from `ExerciseRepo`), and a FlashList of results showing exercise name + equipment icon
- [x] 2.2 Implement empty state ("No se encontraron ejercicios") and loading indicator in ExercisePicker
- [x] 2.3 Handle exercise selection: on tap, close picker and pass selected exercise (id + name) to parent callback

## 3. Exercise Configurator Component

- [x] 3.1 Create `src/components/routine/ExerciseConfigurator.tsx` — modal that receives an exercise name and current config values, renders numeric inputs for targetSets (≥1), targetRepsMin (≥1), targetRepsMax (≥1), restSeconds (≥0) with 48px minimum touch targets and `keyboardType="numeric"`
- [x] 3.2 Validate within the modal that targetSets ≥1 before allowing confirm; show inline error if invalid
- [x] 3.3 On confirm, return the configuration object to the parent; on cancel, return null

## 4. Day Editor Component

- [x] 4.1 Create `src/components/routine/DayEditor.tsx` — expandable card showing day name (editable TextInput), exercise count badge, and collapse/expand chevron
- [x] 4.2 Implement expanded state: list of exercises with name, targetSets×reps/rest summary, edit config button, remove button, and up/down reorder buttons (disabled at boundaries)
- [x] 4.3 Wire "Agregar ejercicio" button to open ExercisePicker → on select open ExerciseConfigurator → on confirm add to the day's exercises field array
- [x] 4.4 Wire exercise remove, edit config (reopen ExerciseConfigurator), and reorder buttons to `useFieldArray` methods
- [x] 4.5 Implement remove day button (disabled when only 1 day remains) and up/down day reorder buttons

## 5. Routine Form Component

- [x] 5.1 Create `src/components/routine/RoutineForm.tsx` — shared form component receiving `initialData?: RoutineFormValues` and `onSubmit: (data: RoutineFormValues) => Promise<void>`
- [x] 5.2 Wire React Hook Form with `useForm<RoutineFormValues>({ resolver: zodResolver(schema), defaultValues })` and `useFieldArray` for days and nested exercises
- [x] 5.3 Render name TextInput, description TextInput (multiline), and goal Picker/selector at the top of the form
- [x] 5.4 Render the list of DayEditor components from the days field array with an "Agregar día" button at the bottom
- [x] 5.5 Render submit button ("Crear rutina" or "Guardar cambios") with loading spinner; disable while submitting
- [x] 5.6 Display aggregated validation errors at the top of the form (beyond per-field errors) for "at least 1 day" and "at least 1 exercise per day" rules
- [x] 5.7 Use `useZenliftTheme()` tokens (colors, spacing, radius, typography) and `StyleSheet.create()` for all styling; primary orange for CTAs, `ThemedView type="surface"` for cards
- [x] 5.8 Add `accessibilityLabel` on all inputs and buttons

## 6. Create Route

- [x] 6.1 Create `src/app/routine/create.tsx` — renders `<RoutineForm />` with empty defaults (name: "", days: [])
- [x] 6.2 Implement `onSubmit`: open database transaction, create routine + days + exercises via RoutineRepo methods, return new routine ID
- [x] 6.3 On success: navigate to `/routine/<new-id>` via `router.replace()`; fallback to `/routines` if detail route unavailable
- [x] 6.4 Handle save error: display error message and re-enable submit button

## 7. Edit Route

- [x] 7.1 Create `src/app/routine/edit/[id].tsx` — uses `useLocalSearchParams` to get `id`, fetches full routine via `RoutineRepo.getFullRoutine(id)`
- [x] 7.2 Transform `FullRoutine` into `RoutineFormValues` (add `key` fields for field array identity, map camelCase to form field names), preserving all UUIDs
- [x] 7.3 Render loading state while fetching; render error state if routine not found
- [x] 7.4 Render `<RoutineForm initialData={...} />` with the transformed data
- [x] 7.5 Implement `onSubmit`: open transaction, update routine fields, delete-and-reinsert days/exercises preserving UUIDs for existing items and generating new UUIDs for added items
- [x] 7.6 On success: navigate back to `/routine/<id>`; on error: display error and re-enable submit

## 8. Unsaved Changes Guard

- [x] 8.1 Use React Hook Form's `formState.isDirty` to detect unsaved changes
- [x] 8.2 On hardware back button or navigation back gesture with dirty form, show `Alert.alert` confirmation dialog ("¿Descartar cambios?")
- [x] 8.3 On confirm discard, allow navigation; on cancel, stay on form

## 9. Integration and Polish

- [x] 9.1 Ensure `src/app/routines.tsx` has a button/link to navigate to `/routine/create`
- [x] 9.2 Add a `src/app/routine/[id].tsx` placeholder detail screen (basic display of routine name and days count) so the post-save navigation target exists
- [x] 9.3 Verify form reset on create (fields clear after successful save) vs edit (fields retain after save, navigation away)
- [ ] 9.4 Smoke test core flow: create routine with 2 days, 3 exercises → save → verify navigation
- [ ] 9.5 Smoke test edit flow: open routine, change name, add exercise, save → verify UUIDs preserved, past sessions unaffected
- [x] 9.6 Verify all touch targets ≥48px and accessibility labels are present
