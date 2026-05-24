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

- Timer de descanso.
- Personal records.
- Gráficas por ejercicio.
- Volumen por sesión.
- Duplicar rutina.
- Repetir workout.
- Notas.
- Filtros en historial.
- Tema claro/sistema opcional sobre dark mode por defecto.

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
- Timer.
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
| Fatiga del teclado | Media | returnKeyType, +/- buttons, teclado numérico, timer fijo. |
| IDs no aptos para sync futuro | Crítica futura | UUIDs desde el día 1. |

## Testing

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
