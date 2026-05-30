## Why

La biblioteca de ejercicios ya existe, pero no esta disponible como destino principal en la navegacion inferior y su experiencia actual mezcla exploracion visual con acciones de edicion, favoritos e inicio rapido. Esta propuesta agrega una tab dedicada de `Ejercicios` para que los usuarios encuentren ejercicios rapidamente y entiendan cada movimiento mediante descripcion y foto sin distraerse del flujo principal de workout.

## What Changes

- Agregar `Ejercicios` como tab primaria entre `Rutinas` e `Historial`.
- Usar un icono de mancuerna para la tab de `Ejercicios`.
- Cambiar el icono de `Rutinas` para que use una metafora de lista o plan y no compita semanticamente con la nueva tab de ejercicios.
- Convertir la superficie de la biblioteca de ejercicios en una experiencia visual de descubrimiento con tarjetas que muestren foto, nombre, descripcion breve, musculo principal y equipo.
- Convertir el detalle de ejercicio accesible desde esta tab en una pagina visual y descriptiva con foto, descripcion, equipo y grupos musculares.
- Retirar de esta superficie visual las acciones de crear ejercicio, marcar favorito, editar, eliminar e iniciar workout rapido.
- Mantener busqueda, filtros por musculo y filtros por equipo para facilitar encontrar ejercicios.
- Mantener los assets visuales locales para que la experiencia funcione offline.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `base-tab-navigation`: Cambia de cuatro a cinco tabs primarias e incluye la nueva ruta `/exercise`.
- `tab-bar-icons`: Agrega iconografia especifica para `Ejercicios` con mancuerna y cambia `Rutinas` a un icono de lista o plan.
- `exercise-library`: Cambia la biblioteca hacia una experiencia visual solo lectura con foto y descripcion, sin FAB ni favorito.
- `exercise-detail-screen`: Cambia el detalle accesible desde la biblioteca visual hacia contenido descriptivo solo lectura, sin metricas, acciones de edicion o workout rapido.

## Impact

- Afecta `src/components/app-tabs.tsx` y una nueva configuracion testeable de tabs.
- Afecta `src/app/exercise/index.tsx`, `src/app/exercise/[id].tsx` y componentes de tarjeta de ejercicio.
- Agrega metadata visual local para ejercicios seed y assets PNG bajo `assets/images/exercises/`.
- Agrega o actualiza tests de configuracion de tabs y metadata visual.
- No cambia el schema SQLite ni la estructura de repositorios para esta iteracion.
