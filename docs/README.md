# Zenlift Docs

Esta carpeta resume el blueprint largo en documentos pequenos y cargables por tarea. El objetivo es reducir tokens en futuras sesiones sin perder las decisiones de producto y arquitectura.

## Fuente de verdad

- Blueprint completo: [zenlift_product_blueprint.md](zenlift_product_blueprint.md)
- Estos documentos son resúmenes operativos derivados del blueprint v2.0.
- Si hay conflicto, el blueprint completo gana, salvo instrucciones explícitas en `AGENTS.md`.

## Qué leer según la tarea

| Tarea | Leer |
|---|---|
| Entender el producto, alcance, usuario o posicionamiento | [product_context.md](product_context.md) |
| Definir pantallas, flujos, UX o copy de producto | [ux_workflows.md](ux_workflows.md) |
| Implementar arquitectura, estado, storage, performance o errores | [architecture.md](architecture.md) |
| Crear o modificar schema SQLite, entidades, repositorios o seeds | [data_model.md](data_model.md) |
| Planificar MVP, priorizar features, testing, release o riesgos | [roadmap_testing.md](roadmap_testing.md) |
| Trabajar con agentes IA o dividir tareas para agentes | [ai_development_strategy.md](ai_development_strategy.md) |

## Reglas de carga de contexto

1. Empieza por este `README.md`.
2. Abre solo el documento relacionado con la tarea.
3. Abre el blueprint completo solo cuando falte detalle, haya ambigüedad o la tarea sea actualizar documentación estratégica.
4. Para cambios de código con librerías, SDKs, frameworks, CLI o cloud services, usa Context7 antes de implementar, como indica `AGENTS.md`.

