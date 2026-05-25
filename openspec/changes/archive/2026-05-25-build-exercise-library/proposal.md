## Why

La biblioteca de ejercicios es la puerta de entrada al catálogo de movimientos de Zenlift. Sin una pantalla funcional con búsqueda, filtros y gestión de favoritos, los usuarios no pueden explorar ejercicios ni seleccionarlos para sus rutinas. Es una pantalla P0 core del MVP que habilita los flujos de crear rutina y añadir ejercicios.

## What Changes

- Nueva ruta `app/exercise/index.tsx` con el layout principal de la biblioteca
- `ExerciseCard.tsx`: componente reutilizable que muestra nombre, músculo principal (dot coloreado), ícono de equipo y botón de favorito
- `FilterChip.tsx`: chip de filtro con estados selected/unselected, soporte multi-selección para músculos secundarios
- `SearchBar.tsx`: barra de búsqueda con debounce (300ms), icono de búsqueda, botón de limpiar y dismiss del teclado al submit
- Integración con ExerciseRepo existente para búsqueda case-insensitive, filtro por músculo (JOIN exercise_muscles) y toggle de favoritos
- FAB para navegar a crear ejercicio personalizado
- Estado vacío cuando no hay resultados de búsqueda
- FlashList con `estimatedItemSize` para scroll fluido con 25+ ejercicios

## Capabilities

### New Capabilities
- `exercise-library`: Pantalla de biblioteca de ejercicios con búsqueda con debounce, filtros por grupo muscular y equipo, toggle de favoritos persistente en SQLite, FAB para crear ejercicio personalizado, y estado vacío. Usa FlashList con estimatedItemSize.

### Modified Capabilities
<!-- No se modifican specs existentes a nivel de requisitos. La pantalla consume ExerciseRepo y MuscleGroupRepo sin cambiar su contrato. -->

## Impact

- Nuevos archivos: `src/app/exercise/index.tsx`, `src/components/ui/ExerciseCard.tsx`, `src/components/ui/FilterChip.tsx`, `src/components/ui/SearchBar.tsx`
- Depende de: `ExerciseRepo` (búsqueda, filtros, toggleFavorite), `MuscleGroupRepo` (lista de grupos para filtros), `getDatabase()` (conexión SQLite)
- No afecta rutas, repositorios ni entidades existentes
- Añade ruta `exercise/` no presente en AppTabs actual; requiere entrada desde navegación stack o tab futura
