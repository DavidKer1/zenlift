## Why

Los filtros actuales de ejercicios dependen de filas horizontales de pills que son dificiles de explorar con lector de pantalla, ocupan mucho espacio y se vuelven menos comodos durante un workout activo. Este cambio reduce la decision a dos controles claros, `Equipment` y `Muscle`, con seleccion en un bottom modal accesible que muestra opciones en lista y aplica el filtro al seleccionar.

## What Changes

- Reemplazar las pills de filtros en la tab de `Ejercicios` por dos controles persistentes: `Equipment` y `Muscle`.
- Reemplazar las pills del selector compartido de ejercicios por los mismos dos controles, cubriendo el flujo de `Agregar ejercicio` desde Active Workout y desde edicion/creacion de rutinas.
- Mostrar cada grupo de opciones en un bottom modal parcialmente abierto, no fullscreen, con lista vertical.
- Mostrar en cada opcion el nombre del filtro y una imagen local a la izquierda.
- Usar un asset temporal local bajo `assets/images/filters/` hasta que se proporcionen imagenes finales.
- Cerrar el modal inmediatamente al seleccionar una opcion y aplicar el filtro seleccionado.
- Mantener la busqueda por texto y la combinacion de filtros con la lista existente de ejercicios.
- Eliminar el filtro visible por categoria en el selector compartido para que el sistema expuesto sea solo `Equipment` y `Muscle`.

## Capabilities

### New Capabilities

- `exercise-picker-filters`: Cubre el sistema compartido de filtros accesibles para el selector de ejercicios usado al agregar ejercicios en Active Workout y rutinas.

### Modified Capabilities

- `exercise-library`: Cambia la interaccion de filtros de pills horizontales a dos controles accesibles con bottom modal, seleccion unica por grupo y cierre al seleccionar.
- `routine-form-screen`: Cambia los requisitos del exercise picker usado desde rutinas para que filtre con los dos controles `Equipment` y `Muscle` en lugar de chips.

## Impact

- Afecta `src/app/exercise/index.tsx` y `src/components/routine/ExercisePicker.tsx`.
- Agrega componentes reutilizables de filtros bajo `src/components/exercise/`.
- Agrega helpers compartidos de opciones bajo `src/features/exercises/`.
- Agrega un asset temporal local bajo `assets/images/filters/`.
- Agrega `BottomSheetModalProvider` en `src/app/_layout.tsx` para soportar los modales de filtro.
- Usa dependencias ya instaladas: `@gorhom/bottom-sheet` y `expo-image`.
- No cambia SQLite, repositorios, entidades de dominio, active workout store ni persistencia de sets.
