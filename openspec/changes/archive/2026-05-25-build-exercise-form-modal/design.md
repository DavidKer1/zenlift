## Context

Zenlift usa React Hook Form + Zod para validación de formularios desde la arquitectura base. El `ExerciseRepo` expone `create()`, `update()`, `search()`, `getMuscles()`, `addMuscle()`, y `removeMuscle()`. El `MuscleGroupRepo` expone `getAll()` y `getById()` para datos de solo lectura. Los 13 grupos musculares y 9 tipos de equipamiento están definidos como tipos TypeScript en `@/domain/entities`. La biblioteca de ejercicios (`build-exercise-library`) incluye un FAB para navegar a este formulario modal.

El formulario debe funcionar completamente offline, usar UUIDs, y seguir el theming light con naranja atlético como primary.

Design reference compliance: implementation MUST review `DESIGN.md` and the relevant `tmp/design/screens/exercise_library-html.html` / `tmp/design/screens/routine_editor-html.html` references before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Formulario modal con React Hook Form + zodResolver para crear y editar ejercicios custom
- Validación: nombre (min 2 chars, sin duplicados), músculo primario requerido, equipamiento requerido
- Select de músculo primario con 13 opciones, multi-select chips para secundarios
- Categoría y equipamiento como selects con opciones tipadas
- Modo creación: `isCustom=1` automático, inserta ejercicio + asociaciones de músculos
- Modo edición: precarga valores, actualiza ejercicio y sincroniza músculos
- Callback `onSave` para refrescar la biblioteca al cerrar

**Non-Goals:**
- No edita grupos musculares pre-seed (son read-only)
- No sube imágenes ni multimedia
- No maneja ejercicios no-custom (la edición de seed exercises está fuera de scope)
- No crea rutinas ni workouts desde este modal
- No backend sync

## Decisions

### React Hook Form + zodResolver
Se elige RHF con zodResolver porque es el stack definido en arquitectura. Zod provee validación declarativa con tipos inferidos. Alternativa considerada: Formik — descartado por no estar en el stack del proyecto.

### Modal como componente, no como ruta
El formulario se implementa como un componente `ExerciseFormModal` que recibe props (`visible`, `exercise?`, `onClose`, `onSave`) en lugar de ser una ruta Expo Router. Esto permite que el modal se abra desde cualquier pantalla sin afectar la navegación file-based. La biblioteca de ejercicios controla la visibilidad y el callback `onSave` refresca los datos.

### isCustom automático para creación
En modo creación, `isCustom` siempre es `1`. No se expone como campo editable para mantener simplicidad. El usuario no necesita saber que es un "ejercicio custom", solo que lo creó él.

### Detección de duplicados vía search()
Antes de submit, se ejecuta `ExerciseRepo.search(nombre)` para detectar ejercicios con nombre similar. Si existe coincidencia exacta (case-insensitive), se muestra un warning. En modo edición, se excluye el ejercicio actual de la comparación. Esto corre en el cliente, sin backend.

### Gestión de músculos en edición
Al editar, se obtienen los músculos actuales vía `ExerciseRepo.getMuscles()`. En submit, se calcula la diferencia: músculos añadidos → `addMuscle()`, músculos eliminados → `removeMuscle()`. No se usa `delete` + `create` completo para evitar perder el id del ejercicio.

### Select y multi-select con tipado nativo
Para músculos primarios, equipamiento y categoría se usa un approach simple: lista de opciones con `TouchableOpacity` renderizadas en un `ScrollView` o `FlatList` dentro de un bottom sheet / modal picker. Para músculos secundarios, chips multi-select con toggle. No se usa librería de select porque el proyecto evita UI kits pesados.

## Risks / Trade-offs

- [Race condition en duplicate check]: Dos usuarios (o tabs) podrían crear ejercicios con el mismo nombre entre el check y el insert. → Mitigación: MVP single-user, sin concurrencia. A futuro se podría añadir constraint UNIQUE en BD.
- [Sincronización de músculos en edición]: Si falla a mitad de la actualización de músculos, el ejercicio queda con estado inconsistente. → Mitigación: usar transacción SQLite (BEGIN/COMMIT/ROLLBACK) como ya hace ExerciseRepo.create().
- [Modal en Android]: Modales en React Native pueden tener comportamiento inconsistente en Android. → Usar `Modal` de React Native con `animationType="slide"` y `presentationStyle="pageSheet"` en iOS. En Android, full-screen modal es aceptable.
