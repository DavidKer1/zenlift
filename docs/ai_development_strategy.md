# Zenlift AI Development Strategy

Este documento resume cómo trabajar con agentes IA sin cargar todo el blueprint en cada tarea.

## Flujo recomendado

```text
Docs compactos -> Spike si hay incertidumbre -> Plan pequeno
  -> Implementación con tests -> Review -> Prueba manual -> Fixes
```

## Qué contexto dar a un agente

Incluir solo:

- Objetivo de la tarea.
- Archivos relevantes.
- Uno de los documentos compactos de `docs/`.
- Criterios de aceptación.
- Tests esperados.
- Restricciones de `AGENTS.md`.

Evitar pegar el blueprint completo salvo que la tarea sea estratégica o documental.

## Reglas

- Una tarea = contexto fresco.
- Cada tarea de código debe incluir pruebas relevantes.
- Preferir tareas pequenas y verificables.
- Para decisiones inciertas, hacer un spike descartable antes de implementar.
- Revisar outputs antes de continuar con otra feature.
- Probar manualmente flujos críticos en dispositivo real cuando aplique.

## Integración de testing con agent-browser

Usar `agent-browser` como capa de smoke testing asistida por IA cuando una tarea toque pantallas, navegación, formularios o flujos web-renderizables de Expo.

### Cuándo usarlo

- Después de cambios en flujos principales: crear rutina, iniciar workout, registrar sets, finalizar sesión, historial y progreso.
- Después de cambios visuales o de navegación donde un test unitario no capture la experiencia.
- Antes de cerrar una tarea de UI si existe una URL local verificable (`expo start --web`, preview o build web).

### Flujo base

1. Levantar o reutilizar el servidor local disponible.
2. Abrir la app con `agent-browser`.
3. Ejecutar el smoke path del core loop:
   - Crear rutina.
   - Iniciar workout.
   - Registrar al menos 1 ejercicio con 2 sets.
   - Finalizar sesión.
   - Confirmar que la sesión aparece en historial o resumen.
4. Capturar evidencia cuando falle: URL, pasos, screenshot y error visible.
5. Reportar cualquier bloqueo como bug reproducible, no como feedback subjetivo.

### Límites

- `agent-browser` no reemplaza Jest, typecheck ni pruebas de repositorios SQLite.
- `agent-browser` no reemplaza prueba manual en Android físico para ergonomía, teclado, haptics, rendimiento real, modo avión o recuperación tras matar la app.
- No usarlo para validar features fuera del core loop ni para ampliar alcance del producto.

## Sistema de testing móvil para agentes

Codex, Copilot y Opencode deben usar los scripts compartidos del proyecto como contrato de verificación. Las herramientas propias de cada agente sirven para inspección o debug, pero el pase/fallo debe venir de comandos reproducibles:

```bash
pnpm typecheck
pnpm test
pnpm test:agent:web
pnpm test:agent:ios
pnpm test:agent:smoke
```

### Capas

- `pnpm test:agent:web`: Playwright levanta Expo web en `http://127.0.0.1:8081` y ejecuta el core loop con viewport móvil. Es la ruta rápida para agentes y permite reproducir fallos con browser MCP sobre la misma URL.
- `pnpm test:agent:ios`: Maestro ejecuta el core loop en iOS Simulator contra el bundle id `com.zenlift.workout`. Es la ruta nativa para validar launch, touch, teclado y superficie móvil realista.
- `pnpm test:agent:smoke`: corre typecheck, Jest, Playwright web smoke y Maestro iOS smoke en orden.

### Cuándo usar cada capa

- Cambios de UI, navegación o formularios: ejecutar `pnpm test:agent:web` como smoke mínimo cuando Expo web funcione.
- Cambios del Active Workout, inputs de sets, finalizar sesión, recuperación visual o ergonomía móvil: ejecutar `pnpm test:agent:ios` si hay macOS, Xcode, Simulator y Maestro disponibles.
- Antes de cerrar un cambio grande: ejecutar `pnpm test:agent:smoke` o reportar exactamente qué prerequisito impidió la parte iOS.

### Artefactos

- Playwright: `test-results/agent-web/` y `playwright-report/agent-web/`.
- Maestro: `e2e/artifacts/maestro/`.

Reportar URL, pasos, error visible y ruta de screenshot/trace/log cuando falle.

### Límites

- Playwright/Expo web es smoke rápido; no prueba comportamiento nativo completo.
- Maestro/iOS Simulator es smoke nativo; no reemplaza Android físico.
- Ninguna capa de agente reemplaza Jest, typecheck, pruebas de repositorios SQLite, migraciones, modo avión, haptics, rendimiento real o recuperación tras matar la app en dispositivo.

## Lo que la IA hace bien

- Modelos de datos.
- Migraciones SQL.
- Tipos TypeScript.
- Funciones puras de dominio.
- Componentes React Native.
- Hooks.
- Tests unitarios e integración.
- Reviews de cumplimiento con specs.

## Lo que requiere humano/dispositivo real

- Instalar Android Studio o configurar dispositivo.
- Sentir si la UX es rápida durante entrenamiento.
- Validar ergonomía con una mano.
- Probar en gimnasio real.
- Publicar en Play Store.

## Checklist para prompts de implementación

- Leer `AGENTS.md`.
- Leer `docs/README.md`.
- Leer el doc compacto relevante.
- Usar Context7 para documentación actual de librerías/frameworks/SDKs/CLI/cloud.
- Escribir o actualizar tests.
- Ejecutar typecheck/tests disponibles.
- Si hay cambios de UI o navegación, ejecutar `pnpm test:agent:web` cuando exista una URL local verificable.
- Si el cambio toca comportamiento móvil nativo o Active Workout, ejecutar `pnpm test:agent:ios` cuando estén disponibles Xcode, iOS Simulator y Maestro.
- Reportar archivos cambiados y verificación.
