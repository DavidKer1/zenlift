# Zenlift — Product & Technical Blueprint v2.0

> **Versión 2.0** — Mayo 2026. Actualización mayor con nuevas secciones técnicas: arquitectura de estado, estrategia de errores, optimización de rendimiento, modelo de datos con muscle_groups y UUIDs, competitor teardown, testing strategy, CI/CD, seguridad, estrategia AI-driven y glosario. Secciones nuevas: 8.3, 10.4–10.9, 11.1–11.2, 11.12, 15.5–15.7, 21.5–21.10, 28–33.

## 1. Resumen ejecutivo

**Zenlift** es una aplicación móvil de seguimiento de entrenamientos construida con **React Native**, enfocada en el usuario final que descarga la app desde la Play Store para llevar control de sus rutinas, ejercicios, cargas, series, repeticiones, progreso y consistencia en el gimnasio.

Zenlift no es un CRM, no es una plataforma web administrativa, no es un SaaS para gimnasios y no está diseñada para operar negocios fitness. Su enfoque es **B2C mobile-first**: una app personal para que cualquier usuario pueda planificar, registrar y analizar su entrenamiento de manera simple, rápida y visual.

Sus competidores directos conceptuales son aplicaciones como **Hevy** y **Strong App**, que se centran en el tracking de workouts, historial de entrenamiento, progreso de fuerza, rutinas personalizadas y experiencia de registro durante la sesión.

La visión de Zenlift es convertirse en una app de entrenamiento elegante, rápida y confiable para usuarios que quieren tener control real de su progreso físico sin depender de libretas, notas, hojas de cálculo o memoria.

---

## 2. Posicionamiento correcto del producto

### 2.1 Qué es Zenlift

Zenlift es:

- Una app móvil de workout tracking.
- Una herramienta personal para registrar entrenamientos.
- Un diario de progreso de fuerza e hipertrofia.
- Una app para crear rutinas, ejecutar sesiones y analizar resultados.
- Un producto enfocado en el cliente final.
- Una app distribuible en Play Store.
- Una experiencia mobile-first construida con React Native.

### 2.2 Qué no es Zenlift

Zenlift no es:

- Un CRM.
- Un ERP fitness.
- Una plataforma SaaS B2B.
- Un sistema para gimnasios.
- Una web administrativa.
- Un dashboard para coaches.
- Una API pública.
- Un marketplace.
- Un sistema de pagos para membresías.
- Una plataforma de reservas.
- Una app para gestionar clientes de entrenadores.

### 2.3 Competidores principales

Los referentes competitivos más cercanos son:

- **Hevy**: workout tracker moderno con rutinas, historial, estadísticas y componente social.
- **Strong App**: app enfocada en registrar entrenamientos de fuerza de forma rápida, simple y confiable.

Zenlift debe competir en la misma categoría, pero puede diferenciarse mediante:

- Mejor experiencia visual.
- Menor fricción al registrar sets.
- Progreso más claro.
- Personalización inteligente.
- Diseño más moderno.
- Rutinas más fáciles de organizar.
- Mejor experiencia para usuarios hispanohablantes.
- Simplicidad sin sacrificar profundidad.

---

## 3. Problema central

Muchas personas que entrenan en gimnasio no tienen una forma consistente y clara de medir su progreso. Usan métodos dispersos como:

- Notas del celular.
- Libretas físicas.
- Capturas de pantalla.
- Rutinas enviadas por WhatsApp.
- Memoria.
- Hojas de cálculo.
- Apps demasiado complejas.
- Apps con interfaces poco intuitivas.

El problema no es solo registrar datos. El problema real es que el usuario necesita saber:

- Qué rutina debe hacer hoy.
- Qué peso usó la vez anterior.
- Cuántas repeticiones logró.
- Si está progresando.
- Qué ejercicios forman parte de cada día.
- Cuándo fue su último entrenamiento.
- Qué músculos ha trabajado más o menos.
- Si está siendo consistente.
- Cómo evolucionan sus marcas personales.

Zenlift debe resolver esa necesidad con una experiencia rápida, limpia y centrada en el momento más importante: **el usuario está entrenando y no quiere perder tiempo manipulando la app**.

---

## 4. Visión de producto

### 4.1 Declaración de visión

**Zenlift es una app móvil de workout tracking diseñada para ayudar a usuarios de gimnasio a registrar sus entrenamientos de forma rápida, visualizar su progreso y mantenerse consistentes con sus rutinas.**

### 4.2 Promesa de valor

Zenlift ayuda al usuario a:

- Crear rutinas personalizadas.
- Registrar entrenamientos en tiempo real.
- Consultar pesos y repeticiones anteriores.
- Medir progreso por ejercicio.
- Guardar historial de sesiones.
- Ver estadísticas de volumen, frecuencia y fuerza.
- Mantener consistencia semanal.
- Organizar ejercicios por músculo o categoría.
- Seguir entrenando con menos fricción.

### 4.3 Principio central

La app debe sentirse como un compañero de entrenamiento, no como un sistema administrativo.

Cada pantalla debe responder a una necesidad concreta del usuario:

- ¿Qué entreno hoy?
- ¿Qué peso usé antes?
- ¿Cuántas series me faltan?
- ¿Estoy progresando?
- ¿Qué hice la semana pasada?
- ¿Cuál es mi mejor marca?

---

## 5. Usuario objetivo

### 5.1 Usuario principal

Persona que entrena en gimnasio y quiere llevar control de sus rutinas.

Puede ser:

- Principiante que quiere ordenarse.
- Intermedio que busca progresión de cargas.
- Usuario avanzado que mide volumen, intensidad y frecuencia.
- Persona enfocada en hipertrofia.
- Persona enfocada en fuerza.
- Persona que sigue rutinas tipo Push/Pull/Legs, Upper/Lower, Full Body o Bro Split.

### 5.2 Necesidades del usuario

El usuario necesita:

- Crear rutinas sin complicarse.
- Iniciar un entrenamiento rápido.
- Registrar sets con pocos taps.
- Ver datos de la sesión anterior.
- Guardar historial automáticamente.
- Ver progreso visual.
- Repetir rutinas frecuentes.
- Editar ejercicios fácilmente.
- Agregar notas personales.
- Tener una app confiable durante el entrenamiento.

### 5.3 Perfil emocional

El usuario quiere sentir que está progresando. Quiere ver evidencia de que sus esfuerzos están dando resultado.

Zenlift debe reforzar esa sensación mediante:

- Historial claro.
- Personal records visibles.
- Tendencias positivas.
- Celebraciones discretas.
- Estadísticas fáciles de entender.
- Comparación con entrenamientos previos.

---

## 6. Jobs To Be Done

### 6.1 JTBD principal

**Cuando voy al gimnasio y quiero entrenar con estructura, quiero una app que me diga qué rutina toca, me permita registrar cada serie rápido y me muestre mis pesos anteriores para poder progresar sin depender de memoria o notas desordenadas.**

### 6.2 JTBD de progreso

**Cuando llevo varias semanas entrenando, quiero ver si estoy levantando más peso, haciendo más repeticiones o acumulando más volumen para saber si realmente estoy mejorando.**

### 6.3 JTBD de consistencia

**Cuando intento mantener el hábito de entrenar, quiero ver mi historial y frecuencia semanal para motivarme a no perder continuidad.**

### 6.4 JTBD de rutina

**Cuando sigo un programa de entrenamiento, quiero tener mis días, ejercicios y series organizados para iniciar la sesión sin pensar demasiado.**

### 6.5 JTBD durante el entrenamiento

**Cuando estoy en medio de una sesión, quiero registrar pesos y reps con la menor fricción posible porque mi foco principal debe seguir siendo entrenar.**

---

## 7. Principios de producto

### 7.1 Mobile-first absoluto

Zenlift vive en el teléfono. No depende de una web. No requiere una plataforma externa. La experiencia debe ser excelente en pantalla pequeña, con navegación rápida y acciones accesibles con una sola mano.

### 7.2 Registro rápido sobre configuración compleja

El momento crítico es durante el entrenamiento. Si registrar una serie toma demasiado tiempo, el usuario abandona la app.

La prioridad debe ser:

- Pocos taps.
- Inputs claros.
- Valores previos precargados.
- Edición rápida.
- Descanso visible.
- Flujo continuo.

### 7.3 Progreso visible

El tracking solo tiene valor si el usuario puede interpretar su progreso.

Zenlift debe mostrar:

- Mejores marcas.
- Volumen por ejercicio.
- Historial de peso/reps.
- Frecuencia semanal.
- Músculos entrenados.
- Evolución por rutina.

### 7.4 Simplicidad con profundidad progresiva

La app debe ser simple para principiantes, pero suficientemente poderosa para usuarios intermedios y avanzados.

Esto se logra con profundidad progresiva:

- Flujo básico simple.
- Opciones avanzadas ocultas hasta que sean necesarias.
- Estadísticas comprensibles.
- Configuración flexible, pero no invasiva.

### 7.5 Offline-friendly

Un usuario puede entrenar en un gimnasio con mala conexión. Zenlift debe funcionar aunque no haya internet.

La información principal debe guardarse localmente:

- Rutinas.
- Ejercicios.
- Entrenamientos.
- Historial.
- Sets.
- Estadísticas básicas.

### 7.6 Tema visual

Zenlift debe usar **tema claro por defecto** y **naranja atlético como color primario**.

Tokens base recomendados:

```text
background: #F7F8FA
surface: #FFFFFF
surfaceElevated: #F1F3F6
primary: #F97316
primaryPressed: #EA580C
primarySoft: #FFEDD5
accent: #0EA5E9
success: #22C55E
warning: #FBBF24
danger: #F43F5E
text: #111827
mutedText: #6B7280
border: #E5E7EB
```

El verde no debe usarse como color primario. Reservarlo para estados positivos: set completado, éxito, progreso confirmado o confirmaciones discretas.

---

## 8. Modelo de dominio de alto nivel

### 8.1 Entidades principales

