## Context

La biblioteca de ejercicios es una pantalla P0 del MVP. Debe cargar 25+ ejercicios desde SQLite, soportar búsqueda con debounce (300ms), filtrado por músculo (JOIN con exercise_muscles) y por equipo, toggle de favoritos persistente, y scroll fluido en FlashList. El ExerciseRepo ya implementa `search()`, `getByMuscle()`, `getByEquipment()`, `toggleFavorite()` y `getFavorites()`. MuscleGroupRepo provee los 13 grupos para los chips de filtro.

Design reference compliance: implementation MUST review `DESIGN.md` and `tmp/design/screens/exercise_library-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Pantalla funcional con búsqueda debounced (300ms), filtros muscle/equipment, favoritos, y FAB
- FlashList con `estimatedItemSize=72` para scroll 60 FPS con 25+ elementos
- Favoritos toggle con persistencia inmediata en SQLite vía `ExerciseRepo.toggleFavorite()`
- Componentes reutilizables: SearchBar, FilterChip, ExerciseCard
- Estado vacío cuando no hay resultados
- Keep screen thin: lógica de filtrado y búsqueda delegada a repos

**Non-Goals:**
- Swipe-to-favorite (se implementa como botón estrella en la card; swipe añadiría complejidad innecesaria)
- Drag-to-reorder
- Ejercicio detail screen (ruta futura)
- Animaciones complejas en la card

## Decisions

1. **Arquitectura de filtrado**: La pantalla aplica filtros secuencialmente combinando resultados de múltiples queries del repo, en lugar de una única query compleja. Esto mantiene el repo simple y la lógica de composición en la pantalla es trivial.

2. **Debounce local vs hook**: Se implementa con `useRef` + `useEffect` + `setTimeout` de 300ms. No se añade lodash ni dependencia externa para esto. El debounce aplica solo a la búsqueda por texto.

3. **FilterChip multi-select**: Los chips de músculo soportan selección múltiple (puedes filtrar por varios músculos a la vez). Los chips de equipo son single-select (dropdown alternativo si hay muchos equipos).

4. **Favoritos**: El toggle llama a `ExerciseRepo.toggleFavorite()` y actualiza optimisticamente el estado local. En caso de error, revierte. Esto evita glitches visuales.

5. **FAB**: Un Floating Action Button con ícono "+" que navega a `exercise/create` (ruta futura). Posicionado `absolute` bottom-right con `SafeAreaView` awareness.

6. **Estado vacío**: Se muestra un `ThemedView` centrado con mensaje "No se encontraron ejercicios" e icono cuando `filteredExercises.length === 0`.

7. **Sin provider de DB**: Cada screen obtiene el DB vía `getDatabase()` y crea las instancias de repo que necesita. Esto es simple y evita un Context innecesario hasta que haya más screens que compartan la misma instancia de repo.

## Risks / Trade-offs

- **Filtros secuenciales pueden ser ineficientes con muchos ejercicios**: Para 25-250 ejercicios, el impacto es imperceptible en dispositivo. Si crece a 1000+ ejercicios, refactorizar a query combinada en el repo. → Mitigación: medir performance real con 100 ejercicios y optimizar si necesario.
- **No hay cache entre renders**: Cada cambio de filtro/dispatch dispara una query SQLite. Con WAL mode y <100 ejercicios, las lecturas son sub-ms. → Mitigación: si se nota lentitud, añadir `useMemo` con dependencias de filtros.
- **Optimistic toggle de favoritos**: Si falla SQLite, el estado local queda desincronizado. → Mitigación: revertir estado en catch.
- **La ruta `exercise/` no está en AppTabs**: La pantalla debe ser accesible desde un stack navigator o desde otra pantalla. Por ahora se puede acceder directamente vía URL. La integración de navegación es un task separado.
