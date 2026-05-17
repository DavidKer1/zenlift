# Zenlift — Product & Technical Blueprint

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

---

## 8. Modelo de dominio de alto nivel

### 8.1 Entidades principales

| Entidad | Descripción |
|---|---|
| UserProfile | Perfil local del usuario de la app. |
| Exercise | Ejercicio disponible o creado por el usuario. |
| MuscleGroup | Grupo muscular asociado a ejercicios. |
| Routine | Rutina o plantilla creada por el usuario. |
| RoutineDay | Día o bloque dentro de una rutina. |
| RoutineExercise | Ejercicio configurado dentro de una rutina. |
| WorkoutSession | Entrenamiento realizado o en curso. |
| WorkoutExercise | Ejercicio ejecutado dentro de una sesión. |
| SetLog | Registro individual de una serie. |
| PersonalRecord | Mejor marca detectada por ejercicio. |
| ProgressMetric | Métrica calculada de progreso. |
| RestTimer | Temporizador de descanso. |
| Note | Nota asociada a ejercicio, set o sesión. |
| AppSettings | Preferencias locales del usuario. |

### 8.2 Relaciones principales

```text
UserProfile
  └── Routine[]
        └── RoutineDay[]
              └── RoutineExercise[]
                    └── Exercise

UserProfile
  └── WorkoutSession[]
        └── WorkoutExercise[]
              └── SetLog[]

Exercise
  └── PersonalRecord[]

WorkoutSession
  └── ProgressMetric[]
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
- Tema: claro/oscuro/sistema.
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

Zenlift es una app móvil construida con React Native. La arquitectura debe ser local-first, simple, mantenible y preparada para crecer.

No se asume web, backend ni API en la versión actual.

### Arquitectura conceptual

```text
React Native App
  ├── UI Layer
  ├── Navigation Layer
  ├── State Layer
  ├── Domain Logic
  ├── Local Persistence
  ├── Analytics Calculations
  └── Device Features
```

### Objetivo técnico

- Funcionar rápido.
- Guardar datos localmente.
- Recuperar workouts en curso.
- Calcular estadísticas en dispositivo.
- Mantener una base de código clara.
- Evitar sobrearquitectura.

---

## 10.2 Stack sugerido

### Core

- React Native.
- TypeScript.
- Expo o React Native CLI, según el proyecto actual.
- React Navigation o Expo Router.

### Estado

Opciones recomendadas:

- Zustand para estado simple y global.
- React Context solo para estado pequeño.
- TanStack Query no es necesario si no hay API.

### Persistencia local

Opciones posibles:

- SQLite.
- WatermelonDB.
- Realm.
- MMKV para settings y estado pequeño.
- AsyncStorage solo para datos simples, no ideal para historial complejo.

Recomendación:

- **SQLite** para datos estructurados de workouts, rutinas, ejercicios y sets.
- **MMKV** para settings, flags y estado ligero.

### Formularios y validación

- React Hook Form.
- Zod.

### UI

- Componentes propios.
- NativeWind si se usa Tailwind en React Native.
- Tamagui, Restyle o Shopify FlashList si el diseño lo requiere.

### Gráficas

- react-native-svg.
- victory-native.
- react-native-gifted-charts.
- Recharts no aplica directamente en React Native puro.

### Fechas

- date-fns.

---

## 10.3 Capas internas recomendadas

```text
src/
  app/
    navigation/
    providers/
  features/
    home/
    routines/
    workout/
    exercises/
    history/
    progress/
    settings/
  domain/
    entities/
    services/
    calculations/
  storage/
    database/
    repositories/
    migrations/
  components/
    ui/
    workout/
    charts/
  utils/
    dates/
    units/
    formatters/
  theme/
