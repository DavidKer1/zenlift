## Why

El active workout solo se renderiza dentro de la pestaña Home. Cuando el usuario cambia a Routines, History o Settings durante una sesión, pierde visibilidad del timer, el nombre del workout y el acceso rápido a los controles de la sesión. Esto rompe el core loop y crea fricción en un momento donde cada segundo cuenta.

## What Changes

- Extraer el renderizado del active workout de la pantalla Home hacia un bottom modal persistente con `translateY` animation.
- El modal es un solo `Animated.View` que desliza arriba/abajo: expandido (pantalla completa) y minimizado (solo header row de 56px visible sobre el tab bar).
- Header row horizontal: nombre del workout | timer con dot naranja | chevron ▼/▲.
- Body content (Cancel, RestTimer, FlashList, BottomBar) se desvanece al minimizar.
- `withTiming` 350ms, sin bounce.
- Swipe-down gesture para minimizar; tap en chevron para toggle.
- Tab bar permanece sin cambios (sin shift).
- Timer corre vía `setInterval` en ambos estados.
- Home screen deja de renderizar `ActiveWorkoutScreen` inline.

## Capabilities

### New Capabilities

- `active-workout-modal`: Bottom modal persistente para el workout activo con estados expandido/minimizado, transiciones animadas, y miniplayer cross-tab.

### Modified Capabilities

None. The `base-tab-navigation` layout remains unchanged — the modal positions itself above the tab bar without modifying it.

## Impact

- Affected code: `src/app/_layout.tsx` (mounts modal + GestureHandlerRootView), `src/app/index.tsx` (removes inline ActiveWorkoutScreen), `src/components/workout/ActiveWorkoutModal.tsx` (new).
- No spec modifications needed.
- No API, persistence, database, or dependency changes.
