# Zenlift Architecture

## Enfoque

Zenlift es una app móvil local-first construida con Flutter y Dart. No se asume backend, web app ni API para el MVP.

Objetivos técnicos:

- Funcionar rápido en Android, incluyendo gama media-baja.
- Guardar datos localmente sin red.
- Recuperar workouts activos tras cerrar la app.
- Calcular estadísticas en el dispositivo.
- Mantener tipos estrictos y lógica testeable.
- Evitar abstracciones para features que no existen.

## Stack recomendado

- Flutter para UI mobile-first.
- Dart 3 con análisis estricto.
- go_router para navegación declarativa.
- flutter_riverpod para estado compartido cuando sea necesario.
- Drift con SQLite para datos estructurados.
- shared_preferences para settings, flags y estado ligero de recuperación.
- Flutter ThemeData y widgets propios, sin UI kits pesados.
- fl_chart para gráficas.
- file_picker y share_plus para backup local y compartir datos.

TanStack Query o capas de red no son necesarias mientras no haya API.

## Theme

Zenlift usa tema oscuro por defecto. El sistema de color, tipografía, espaciado y componentes está definido en `DESIGN.md`.

El tema es monocromático con profundidad por capas tonales (surface hierarchy). El color primario es purple/lavender (`#cfbcff`). El verde se reserva para estados de éxito/completado. Consultar `DESIGN.md` para los tokens completos.

## Estructura sugerida

```text
lib/
  app/                    # Bootstrap, router y composición de rutas
  core/                   # Fecha, UUIDs y primitivas compartidas
  features/               # Application, domain, data y presentation por feature
  storage/                # Drift database, connection, schema y seeds
  theme/                  # Tokens y helpers de ThemeData
  widgets/                # Widgets reutilizables compartidos
```

Las pantallas no deben contener lógica pesada. Cálculos, PRs, volumen y progresión viven en capas `domain` de features o servicios puros testeables.

## Estado

Estado global mínimo:

- Workout activo.
- Preferencias.
- Tema, con `dark` como default.
- Unidad de peso.

Reglas:

- Workout activo coordinado desde controladores de feature, no solo estado local de un widget.
- Autosave a SQLite en cada set completado.
- La recuperación reconstruye el estado desde una sesión `status='active'` y helpers ligeros persistidos.
- Settings y estado ligero de recuperación en shared_preferences.
- El resto se carga desde repositorios Drift.

## Errores

Jerarquía:

```text
Flutter ErrorWidget / zonas de bootstrap
  -> try/catch en repositories
  -> Result<T, E> o estados explícitos en funciones de dominio/controladores
```

Reglas:

- Todo repository envuelve SQLite en try/catch.
- Relanzar como error de base de datos con contexto.
- No tragar errores silenciosamente.
- Las funciones puras de cálculo no deben depender de widgets ni navegación.
- Durante workout activo, nunca perder un set: reintentar SQLite y conservar estado ligero de recuperación en shared_preferences si hace falta.

## Performance

Targets:

- Cold start menor a 2 segundos.
- Registrar un set en menos de 3 segundos.
- Persistencia de set menor a 100 ms, async y no bloqueante.
- Historial de 100 sesiones en menos de 500 ms.
- Active Workout con 60 FPS.

Reglas:

- Usar listas perezosas de Flutter para colecciones largas.
- Extraer filas repetidas a widgets pequeños y const-friendly.
- Evitar rebuilds amplios con providers/controladores bien acotados.
- SQLite en WAL mode.
- Índices en foreign keys y filtros frecuentes.
- Batch inserts para seed data.

## Teclado y workout activo

El teclado es crítico en Active Workout.

- Usar teclado numérico para peso y reps.
- Evitar saltos de layout al enfocar inputs.
- Hacer scroll automático al input enfocado cuando aplique.
- Mantener la duración visible en header fijo.
- Botones +/- junto a inputs para ajustar sin teclear.
- Acción next en peso.
- Acción done en reps para completar set.

## Backup y datos

P2:

- Generar un JSON completo `.zenlift`.
- Usar file_picker y share_plus para seleccionar y compartir archivos locales.
- Validar estructura antes de importar.
- Estrategia de import: merge por UUID, no replace.

## Seguridad y privacidad

- MVP sin registro, email, backend, analytics ni telemetría.
- Datos locales en SQLite y shared_preferences.
- Permisos mínimos.
- No pedir Location, Contacts, Camera o Microphone.
- Usar consultas SQL parametrizadas siempre.
- No hardcodear secretos.
