## Why

El active workout minimizado se esta mostrando como un bottom sheet reducido en la parte inferior, lo que deja demasiado cuerpo visible y compite con el bottom tab navigation. Durante una sesion, el usuario necesita una referencia persistente tipo miniplayer: solo el header del workout, fijo justo encima del tab bar, con acceso rapido para volver al workout completo.

## What Changes

- Reemplazar el estado minimizado basado en un `BottomSheet` con snap bajo por un header minimizado independiente ubicado sobre el bottom tab navigation.
- Mantener el workout expandido como una superficie de sesion completa, separada del header minimizado para evitar que el contenido del sheet se asome cuando esta colapsado.
- Usar transiciones coordinadas con Reanimated 4.2, idealmente con shared elements o shared transitions entre el header minimizado y el header expandido.
- Preservar el timer, nombre de sesion y controles de expandir/minimizar sin reiniciar la sesion ni perder datos ya registrados.
- Mantener el bottom tab navigation usable y visualmente estable mientras el header minimizado esta visible.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `active-workout-modal`: El comportamiento minimizado cambia de un sheet parcialmente visible a un header/miniplayer independiente situado encima del bottom tab navigation, con transicion compartida hacia el estado expandido.

## Impact

- Affected code: `src/components/workout/ActiveWorkoutModal.tsx`, `src/components/workout/ActiveWorkoutHandle.tsx`, and likely new focused components for the minimized header and expanded workout surface.
- Affected navigation surface: `src/app/_layout.tsx` may need to keep mounting the overlay at root; `src/components/app-tabs.tsx` should remain stable unless spacing constants must be aligned.
- Dependencies: no new package expected if `react-native-reanimated` 4.2 is already installed; implementation should verify the installed version before coding.
- Data/storage: no SQLite, repository, or active workout store schema changes expected.