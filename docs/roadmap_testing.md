# Zenlift Roadmap, Risks And Testing

## MVP

Objetivo: validar que el usuario puede crear rutinas, iniciar workouts, registrar sets, finalizar sesión, consultar historial y ver progreso básico.

### P0

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

### P1

- Personal records.
- Gráficas por ejercicio.
- Volumen por sesión.
- Duplicar rutina.
- Repetir workout.
- Notas.
- Filtros en historial.
- Tema oscuro por defecto, con modo claro/sistema opcional.

### P2

- Plantillas de rutina.
- Estimated 1RM.
- Distribución por músculo.
- Calendario de consistencia.
- Exportar datos.
- Backup opcional.
- Importación futura.

### Fuera del MVP

- CRM, web app, API pública.
- Coaches/clientes/gimnasios.
- Pagos, reservas, marketplace.
- Chat.
- Nutrición compleja.
- IA avanzada.
- Social-first.

## Roadmap

### 0.1 Core local tracker

- Crear ejercicios.
- Crear rutinas.
- Iniciar workout.
- Registrar sets.
- Guardar sesión local.
- Ver historial básico.

### 0.5 MVP usable

- Biblioteca de ejercicios.
- Rutinas con días.
- Previous values.
- Resumen de sesión.
- Settings kg/lb.
- Persistencia confiable.
- Edición de sesiones.

### 1.0 Play Store release

- UI final consistente.
- PRs.
- Historial completo.
- Progreso básico.
- Tema oscuro por defecto con opción claro/sistema si se decide.
- Onboarding.
- Manejo de errores.
- Performance optimizada.

### 1.5 Progress intelligence

- Gráficas avanzadas.
- Estimated 1RM.
- Volumen semanal.
- Distribución muscular.
- Comparaciones.
- Insights textuales.

### 2.0 Retención y monetización

- Freemium o compra única.
- Premium features.
- Backup en nube opcional.
- Sync multi-dispositivo si se agrega backend.
- Plantillas premium.
- Estadísticas premium.

## Riesgos principales

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Mercado competido | Alta | Android pulido, español nativo, diseño premium, insights claros. |
| Fricción al registrar sets | Crítica | Active Workout prioridad #1, set en < 3 s, previous values, +/- y haptics. |
| Pérdida de datos | Crítica | Autosave por set, recuperación de sesión activa, retry queue en MMKV. |
| Sobrecarga de features | Alta | Proteger el loop core; evitar social, pagos, coaching y web en MVP. |
| Rendimiento Android bajo | Alta | FlashList, WAL, índices, medir en dispositivo real. |
| Onboarding complejo | Alta | Máximo 3 pantallas, skipeable, templates y Quick Workout. |
| Errores silenciosos SQLite | Crítica | Repositories con try/catch, DatabaseError, tests de integridad. |
| Fatiga del teclado | Media | returnKeyType, +/- buttons y teclado numérico. |
| IDs no aptos para sync futuro | Crítica futura | UUIDs desde el día 1. |

## Testing

### Flutter migration testing

Durante la migración, la app Flutter vive temporalmente en `flutter-version/`. Los comandos canónicos para esa implementación son:

```bash
cd flutter-version
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

Estado actual:

- `flutter analyze` pasa.
- `flutter test` pasa para la suite Flutter completa.
- `flutter test integration_test/core_loop_test.dart` pasa en el simulador iOS local disponible.
- Android real/emulador sigue siendo obligatorio antes de declarar paridad final, especialmente para teclado, rendimiento, recuperación de sesión activa y set logging < 3 s.
- Maestro smoke está registrado como bloqueado si la CLI no está instalada.

Detalles y bloqueos vivos: [flutter_migration/testing.md](flutter_migration/testing.md).

### Pirámide de testing

```text
Manual en dispositivo real
Maestro iOS Simulator smoke
Playwright Expo web mobile smoke
Integration tests SQLite
Unit tests dominio/utils
```

La pirámide mantiene los tests rápidos abajo y usa smoke móvil solo para validar flujos de usuario. Playwright y Maestro ayudan a agentes IA, pero no sustituyen las pruebas unitarias, de repositorios o de dispositivo físico.

### Unit tests P0

Cubrir funciones puras:

- Cálculo de volumen.
- Volumen de sesión.
- Estimated 1RM Epley.
- Detección de PRs.
- Conversión kg/lb.
- Agrupación por semana.
- Distribución por músculo.

### Integration tests P1

Cubrir repositorios SQLite:

- Crear y leer ejercicios.
- Buscar por nombre.
- Filtrar por músculo vía join.
- Crear sesión, agregar ejercicios, agregar sets y completar sesión.
- Recuperar sesión activa.
- Aplicar migraciones una sola vez.
- Validar cascades.

### Agent smoke tests P1

Usar los scripts compartidos para Codex, Copilot y Opencode:

- `pnpm test:agent:web`: Playwright + Expo web en viewport móvil. Debe cubrir crear rutina, iniciar workout, registrar al menos 2 sets, finalizar sesión y confirmar resumen/historial.
- `pnpm test:agent:ios`: Maestro + iOS Simulator contra `com.zenlift.workout`. Debe cubrir el mismo core loop con launch nativo y estado limpio.
- `pnpm test:agent:smoke`: typecheck, Jest, Playwright web smoke y Maestro iOS smoke en orden.

Prerequisitos:

- Playwright browsers instalados con `pnpm exec playwright install chromium`.
- Para iOS: macOS, Xcode Command Line Tools, un iOS Simulator iniciado, app instalada con `pnpm ios`, y Maestro CLI.

Artefactos:

- Playwright: `test-results/agent-web/`, `playwright-report/agent-web/`.
- Maestro: `e2e/artifacts/maestro/`.

Límites:

- Expo web valida navegación y layout móvil rápido, no haptics ni APIs nativas.
- iOS Simulator valida interacción nativa, pero no reemplaza Android físico.
- Real-device testing sigue siendo obligatorio para teclado, haptics, modo avión, performance, uso con una mano y recuperación tras matar la app.

### Manual tests críticos

1. Crear rutina desde cero.
2. Iniciar workout desde rutina.
3. Registrar 20 sets.
4. Cerrar app durante workout y recuperar sesión.
5. Cambiar kg/lb.
6. Detectar PR al finalizar.
7. Usar modo avión.
8. Usar en gimnasio real con una mano, sudor y prisa.

## CI/CD

Recomendado:

- GitHub Actions para typecheck y tests.
- Smoke agent web como verificación opcional para cambios de UI cuando Expo web esté estable.
- Conventional commits.
- `main` protegida.
- EAS Build para Android development, preview y production.
- SemVer.

Release checklist:

- Typecheck pasa.
- Jest pasa.
- Build production compila.
- Prueba manual en Android físico.
- Upgrade desde versión anterior si aplica.
- Migraciones verificadas.
- Store listing y changelog actualizados.
