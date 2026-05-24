# Zenlift Product Context

## Posicionamiento

Zenlift es una app móvil B2C de workout tracking para usuarios de gimnasio. Ayuda a crear rutinas, registrar entrenamientos, consultar historial y visualizar progreso de fuerza e hipertrofia.

Zenlift debe sentirse como un compañero de entrenamiento: rápido, claro y confiable durante la sesión.

## Qué es

- App móvil personal de seguimiento de entrenamientos.
- Diario de progreso para rutinas, ejercicios, cargas, series y repeticiones.
- Producto mobile-first construido con React Native + Expo.
- App local-first que debe funcionar bien sin conexión.
- Producto distribuible en Play Store.

## Qué no es

- CRM, ERP fitness o SaaS B2B.
- Sistema para gimnasios, coaches o clientes.
- Web administrativa, marketplace, API pública o plataforma de reservas.
- App de pagos de membresías.
- Producto social-first, nutrición compleja o coaching empresarial.

## Usuario principal

Persona que entrena en gimnasio y quiere llevar control de sus rutinas. Puede ser principiante, intermedio o avanzado, con foco en hipertrofia, fuerza o consistencia.

Necesita:

- Crear rutinas sin complicarse.
- Iniciar un workout rápido.
- Registrar sets con pocos taps.
- Ver pesos y reps anteriores.
- Consultar historial.
- Entender si está progresando.
- Recuperar workouts si cierra la app.

## Jobs To Be Done

- Cuando voy al gimnasio, quiero saber qué rutina toca, registrar cada serie rápido y ver mis pesos anteriores para progresar sin depender de memoria o notas.
- Cuando llevo semanas entrenando, quiero saber si levanto más peso, hago más reps o acumulo más volumen.
- Cuando intento mantener el hábito, quiero ver frecuencia semanal e historial para no perder continuidad.
- Cuando sigo un programa, quiero días, ejercicios, series y descansos organizados.

## Loop core

```text
Crear rutina -> Iniciar workout -> Registrar sets -> Finalizar sesión -> Ver progreso -> Repetir mejorando
```

Toda feature debe evaluarse con esta pregunta: ¿mejora el loop core o lo distrae?

## Principios de producto

- Mobile-first absoluto.
- Registro rápido por encima de configuración compleja.
- Progreso visible y fácil de interpretar.
- Simplicidad inicial con profundidad progresiva.
- Offline-friendly desde el día 1.
- Español nativo como ventaja inicial, no traducción tardía.
- Tema claro por defecto con naranja atlético como color primario.

## Dirección visual

Zenlift debe sentirse fuerte, moderna y enfocada. El color primario es naranja atlético:

- Primary: `#F97316`
- Primary pressed: `#EA580C`
- Primary soft/light surface: `#FFEDD5`

El verde no debe usarse como color primario. Reservarlo para estados positivos como set completado, éxito o progreso confirmado.

## Competidores y diferenciación

Competidores conceptuales:

- Strong App: velocidad, simplicidad, tracking confiable.
- Hevy: diseño moderno, historial claro, estadísticas y social opcional.

Zenlift debe combinar:

- Velocidad de registro cercana a Strong.
- Diseño moderno cercano o superior a Hevy.
- Experiencia Android muy pulida.
- Español nativo.
- Menos ruido social.
- Insights accionables.
- Local-first real.

## Criterios de éxito del MVP

- Crear rutina sin instrucciones externas.
- Iniciar y finalizar un workout completo.
- Registrar un set en menos de 3 segundos.
- Mostrar valores anteriores correctamente.
- Guardar historial sin pérdida de datos.
- Ver progreso básico por ejercicio.
- Sentirse suficientemente rápida para usarse en el gimnasio.
