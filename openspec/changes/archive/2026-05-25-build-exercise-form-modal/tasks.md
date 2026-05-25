## 1. Setup & Types

- [x] 1.1 Create `src/features/exercises/ExerciseFormModal.tsx` with imports (React, RHF, zod, entities, repos)
- [x] 1.2 Define Zod schema `exerciseFormSchema` with name (min 2, trimmed), primaryMuscleGroupId (required), equipment (required), category (required), secondaryMuscleGroupIds (array of strings), notes (optional string)
- [x] 1.3 Infer TypeScript type `ExerciseFormData` from zod schema using `z.infer`
- [x] 1.4 Define `ExerciseFormModalProps` interface: `visible`, `exercise?` (ExerciseWithMuscles | null), `db` (SQLiteDatabase), `onClose`, `onSave`

## 2. Select & Picker Components

- [x] 2.1 Create inline `OptionPicker` for primary muscle: renders list of 13 muscle groups fetched from MuscleGroupRepo, each with color dot + display name, highlights selected
- [x] 2.2 Create inline `OptionPicker` for equipment: renders 9 equipment options with Spanish display labels
- [x] 2.3 Create inline `OptionPicker` for category: renders 4 category options with Spanish display labels (Fuerza, Cardio, Movilidad, Core)
- [x] 2.4 Create inline `MultiSelectChips` for secondary muscles: horizontal scrollable row of chips, toggle on press, shows muscle color when selected, excludes already-selected primary muscle

## 3. Duplicate Detection

- [x] 3.1 Implement `checkDuplicateName(name: string, excludeId?: string)` async function using ExerciseRepo.search()
- [x] 3.2 Add custom zod refinement or manual validation hook that calls checkDuplicateName on submit
- [x] 3.3 Display duplicate warning message "Ya existe un ejercicio con este nombre" below the name input

## 4. Create Flow

- [x] 4.1 Wire submit handler in create mode: disable button, check duplicates, call ExerciseRepo.create() with is_custom=1
- [x] 4.2 Build MuscleEntry array from primaryMuscleGroupId (role: 'primary') + secondaryMuscleGroupIds (role: 'secondary')
- [x] 4.3 On success: call onSave callback with created exercise, call onClose
- [x] 4.4 On error: show error message, re-enable submit button

## 5. Edit Flow

- [x] 5.1 Preload form values from `exercise` prop using RHF `reset()` with exercise data (name, equipment, category, notes)
- [x] 5.2 Preload primary muscle: fetch muscles via ExerciseRepo.getMuscles(exercise.id), find the one with role='primary', set form value
- [x] 5.3 Preload secondary muscles: extract muscle_group_ids with role='secondary' from getMuscles result, set form array value
- [x] 5.4 Wire submit handler in edit mode: call ExerciseRepo.update() for changed fields
- [x] 5.5 Sync muscle associations: compute diff between old muscles (from getMuscles) and new selection, call addMuscle/removeMuscle accordingly
- [x] 5.6 On success: call onSave callback with updated exercise, call onClose

## 6. Modal Shell & Behavior

- [x] 6.1 Wrap form in React Native `<Modal>` with `visible` prop, `animationType="slide"`, `presentationStyle="pageSheet"`
- [x] 6.2 Add header with title ("Nuevo ejercicio" or "Editar ejercicio") and close/dismiss button
- [x] 6.3 Add cancel button ("Cancelar") that calls onClose without saving
- [x] 6.4 Reset form state via RHF `reset()` when `visible` changes to true (useEffect)
- [x] 6.5 Hide primary muscle from secondary options when primary is selected

## 7. Styling & UX Polish

- [x] 7.1 Style all inputs with theme colors (zenliftColors.light), minimum 48px touch targets, 16dp font size
- [x] 7.2 Style submit button with primary orange (#F97316), pressed state (#EA580C)
- [x] 7.3 Style validation error text in danger color (#F43F5E) below each field
- [x] 7.4 Add loading/disabled state on submit button ("Guardando...")
- [x] 7.5 Add `accessibilityLabel` on all interactive elements
- [x] 7.6 Wrap form content in `ScrollView` with `keyboardShouldPersistTaps="handled"`

## 8. Verification

- [ ] 8.1 Manual test: open modal in create mode, submit empty → see validation errors on required fields
- [ ] 8.2 Manual test: create exercise with valid data → exercise appears in library
- [ ] 8.3 Manual test: create exercise with duplicate name → see warning, exercise not created
- [ ] 8.4 Manual test: open modal in edit mode → fields preloaded with current values
- [ ] 8.5 Manual test: edit exercise and save → changes persist in DB and library refreshes
- [ ] 8.6 Manual test: select/deselect secondary muscle chips → chips toggle correctly
- [ ] 8.7 Manual test: cancel button → modal closes, no data persisted