| Entidad | Descripción |
|---|---|
| UserProfile | Perfil local del usuario de la app. |
| Exercise | Ejercicio disponible o creado por el usuario. |
| MuscleGroup | Grupo muscular (entidad propia con ID, nombre). |
| ExerciseMuscle | Relación many-to-many entre Exercise y MuscleGroup (con rol: primary/secondary). |
| Routine | Rutina o plantilla creada por el usuario. |
| RoutineDay | Día o bloque dentro de una rutina. |
| RoutineExercise | Ejercicio configurado dentro de una rutina (referencia al Exercise). |
| WorkoutSession | Entrenamiento realizado o en curso. |
| WorkoutExercise | Ejercicio ejecutado dentro de una sesión (referencia al Exercise). |
| SetLog | Registro individual de una serie. |
| PersonalRecord | Mejor marca detectada por ejercicio. |
| ProgressMetric | Métrica calculada de progreso. |
| RestTimer | Temporizador de descanso (lógica, no entidad persistida). |
| Note | Nota asociada a ejercicio, set o sesión. |
| AppSettings | Preferencias locales del usuario (key-value en SQLite o MMKV). |
| Migration | Registro de migraciones de base de datos aplicadas. |

### 8.2 Relaciones principales

```text
MuscleGroup ←→ ExerciseMuscle ←→ Exercise
     (many-to-many con role: 'primary' | 'secondary')

UserProfile
  └── Routine[]
        └── RoutineDay[]
              └── RoutineExercise[]
                    └── Exercise (referencia)

UserProfile
  └── WorkoutSession[]
        └── WorkoutExercise[]
              └── SetLog[]

Exercise
  └── PersonalRecord[]

WorkoutSession
  └── ProgressMetric[]
```

### 8.3 Decisión de IDs: UUIDs desde el día 1

Todos los IDs de entidades deben ser **UUIDs v4** (o equivalentes de alta entropía), NO enteros autoincrementales. Razones:

- **Sync futuro:** si algún día se agrega sincronización entre dispositivos o backup en nube, los UUIDs evitan colisiones entre dispositivos.
- **Offline-first:** los IDs se generan en el dispositivo sin depender de un servidor central.
- **Costo cero hoy:** usar UUIDs no añade complejidad ahora y previene una migración masiva después.

Implementación sugerida:
```typescript
// utils/id.ts
export function generateId(): string {
  // crypto.randomUUID() está disponible en Hermes engine (React Native)
  // Si no, fallback a nanoid o Date.now + Math.random
  return crypto.randomUUID?.() ?? nanoid();
}
```

---

## 9. Módulos funcionales

## 9.1 Home

### Objetivo

Mostrar al usuario qué puede hacer inmediatamente al abrir la app.

### Elementos principales

- Botón de iniciar entrenamiento.
- Rutina sugerida o última rutina usada.
- Resumen semanal.
- Último entrenamiento.
- Acceso rápido a rutinas.
- Progreso reciente.
- Racha o consistencia.

### Preguntas que debe responder

- ¿Qué entreno hoy?
- ¿Cuándo fue mi último workout?
- ¿Cuántas veces entrené esta semana?
- ¿Puedo iniciar rápido mi rutina habitual?

---

## 9.2 Rutinas

### Objetivo

Permitir que el usuario cree y organice sus programas de entrenamiento.

### Funciones

- Crear rutina.
- Editar rutina.
- Duplicar rutina.
- Eliminar rutina.
- Crear días dentro de una rutina.
- Agregar ejercicios a cada día.
- Configurar series objetivo.
- Configurar reps objetivo.
- Configurar descanso.
- Reordenar ejercicios.
- Agregar notas.

### Ejemplos de rutinas

- Push Pull Legs.
- Upper Lower.
- Full Body.
- Torso Pierna.
- Bro Split.
- Fuerza 5x5.
- Hipertrofia 4 días.
- Rutina personalizada.

### Estructura de una rutina

```text
Routine: Push Pull Legs
  Day: Push
    Exercise: Bench Press
      Target Sets: 4
      Target Reps: 6-8
      Rest: 120 sec
    Exercise: Shoulder Press
      Target Sets: 3
      Target Reps: 8-10
      Rest: 90 sec

  Day: Pull
    Exercise: Pull Up
    Exercise: Barbell Row
    Exercise: Face Pull

  Day: Legs
    Exercise: Squat
    Exercise: Romanian Deadlift
    Exercise: Leg Press
```

### Reglas de producto

- Una rutina puede tener uno o varios días.
- Un día puede tener varios ejercicios.
- Un ejercicio puede repetirse en distintas rutinas.
- Editar una rutina no debe modificar sesiones pasadas.
- El usuario debe poder iniciar un entrenamiento desde cualquier rutina o día.

---

## 9.3 Biblioteca de ejercicios

### Objetivo

Ofrecer una base organizada de ejercicios y permitir ejercicios personalizados.

### Funciones

- Buscar ejercicio.
- Filtrar por grupo muscular.
- Filtrar por equipo.
- Crear ejercicio personalizado.
- Editar ejercicio personalizado.
- Marcar favoritos.
- Ver historial por ejercicio.
- Ver records por ejercicio.

### Campos de ejercicio

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador local. |
| name | string | Nombre del ejercicio. |
| primaryMuscle | enum | Músculo principal. |
| secondaryMuscles | array | Músculos secundarios. |
| equipment | enum | Barra, mancuerna, máquina, cable, peso corporal, etc. |
| category | enum | Fuerza, cardio, movilidad, core. |
| isCustom | boolean | Indica si fue creado por el usuario. |
| notes | string | Notas opcionales. |

### Grupos musculares sugeridos

- Chest.
- Back.
- Shoulders.
- Biceps.
- Triceps.
- Forearms.
- Abs.
- Quads.
- Hamstrings.
- Glutes.
- Calves.
- Full Body.
- Cardio.

### Equipamiento sugerido

- Barbell.
- Dumbbell.
- Machine.
- Cable.
- Bodyweight.
- Kettlebell.
- Smith Machine.
- Resistance Band.
- Other.

---

## 9.4 Ejecución de entrenamiento

### Objetivo

Ser el flujo más rápido y pulido de la app. El usuario debe poder registrar su sesión sin fricción.

### Flujo principal

```text
Usuario abre Zenlift
  ↓
Selecciona rutina o pulsa Start Workout
  ↓
Ve ejercicios del día
  ↓
Registra peso y reps por set
  ↓
Descansa con timer opcional
  ↓
Completa ejercicios
  ↓
Finaliza workout
  ↓
Ve resumen de sesión
```

### Pantalla de workout activo

Debe mostrar:

- Nombre de la rutina o sesión.
- Duración actual.
- Lista de ejercicios.
- Sets por ejercicio.
- Peso anterior.
- Reps anteriores.
- Inputs actuales.
- Check de set completado.
- Timer de descanso.
- Botón para agregar set.
- Botón para agregar ejercicio.
- Finalizar entrenamiento.

### Registro de set

Cada set debe permitir:

- Peso.
- Repeticiones.
- Tipo de set.
- Estado completado.
- Nota opcional.

Tipos de set sugeridos:

- Normal.
- Warm-up.
- Drop set.
- Failure.
- AMRAP.

### Reglas importantes

- El peso y reps anteriores deben mostrarse automáticamente.
- Completar un set puede iniciar el timer de descanso.
- El usuario debe poder modificar sets anteriores sin fricción.
- La sesión debe guardarse automáticamente.
- Si la app se cierra, el workout en curso debe recuperarse.

---

## 9.5 Historial

### Objetivo

Permitir que el usuario consulte entrenamientos pasados.

### Funciones

- Ver lista de workouts por fecha.
- Ver duración.
- Ver rutina usada.
- Ver ejercicios realizados.
- Ver sets registrados.
- Duplicar workout.
- Repetir workout.
- Editar sesión pasada.
- Eliminar sesión.

### Vista de historial

Ejemplo:

```text
May 16, 2026 — Push Day
Duration: 58 min
Volume: 12,450 kg
Exercises: 6
PRs: 2
```

### Reglas

- El historial debe ser inmutable a nivel conceptual, pero editable por el usuario.
- Si se edita una sesión pasada, las estadísticas deben recalcularse.
- El usuario debe poder buscar por ejercicio, rutina o fecha.

---

## 9.6 Progreso y estadísticas

### Objetivo

Transformar registros individuales en información útil.

### Métricas clave

- Volumen total por sesión.
- Volumen por ejercicio.
- Volumen por grupo muscular.
- Peso máximo por ejercicio.
- Estimated 1RM.
- Repeticiones máximas.
- Sets completados.
- Frecuencia semanal.
- Duración promedio.
- Rutinas más realizadas.
- Personal records.

### Fórmulas sugeridas

#### Volumen

```text
volume = weight × reps
sessionVolume = sum(all set volumes)
```

#### Estimated 1RM — Epley

```text
estimated1RM = weight × (1 + reps / 30)
```

#### Cumplimiento semanal

```text
weeklyConsistency = workoutsCompletedThisWeek / targetWorkoutsPerWeek
```

### Visualizaciones

- Línea de progreso por ejercicio.
- Barras de volumen semanal.
- Calendario de consistencia.
- PR cards.
- Distribución por músculo.
- Comparación sesión actual vs sesión anterior.

### Insight ideal

Zenlift no debe limitarse a mostrar números. Debe ayudar al usuario a interpretar:

- “Subiste tu volumen en Bench Press 12% vs la semana pasada.”
- “Este es tu mejor set histórico en Squat.”
- “Entrenaste piernas 2 veces esta semana.”
- “Llevas 3 semanas aumentando carga en Deadlift.”

---

## 9.7 Personal Records

### Objetivo

Motivar al usuario detectando logros reales.

### Tipos de PR

- Mayor peso levantado.
- Mayor volumen en un ejercicio.
- Mayor número de repeticiones con cierto peso.
- Mejor estimated 1RM.
- Mayor volumen total de sesión.
- Mayor duración o consistencia, si aplica.

### Reglas

- Los PRs deben detectarse al finalizar una sesión.
- Deben mostrarse en el resumen.
- Deben guardarse con fecha y referencia al workout.
- Deben ser celebrados sin exagerar la interfaz.

Ejemplo:

```text
New PR!
Bench Press — 80 kg × 6 reps
Estimated 1RM: 96 kg
```

---

## 9.8 Timer de descanso

### Objetivo

Ayudar al usuario a mantener ritmo entre series.

### Funciones

- Timer por defecto global.
- Timer específico por ejercicio.
- Inicio automático al completar set.
- Pausar/reanudar.
- Saltar timer.
- Notificación/vibración al terminar.

### Reglas

- El timer no debe bloquear el registro de otros datos.
- Debe seguir corriendo si el usuario cambia de pantalla.
- Debe ser visible durante el workout activo.

