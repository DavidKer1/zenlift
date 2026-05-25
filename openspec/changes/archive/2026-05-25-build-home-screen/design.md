## Context

Zenlift tiene repositorios funcionales (`WorkoutRepo`, `RoutineRepo`, PR queries) y un sistema de temas definido, pero no tiene pantallas reales. La Home Screen es el punto de entrada principal y debe construirse sobre la infraestructura existente. No hay `app/` directory aún — se creará `app/index.tsx` como ruta raíz de Expo Router.

Constraints:
- Todo local-first con SQLite, sin backend
- Estilo con `StyleSheet.create()`, sin UI kits
- Tema claro por defecto, primary = `#F97316`, success = `#22C55E` solo para completados
- Pantallas thin: lógica en services y repos, no en route files
- `useCallback` + `useEffect` para carga de datos
- Touch targets >= 48px, contraste >= 4.5:1

Design reference compliance: implementation MUST review `DESIGN.md` and `tmp/design/screens/home_dashboard-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Home Screen con 5 secciones funcionales: greeting, CTA, último workout, actividad semanal, rutina actual, PRs recientes
- Datos reales desde repositorios SQLite existentes
- Empty states diseñados para cada sección (no texto genérico)
- Navegación: Start Workout -> rutinas
- Renderizado rápido (<500ms para datos de 100 sesiones)

**Non-Goals:**
- No incluye creación/edición de rutinas (eso va en otra pantalla)
- No incluye gráficas detalladas (eso es Progress)
- No incluye el active workout en sí (otra pantalla)
- No configura el tab navigator (ya existe `base-tab-navigation` spec)

## Decisions

### 1. Estructura de archivos: app/index.tsx + componentes en src/components/home/

**Decisión**: La Home Screen vive en `app/index.tsx` como ruta Expo Router. Los componentes de UI (Greeting, StartWorkoutButton, cards) van en `src/components/home/` como componentes reutilizables.

**Alternativa considerada**: Todo en un solo archivo. Rechazado por legibilidad y testabilidad.

**Razón**: Separar datos (lógica de fetch en el route) de presentación (componentes puros). Los componentes de card reciben props, no llaman a repos.

### 2. Carga de datos: useCallback + useEffect con dependencias vacías

**Decisión**: Cada sección usa su propio `useCallback` para la query y un `useEffect` que lo invoca al mount. Sin refresh automático (pull-to-refresh manual si se necesita en futuro).

**Alternativa considerada**: React Query / SWR. Rechazado porque no hay API remota y SQLite local es instantáneo.

**Razón**: Mantener simplicidad. La arquitectura dice "TanStack Query no es necesario mientras no haya API."

### 3. Empty states con diseño específico por sección

**Decisión**: Cada card tiene un estado de carga, un estado con datos, y un empty state con diseño propio (icono, texto descriptivo, CTA si aplica). No usar placeholder skeletons por ahora.

**Alternativa considerada**: Skeleton screens. Rechazado por complejidad innecesaria para MVP.

**Razón**: Los empty states bien diseñados guían al usuario hacia la siguiente acción (crear rutina, iniciar primer workout).

### 4. WeeklyActivity: progreso calculado desde historial local

**Decisión**: Calcular días con workout en la semana actual consultando `getHistoryByDateRange` con inicio de semana (lunes) y hoy. Mostrar barra con 7 segmentos (L-VII) coloreados si hubo workout ese día.

**Alternativa considerada**: Contador semanal simple (ej. "3/5 workouts"). Rechazado por ser menos informativo visualmente.

**Razón**: La barra de días da feedback inmediato de consistencia semanal sin necesidad de configurar un goal.

### 5. Greeting: función pura basada en hora local

**Decisión**: El saludo se calcula con `new Date().getHours()`: 6-11 = "Buenos días", 12-18 = "Buenas tardes", resto = "Buenas noches". Sin dependencia de librerías.

**Razón**: Simple, local, no requiere BD.

### 6. RecentPRs: usar getLatestPRs(3) del WorkoutRepo

**Decisión**: Consultar los últimos 3 PRs globales con la query existente `getLatestPRs`. Mostrar nombre de ejercicio, tipo de PR, peso/reps/volumen y fecha.

**Razón**: La query ya existe y está spec-validada. No se necesita nueva query.

## Risks / Trade-offs

- **[Riesgo] Home Screen hace 4-5 queries SQLite al mount** → Mitigación: todas son queries indexadas simples (<1ms cada una). Si se detecta lentitud, agrupar en una sola query compuesta con JOINs.
- **[Riesgo] Sin rutina creada, 3 de 5 secciones muestran empty state** → Mitigación: los empty states incluyen CTAs que guían al usuario a crear su primera rutina o iniciar freestyle.
- **[Riesgo] Los nombres de ejercicios en PRs vienen de la tabla exercises (JOIN)** → Mitigación: la query `getLatestPRs` debe incluir el JOIN con exercises para mostrar el nombre. Si no lo hace, se modifica el repositorio.
