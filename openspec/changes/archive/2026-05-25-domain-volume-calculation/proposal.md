## Why

El volumen es la metrica de entrenamiento mas importante para medir la carga de trabajo. Sin funciones puras de calculo de volumen, no podemos mostrar progreso, detectar PRs, ni ofrecer feedback durante el workout. Son necesarias desde el MVP para cerrar el loop "Ver progreso".

## What Changes

- Crear `src/domain/calculations/volume.ts` con funciones puras:
  - `calculateSetVolume(weight, reps)` — volumen basico peso x reps
  - `calculateExerciseVolume(sets)` — suma sets completados, ignora warmups
  - `calculateSessionVolume(exercises)` — suma ejercicios de una sesion
  - `calculateMuscleVolume(exercises, muscleMap)` — agrupa volumen por grupo muscular
  - `calculateWeeklyVolume(sessions)` — agrupa volumen por semana ISO
- Crear tests unitarios en `src/domain/calculations/__tests__/volume.test.ts`
- No modifica repositorios, entidades, ni UI

## Capabilities

### New Capabilities
- `domain-volume-calculation`: Calculo puro de volumen de entrenamiento a nivel set, ejercicio, sesion, musculo y semana. Ignora warmup sets y sets no completados. Totalmente testeable sin base de datos.

### Modified Capabilities
<!-- None -->

## Impact

- Afecta: `src/domain/calculations/volume.ts` (nuevo), tests asociados
- Sin dependencias de UI, repositorios o base de datos
- Funciones puras exportadas para consumo desde screens, services y hooks
