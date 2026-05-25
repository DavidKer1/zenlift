## Why

Los usuarios necesitan crear ejercicios personalizados cuando el catálogo de seed (190+ ejercicios) no cubre un movimiento específico que realizan en el gimnasio. Sin un formulario de creación/edición, la biblioteca de ejercicios queda incompleta y los usuarios no pueden registrar ejercicios nuevos. Esta es la pantalla modal P1 que cierra el flujo de biblioteca de ejercicios.

## What Changes

- Nuevo componente `src/features/exercises/ExerciseFormModal.tsx` con formulario completo de creación/edición
- Integración con React Hook Form + zodResolver para validación
- Validación Zod: nombre mínimo 2 caracteres, músculo primario requerido, equipamiento requerido, sin duplicados (check contra DB)
- Select primario de 13 grupos musculares, multi-select chips para secundarios (opcional)
- Select de 9 opciones de equipamiento, select de 4 categorías
- Campo de notas opcional (TextArea)
- Modo creación: `isCustom=true` automático, genera UUID, inserta ejercicio + asociaciones de músculos vía ExerciseRepo.create()
- Modo edición: precarga valores actuales del ejercicio, actualiza vía ExerciseRepo.update() y gestiona músculos vía addMuscle/removeMuscle
- Al guardar: cierra modal y refresca la biblioteca (callback onSave)
- Botón cancelar cierra sin guardar

## Capabilities

### New Capabilities
- `exercise-form`: Formulario modal para crear/editar ejercicios personalizados con validación Zod, selects de músculo/equipamiento/categoría, multi-select chips de músculos secundarios, detección de duplicados vía ExerciseRepo.search(), y persistencia en SQLite vía ExerciseRepo.create() / ExerciseRepo.update() con gestión de asociaciones muscle_group.

### Modified Capabilities
<!-- No se modifican specs existentes. El formulario consume ExerciseRepo y MuscleGroupRepo sin cambiar su contrato. -->

## Impact

- Nuevo archivo: `src/features/exercises/ExerciseFormModal.tsx`
- Depende de: `ExerciseRepo` (create, update, search, getMuscles, addMuscle, removeMuscle), `MuscleGroupRepo` (getAll para selects), `@/domain/entities` (tipos Exercise, Equipment, ExerciseCategory, MuscleGroup, MuscleRole)
- Depende de: `react-hook-form`, `zod`, `@hookform/resolvers/zod`
- La ruta `exercise/` del build-exercise-library abre este modal vía FAB "Crear ejercicio"
- No afecta rutas, repositorios ni entidades existentes