---

## 9.9 Notas

### Objetivo

Permitir contexto cualitativo.

### Tipos de notas

- Nota de ejercicio.
- Nota de set.
- Nota de workout.
- Nota de rutina.

### Ejemplos

- “Sentí molestia en hombro derecho.”
- “Subir 2.5 kg la próxima semana.”
- “Mantener técnica más controlada.”
- “Dormí mal, bajar intensidad.”

---

## 9.10 Configuración

### Objetivo

Permitir personalización sin complicar el producto.

### Opciones sugeridas

- Unidad de peso: kg/lb.
- Tema: claro por defecto; oscuro/sistema como opción configurable.
- Descanso por defecto.
- Objetivo semanal de entrenamientos.
- Idioma.
- Formato de fecha.
- Semana inicia lunes/domingo.
- Exportar datos.
- Borrar datos.

---

## 10. Arquitectura técnica realista

## 10.1 Enfoque general

Zenlift es una app móvil construida con React Native + Expo (managed workflow). La arquitectura debe ser local-first, simple, mantenible y preparada para crecer.

No se asume web, backend ni API en la versión actual.

### Arquitectura conceptual

```text
React Native App (Expo SDK 56)
  ├── UI Layer (React components + StyleSheet/theme)
  ├── Navigation Layer (Expo Router, file-based routing)
  ├── State Layer (Zustand stores + React Context para theme)
  ├── Domain Logic (funciones puras de cálculo: volumen, 1RM, PRs)
  ├── Local Persistence (SQLite para datos, MMKV para settings)
  ├── Analytics Calculations (servicios de progreso y estadísticas)
  └── Device Features (haptics, keyboard, timer)
```

### Objetivo técnico

- Funcionar rápido en dispositivo Android (gama media-baja incluida).
- Guardar datos localmente sin dependencia de red.
- Recuperar workouts en curso tras cierre de app.
- Calcular estadísticas en dispositivo (sin backend).
- Mantener una base de código clara, testeable y con tipos estrictos.
- Evitar sobrearquitectura: no implementar abstracciones para features que no existen.

---

## 10.2 Stack sugerido

### Core

- **React Native 0.85+** (vía Expo SDK 56).
- **TypeScript 6** con strict mode.
- **Expo** (managed workflow) — reduce configuración nativa al mínimo.
- **Expo Router** — file-based routing, similar a Next.js App Router.

### Estado

- **Zustand** para estado global mínimo (workout activo, timer, preferencias).
- **React Context** solo para theme (claro/oscuro/sistema).
- **TanStack Query** innecesario (no hay API ni fetching).

### Persistencia local

- **expo-sqlite** (`SQLiteDatabase`) con API async — para datos estructurados (workouts, rutinas, ejercicios, sets, PRs). API síncrona disponible si se necesita rendimiento extra.
- **react-native-mmkv** — para settings, flags, preferencias y estado ligero. Lectura síncrona, cero latencia.

### Formularios y validación

- **React Hook Form** — manejo de formularios con mínimo re-render.
- **Zod** — schemas de validación tipados.

### UI y rendimiento

- **@shopify/flash-list** — obligatorio para listas con inputs (Active Workout, biblioteca de ejercicios). Reemplaza FlatList con mejor performance en scroll.
- **Componentes propios** con StyleSheet — sin dependencia de UI kits pesados.
- **react-native-reanimated** (si Expo lo incluye) para animaciones de PR, timer, transiciones.

### Gráficas

- **react-native-svg** + **victory-native** — gráficas de progreso (línea, barra).
- Alternativa: **react-native-gifted-charts** para gráficas más simples.
- Recharts NO aplica (es web-only).

### Fechas

- **date-fns** — ligero, tree-shakeable, sin dependencia de moment/luxon.

### Feedback háptico

- **expo-haptics** — vibración al completar set, al detectar PR, al terminar timer.

---

## 10.3 Capas internas recomendadas

```text
src/
  app/                    # Expo Router: file-based routes
    (tabs)/
      index.tsx           # Home
      routines.tsx        # Lista de rutinas
      history.tsx         # Historial
      settings.tsx        # Configuración
    routine/
      [id].tsx            # Detalle de rutina
    workout/
      active.tsx          # Workout en curso (LA PANTALLA CRÍTICA)
      summary.tsx         # Resumen post-workout
    exercise/
      index.tsx           # Biblioteca de ejercicios
      [id].tsx            # Detalle de ejercicio
    progress/
      index.tsx           # Progreso general
      [exerciseId].tsx    # Progreso por ejercicio
  features/               # Lógica de negocio por feature
    home/
    routines/
    workout/
    exercises/
    history/
    progress/
    settings/
  domain/
    entities/             # Tipos TypeScript puros
    services/             # Lógica de negocio (cálculos, PRs, estadísticas)
    calculations/         # Funciones puras: volumen, 1RM, conversión
  storage/
    database/
      connection.ts       # Singleton de conexión SQLite
      schema.ts           # SQL DDL
    repositories/         # Patrón repository por entidad
    migrations/           # Sistema de migraciones versionado
  components/
    ui/                   # Componentes genéricos reutilizables
    workout/              # Componentes específicos de workout
    charts/               # Wrappers de gráficas
  utils/
    dates/                # Helpers de date-fns
    units/                # Conversión kg↔lb, formateo
    formatters/           # Formateo de números, duración
  theme/                  # Colores, tipografía, spacing
  providers/              # ThemeProvider, DatabaseProvider
```

### Principio

Las pantallas no deben contener lógica pesada de cálculo. Las estadísticas, PRs, volumen y progresión deben estar en `domain/services/` y `domain/calculations/` como funciones puras, testeables unitariamente sin montar componentes React.

---

## 10.4 Arquitectura de estado (Zustand)

### Stores principales

```typescript
// stores/activeWorkoutStore.ts
interface ActiveWorkoutStore {
  session: WorkoutSession | null;
  exercises: WorkoutExerciseWithSets[];  // ejercicios + sus sets
  timerSeconds: number;
  timerRunning: boolean;
  // Acciones
  startWorkout: (routineId?: string, routineDayId?: string) => void;
  addSet: (exerciseId: string, set: Omit<SetLog, 'id'>) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  updateSet: (setId: string, updates: Partial<SetLog>) => void;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  skipTimer: () => void;
  finishWorkout: () => Promise<WorkoutSummary>;
  recoverSession: () => Promise<void>; // al reabrir la app
}

// stores/settingsStore.ts
interface SettingsStore {
  weightUnit: 'kg' | 'lb';
  theme: 'light' | 'dark' | 'system';
  defaultRestSeconds: number;
  weeklyGoal: number;
  onboardingComplete: boolean;
  // Persistido en MMKV
}
```

**Default:** `theme = 'light'`. El tema claro es la experiencia base de Zenlift; `dark` y `system` son opciones configurables.

### Reglas de estado

- **Workout activo en Zustand** (no en React state) — sobrevive a re-renders y cambios de pantalla.
- **Autosave en cada set completado** — el store persiste a SQLite inmediatamente tras cada `completeSet()`.
- **Recuperación al iniciar** — `recoverSession()` busca una sesión con `status='active'` en SQLite y reconstruye el store.
- **Settings en MMKV** — lectura síncrona, sin async, disponible inmediatamente al arrancar.

---

## 10.5 Estrategia de manejo de errores

### Jerarquía de errores

```
ErrorBoundary (React)         ← captura crashes de UI, muestra pantalla de recovery
  └── Try/catch en repositories ← operaciones SQLite
       └── Result<T, E> pattern  ← funciones de dominio (cálculos, PRs)
```

### Base de datos

```typescript
// storage/database/errors.ts
class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}

// Todo repository debe:
// 1. Envolver operaciones en try/catch
// 2. Loguear el error (en desarrollo)
// 3. Relanzar como DatabaseError con contexto
// 4. NUNCA tragar errores silenciosamente
```

### Workout activo (crítico)

- Si una operación SQLite falla durante un workout, **reintentar hasta 3 veces con backoff**.
- Si los reintentos fallan, guardar el set en una **cola en memoria** (MMKV) y reintentar en el siguiente set exitoso.
- **Nunca perder un set** — es preferible duplicar (y des-duplicar al recuperar) que perder datos.

### Cálculos (funciones puras)

- Usar **Result<T, E> pattern** (Neverthrow o implementación propia simple):
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```
- Las funciones de cálculo nunca lanzan excepciones — siempre retornan Result.

---

## 10.6 Performance y optimización

### Targets de rendimiento

| Métrica | Objetivo | Medición |
|---|---|---|
| Tiempo de arranque (cold start) | < 2 segundos | `expo-splash-screen` + timing manual |
| Tiempo para registrar un set | < 3 segundos | Medir desde que el usuario toca el input hasta que el set aparece como completado |
| Scroll en Active Workout (30 rows con inputs) | 60 FPS, sin lag visible | FlashList + `estimatedItemSize` |
| Carga de historial (100 sesiones) | < 500ms | SQLite con índices apropiados |
| Persistencia de set | < 100ms (async, no bloqueante) | `runAsync` de expo-sqlite |

### Técnicas de optimización

- **FlashList en TODAS las listas** con inputs editables. FlatList estándar tiene problemas de reciclaje con TextInputs.
- **`estimatedItemSize`** en FlashList — mejora drásticamente el scroll inicial.
- **React.memo** en SetRow y ExerciseCard — evita re-renders de toda la lista cuando un solo set cambia.
- **useCallback** en handlers de sets — las referencias estables evitan re-renders.
- **SQLite WAL mode** — lecturas concurrentes sin bloquear escrituras:
  ```sql
  PRAGMA journal_mode = WAL;
  ```
- **Índices** en todas las foreign keys y columnas de filtrado frecuente:
  ```sql
  CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
  CREATE INDEX idx_set_logs_workout_exercise ON set_logs(workoutExerciseId);
  CREATE INDEX idx_exercise_muscles_muscle ON exercise_muscles(muscleGroupId);
  ```
- **Batch inserts** para seed data y operaciones que toquen múltiples filas:
  ```sql
  INSERT INTO exercises (id, name, ...) VALUES (?, ?, ...), (?, ?, ...), ...;
  ```

---

## 10.7 Manejo del teclado

El teclado es un problema crítico en la Active Workout Screen. El usuario alterna constantemente entre inputs de peso y reps.

### Reglas

- **Teclado numérico** (`keyboardType="numeric"`) para peso y reps.
- **NO usar KeyboardAvoidingView** — causa jumps de layout que rompen la experiencia de registro rápido.
- En su lugar: **scroll automático al input enfocado** (FlashList tiene `scrollToIndex`).
- **Botones +/-** junto a cada input — permiten ajustar peso/reps sin teclear (útil con una mano, sudor, prisa).
- **Cerrar teclado al hacer tap en "completar set"** — `Keyboard.dismiss()`.
- **El teclado NO debe empujar el timer** — el timer debe permanecer visible en un header fijo.

---

## 10.8 Timer de descanso: implementación técnica

**Problema:** En React Native, un `setInterval` dentro de un componente se destruye al cambiar de pantalla. El timer debe sobrevivir.

### Solución: timestamps absolutos + servicio independiente

NO usar countdown con `setInterval`. Usar **timestamps absolutos**:

```typescript
// domain/services/restTimer.ts
class RestTimerService {
  private targetEnd: number | null = null; // Date.now() + seconds*1000

