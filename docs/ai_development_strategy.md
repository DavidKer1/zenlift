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
- Reportar archivos cambiados y verificación.

