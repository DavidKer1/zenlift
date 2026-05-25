# Zenlift Architecture

## Enfoque

Zenlift es una app móvil local-first con React Native + Expo. No se asume backend, web app ni API para el MVP.

Objetivos técnicos:

- Funcionar rápido en Android, incluyendo gama media-baja.
- Guardar datos localmente sin red.
- Recuperar workouts activos tras cerrar la app.
- Calcular estadísticas en el dispositivo.
- Mantener tipos estrictos y lógica testeable.
- Evitar abstracciones para features que no existen.

## Stack recomendado

- React Native vía Expo managed workflow.
- TypeScript strict.
- Expo Router para navegación file-based.
- Zustand para estado global mínimo.
- React Context solo para theme.
- expo-sqlite para datos estructurados.
- react-native-mmkv para settings, flags y estado ligero.
- React Hook Form + Zod para formularios y validación.
- FlashList para listas con inputs o listas grandes.
- StyleSheet y componentes propios, sin UI kits pesados.
- date-fns para fechas.
- expo-haptics para feedback al completar sets y timer.
- react-native-svg + victory-native o gifted-charts para gráficas.

TanStack Query no es necesario mientras no haya API.

## Theme

Zenlift usa tema oscuro por defecto. El sistema de color, tipografía, espaciado y componentes está definido en `DESIGN.md`.

El tema es monocromático con profundidad por capas tonales (surface hierarchy). El color primario es purple/lavender (`#cfbcff`). El verde se reserva para estados de éxito/completado. Consultar `DESIGN.md` para los tokens completos.

## Estructura sugerida

```text
src/
  app/                    # Expo Router routes
  features/               # Lógica por feature
  domain/
    entities/             # Tipos puros
    services/             # PRs, estadísticas, reglas de negocio
    calculations/         # volumen, 1RM, unidades
  storage/
    database/             # conexión, schema, migraciones
    repositories/         # acceso a SQLite
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
  providers/
```

Las pantallas no deben contener lógica pesada. Cálculos, PRs, volumen y progresión viven en `domain/services/` o `domain/calculations/`.

## Estado

Estado global mínimo:

- Workout activo.
- Timer activo.
- Preferencias.
- Tema, con `dark` como default.
- Unidad de peso.

Reglas:

- Workout activo en Zustand, no solo en React state.
- Autosave a SQLite en cada set completado.
- `recoverSession()` reconstruye el store desde una sesión `status='active'`.
- Settings de alta frecuencia en MMKV.
- El resto se carga desde repositorios.

## Errores

Jerarquía:

```text
ErrorBoundary de React
  -> try/catch en repositories
  -> Result<T, E> en funciones de dominio
```

Reglas:

- Todo repository envuelve SQLite en try/catch.
- Relanzar como `DatabaseError` con contexto.
- No tragar errores silenciosamente.
- Las funciones puras de cálculo no lanzan excepciones; retornan `Result`.
- Durante workout activo, nunca perder un set: reintentar SQLite hasta 3 veces y usar cola temporal en MMKV si hace falta.

## Performance

Targets:

- Cold start menor a 2 segundos.
- Registrar un set en menos de 3 segundos.
- Persistencia de set menor a 100 ms, async y no bloqueante.
- Historial de 100 sesiones en menos de 500 ms.
- Active Workout con 60 FPS.

Reglas:

- FlashList en listas con inputs.
- `estimatedItemSize` siempre que se use FlashList.
- `React.memo` en filas de set y cards repetidas.
- `useCallback` para handlers de sets.
- SQLite en WAL mode.
- Índices en foreign keys y filtros frecuentes.
- Batch inserts para seed data.

## Teclado y workout activo

El teclado es crítico en Active Workout.

- Usar `keyboardType="numeric"` para peso y reps.
- Evitar `KeyboardAvoidingView` si causa saltos de layout.
- Hacer scroll automático al input enfocado.
- Mantener timer visible en header fijo.
- Botones +/- junto a inputs para ajustar sin teclear.
- `returnKeyType="next"` en peso.
- `returnKeyType="done"` en reps para completar set.

## Timer de descanso

No implementar countdown dependiente de un componente. Usar timestamps absolutos:

- Guardar `targetEnd = Date.now() + seconds * 1000`.
- Persistir `targetEnd` en MMKV.
- Calcular segundos restantes con `targetEnd - Date.now()`.
- La UI solo refleja el estado.
- Haptics al llegar a cero.

## Backup y exportación

P2:

- Exportar un JSON completo `.zenlift`.
- Usar `expo-file-system` + `expo-sharing`.
- Importar con `expo-document-picker`.
- Validar con Zod.
- Estrategia de import: merge por UUID, no replace.

## Seguridad y privacidad

- MVP sin registro, email, backend, analytics ni telemetría.
- Datos locales en SQLite/MMKV.
- Permisos mínimos.
- No pedir Location, Contacts, Camera o Microphone.
- Usar consultas SQL parametrizadas siempre.
- No hardcodear secretos.