  start(seconds: number): void {
    this.targetEnd = Date.now() + seconds * 1000;
    // Persistir targetEnd en MMKV para recuperación
  }

  getRemainingSeconds(): number {
    if (!this.targetEnd) return 0;
    return Math.max(0, Math.ceil((this.targetEnd - Date.now()) / 1000));
  }

  isRunning(): boolean {
    return this.targetEnd !== null && this.getRemainingSeconds() > 0;
  }

  // La UI hace polling cada 1s con requestAnimationFrame
  // o usa un solo setInterval global en el store
}
```

- El `targetEnd` se guarda en MMKV. Si la app se cierra y reabre, el timer se reconstruye con los segundos restantes reales.
- **Notificación:** `expo-haptics` vibra al llegar a 0. Si se implementa notificación local futura, usar `expo-notifications` con un scheduled notification al `targetEnd`.

---

## 10.9 Estrategia de backup y exportación

### Export (P2)

- **Formato JSON** — un solo archivo `.zenlift` que contiene todo: ejercicios, rutinas, sesiones, sets, PRs, settings.
- Implementar con `expo-file-system` + `expo-sharing`:
  ```typescript
  // Generar JSON del estado completo
  const backup = await backupService.exportAll();
  // Escribir a caché
  const path = FileSystem.cacheDirectory + 'zenlift_backup_2026-05-24.json';
  await FileSystem.writeAsStringAsync(path, JSON.stringify(backup));
  // Compartir (guardar en Drive, enviar por WhatsApp, etc.)
  await Sharing.shareAsync(path);
  ```

### Import (P2)

- Leer archivo `.zenlift` con `expo-document-picker`.
- Validar schema con Zod antes de insertar.
- Estrategia: **merge**, no replace — insertar solo lo que no existe (por UUID), actualizar settings.

### Backup automático (P3)

- Opcionalmente, respaldar a un archivo en `FileSystem.documentDirectory` cada N workouts.
- No requiere backend ni nube. El usuario decide si lo copia manualmente.

---

## 11. Modelo de datos local

### Principio de IDs

Todos los IDs son **UUIDs** (texto), generados en el dispositivo con `crypto.randomUUID()` o `nanoid()`. No se usan enteros autoincrementales. Ver sección 8.3 para justificación.

---

## 11.1 muscle_groups

Tabla de referencia de grupos musculares. Datos fijos (seed), no editables por el usuario.

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID del grupo muscular. |
| name | text UNIQUE | Nombre en inglés (ej: 'Chest', 'Back', 'Quads'). |
| displayNameEs | text | Nombre en español (ej: 'Pecho', 'Espalda', 'Cuádriceps'). |
| color | text | Color hexadecimal asociado para gráficas y UI. |

Seed inicial (13 grupos):
```text
Chest (#EF4444), Back (#3B82F6), Shoulders (#F97316), Biceps (#22C55E),
Triceps (#A855F7), Forearms (#EC4899), Abs (#FBBF24), Quads (#06B6D4),
Hamstrings (#84CC16), Glutes (#EAB308), Calves (#14B8A6),
Full Body (#6B7280), Cardio (#F472B6)
```

## 11.2 exercise_muscles

Tabla de relación many-to-many entre exercises y muscle_groups.

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| exerciseId | text FK | Referencia a exercises.id. |
| muscleGroupId | text FK | Referencia a muscle_groups.id. |
| role | text | 'primary' o 'secondary'. Un ejercicio tiene exactamente 1 primary y 0+ secondary. |

**Índices:**
- `idx_exercise_muscles_exercise` sobre `exerciseId`
- `idx_exercise_muscles_muscle` sobre `muscleGroupId`

**Regla de integridad:** Un ejercicio debe tener exactamente un registro con `role = 'primary'`. Validar en capa de repositorio/dominio, no solo en SQL.

## 11.3 exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| name | text NOT NULL | Nombre del ejercicio. |
| equipment | text NOT NULL | Equipo requerido. |
| category | text NOT NULL | Categoría del ejercicio. |
| isCustom | integer DEFAULT 0 | 1 = creado por el usuario, 0 = seed. |
| isFavorite | integer DEFAULT 0 | Marcado como favorito por el usuario. |
| notes | text | Notas personales del usuario sobre este ejercicio. |
| createdAt | text | ISO 8601 timestamp. |
| updatedAt | text | ISO 8601 timestamp. |

**Nota:** `primaryMuscle` y `secondaryMuscles` se eliminan de esta tabla. En su lugar se usa la tabla `exercise_muscles` con la relación many-to-many.

## 11.4 routines

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| name | text NOT NULL | Nombre de rutina. |
| description | text | Descripción opcional. |
| goal | text | Objetivo opcional (hipertrofia, fuerza, resistencia). |
| isArchived | integer DEFAULT 0 | 1 = archivada (no se muestra en activas). |
| sortOrder | integer DEFAULT 0 | Orden de visualización en la lista. |
| createdAt | text | ISO 8601. |
| updatedAt | text | ISO 8601. |

## 11.5 routine_days

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| routineId | text FK NOT NULL | Rutina padre. ON DELETE CASCADE. |
| name | text NOT NULL | Nombre del día (ej: 'Push Day', 'Día 1 - Pecho'). |
| dayOfWeek | integer nullable | Día de la semana sugerido (0=Domingo, 1=Lunes...). Null = no asignado. |
| sortOrder | integer DEFAULT 0 | Orden dentro de la rutina. |

## 11.6 routine_exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| routineDayId | text FK NOT NULL | Día padre. ON DELETE CASCADE. |
| exerciseId | text FK NOT NULL | Ejercicio referenciado. |
| targetSets | integer | Series objetivo. |
| targetRepsMin | integer | Reps mínimas. |
| targetRepsMax | integer | Reps máximas. |
| restSeconds | integer | Descanso sugerido entre sets. |
| notes | text | Notas específicas para este ejercicio en esta rutina. |
| sortOrder | integer DEFAULT 0 | Orden dentro del día. |

## 11.7 workout_sessions

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| routineId | text nullable | Rutina de origen (si se inició desde una). |
| routineDayId | text nullable | Día específico de origen. |
| name | text | Nombre de la sesión (default: nombre de rutina + fecha). |
| startedAt | text NOT NULL | ISO 8601 del inicio. |
| endedAt | text nullable | ISO 8601 del fin. |
| durationSeconds | integer | Duración total calculada al finalizar. |
| status | text NOT NULL | 'active', 'completed', 'cancelled'. CHECK constraint. |
| notes | text | Notas generales de la sesión. |
| createdAt | text | ISO 8601. |
| updatedAt | text | ISO 8601. |

**Índices:**
- `idx_workout_sessions_status` sobre `status` (filtrado de sesiones activas)
- `idx_workout_sessions_started` sobre `startedAt` (orden cronológico)

## 11.8 workout_exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| workoutSessionId | text FK NOT NULL | Sesión padre. ON DELETE CASCADE. |
| exerciseId | text FK NOT NULL | Ejercicio ejecutado. |
| sortOrder | integer DEFAULT 0 | Orden de ejecución. |
| notes | text | Notas durante la ejecución (ej: 'sentí molestia'). |

## 11.9 set_logs

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| workoutExerciseId | text FK NOT NULL | Ejercicio padre. ON DELETE CASCADE. |
| setNumber | integer NOT NULL | Número de serie (1, 2, 3...). |
| weight | real NOT NULL | Peso utilizado (en kg, convertir a lb para display). |
| reps | integer NOT NULL | Repeticiones realizadas. |
| setType | text DEFAULT 'normal' | 'normal', 'warmup', 'drop', 'failure', 'amrap'. |
| isCompleted | integer DEFAULT 0 | 1 = completado. |
| completedAt | text nullable | ISO 8601 del momento exacto de completado. |
| notes | text | Nota opcional de esta serie. |

**Índices:**
- `idx_set_logs_workout_exercise` sobre `workoutExerciseId`

## 11.10 personal_records

| Campo | Tipo | Descripción |
|---|---|---|
| id | text PK | UUID. |
| exerciseId | text FK NOT NULL | Ejercicio. |
| workoutSessionId | text FK NOT NULL | Sesión donde se logró. |
| type | text NOT NULL | Tipo de PR: 'max_weight', 'max_volume', 'max_reps', 'estimated_1rm', 'max_session_volume'. |
| value | real NOT NULL | Valor numérico del record. |
| weight | real nullable | Peso asociado (si aplica). |
| reps | integer nullable | Reps asociadas (si aplica). |
| achievedAt | text NOT NULL | ISO 8601 de cuando se logró. |

## 11.11 app_settings

Tabla key-value para preferencias que requieren persistencia estructurada. Para settings de alta frecuencia (tema, unidad), usar MMKV en su lugar.

| Campo | Tipo | Descripción |
|---|---|---|
| key | text PK | Clave única. |
| value | text | Valor serializado como string. |

## 11.12 _migrations

Tabla de control de versiones del schema SQLite.

| Campo | Tipo | Descripción |
|---|---|---|
| version | integer PK | Número de versión de migración. |
| description | text | Descripción del cambio. |
| appliedAt | text NOT NULL | ISO 8601 de cuando se aplicó. |

---

## 12. Estado de la app

### 12.1 Estado global mínimo

El estado global debe incluir solo lo necesario:

- Workout activo.
- Timer activo.
- Preferencias del usuario.
- Tema, con `light` como default.
- Unidad de peso.

El resto debe cargarse desde storage mediante repositorios.

### 12.2 Workout activo

El workout activo es el estado más crítico de la app.

Debe soportar:

- Recuperación después de cerrar app.
- Autosave.
- Edición en tiempo real.
- Timer asociado.
- Finalización segura.

### 12.3 Riesgo técnico principal

Perder datos durante un entrenamiento es uno de los peores errores para este tipo de app.

Mitigaciones:

- Persistir cada set al completarse.
- Guardar sesión activa localmente.
- Evitar depender solo de estado en memoria.
- Confirmar antes de descartar workout.

---

## 13. Flujos clave de usuario

## 13.1 Crear primera rutina

```text
Usuario abre app por primera vez
  ↓
Ve onboarding simple
  ↓
Crea rutina
  ↓
Agrega día de entrenamiento
  ↓
Agrega ejercicios
  ↓
Configura sets/reps/rest
  ↓
Guarda rutina
  ↓
Puede iniciar entrenamiento
```

### Puntos críticos

- No pedir demasiados datos al inicio.
- Ofrecer plantillas opcionales.
- Permitir saltar onboarding.
- Hacer que el usuario llegue rápido al primer workout.

---

## 13.2 Iniciar entrenamiento desde rutina

```text
Rutinas
  ↓
Selecciona rutina
  ↓
Selecciona día
  ↓
Start Workout
  ↓
Zenlift crea WorkoutSession activa
  ↓
Carga ejercicios configurados
  ↓
Muestra últimos valores registrados
```

---

## 13.3 Registrar set

```text
Usuario ve ejercicio actual
  ↓
Zenlift muestra peso/reps anteriores
  ↓
Usuario ajusta peso si hace falta
  ↓
Usuario ajusta reps
  ↓
Marca set como completado
  ↓
Zenlift guarda set
  ↓
Zenlift inicia rest timer
  ↓
Usuario continúa siguiente set
```

---

## 13.4 Finalizar entrenamiento

```text
Usuario pulsa Finish
  ↓
Zenlift valida sets completados
  ↓
Calcula duración
  ↓
Calcula volumen
  ↓
Detecta PRs
  ↓
Guarda sesión completada
  ↓
Muestra resumen
```

---

## 13.5 Revisar progreso

```text
Usuario abre Progress
  ↓
Selecciona ejercicio o vista general
  ↓
Zenlift consulta historial local
  ↓
Calcula métricas
  ↓
Muestra gráfica y records
```

---

## 14. Pantallas principales

## 14.1 Onboarding

### Objetivo

Presentar el valor de la app y configurar lo mínimo.

### Pantallas sugeridas

1. Bienvenida.
2. Elige unidad: kg/lb.
3. Objetivo semanal opcional.
4. Crear primera rutina o usar plantilla.

### Regla

El onboarding debe ser corto. El usuario debe poder saltarlo.

---

## 14.2 Home Screen

### Componentes

- Greeting simple.
- Start Workout CTA.
- Last Workout Card.
- Weekly Activity Card.
- Current Routine Card.
- Recent PRs.

---

## 14.3 Routines Screen

### Componentes

- Lista de rutinas.
- Botón crear rutina.
- Rutinas archivadas.
- Plantillas sugeridas.

---

## 14.4 Routine Detail Screen

### Componentes

- Nombre de rutina.
- Días.
- Ejercicios por día.
- Editar.
- Reordenar.
- Start Workout.

---

## 14.5 Exercise Library Screen

### Componentes

- Search bar.
- Filtros.
- Lista de ejercicios.
- Crear ejercicio.
- Favoritos.

---

## 14.6 Active Workout Screen

### Componentes críticos

- Header con duración.
- Ejercicios en cards.
- Sets editables.
- Previous performance.
- Add set.
- Add exercise.
- Rest timer.
- Finish button.

Esta es probablemente la pantalla más importante de todo Zenlift.

---

## 14.7 Workout Summary Screen

### Componentes

- Duración.
- Volumen total.
- Ejercicios realizados.
- Sets completados.
- PRs nuevos.
- Comparación con sesión anterior.
- Notas.

---

## 14.8 History Screen

### Componentes

- Calendario o lista.
- Workouts agrupados por fecha.
- Filtros por rutina/ejercicio.
- Detalle de sesión.

---

## 14.9 Progress Screen

### Componentes

- Overview general.
- Selector de ejercicio.
- Gráfica de volumen.
- Gráfica de estimated 1RM.
- PRs.
- Frecuencia semanal.
- Muscle distribution.

---

## 14.10 Settings Screen

### Componentes

- Peso: kg/lb.
- Tema claro por defecto; oscuro/sistema como opción configurable.
- Timer por defecto.
- Objetivo semanal.
- Exportar datos.
- Importar datos, si aplica.
- Borrar datos.
- About Zenlift.

---

## 15. UX de registro de sets

### 15.1 Principio

El registro de un set debe sentirse casi instantáneo.

### 15.2 Recomendaciones

- Inputs grandes (mínimo 48px de altura para cumplir con touch targets de accesibilidad).
- Teclado numérico (`keyboardType="numeric"`).
- Botones +/- a los lados de cada input para ajustar sin teclear (crítico para uso con una mano o sudor).
- Valores anteriores precargados del último workout con el mismo ejercicio.
- Check rápido (tap en botón check, o swipe right en la fila del set).
- Evitar modales y alerts — toda interacción debe ser inline.
- **Haptic feedback** (`expo-haptics`) al completar un set: una vibración corta confirma la acción sin necesidad de mirar la pantalla.
- **El set row debe tener al menos 56px de altura** — touch target mínimo para uso en movimiento.

### 15.3 Ejemplo de set row

```text
Set | Previous     | kg [-] [input] [+] | reps [-] [input] [+] | ✓
1   | 60kg × 10    |     [ 62.5 ]        |      [ 8 ]           | ☐
2   | 60kg × 9     |     [ 62.5 ]        |      [ 8 ]           | ☐
3   | 60kg × 8     |     [ 60.0 ]        |      [ 10 ]          | ☑
```

- El set completado (✓ o ☑) muestra feedback visual de éxito (verde suave reservado para estado completado, texto tachado).
- Los inputs del siguiente set reciben foco automáticamente al completar el actual.
- El botón +/- ajusta en incrementos de 2.5 kg (o 5 lb).

### 15.4 Criterio de calidad

Un usuario debe poder registrar una serie en menos de 3 segundos.

### 15.5 Accesibilidad

- **Contraste mínimo 4.5:1** en texto de peso/reps (WCAG AA).
- **Labels accesibles:** cada input debe tener `accessibilityLabel` (ej: "Peso para serie 2, valor anterior 60 kilogramos").
- **TalkBack/VoiceOver:** el botón de check debe anunciar "Serie completada. 62.5 kilogramos, 8 repeticiones".
- **Tamaño de fuente mínimo 16dp** en inputs — evita zoom automático en iOS y mejora legibilidad.

### 15.6 Comportamiento del teclado

- `returnKeyType="next"` en input de peso → salta al input de reps.
- `returnKeyType="done"` en input de reps → completa el set automáticamente (mismo efecto que tap en ✓).
- `blurOnSubmit={false}` en peso para mantener el teclado abierto al saltar a reps.
- El contenedor del set row NO debe moverse al aparecer el teclado (el timer está en un header fijo).
- Si el usuario hace scroll durante la edición, el input enfocado no debe perder el foco.

### 15.7 Modo "rápido" (P2)

Para usuarios avanzados que quieren máxima velocidad:

- **Triple-tap** en cualquier parte de la fila del set = completar set con peso y reps idénticos al set anterior.
- **Long-press** en el check = completar set y abrir menú de tipo de set (warmup, drop, failure, AMRAP).

---

## 16. Diferenciación contra Hevy y Strong

Zenlift no debe copiar sin criterio. Debe aprender de la categoría y encontrar su ángulo.

### 16.1 Strong App

Strong es fuerte por:

- Simplicidad.
- Velocidad.
- Tracking confiable.
- Experiencia enfocada en fuerza.

Zenlift debe igualar o superar la velocidad de registro.

### 16.2 Hevy

Hevy es fuerte por:

- Diseño moderno.
- Historial claro.
- Componente social.
- Buenas estadísticas.

Zenlift puede diferenciarse si prioriza:

- UX más limpia.
- Mejor experiencia en español.
- Menos ruido social si el usuario solo quiere tracking.
- Insights más accionables.
- Personalización visual.

### 16.3 Posicionamiento posible

**Zenlift: el workout tracker simple, moderno y enfocado en progreso para usuarios que quieren entrenar mejor sin complicarse.**

### 16.4 Diferenciadores concretos

- App ligera y rápida.
- Excelente experiencia en Android.
- Diseño premium.
- Rutinas fáciles de crear.
- Historial comprensible.
- Progreso explicado en lenguaje claro.
- Local-first sin depender de conexión.
- Enfoque en usuarios hispanohablantes como ventaja inicial.

---

## 17. MVP recomendado

### 17.1 Objetivo del MVP

Validar que el usuario puede:

- Crear una rutina.
- Iniciar un workout.
- Registrar sets.
- Finalizar sesión.
- Consultar historial.
- Ver progreso básico.

### 17.2 Funciones P0

- Onboarding mínimo.
- Biblioteca básica de ejercicios.
- Crear ejercicio personalizado.
- Crear rutina.
- Crear días de rutina.
- Agregar ejercicios a rutina.
- Iniciar workout desde rutina.
- Registrar peso y reps.
- Agregar/eliminar sets.
- Finalizar workout.
- Historial de sesiones.
- Resumen de workout.
- Persistencia local.
- Ajuste kg/lb.

### 17.3 Funciones P1

- Timer de descanso.
- Personal records.
- Gráficas por ejercicio.
- Volumen por sesión.
- Duplicar rutina.
- Repetir workout.
- Notas.
- Filtros en historial.
- Tema oscuro/sistema opcional sobre light mode por defecto.

### 17.4 Funciones P2

- Plantillas de rutina.
- Estimated 1RM.
- Distribución por músculo.
- Calendario de consistencia.
- Exportar datos.
- Backup opcional.
- Importación futura.
- Widgets o accesos rápidos.

### 17.5 Fuera del MVP

- CRM.
- Web app.
- API.
- Gestión de coaches.
- Pagos.
- Marketplace.
- Chat.
- Reservas.
- Sistema de clientes.
- Dashboard administrativo.
- Nutrición compleja.
- IA avanzada.

---

## 18. Roadmap

## 18.1 Versión 0.1 — Core local tracker

Objetivo: registrar entrenamientos de forma funcional.

Incluye:

- Crear ejercicios.
- Crear rutinas.
- Iniciar workout.
- Registrar sets.
- Guardar sesión localmente.
- Ver historial básico.

## 18.2 Versión 0.5 — MVP usable

Objetivo: que una persona pueda reemplazar notas/libreta.

Incluye:

- Biblioteca de ejercicios.
- Rutinas con días.
- Previous values.
- Resumen de sesión.
- Settings kg/lb.
- Persistencia confiable.
- Edición de sesiones.

## 18.3 Versión 1.0 — Play Store release

Objetivo: publicar una versión suficientemente pulida.

Incluye:

- UI final consistente.
- Timer de descanso.
- PRs.
- Historial completo.
- Progreso básico.
- Tema claro por defecto con opción oscuro/sistema si se decide.
- Onboarding.
- Manejo de errores.
- Performance optimizada.

## 18.4 Versión 1.5 — Progress intelligence

Objetivo: mejorar diferenciación por análisis.

Incluye:

- Gráficas avanzadas.
- Estimated 1RM.
- Volumen semanal.
- Distribución muscular.
- Comparaciones.
- Insights textuales.

## 18.5 Versión 2.0 — Retención y monetización

Objetivo: convertir Zenlift en producto sostenible.

Incluye:

- Freemium.
- Premium features.
- Backup en la nube opcional.
- Sincronización entre dispositivos, si se agrega backend en el futuro.
- Exportación avanzada.
- Plantillas premium.
- Estadísticas premium.

---

## 19. Monetización posible

Aunque Zenlift puede iniciar gratis, debe tener una estrategia futura.

### 19.1 Freemium

Gratis:

- Rutinas limitadas o ilimitadas según estrategia.
- Tracking básico.
- Historial reciente.
- Biblioteca básica.

Premium:

- Estadísticas avanzadas.
- Historial ilimitado, si se decide limitar.
- Plantillas avanzadas.
- Backup en nube.
- Exportación.
- Temas personalizados.
- Insights avanzados.

### 19.2 Compra única

Otra opción es una compra única para desbloquear Zenlift Pro.

Ventajas:

- Simple para usuarios.
- Menos fricción psicológica.
- Buena para apps independientes.

Desventajas:

- Menos ingresos recurrentes.
- Difícil financiar mantenimiento continuo.

### 19.3 Suscripción

Ventajas:

- Ingreso recurrente.
- Permite financiar mejoras.
- Compatible con backup, sync y features cloud futuras.

Desventajas:

- Los usuarios comparan mucho contra apps gratuitas.
- Requiere valor premium claro.

---

## 20. Métricas de producto

### 20.1 Activación

- Usuario crea primera rutina.
- Usuario inicia primer workout.
- Usuario completa primer workout.

### 20.2 Retención

- Workouts por semana.
- Usuarios que registran workout en semana 2.
- Usuarios que vuelven después de 7 días.
- Usuarios que crean más de una rutina.

### 20.3 Engagement

- Sets registrados por sesión.
- Sesiones por usuario.
- Ejercicios personalizados creados.
- Uso de timer.
- Consultas a progreso.

### 20.4 Calidad de experiencia

- Tiempo para registrar un set.
- Crash-free sessions.
- Pérdida de datos reportada.
- Tiempo de carga de workout activo.

---

## 21. Riesgos del producto

### 21.1 Mercado competido

Hevy y Strong ya son fuertes. Zenlift necesita un ángulo claro.

**Severidad:** Alta | **Probabilidad:** Alta

Mitigación:

- Enfocarse en experiencia Android muy pulida (Hevy y Strong priorizan iOS).
- Diferenciar con idioma (español nativo, no traducción automática), diseño premium e insights accionables.
- Construir una app más simple y agradable para usuarios que no quieren complejidad social.
- Apuntar al mercado hispanohablante como ventaja inicial (100M+ usuarios potenciales).

### 21.2 Fricción durante entrenamiento

Si registrar sets es lento, la app pierde valor inmediatamente.

**Severidad:** Crítica | **Probabilidad:** Alta

Mitigación:

- Optimizar Active Workout Screen como prioridad #1.
- Reducir taps: un set debe registrarse en < 3 segundos.
- Precargar valores anteriores del último workout.
- Autosave inmediato en cada set completado.
- Haptic feedback para confirmación táctil.
- Botones +/- para ajustes sin teclear.

### 21.3 Pérdida de datos

Si se pierde un workout, el usuario pierde confianza permanentemente.

**Severidad:** Crítica | **Probabilidad:** Media

Mitigación:

- Persistencia inmediata a SQLite en cada set completado (no al final del workout).
- Recuperación de sesión activa al reabrir la app (buscar `status='active'` en SQLite).
- Cola de reintentos en MMKV si SQLite falla temporalmente.
- Timestamps en cada operación para detectar y resolver duplicados.
- Tests automatizados de recuperación de sesión.

### 21.4 Sobrecarga de features

Intentar agregar IA, social, nutrición, pagos o coaching puede desviar el producto.

**Severidad:** Alta | **Probabilidad:** Alta

Mitigación:

- Mantener foco absoluto en workout tracking.
- Roadmap disciplinado con criterios claros de entrada para cada feature.
- Construir primero el loop core (rutina → workout → historial → progreso).
- Toda feature nueva debe responder "¿mejora el loop core o lo distrae?"

### 21.5 Rendimiento en dispositivos de gama baja

La mayoría del mercado Android usa dispositivos de gama media-baja (2-4 GB RAM). Una app pesada o lenta no será adoptada.

**Severidad:** Alta | **Probabilidad:** Media

Mitigación:

- FlashList en TODAS las listas con inputs.
- SQLite WAL mode para no bloquear lecturas.
- Evitar animaciones pesadas y librerías UI infladas.
- Medir tiempo de arranque y memoria en un dispositivo de gama baja (ej: Moto G, 3GB RAM).
- APK objetivo < 30 MB (sin contar assets nativos de Expo).

### 21.6 Abandono por onboarding complejo

Si el usuario no llega a su primer workout en < 5 minutos, la tasa de abandono se dispara.

**Severidad:** Alta | **Probabilidad:** Alta

Mitigación:

- Onboarding de 3 pantallas máximo, skipeable.
- Templates de rutinas pre-cargadas (Push/Pull/Legs, Upper/Lower, Full Body).
- El usuario debe poder iniciar un "Quick Workout" sin crear rutina (workout vacío, agrega ejercicios sobre la marcha).
- No pedir registro, email, ni datos personales.

### 21.7 Errores silenciosos en SQLite

Un error de base de datos no detectado puede corromper datos sin que el usuario lo note hasta semanas después.

**Severidad:** Crítica | **Probabilidad:** Baja

Mitigación:

- Try/catch en TODAS las operaciones de repositorio.
- Result<T, E> pattern en capa de dominio para errores recuperables.
- ErrorBoundary en UI para crashes de render.
- Logging de errores en desarrollo (en producción, solo métricas anónimas de crash).
- Test de integración que inserte 1000 sets y verifique integridad.

### 21.8 Fatiga del teclado en workout activo

Si el usuario tiene que alternar constantemente entre peso y reps tocando inputs pequeños, se fatiga y abandona.

**Severidad:** Media | **Probabilidad:** Alta

Mitigación:

- returnKeyType="next" en peso → salta automáticamente a reps.
- returnKeyType="done" en reps → completa el set automáticamente.
- Botones +/- para ajustar sin teclear (útil con una mano).
- Teclado numérico (no alfanumérico) en ambos inputs.

### 21.9 Sincronización futura con datos locales sin UUIDs

Si hoy se usan IDs numéricos autoincrementales, migrar a sync multi-dispositivo en el futuro requeriría reasignar todos los IDs — una migración extremadamente costosa y arriesgada.

**Severidad:** Baja (hoy) → Crítica (futuro) | **Probabilidad:** Media

Mitigación:

- UUIDs desde el día 1. Costo: cero. Beneficio futuro: enorme.
- Los UUIDs son el estándar para sistemas offline-first con sync diferido.

### 21.10 Competidor agrega español

Hevy o Strong podrían agregar localización en español en cualquier momento, eliminando la ventaja de diferenciación por idioma.

**Severidad:** Alta | **Probabilidad:** Media

Mitigación:

- El idioma es solo UNA palanca de diferenciación, no la única.
- Construir fosos competitivos más profundos: velocidad de registro, insights accionables, diseño premium.
- Enfocarse en la calidad de la experiencia en Android (donde los competidores priorizan iOS).
- Comunidad y presencia en mercado hispano desde el día 1 (Play Store listing en español, redes sociales, reseñas).

---

## 22. Backlog priorizado

### P0 — Core loop

- Crear rutina.
- Crear día.
- Agregar ejercicio.
- Iniciar workout.
- Registrar set.
- Finalizar workout.
- Guardar historial.
- Ver workout anterior.

### P1 — Usabilidad real

- Previous performance.
- Timer de descanso.
- Editar sets.
- Reordenar ejercicios.
- Duplicar rutina.
- Tema oscuro/sistema opcional sobre light mode por defecto.
- Settings kg/lb.

### P2 — Progreso

- PR detection.
- Volumen total.
- Gráficas por ejercicio.
- Estimated 1RM.
- Calendario de actividad.

### P3 — Diferenciación

- Insights textuales.
- Plantillas inteligentes.
- Distribución muscular.
- Exportación.
- Backup opcional.

---

## 23. Criterios de éxito del MVP

Zenlift MVP se considera exitoso si:

- El usuario puede crear una rutina sin instrucciones externas.
- El usuario puede iniciar y finalizar un workout completo.
- Registrar un set toma menos de 3 segundos.
- La app muestra valores anteriores correctamente.
- El historial se guarda sin pérdida de datos.
- El usuario puede ver progreso básico por ejercicio.
- La experiencia se siente suficientemente rápida para usarse en gimnasio.
- La app puede reemplazar notas o libreta para un usuario real.

---

## 24. Estrategia de implementación

### 24.1 Fase 1 — Estructura base

- Configurar React Native.
- Configurar TypeScript.
- Configurar navegación.
- Definir tema.
- Definir estructura de carpetas.
- Definir storage local.

### 24.2 Fase 2 — Datos core

- Modelo de ejercicios.
- Modelo de rutinas.
- Modelo de días.
- Modelo de sesiones.
- Modelo de sets.
- Repositorios locales.

### 24.3 Fase 3 — Rutinas

- Crear rutina.
- Editar rutina.
- Agregar ejercicios.
- Configurar sets/reps.
- Reordenar.

### 24.4 Fase 4 — Workout activo

- Start workout.
- Active workout screen.
- Set logging.
- Autosave.
- Rest timer.
- Finish workout.

### 24.5 Fase 5 — Historial y progreso

- Historial de sesiones.
- Detalle de sesión.
- Cálculo de volumen.
- PR detection.
- Gráficas básicas.

### 24.6 Fase 6 — Pulido para Play Store

- Icono.
- Splash screen.
- Empty states.
- Error states.
- Performance.
- Testing manual.
- Build release.
- Store listing.

---

## 25. Testing recomendado

### 25.1 Casos críticos

- Crear rutina desde cero.
- Iniciar workout desde rutina.
- Registrar múltiples ejercicios.
- Registrar múltiples sets.
- Cerrar app durante workout y recuperar sesión.
- Finalizar workout.
- Editar workout pasado.
- Cambiar kg/lb.
- Crear ejercicio personalizado.
- Ver historial después de reiniciar app.

### 25.2 Tests unitarios útiles

- Cálculo de volumen.
- Estimated 1RM.
- Detección de PR.
- Conversión kg/lb.
- Agrupación por semana.
- Distribución por músculo.

### 25.3 Pruebas manuales en gimnasio

La app debe probarse en el contexto real:

- Con una mano.
- Con sudor.
- Con cansancio.
- Entre series.
- Con mala conexión.
- Con poco tiempo.

Ese contexto importa más que una prueba cómoda en escritorio.

---

## 26. Portfolio strategy

Zenlift puede presentarse como un proyecto mobile fuerte porque demuestra:

- React Native.
- Arquitectura local-first.
- Diseño de producto B2C.
- Mobile UX.
- Persistencia local.
- Modelado de datos offline.
- Cálculo de métricas.
- Visualización de progreso.
- Diseño competitivo contra apps reales como Hevy y Strong.

### 26.1 Descripción para CV

**Zenlift — React Native workout tracker app**

Diseñé y desarrollé una aplicación móvil de seguimiento de entrenamientos enfocada en usuarios de gimnasio, permitiendo crear rutinas, registrar series, pesos y repeticiones, consultar historial, detectar records personales y visualizar progreso de fuerza. La app fue construida con React Native, arquitectura local-first y persistencia en dispositivo para funcionar de forma confiable durante entrenamientos reales.

### 26.2 Bullets para CV

- Built a React Native workout tracker app focused on fast set logging, routine creation and workout history.
- Designed a local-first data model for exercises, routines, workout sessions and set logs.
- Implemented progress calculations including training volume, personal records and exercise history.
- Created a mobile-first UX optimized for real gym usage, reducing friction during active workouts.
- Positioned the product against leading workout trackers such as Hevy and Strong App.

---

## 27. Conclusión

Zenlift debe enfocarse completamente en el usuario final que quiere registrar y mejorar sus entrenamientos. Su valor no está en administrar gimnasios, clientes o coaches, sino en ofrecer una experiencia móvil rápida, clara y confiable para tracking personal.

El núcleo del producto es el loop:

```text
Crear rutina → Iniciar workout → Registrar sets → Finalizar sesión → Ver progreso → Repetir mejorando
```

Todo lo demás debe evaluarse según si mejora o distrae de ese loop.

Para competir con Hevy y Strong, Zenlift necesita ser extremadamente buena en tres cosas:

1. Registro rápido durante el entrenamiento.
2. Historial y progreso fáciles de entender.
3. Experiencia mobile pulida, especialmente para usuarios Android y/o hispanohablantes.

El MVP debe evitar cualquier desviación hacia CRM, web, SaaS, pagos, reservas o gestión de negocios. Zenlift es una app de workout tracking. Esa claridad de enfoque es su mayor ventaja inicial.

---

## 28. Competitor Teardown: Hevy & Strong App

Para competir, hay que entender exactamente qué hace bien (y mal) cada competidor. Este análisis debe realizarse USANDO las apps en entrenamientos reales. Aquí se documenta el framework de análisis.

### 28.1 Dimensiones de análisis

| Dimensión | Qué evaluar |
|---|---|
| **Onboarding** | Tiempo hasta el primer workout. Fricción inicial. |
| **Registro de sets** | Velocidad (segundos por set). UX del input. Valores previos. |
| **Rutinas** | Facilidad de crear, editar, duplicar. Templates. |
| **Historial** | Visualización. Filtros. Búsqueda. Edición retroactiva. |
| **Progreso** | Métricas mostradas. Gráficas. Insights. PRs. |
| **Timer** | Visibilidad. Personalización. Persistencia entre pantallas. |
| **Offline** | ¿Funciona sin internet? ¿Sincroniza después? |
| **UI/UX general** | Velocidad percibida. Consistencia visual. Animaciones. |
| **Idioma** | ¿Español disponible? Calidad de la traducción. |
| **Social** | Componente social. ¿Es opcional o intrusivo? |
| **Monetización** | Modelo. Qué es gratis vs premium. |

### 28.2 Strong App — Fortalezas

- **Velocidad de registro legendaria** — la referencia de la industria. Un set se registra en ~2 segundos.
- **Simplicidad extrema** — sin features innecesarias. Solo tracking de fuerza.
- **Confiabilidad** — años en el mercado, prácticamente sin bugs de pérdida de datos.
- **Enfoque en fuerza pura** — sin distracciones de hipertrofia, cardio, nutrición.

### 28.3 Strong App — Debilidades

- **Diseño anticuado** — la UI parece de 2016. Sin tema oscuro nativo atractivo.
- **Sin insights** — muestra datos, no los interpreta. Cero "actionable insights".
- **Rutinas rígidas** — cambiar ejercicios sobre la marcha es tedioso.
- **Sin componente social ni gamificación** — tracking puro, sin motivación externa.
- **Prioriza iOS** — la experiencia Android es secundaria.
- **Sin español** — solo inglés.

### 28.4 Hevy — Fortalezas

- **Diseño moderno y pulido** — UI atractiva, consistente, con animaciones agradables.
- **Historial excelente** — fácil de navegar, visualmente claro.
- **Estadísticas sólidas** — volumen, frecuencia, distribución muscular, PRs.
- **Componente social opcional** — puedes seguir a otros, compartir workouts, pero sin ser intrusivo.
- **Buen balance simplicidad/profundidad** — principiantes e intermedios encuentran valor.

### 28.5 Hevy — Debilidades

- **Registro de sets más lento que Strong** — la UI bonita añade fricción.
- **El componente social puede distraer** — notificaciones, feeds, seguimiento.
- **Timer básico** — funcional pero no destaca.
- **Rutinas limitadas en versión gratuita** — solo 3 rutinas en free tier.
- **Sin español nativo** — la app está en inglés. Las traducciones automáticas en reseñas son malas.

### 28.6 Oportunidades para Zenlift

| Oportunidad | Cómo capitalizarla |
|---|---|
| **Velocidad de Strong + Diseño de Hevy** | Igualar la velocidad de registro de Strong con una UI moderna. |
| **Español nativo** | No traducir — diseñar la app EN español desde el inicio. |
| **Android-first** | Pulir la experiencia Android antes de considerar iOS. |
| **Sin ruido social** | Workout tracking puro, sin feeds, follows ni notificaciones sociales. |
| **Insights accionables** | No mostrar solo datos — explicar qué significan. |
| **Offline-first real** | Funcionar perfecto sin internet, no solo "modo offline" limitado. |
| **Onboarding en < 3 minutos** | Templates pre-cargados, "Quick Workout" inmediato. |

### 28.7 Plan de análisis práctico

Antes de escribir código de producción, dedicar 3-4 sesiones de gimnasio reales usando:

1. **Sesión 1:** Usar Strong App durante todo el entrenamiento. Documentar cada fricción.
2. **Sesión 2:** Usar Hevy durante todo el entrenamiento. Documentar cada fricción.
3. **Sesión 3:** Alternar entre ambas en el mismo workout. Comparar directamente.

Documentar: tiempo por set, taps necesarios, momentos de confusión, features que hicieron falta.

---

## 29. Estrategia de Testing

### 29.1 Pirámide de testing

```
         ┌──────┐
         │ E2E  │  ← Pruebas manuales en gimnasio (5-10 casos)
         ├──────┤
         │ INT  │  ← Tests de integración de repositorios SQLite (20-30 casos)
         ├──────┤
         │UNIT  │  ← Tests unitarios de funciones puras (50+ casos)
         └──────┘
```

### 29.2 Tests unitarios (P0)

Todas las funciones en `domain/calculations/` y `domain/services/` deben tener tests unitarios.

```typescript
// domain/calculations/__tests__/volume.test.ts
describe('calculateVolume', () => {
  it('calcula volumen de un set: peso × reps', () => {
    expect(calculateVolume(60, 10)).toBe(600);
  });
  it('retorna 0 si peso es 0', () => { ... });
  it('retorna 0 si reps es 0', () => { ... });
});

describe('calculateSessionVolume', () => {
  it('suma el volumen de todos los sets completados', () => { ... });
  it('ignora sets no completados', () => { ... });
  it('ignora warmup sets', () => { ... });
});

// domain/calculations/__tests__/oneRM.test.ts
describe('estimate1RM (Epley)', () => {
  it('calcula 1RM estimado con fórmula de Epley', () => {
    expect(estimate1RM(80, 6)).toBeCloseTo(96, 0);
  });
  it('retorna el peso si reps = 1', () => { ... });
  it('maneja reps = 0', () => { ... });
});

// domain/services/__tests__/prDetection.test.ts
describe('detectPRs', () => {
  it('detecta nuevo PR de peso máximo', () => { ... });
  it('detecta nuevo PR de volumen', () => { ... });
  it('detecta nuevo estimated 1RM', () => { ... });
  it('no detecta PR si no supera el anterior', () => { ... });
  it('maneja primer workout (sin PRs previos)', () => { ... });
});

// utils/__tests__/units.test.ts
describe('kgToLb', () => {
  it('convierte 100 kg a 220.46 lb', () => { ... });
});
describe('lbToKg', () => {
  it('convierte 220.46 lb a 100 kg', () => { ... });
});
describe('formatWeight', () => {
  it('formatea en kg con 1 decimal', () => { ... });
  it('formatea en lb sin decimales', () => { ... });
});
```

### 29.3 Tests de integración (P1)

Tests que ejercitan los repositorios contra una base de datos SQLite real (en memoria o archivo temporal).

```typescript
// storage/repositories/__tests__/exerciseRepo.test.ts
describe('ExerciseRepo', () => {
  let db: SQLiteDatabase;
  let repo: ExerciseRepo;

  beforeEach(async () => {
    db = await openDatabaseAsync(':memory:');
    await runMigrations(db);
    repo = new ExerciseRepo(db);
  });

  it('creates and retrieves an exercise', async () => { ... });
  it('searches exercises by name (case insensitive)', async () => { ... });
  it('filters by muscle group via exercise_muscles join', async () => { ... });
  it('filters by equipment', async () => { ... });
  it('updates an exercise', async () => { ... });
  it('deletes an exercise and its muscle associations (CASCADE)', async () => { ... });
});

// storage/repositories/__tests__/workoutRepo.test.ts
describe('WorkoutRepo', () => {
  it('creates a session, adds exercises, adds sets, completes session', async () => { ... });
  it('getActiveSession returns null when no active session', async () => { ... });
  it('getActiveSession returns the active session', async () => { ... });
  it('getFullSession returns session with nested exercises and sets', async () => { ... });
  it('recovers active session after simulated app close', async () => { ... });
  it('completeSession calculates duration correctly', async () => { ... });
});

// storage/migrations/__tests__/migrations.test.ts
describe('Migrations', () => {
  it('applies v1 migration on fresh database', async () => { ... });
  it('does not reapply already-applied migrations', async () => { ... });
  it('migrates from v1 to v2 (future test)', async () => { ... });
});
```

### 29.4 Tests manuales (P0 — críticos)

Casos que no se pueden automatizar fácilmente y DEBEN probarse manualmente:

1. **Crear rutina desde cero** — ¿Un usuario nuevo puede hacerlo sin instrucciones?
2. **Iniciar workout desde rutina** — ¿Los ejercicios aparecen en orden? ¿Los valores previos son correctos?
3. **Registrar 20 sets** — ¿Se siente rápido? ¿Hay lag?
4. **Cerrar app durante workout** — ¿Se recupera la sesión al reabrir?
5. **Cambiar kg/lb** — ¿El historial se muestra en la unidad correcta?
6. **PR detection** — ¿Se detecta correctamente al finalizar un workout con nuevo récord?
7. **Modo avión** — ¿La app funciona completamente offline?
8. **Gimnasio real** — ¿Se puede usar con una mano, sudor, prisa, música fuerte?

### 29.5 Herramientas de testing

- **Jest** — test runner (incluido en Expo/RN).
- **jest-expo** — preset para tests en entorno Expo.
- **@testing-library/react-native** — para tests de componentes (P2, post-MVP).
- **expo-sqlite con :memory:** — para tests de integración de repositorios (sin tocar la DB real del usuario).

---

## 30. CI/CD y Release Pipeline

### 30.1 Control de versiones

- **GitHub** como host del repositorio (público, open source).
- **main** branch protegida — requiere PR review (de otro agente IA o humano).
- **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

### 30.2 CI con GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx jest --coverage
```

### 30.3 Build con EAS (Expo Application Services)

```bash
# Desarrollo
eas build --profile development --platform android

# Preview (APK para testers)
eas build --profile preview --platform android

# Producción (AAB para Play Store)
eas build --profile production --platform android

# Submit a Play Store
eas submit --platform android --profile production
```

### 30.4 Perfiles de build (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store",
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### 30.5 Versionado

- **SemVer:** `MAJOR.MINOR.PATCH`
- `MAJOR` — cambios que rompen compatibilidad de datos (migración de schema incompatible).
- `MINOR` — nuevas features.
- `PATCH` — bug fixes.
- Versión en `app.json` → `expo.version` y `expo.android.versionCode` (entero incremental).
- VersionCode = `MAJOR * 10000 + MINOR * 100 + PATCH`.

### 30.6 Release checklist

Antes de cada release a Play Store:

- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] `npx jest` pasa sin fallos.
- [ ] La app compila con `eas build --profile production`.
- [ ] Prueba manual en dispositivo Android físico (no solo emulador).
- [ ] Prueba de upgrade desde versión anterior (si aplica).
- [ ] Migraciones de DB ejecutadas correctamente en upgrade.
- [ ] Store listing actualizado (descripción, screenshots, changelog).

---

## 31. Seguridad y Privacidad

### 31.1 Datos del usuario

Zenlift maneja datos de salud/ejercicio. Aunque son locales, la protección es importante:

- **Todos los datos se almacenan localmente** en SQLite y MMKV. No se envían a ningún servidor.
- **No hay tracking, analytics ni telemetría** en el MVP. Si se agrega en el futuro, debe ser opt-in.
- **No se recopila información personal** — sin email, sin nombre, sin registro.
- **El backup manual** (.zenlift JSON) es responsabilidad del usuario. Si se agrega backup en nube, debe ser cifrado.

### 31.2 Cifrado (futuro)

Si se agrega backup en nube (P3/v2.0):

- Cifrar el archivo .zenlift con AES-256 antes de subir.
- Clave derivada de un passphrase del usuario (PBKDF2).
- El proveedor de nube (Google Drive, iCloud) nunca ve los datos en texto plano.

### 31.3 Permisos de Android

Zenlift debe pedir los MÍNIMOS permisos necesarios:

| Permiso | Justificación |
|---|---|
| `VIBRATE` | Haptic feedback al completar sets y timer. |
| `FOREGROUND_SERVICE` | Solo si se implementa timer con notificación persistente (P2). |

Permisos que NO se deben pedir:

- `INTERNET` — solo si se agrega backup en nube (futuro).
- `ACCESS_NETWORK_STATE` — innecesario para app offline.
- `READ/WRITE_EXTERNAL_STORAGE` — innecesario (FileSystem usa scoped storage).
- Location, Contacts, Camera, Microphone — nunca.

### 31.4 Seguridad del código

- **No hardcodear secretos** — aunque no hay API keys en el MVP, si se agregan en el futuro usar `expo-secure-store` o variables de entorno de EAS.
- **SQL injection:** usar siempre consultas parametrizadas (`runAsync(sql, [params])`), NUNCA concatenación de strings.
- **Dependencias:** revisar `npm audit` regularmente. Actualizar dependencias con vulnerabilidades conocidas.

---

## 32. AI-Driven Development Strategy

Ver documento complementario: `docs/ai_development_strategy.md`.

### 32.1 Herramientas disponibles

| Herramienta | Ubicación | Uso principal |
|---|---|---|
| **Hermes Agent** (`delegate_task`) | Tu asistente principal | Orquestación, planificación, tareas unitarias |
| **subagent-driven-development** | Skill de Hermes | Ejecución de planes con doble review |
| **writing-plans** | Skill de Hermes | Creación de planes detallados bite-sized |
| **spike** | Skill de Hermes | Prototipos desechables para validar decisiones |
| **Claude Code** (`claude -p`) | Terminal | One-shots de código, refactors, tests |
| **Codex** (`codex exec`) | Terminal | Features con integración GitHub |
| **OpenCode** (`opencode run`) | Terminal | Provider-agnostic, bueno para RN |

### 32.2 Flujo de trabajo IA

```
Blueprint → Spikes (validar) → Plan (writing-plans)
    → Ejecutar (subagent-driven-development) → Review → Tú pruebas → Fixes
```

### 32.3 Lo que la IA hace bien

- Escribir modelos de datos, migraciones SQL, tipos TypeScript.
- Implementar funciones puras (cálculos de volumen, 1RM, PRs, conversiones).
- Construir componentes React Native, hooks, navegación.
- Escribir tests unitarios y de integración.
- Revisar código (spec compliance + code quality).

### 32.4 Lo que la IA NO puede hacer

- Instalar Android Studio, ejecutar emulador, compilar APK.
- Probar en un dispositivo real.
- Sentir si la UI es rápida o frustrante.
- Publicar en Play Store.

### 32.5 Reglas de uso

1. **Una tarea = contexto fresco** — cada `delegate_task` recibe todo lo necesario (tipos, paths, librerías).
2. **TDD siempre** — cada tarea de código debe incluir "escribe el test primero".
3. **Revisa cada output** — compila y revisa visualmente después de cada feature.
4. **Spikes antes de decisiones** — 30 minutos de spike pueden ahorrar 3 días de refactor.

---

## 33. Glosario técnico

| Término | Definición |
|---|---|
| **1RM** | One Rep Max — peso máximo que puedes levantar en una repetición. |
| **AMRAP** | As Many Reps As Possible — set llevado al fallo muscular. |
| **Bro Split** | Rutina que entrena un grupo muscular por día (ej: lunes pecho, martes espalda). |
| **Drop Set** | Técnica donde reduces el peso después de llegar al fallo y sigues haciendo reps. |
| **Epley** | Fórmula para estimar 1RM: `weight × (1 + reps/30)`. |
| **FlashList** | Componente de Shopify que reemplaza FlatList con mejor rendimiento en scroll. |
| **MMKV** | Almacenamiento key-value de alto rendimiento (Tencent). |
| **PR** | Personal Record — mejor marca personal en un ejercicio. |
| **Push/Pull/Legs (PPL)** | Rutina de 3 días: empuje, tracción, pierna. |
| **RIR** | Reps In Reserve — cuántas repeticiones te quedaban antes del fallo. (No implementado en MVP). |
| **RPE** | Rate of Perceived Exertion — escala subjetiva de esfuerzo (1-10). (No implementado en MVP). |
| **SQLite WAL** | Write-Ahead Logging — modo de SQLite que permite lecturas concurrentes con escrituras. |
| **UUID** | Universally Unique Identifier — ID globalmente único, generado localmente sin servidor central. |
| **Upper/Lower** | Rutina de 2-4 días alternando tren superior e inferior. |
| **Volumen** | weight × reps — medida de trabajo total en un set/ejercicio/sesión. |
| **Warmup Set** | Set de calentamiento — no cuenta para volumen ni PRs. |
| **Zustand** | Librería de estado global minimalista para React. |
