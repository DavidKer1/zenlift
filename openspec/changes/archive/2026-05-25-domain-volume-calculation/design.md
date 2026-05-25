## Context

Zenlift necesita mostrar volumen de entrenamiento como la metrica principal de progreso. El volumen es la suma de peso x reps en sets completados (excluyendo warmups). Estas funciones seran consumidas desde screens de historial, progreso, y el workout activo. Deben ser puras (sin efectos secundarios, sin acceso a DB) para ser totalmente testeables.

Las entidades necesarias (`SetLog`, `WorkoutExerciseWithSets`, `FullSession`, `MuscleGroup`) ya estan definidas en el spec `domain-entities` y el repositorio de workouts (`workout-repository`) esta disponible para obtener las sesiones.

## Goals / Non-Goals

**Goals:**
- Funcion pura para volumen de un set individual (`calculateSetVolume`)
- Funcion pura para volumen de un ejercicio filtrando warmups/no completados (`calculateExerciseVolume`)
- Funcion pura para volumen total de una sesion (`calculateSessionVolume`)
- Funcion pura para volumen agrupado por grupo muscular (`calculateMuscleVolume`)
- Funcion pura para volumen agrupado por semana ISO (`calculateWeeklyVolume`)
- Tests con 100% coverage en todas las funciones
- Cero dependencias de runtime excepto `date-fns` (opcional, o implementacion manual de ISO week)

**Non-Goals:**
- Persistencia de volumen calculado en DB (se calcula on-demand)
- UI o componentes que consuman estas funciones
- Deteccion de PRs (eso es otro servicio de dominio)
- Calculo de intensidad, tonelaje, o metricas derivadas
- Soporte para sets de tipo dropset/superset en calculo de volumen (escala simple)

## Decisions

1. **Funciones puras con parametros explicitos**: Cada funcion recibe solo los datos que necesita (weight/reps, array de sets, etc.). No reciben objetos de dominio completos innecesariamente. Esto maximiza la testabilidad y permite reutilizar las funciones en distintos contextos.

2. **Muscle volume: volumen completo a cada musculo**: Cuando un ejercicio trabaja multiples grupos musculares, el volumen del ejercicio se asigna completo a cada grupo. Alternativa considerada: distribuir proporcionalmente. Se descarta por simplicidad — distribuir requiere pesos arbitrarios y no aporta valor suficiente en MVP.

3. **ISO week sin date-fns como dependencia obligatoria**: Implementar calculo manual de semana ISO para evitar forzar `date-fns` como dependency de un modulo puro. Si el proyecto ya usa `date-fns`, se puede usar `getISOWeek`. La funcion acepta un `Date` y extrae year/week.

4. **Orden de semanas garantizado**: `calculateWeeklyVolume` devuelve array ordenado por `weekStart` ascendente. Esto evita que el consumidor tenga que ordenar.

5. **Volumen 0 para sets con weight=0 o reps=0**: Evita NaN o resultados sin sentido. Un set con 0 peso o 0 reps no contribuye volumen.

## Risks / Trade-offs

- **[Riesgo] Cambio de formula de volumen en futuro**: Si se decide que dropsets o myoreps contribuyen diferente. → **Mitigacion**: La funcion `calculateSetVolume` es la unica que encapsula la formula. Cambiarla propaga a todas las demas automaticamente.
- **[Riesgo] Muscle map puede estar incompleto**: Si un exerciseId no tiene entrada en el muscleMap, se ignora silenciosamente. → **Mitigacion**: Documentar en el spec que el caller es responsable del mapping.
- **[Trade-off] Volumen duplicado en muscle volume**: Asignar el volumen completo a cada grupo muscular infla los totales si un ejercicio tiene 3+ grupos. → **Aceptado para MVP**: El usuario ve mas volumen del real, lo cual es motivacional y no causa problemas de seguridad.

## Open Questions

- Ninguna. El scope esta completamente definido.
