import type { ImageSourcePropType } from 'react-native';

type ExerciseVisualInput = {
  id: string;
  name: string;
  notes: string | null;
};

export type SeededExerciseVisual = {
  descriptionEs: string;
  photo: ImageSourcePropType;
  photoAlt: string;
};

const fallbackPhoto = require('../../../assets/images/exercises/bench-press.png');

export const seededExerciseVisuals: Record<string, SeededExerciseVisual> = {
  'e5f6a7b8-0001-4000-8000-000000000001': {
    descriptionEs:
      'Press horizontal con barra para trabajar principalmente pecho, triceps y hombro anterior. Manten escapulas retraidas, pies firmes y baja la barra con control hacia la parte media del pecho.',
    photo: require('../../../assets/images/exercises/bench-press.png'),
    photoAlt: 'Foto de referencia para Bench Press',
  },
  'e5f6a7b8-0001-4000-8000-000000000002': {
    descriptionEs:
      'Variacion inclinada del press con barra que enfatiza la porcion superior del pecho. Controla la bajada, evita arquear de mas la espalda y empuja en una trayectoria estable.',
    photo: require('../../../assets/images/exercises/incline-bench-press.png'),
    photoAlt: 'Foto de referencia para Incline Bench Press',
  },
  'e5f6a7b8-0001-4000-8000-000000000003': {
    descriptionEs:
      'Apertura con mancuernas para aislar el pecho con un arco amplio. Usa carga moderada, codos ligeramente flexionados y prioriza el estiramiento controlado sobre el peso.',
    photo: require('../../../assets/images/exercises/dumbbell-fly.png'),
    photoAlt: 'Foto de referencia para Dumbbell Fly',
  },
  'e5f6a7b8-0001-4000-8000-000000000004': {
    descriptionEs:
      'Cruce en poleas para mantener tension constante en el pecho. Ajusta las poleas a una altura comoda, junta las manos al frente y controla el regreso sin perder postura.',
    photo: require('../../../assets/images/exercises/cable-crossover.png'),
    photoAlt: 'Foto de referencia para Cable Crossover',
  },
  'e5f6a7b8-0001-4000-8000-000000000005': {
    descriptionEs:
      'Dominada con peso corporal para espalda y biceps. Inicia con hombros activos, sube hasta acercar el pecho a la barra y baja completo sin relajarte al fondo.',
    photo: require('../../../assets/images/exercises/pull-up.png'),
    photoAlt: 'Foto de referencia para Pull Up',
  },
  'e5f6a7b8-0001-4000-8000-000000000006': {
    descriptionEs:
      'Remo con barra para desarrollar espalda media, dorsales y agarre. Inclina el torso con columna neutra, tira hacia el abdomen y evita convertirlo en impulso de cadera.',
    photo: require('../../../assets/images/exercises/barbell-row.png'),
    photoAlt: 'Foto de referencia para Barbell Row',
  },
  'e5f6a7b8-0001-4000-8000-000000000007': {
    descriptionEs:
      'Jalon en polea para dorsales, util cuando aun no hay dominadas solidas. Lleva la barra hacia la parte alta del pecho y piensa en bajar los codos, no las manos.',
    photo: require('../../../assets/images/exercises/lat-pulldown.png'),
    photoAlt: 'Foto de referencia para Lat Pulldown',
  },
  'e5f6a7b8-0001-4000-8000-000000000008': {
    descriptionEs:
      'Levantamiento bisagra de cuerpo completo para espalda, gluteos e isquiotibiales. Coloca la barra cerca de las piernas, bracea fuerte y extiende cadera sin hiperextender la espalda.',
    photo: require('../../../assets/images/exercises/deadlift.png'),
    photoAlt: 'Foto de referencia para Deadlift',
  },
  'e5f6a7b8-0001-4000-8000-000000000009': {
    descriptionEs:
      'Sentadilla con barra para cuadriceps, gluteos y core. Manten el torso firme, rodillas siguiendo la linea de los pies y baja hasta una profundidad que puedas controlar.',
    photo: require('../../../assets/images/exercises/squat.png'),
    photoAlt: 'Foto de referencia para Squat',
  },
  'e5f6a7b8-0001-4000-8000-00000000000a': {
    descriptionEs:
      'Prensa para trabajar piernas con soporte externo. Coloca los pies firmes, controla la bajada y evita bloquear agresivamente las rodillas al extender.',
    photo: require('../../../assets/images/exercises/leg-press.png'),
    photoAlt: 'Foto de referencia para Leg Press',
  },
  'e5f6a7b8-0001-4000-8000-00000000000b': {
    descriptionEs:
      'Peso muerto rumano enfocado en isquiotibiales y gluteos. Empuja la cadera hacia atras, conserva rodillas suaves y baja hasta sentir tension sin perder espalda neutra.',
    photo: require('../../../assets/images/exercises/romanian-deadlift.png'),
    photoAlt: 'Foto de referencia para Romanian Deadlift',
  },
  'e5f6a7b8-0001-4000-8000-00000000000c': {
    descriptionEs:
      'Curl femoral en maquina para aislar isquiotibiales. Ajusta el eje con la rodilla, flexiona sin levantar cadera y controla la fase de regreso.',
    photo: require('../../../assets/images/exercises/leg-curl.png'),
    photoAlt: 'Foto de referencia para Leg Curl',
  },
  'e5f6a7b8-0001-4000-8000-00000000000d': {
    descriptionEs:
      'Extension de pierna en maquina para enfatizar cuadriceps. Ajusta el respaldo, extiende con control y pausa arriba sin balancear el torso.',
    photo: require('../../../assets/images/exercises/leg-extension.png'),
    photoAlt: 'Foto de referencia para Leg Extension',
  },
  'e5f6a7b8-0001-4000-8000-00000000000e': {
    descriptionEs:
      'Press de hombro con mancuernas para deltoides y triceps. Empuja verticalmente, evita chocar las mancuernas arriba y manten costillas abajo.',
    photo: require('../../../assets/images/exercises/shoulder-press.png'),
    photoAlt: 'Foto de referencia para Shoulder Press',
  },
  'e5f6a7b8-0001-4000-8000-00000000000f': {
    descriptionEs:
      'Elevacion lateral para deltoide medio. Usa peso ligero, sube con codos ligeramente flexionados y evita encoger los hombros al final del rango.',
    photo: require('../../../assets/images/exercises/lateral-raise.png'),
    photoAlt: 'Foto de referencia para Lateral Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000010': {
    descriptionEs:
      'Face pull en polea para deltoide posterior y estabilidad escapular. Tira la cuerda hacia la cara, abre los codos y controla la vuelta.',
    photo: require('../../../assets/images/exercises/face-pull.png'),
    photoAlt: 'Foto de referencia para Face Pull',
  },
  'e5f6a7b8-0001-4000-8000-000000000011': {
    descriptionEs:
      'Curl con barra para biceps. Manten codos cerca del torso, evita balancearte y controla la bajada para aprovechar toda la repeticion.',
    photo: require('../../../assets/images/exercises/barbell-curl.png'),
    photoAlt: 'Foto de referencia para Barbell Curl',
  },
  'e5f6a7b8-0001-4000-8000-000000000012': {
    descriptionEs:
      'Curl martillo con mancuernas para biceps y braquial. Usa agarre neutro, sube sin girar munecas y mantiene hombros estables.',
    photo: require('../../../assets/images/exercises/hammer-curl.png'),
    photoAlt: 'Foto de referencia para Hammer Curl',
  },
  'e5f6a7b8-0001-4000-8000-000000000013': {
    descriptionEs:
      'Extension de triceps en polea para tension constante. Fija codos a los lados, extiende hasta bloquear suave y vuelve sin mover hombros.',
    photo: require('../../../assets/images/exercises/tricep-pushdown.png'),
    photoAlt: 'Foto de referencia para Tricep Pushdown',
  },
  'e5f6a7b8-0001-4000-8000-000000000014': {
    descriptionEs:
      'Extension de triceps sobre la cabeza con mancuerna para enfatizar la cabeza larga. Manten codos apuntando al frente y controla el estiramiento.',
    photo: require('../../../assets/images/exercises/overhead-tricep-extension.png'),
    photoAlt: 'Foto de referencia para Overhead Tricep Extension',
  },
  'e5f6a7b8-0001-4000-8000-000000000015': {
    descriptionEs:
      'Elevacion de gemelos en maquina para pantorrilla. Baja con control, pausa brevemente abajo y sube completo sin rebotar.',
    photo: require('../../../assets/images/exercises/calf-raise.png'),
    photoAlt: 'Foto de referencia para Calf Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000016': {
    descriptionEs:
      'Hip thrust con barra para gluteos. Apoya la espalda alta, alinea barbilla y costillas, y empuja la cadera hasta extender sin arquear la zona lumbar.',
    photo: require('../../../assets/images/exercises/hip-thrust.png'),
    photoAlt: 'Foto de referencia para Hip Thrust',
  },
  'e5f6a7b8-0001-4000-8000-000000000017': {
    descriptionEs:
      'Plancha isometrica para core. Manten cuerpo en linea, gluteos activos y respiracion controlada sin dejar caer la cadera.',
    photo: require('../../../assets/images/exercises/plank.png'),
    photoAlt: 'Foto de referencia para Plank',
  },
  'e5f6a7b8-0001-4000-8000-000000000018': {
    descriptionEs:
      'Elevacion de piernas colgado para abdominales y flexores de cadera. Evita balancearte, sube con control y baja manteniendo tension.',
    photo: fallbackPhoto,
    photoAlt: 'Foto de referencia para Hanging Leg Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000019': {
    descriptionEs:
      'Caminata del granjero con mancuernas para agarre, trapecio y core. Camina erguido, hombros abajo y pasos controlados con carga pesada.',
    photo: fallbackPhoto,
    photoAlt: 'Foto de referencia para Farmers Walk',
  },
};

export function getExerciseVisual(exercise: ExerciseVisualInput): SeededExerciseVisual {
  const seededVisual = seededExerciseVisuals[exercise.id];

  if (seededVisual) {
    return seededVisual;
  }

  return {
    descriptionEs:
      exercise.notes?.trim() ||
      'Ejercicio personalizado guardado en tu biblioteca local. Revisa tus notas y usalo como referencia al armar rutinas.',
    photo: fallbackPhoto,
    photoAlt: `Foto de referencia para ${exercise.name}`,
  };
}