```

### Principio

Las pantallas no deben contener lógica pesada de cálculo. Las estadísticas, PRs, volumen y progresión deben estar en servicios de dominio o funciones puras.

---

## 11. Modelo de datos local

## 11.1 exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| name | text | Nombre. |
| primaryMuscle | text | Músculo principal. |
| secondaryMuscles | text/json | Lista serializada. |
| equipment | text | Equipo. |
| category | text | Categoría. |
| isCustom | integer/boolean | Creado por usuario. |
| createdAt | text | Fecha de creación. |
| updatedAt | text | Última actualización. |

## 11.2 routines

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| name | text | Nombre de rutina. |
| description | text | Descripción opcional. |
| goal | text | Objetivo opcional. |
| isArchived | integer/boolean | Archivada o activa. |
| createdAt | text | Fecha de creación. |
| updatedAt | text | Última actualización. |

## 11.3 routine_days

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| routineId | text | Rutina padre. |
| name | text | Nombre del día. |
| sortOrder | integer | Orden. |

## 11.4 routine_exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| routineDayId | text | Día padre. |
| exerciseId | text | Ejercicio. |
| targetSets | integer | Series objetivo. |
| targetRepsMin | integer | Reps mínimas. |
| targetRepsMax | integer | Reps máximas. |
| restSeconds | integer | Descanso sugerido. |
| notes | text | Notas. |
| sortOrder | integer | Orden. |

## 11.5 workout_sessions

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| routineId | text nullable | Rutina usada. |
| routineDayId | text nullable | Día usado. |
| name | text | Nombre de sesión. |
| startedAt | text | Inicio. |
| endedAt | text nullable | Fin. |
| durationSeconds | integer | Duración. |
| status | text | active/completed/cancelled. |
| notes | text | Notas. |
| createdAt | text | Creación. |
| updatedAt | text | Actualización. |

## 11.6 workout_exercises

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| workoutSessionId | text | Sesión padre. |
| exerciseId | text | Ejercicio. |
| sortOrder | integer | Orden. |
| notes | text | Notas. |

## 11.7 set_logs

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| workoutExerciseId | text | Ejercicio dentro de sesión. |
| setNumber | integer | Número de serie. |
| weight | real | Peso. |
| reps | integer | Repeticiones. |
| setType | text | normal/warmup/drop/failure/amrap. |
| isCompleted | integer/boolean | Completado. |
| completedAt | text nullable | Momento de completado. |
| notes | text | Nota opcional. |

## 11.8 personal_records

| Campo | Tipo | Descripción |
|---|---|---|
| id | text | ID local. |
| exerciseId | text | Ejercicio. |
| workoutSessionId | text | Sesión asociada. |
| type | text | max_weight/max_volume/estimated_1rm/etc. |
| value | real | Valor del record. |
| weight | real nullable | Peso asociado. |
| reps | integer nullable | Reps asociadas. |
| achievedAt | text | Fecha. |

## 11.9 app_settings

| Campo | Tipo | Descripción |
|---|---|---|
| key | text | Clave. |
| value | text | Valor serializado. |

---

## 12. Estado de la app

### 12.1 Estado global mínimo

El estado global debe incluir solo lo necesario:

- Workout activo.
- Timer activo.
- Preferencias del usuario.
- Tema.
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
- Tema.
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

- Inputs grandes.
- Teclado numérico.
- Botones + / - para peso y reps.
- Valores anteriores precargados.
- Check rápido.
- Swipe o tap para completar.
- Evitar modales innecesarios.

### 15.3 Ejemplo de set row

```text
Set | Previous     | kg      | reps | ✓
1   | 60kg × 10    | 62.5    | 8    | [ ]
2   | 60kg × 9     | 62.5    | 8    | [ ]
3   | 60kg × 8     | 60      | 10   | [ ]
```

### 15.4 Criterio de calidad

Un usuario debe poder registrar una serie en menos de 3 segundos.

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
- Tema oscuro.

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
- Tema oscuro.
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

Mitigación:

- Enfocarse en experiencia Android muy pulida.
- Diferenciar con idioma, diseño e insights.
- Construir una app más simple y agradable para usuarios que no quieren complejidad social.

### 21.2 Fricción durante entrenamiento

Si registrar sets es lento, la app pierde valor.

Mitigación:

- Optimizar Active Workout Screen.
- Reducir taps.
- Precargar valores anteriores.
- Autosave.

### 21.3 Pérdida de datos

Si se pierde un workout, el usuario pierde confianza.

Mitigación:

- Persistencia inmediata.
- Recuperación de sesión activa.
- Manejo de cierres inesperados.

### 21.4 Sobrecarga de features

Intentar agregar IA, social, nutrición, pagos o coaching puede desviar el producto.

Mitigación:

- Mantener foco en workout tracking.
- Roadmap disciplinado.
- Construir primero el loop core.

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
- Tema oscuro.
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
