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

## Verificación Flutter para agentes

Codex, Copilot y Opencode deben usar comandos reproducibles del proyecto como contrato de verificación. Las herramientas propias de cada agente sirven para inspección o debug, pero el pase/fallo debe venir de comandos que otra persona pueda repetir.

Comandos base:

```bash
flutter analyze
flutter test
flutter test integration_test/core_loop_test.dart
```

### Cuándo usar cada capa

- Cambios de lógica pura, cálculos o unidades: ejecutar tests enfocados y luego `flutter test` si el cambio cruza capas.
- Cambios de Drift, repositorios, schema, seeds o backup/import: ejecutar los tests de storage/repositorio afectados y considerar `flutter test`.
- Cambios de rutas, shell, navegación, Active Workout, persistencia o finalización de sesión: ejecutar `flutter test integration_test/core_loop_test.dart` cuando el entorno lo permita.
- Cambios visuales o de widgets: ejecutar widget tests enfocados; usar inspección manual o capturas cuando haya riesgo de layout.
- Cambios de plataforma, build o dependencias: ejecutar `flutter analyze`, tests relevantes y el build local disponible.

### Qué reportar

- Comandos ejecutados.
- Resultado clave de cada comando.
- Bloqueos de entorno con error exacto.
- Pruebas manuales pendientes, especialmente Android físico para teclado, haptics, modo avión, rendimiento y recuperación tras matar la app.

## Lo que la IA hace bien

- Modelos de datos.
- Migraciones SQL y Drift.
- Tipos Dart.
- Funciones puras de dominio.
- Widgets Flutter acotados.
- Repositorios Drift.
- Composición de rutas.
- Widget tests, controller tests e integration tests.
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
- Ejecutar `flutter analyze` y tests disponibles.
- Si hay cambios de UI o navegación, ejecutar widget tests o integration tests relevantes.
- Si el cambio toca comportamiento móvil nativo o Active Workout, validar en dispositivo real cuando esté disponible.
- Reportar archivos cambiados y verificación.
