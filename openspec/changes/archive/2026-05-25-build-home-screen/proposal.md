## Why

Zenlift carece de una pantalla principal funcional. El usuario actualmente no tiene un punto de entrada claro al abrir la app: no ve su rutina actual, no puede iniciar un workout con un solo tap, y no recibe feedback de su actividad reciente. La Home Screen es la pantalla más visitada y debe mostrar datos reales del usuario para impulsar el core loop: iniciar workout -> registrar sets -> finalizar -> ver progreso.

## What Changes

- Crear `app/index.tsx` como la Home Screen principal con datos reales desde SQLite
- Implementar saludo dinámico que cambia según la hora del día (buenos días/tardes/noches)
- Botón CTA primario "Start Workout" que navega a la sección de rutinas
- LastWorkoutCard: mostrar último workout completado o empty state con CTA
- WeeklyActivityCard: barra de progreso semanal con días de la semana
- CurrentRoutineCard: mostrar rutina activa del usuario o empty state
- RecentPRsCard: últimos 3 PRs personales desde la BD
- Todos los componentes con empty states diseñados (no placeholders genéricos)
- Datos cargados desde WorkoutRepo, RoutineRepo y PR queries existentes via useCallback + useEffect

## Capabilities

### New Capabilities

- `home-screen`: Pantalla principal con greeting, CTA, último workout, actividad semanal, rutina actual y PRs recientes. Todos los datos provienen de repositorios SQLite. Cada sección maneja empty states con diseño específico.

### Modified Capabilities

<!-- No existing specs are modified. This change adds a new screen that consumes existing repository APIs. -->

## Impact

- **Nuevo archivo**: `app/index.tsx` (o `app/(tabs)/index.tsx` si existe tab layout) — pantalla Expo Router
- **Nuevos componentes**: `src/components/home/Greeting.tsx`, `StartWorkoutButton.tsx`, `LastWorkoutCard.tsx`, `WeeklyActivityCard.tsx`, `CurrentRoutineCard.tsx`, `RecentPRsCard.tsx`
- **Dependencias existentes**: `WorkoutRepo` (getHistory, getLatestPRs, getFullSession), `RoutineRepo` (getAll), `theme/index.ts` (colors, typography, spacing, radius, shadows)
- **Sin nuevas dependencias de paquetes**: todo usa expo-sqlite, Zustand, react-native StyleSheet
