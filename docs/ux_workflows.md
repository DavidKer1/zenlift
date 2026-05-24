# Zenlift UX And Workflows

## Principio central

La app se usa en el gimnasio, entre series, con cansancio y prisa. El flujo más importante es Active Workout. Registrar un set debe tomar menos de 3 segundos.

## Flujos clave

### Crear primera rutina

```text
Onboarding -> Crear rutina -> Agregar día -> Agregar ejercicios
  -> Configurar sets/reps/rest -> Guardar -> Iniciar workout
```

Reglas:

- No pedir demasiados datos al inicio.
- Onboarding corto y skipeable.
- Ofrecer plantillas.
- Permitir llegar al primer workout en menos de 5 minutos.

### Iniciar entrenamiento desde rutina

```text
Rutinas -> Rutina -> Día -> Start Workout
  -> Crear WorkoutSession activa -> Cargar ejercicios -> Mostrar valores anteriores
```

### Registrar set

```text
Ver ejercicio -> Mostrar peso/reps anteriores -> Ajustar peso/reps
  -> Completar set -> Guardar set -> Iniciar timer -> Continuar
```

### Finalizar workout

```text
Finish -> Validar sets -> Calcular duración -> Calcular volumen
  -> Detectar PRs -> Guardar sesión completada -> Mostrar resumen
```

### Revisar progreso

```text
Progress -> Elegir vista general o ejercicio -> Consultar historial local
  -> Calcular métricas -> Mostrar gráficas, records e insights
```

## Pantallas principales

### Onboarding

- Bienvenida.
- Elegir kg/lb.
- Objetivo semanal opcional.
- Crear primera rutina o usar plantilla.

### Home

- CTA para iniciar workout.
- Rutina sugerida o última rutina.
- Resumen semanal.
- Último workout.
- PRs recientes.

### Rutinas

- Lista de rutinas.
- Crear, editar, duplicar, archivar/eliminar.
- Días de rutina.
- Ejercicios por día.
- Sets/reps/rest objetivo.
- Reordenar ejercicios.

### Biblioteca de ejercicios

- Buscar ejercicio.
- Filtrar por músculo/equipo.
- Crear ejercicio personalizado.
- Favoritos.
- Historial y records por ejercicio.

### Active Workout

Componentes críticos:

- Header con duración.
- Lista de ejercicios.
- Sets editables.
- Previous performance.
- Add set.
- Add exercise.
- Rest timer.
- Finish button.

Reglas:

- Mostrar peso/reps anteriores automáticamente.
- Completar set inicia timer opcional.
- Editar sets anteriores sin fricción.
- Guardar automáticamente.
- Recuperar workout si se cierra la app.

### Workout Summary

- Duración.
- Volumen total.
- Ejercicios realizados.
- Sets completados.
- PRs nuevos.
- Comparación contra sesión anterior.
- Notas.

### History

- Workouts por fecha.
- Duración, rutina, volumen, ejercicios y PRs.
- Buscar por ejercicio, rutina o fecha.
- Editar, repetir, duplicar o eliminar sesión.

### Progress

- Overview.
- Selector de ejercicio.
- Gráficas de volumen y estimated 1RM.
- PRs.
- Frecuencia semanal.
- Distribución muscular.

### Settings

- kg/lb.
- Tema claro por defecto; oscuro/sistema como opción futura.
- Timer por defecto.
- Objetivo semanal.
- Exportar/importar datos.
- Borrar datos.
- About.

## UX de set row

Cada set debe permitir:

- Peso.
- Reps.
- Tipo de set.
- Estado completado.
- Nota opcional.

Recomendaciones:

- Inputs grandes, mínimo 48 px de alto.
- Fila de set mínimo 56 px.
- Teclado numérico.
- Botones +/-.
- Valores anteriores precargados.
- Check rápido.
- Evitar modales y alerts.
- Haptic feedback al completar.
- Siguiente set recibe foco automáticamente cuando aplique.
- Usar naranja atlético para CTAs primarios y verde solo para set completado/éxito.

Ejemplo:

```text
Set | Previous  | kg [-] [input] [+] | reps [-] [input] [+] | check
1   | 60kg x 10 |     [ 62.5 ]        |      [ 8 ]            | empty
2   | 60kg x 9  |     [ 62.5 ]        |      [ 8 ]            | empty
3   | 60kg x 8  |     [ 60.0 ]        |      [ 10 ]           | done
```

## Accesibilidad

- Contraste mínimo 4.5:1 en texto.
- Touch targets mínimos de 48 px.
- `accessibilityLabel` en inputs y botones.
- El botón de completar anuncia el resultado del set.
- Tamaño de fuente mínimo 16 dp en inputs.
- La UI no debe depender solo de color para indicar estado.

## Insights deseables

Zenlift no solo muestra números; debe ayudar a interpretarlos:

- "Subiste tu volumen en Bench Press 12% vs la semana pasada."
- "Este es tu mejor set histórico en Squat."
- "Entrenaste piernas 2 veces esta semana."
- "Llevas 3 semanas aumentando carga en Deadlift."
