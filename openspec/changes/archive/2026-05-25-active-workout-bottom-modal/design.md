## Context

El modal se implementa como un único `Animated.View` con `position: absolute` cubriendo toda la pantalla. La animación usa `transform: [{ translateY }]` para deslizar el modal desde abajo (minimizado, solo header row visible) hasta arriba (expandido, pantalla completa).

## Goals / Non-Goals

**Goals:**

- Active workout accesible desde cualquier tab.
- Dos estados: expandido (full UI) y minimizado (header row de 56px).
- Transición `withTiming` 350ms, sin bounce.
- Header row horizontal: nombre | timer | chevron.
- Body (ejercicios, RestTimer, BottomBar) se desvanece al minimizar.
- Timer corre en ambos estados vía `setInterval`.
- `pointerEvents="box-none"` para no bloquear tabs.
- `GestureHandlerRootView` en root layout.

**Non-Goals:**

- No shared element transitions.
- No modificar el tab bar (sin shift).
- No modificar `useActiveWorkoutStore`.
- No nuevas dependencias.

## Decisions

### 1. Single modal con translateY

Un solo `Animated.View` animado con `translateY`. Sin capas separadas, sin conditional rendering de header/miniplayer.

`translateY` interpola entre `hiddenOffset` (minimizado, solo 56px visible sobre tab bar) y `0` (expandido, pantalla completa).

### 2. Header row horizontal

El header siempre visible contiene: workout name (izquierda, truncado) | timer con dot naranja (centro) | chevron ▼/▲ (derecha). Layout: `flexDirection: 'row'`.

### 3. Body fades out

Cancel button + RestTimer + FlashList + BottomBar envueltos en `Animated.View` con `opacity` interpolada. Sincronizado con `translateY`.

### 4. withTiming sin bounce

`expand()` y `minimize()` usan `withTiming(1, { duration: 350 })` y `withTiming(0, { duration: 350 })`.

### 5. Swipe-down gesture

`Gesture.Pan().onEnd()` detecta swipe down (>40px translation) para minimizar.

### 6. Montaje en _layout.tsx

`ActiveWorkoutModal` se monta en `RootNavigation` después de `<AppTabs />` para z-ordering correcto. Retorna `null` cuando no hay sesión.

### 7. Home screen cleanup

`index.tsx` elimina import y renderizado condicional de `ActiveWorkoutScreen`.

## Risks / Trade-offs

- **Riesgo:** Modal podría interferir con gesture handlers. → Mitigado con `pointerEvents="box-none"`.
- **Riesgo:** Jank en gama baja. → Mitigado con animaciones en UI thread (Reanimated).
- **Trade-off:** No usa modals de Expo Router. → Aceptable; necesitamos overlay persistente cross-tab.
