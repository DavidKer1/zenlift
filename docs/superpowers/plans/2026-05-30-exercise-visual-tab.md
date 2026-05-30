# Exercise Visual Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Ejercicios tab where users can browse exercises visually, search/filter them, and open a read-only detail with description and photo.

**Architecture:** Reuse the existing Expo Router headless tab system in `src/components/app-tabs.tsx` and the existing `src/app/exercise` routes. Keep the tab read-only by removing create/favorite/edit/delete/quick-workout actions from the exercise tab surface, and keep visual exercise descriptions/photos in a small feature helper instead of changing SQLite schema for this UI-only pass.

**Tech Stack:** Expo SDK 55, Expo Router UI tabs, React Native, TypeScript, FlashList, Expo Symbols, Expo Image, Jest.

---

## Context Notes

- Context7 MCP was attempted for Expo/Expo Router but the MCP server timed out during startup. Fallback reference used: official Expo SDK 55 docs for Expo Router tabs and router UI:
  - `https://docs.expo.dev/versions/v55.0.0/sdk/router/`
  - `https://docs.expo.dev/versions/v55.0.0/sdk/router/ui/`
- Installed Expo matches the project rule: `expo` is `~55.0.26` and `expo-router` is `~55.0.16` in `package.json`.
- `.graphify/GRAPH_REPORT.md` is stale for the current HEAD: graph built from `1d9f588`, current HEAD is `ff09e8a2068efcd205b5c42843f46fe7a03d2156`. Use raw files for implementation. After significant code changes, run `/graphify src`.

## File Structure

- Modify `src/components/app-tabs.tsx`: render five tabs, add `/exercise`, use a dumbbell SymbolView icon for Ejercicios, and change Rutinas away from the current barbell icon.
- Create `src/components/app-tabs.config.ts`: pure tab configuration exported for tests and the component.
- Create `src/components/app-tabs.config.test.ts`: verifies tab order, the exercises route, the dumbbell icon, and no duplicate tab icon identity.
- Create `assets/images/exercises/*.png`: local generated exercise photos so the screen works offline.
- Create `src/features/exercises/exerciseVisuals.ts`: maps seeded exercise IDs to description text, photo source, photo key, and alt text.
- Create `src/features/exercises/exerciseVisuals.test.ts`: verifies each seeded exercise has visual metadata.
- Create `src/components/exercise/ExerciseDiscoveryCard.tsx`: visual list card with photo, name, description, equipment, and primary muscle.
- Modify `src/app/exercise/index.tsx`: use `ExerciseDiscoveryCard`, visual metadata, read-only interactions, no FAB, no favorite toggle.
- Modify `src/app/exercise/[id].tsx`: show hero photo and description, keep muscle/equipment metadata, remove edit/delete/quick-workout actions from this visual section.
- Optional after execution: run `/graphify src` to refresh AST graph metadata.

---

### Task 1: Extract Tab Config And Add Ejercicios Tab

**Files:**
- Create: `src/components/app-tabs.config.ts`
- Create: `src/components/app-tabs.config.test.ts`
- Modify: `src/components/app-tabs.tsx`

- [ ] **Step 1: Write the failing tab config test**

Create `src/components/app-tabs.config.test.ts`:

```ts
import { appTabs } from './app-tabs.config';

describe('appTabs', () => {
  it('keeps the primary mobile tab order with Ejercicios between Rutinas and Historial', () => {
    expect(appTabs.map((tab) => tab.href)).toEqual([
      '/',
      '/routines',
      '/exercise',
      '/history',
      '/settings',
    ]);
    expect(appTabs.map((tab) => tab.label)).toEqual([
      'Inicio',
      'Rutinas',
      'Ejercicios',
      'Historial',
      'Ajustes',
    ]);
  });

  it('uses a dumbbell symbol for the Ejercicios tab', () => {
    const exercisesTab = appTabs.find((tab) => tab.href === '/exercise');

    expect(exercisesTab).toMatchObject({
      name: 'exercises',
      label: 'Ejercicios',
      icon: {
        type: 'symbol',
        inactive: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
        active: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
      },
    });
  });

  it('does not reuse the same icon identity across tabs', () => {
    const iconKeys = appTabs.map((tab) =>
      tab.icon.type === 'ionicon'
        ? `ionicon:${tab.icon.inactive}:${tab.icon.active}`
        : `symbol:${tab.icon.inactive.ios}:${tab.icon.active.ios}`,
    );

    expect(new Set(iconKeys).size).toBe(iconKeys.length);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
pnpm test src/components/app-tabs.config.test.ts
```

Expected: FAIL with a module resolution error for `./app-tabs.config`.

- [ ] **Step 3: Create the tab config**

Create `src/components/app-tabs.config.ts`:

```ts
import type { Ionicons } from '@expo/vector-icons';
import type { SymbolViewProps } from 'expo-symbols';

export type AppTabHref = '/' | '/routines' | '/exercise' | '/history' | '/settings';

export type IoniconTabIcon = {
  type: 'ionicon';
  inactive: keyof typeof Ionicons.glyphMap;
  active: keyof typeof Ionicons.glyphMap;
};

export type SymbolTabIcon = {
  type: 'symbol';
  inactive: SymbolViewProps['name'];
  active: SymbolViewProps['name'];
};

export type AppTabItem = {
  href: AppTabHref;
  icon: IoniconTabIcon | SymbolTabIcon;
  label: string;
  name: string;
};

export const appTabs: AppTabItem[] = [
  {
    name: 'home',
    href: '/',
    label: 'Inicio',
    icon: { type: 'ionicon', inactive: 'grid-outline', active: 'grid' },
  },
  {
    name: 'routines',
    href: '/routines',
    label: 'Rutinas',
    icon: { type: 'ionicon', inactive: 'list-outline', active: 'list' },
  },
  {
    name: 'exercises',
    href: '/exercise',
    label: 'Ejercicios',
    icon: {
      type: 'symbol',
      inactive: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
      active: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
    },
  },
  {
    name: 'history',
    href: '/history',
    label: 'Historial',
    icon: { type: 'ionicon', inactive: 'time-outline', active: 'time' },
  },
  {
    name: 'settings',
    href: '/settings',
    label: 'Ajustes',
    icon: { type: 'ionicon', inactive: 'settings-outline', active: 'settings' },
  },
];
```

- [ ] **Step 4: Update the tab component to consume the config**

Modify `src/components/app-tabs.tsx`:

```tsx
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTabs, type AppTabItem } from '@/components/app-tabs.config';
import {
  BOTTOM_TAB_BOTTOM_PADDING_MIN,
  BOTTOM_TAB_BUTTON_MIN_HEIGHT,
  BOTTOM_TAB_TOP_PADDING,
} from '@/constants/layout';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          {appTabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon} label={tab.label} name={tab.name} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  icon,
  label,
  name,
  isFocused,
  onPressIn,
  onPressOut,
  ...props
}: TabTriggerSlotProps & Pick<AppTabItem, 'icon' | 'label' | 'name'>) {
  const { colors } = useZenliftTheme();
  const focusProgress = useSharedValue(isFocused ? 1 : 0);
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 180,
      reduceMotion: ReduceMotion.System,
    });
  }, [focusProgress, isFocused]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + focusProgress.value * 0.6 - pressProgress.value * 0.08,
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    pressProgress.value = withTiming(1, {
      duration: 80,
      reduceMotion: ReduceMotion.System,
    });
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    pressProgress.value = withTiming(0, {
      duration: 120,
      reduceMotion: ReduceMotion.System,
    });
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      testID={`tab-${name}`}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}>
      <Animated.View style={[styles.tabContent, animatedContentStyle]}>
        {icon.type === 'ionicon' ? (
          <Ionicons
            name={isFocused ? icon.active : icon.inactive}
            size={20}
            color={colors.textPrimary}
          />
        ) : (
          <SymbolView
            name={isFocused ? icon.active : icon.inactive}
            size={21}
            tintColor={colors.textPrimary}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const { colors } = useZenliftTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabListContainer,
        {
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, BOTTOM_TAB_BOTTOM_PADDING_MIN),
        },
      ]}>
      <View style={styles.innerContainer} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabListContainer: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingTop: BOTTOM_TAB_TOP_PADDING,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: BOTTOM_TAB_BUTTON_MIN_HEIGHT,
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
```

- [ ] **Step 5: Run tab config tests**

Run:

```bash
pnpm test src/components/app-tabs.config.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/app-tabs.config.ts src/components/app-tabs.config.test.ts src/components/app-tabs.tsx
git commit -m "feat: add exercises tab config"
```

---

### Task 2: Add Offline Exercise Visual Metadata

**Files:**
- Create: `assets/images/exercises/bench-press.png`
- Create: `assets/images/exercises/incline-bench-press.png`
- Create: `assets/images/exercises/dumbbell-fly.png`
- Create: `assets/images/exercises/cable-crossover.png`
- Create: `assets/images/exercises/pull-up.png`
- Create: `assets/images/exercises/barbell-row.png`
- Create: `assets/images/exercises/lat-pulldown.png`
- Create: `assets/images/exercises/deadlift.png`
- Create: `assets/images/exercises/squat.png`
- Create: `assets/images/exercises/leg-press.png`
- Create: `assets/images/exercises/romanian-deadlift.png`
- Create: `assets/images/exercises/leg-curl.png`
- Create: `assets/images/exercises/leg-extension.png`
- Create: `assets/images/exercises/shoulder-press.png`
- Create: `assets/images/exercises/lateral-raise.png`
- Create: `assets/images/exercises/face-pull.png`
- Create: `assets/images/exercises/barbell-curl.png`
- Create: `assets/images/exercises/hammer-curl.png`
- Create: `assets/images/exercises/tricep-pushdown.png`
- Create: `assets/images/exercises/overhead-tricep-extension.png`
- Create: `assets/images/exercises/calf-raise.png`
- Create: `assets/images/exercises/hip-thrust.png`
- Create: `assets/images/exercises/plank.png`
- Create: `assets/images/exercises/hanging-leg-raise.png`
- Create: `assets/images/exercises/farmers-walk.png`
- Create: `src/features/exercises/exerciseVisuals.ts`
- Create: `src/features/exercises/exerciseVisuals.test.ts`

- [ ] **Step 1: Create the local image assets**

Generate square 1024x1024 PNG images. Use the same visual direction for every file:

```text
Dark premium gym photography, one athlete demonstrating [exercise name], clear full-body or relevant upper-body pose, neutral black gym background, realistic lighting, no text, no logos, no extra people, mobile app crop, high contrast, sharp subject.
```

Use the exact exercise name in place of `[exercise name]`, and save each output to the exact file path listed above. Keep files under 900 KB each after compression.

- [ ] **Step 2: Write the failing metadata test**

Create `src/features/exercises/exerciseVisuals.test.ts`:

```ts
import { getExerciseVisual, seededExerciseVisuals } from './exerciseVisuals';

type SeedExercise = {
  id: string;
  name: string;
};

const seedData = require('../../../assets/exercise.json') as {
  exercises: SeedExercise[];
};

describe('exerciseVisuals', () => {
  it('has visual metadata for every seeded exercise', () => {
    for (const exercise of seedData.exercises) {
      const visual = getExerciseVisual({
        id: exercise.id,
        name: exercise.name,
        notes: null,
      });

      expect(visual.descriptionEs.length).toBeGreaterThan(40);
      expect(visual.photoAlt).toContain(exercise.name);
      expect(visual.photo).toBeTruthy();
    }
  });

  it('uses custom notes as the description for custom exercises', () => {
    const visual = getExerciseVisual({
      id: 'custom-1',
      name: 'Curl inventado',
      notes: 'Mantener codos pegados al torso y controlar la bajada.',
    });

    expect(visual.descriptionEs).toBe('Mantener codos pegados al torso y controlar la bajada.');
    expect(visual.photoAlt).toBe('Foto de referencia para Curl inventado');
  });

  it('keeps seeded visual ids unique', () => {
    const ids = Object.keys(seededExerciseVisuals);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(seedData.exercises.length);
  });
});
```

- [ ] **Step 3: Run metadata test to verify it fails**

Run:

```bash
pnpm test src/features/exercises/exerciseVisuals.test.ts
```

Expected: FAIL with a module resolution error for `./exerciseVisuals`.

- [ ] **Step 4: Add metadata helper**

Create `src/features/exercises/exerciseVisuals.ts`:

```ts
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
    descriptionEs: 'Press horizontal con barra para trabajar principalmente pecho, triceps y hombro anterior. Mantén escapulas retraidas, pies firmes y baja la barra con control hacia la parte media del pecho.',
    photo: require('../../../assets/images/exercises/bench-press.png'),
    photoAlt: 'Foto de referencia para Bench Press',
  },
  'e5f6a7b8-0001-4000-8000-000000000002': {
    descriptionEs: 'Variacion inclinada del press con barra que enfatiza la porcion superior del pecho. Controla la bajada, evita arquear de mas la espalda y empuja en una trayectoria estable.',
    photo: require('../../../assets/images/exercises/incline-bench-press.png'),
    photoAlt: 'Foto de referencia para Incline Bench Press',
  },
  'e5f6a7b8-0001-4000-8000-000000000003': {
    descriptionEs: 'Apertura con mancuernas para aislar el pecho con un arco amplio. Usa carga moderada, codos ligeramente flexionados y prioriza el estiramiento controlado sobre el peso.',
    photo: require('../../../assets/images/exercises/dumbbell-fly.png'),
    photoAlt: 'Foto de referencia para Dumbbell Fly',
  },
  'e5f6a7b8-0001-4000-8000-000000000004': {
    descriptionEs: 'Cruce en poleas para mantener tension constante en el pecho. Ajusta las poleas a una altura comoda, junta las manos al frente y controla el regreso sin perder postura.',
    photo: require('../../../assets/images/exercises/cable-crossover.png'),
    photoAlt: 'Foto de referencia para Cable Crossover',
  },
  'e5f6a7b8-0001-4000-8000-000000000005': {
    descriptionEs: 'Dominada con peso corporal para espalda y biceps. Inicia con hombros activos, sube hasta acercar el pecho a la barra y baja completo sin relajarte al fondo.',
    photo: require('../../../assets/images/exercises/pull-up.png'),
    photoAlt: 'Foto de referencia para Pull Up',
  },
  'e5f6a7b8-0001-4000-8000-000000000006': {
    descriptionEs: 'Remo con barra para desarrollar espalda media, dorsales y agarre. Inclina el torso con columna neutra, tira hacia el abdomen y evita convertirlo en un impulso de cadera.',
    photo: require('../../../assets/images/exercises/barbell-row.png'),
    photoAlt: 'Foto de referencia para Barbell Row',
  },
  'e5f6a7b8-0001-4000-8000-000000000007': {
    descriptionEs: 'Jalon en polea para dorsales, util cuando aun no hay dominadas solidas. Lleva la barra hacia la parte alta del pecho y piensa en bajar los codos, no las manos.',
    photo: require('../../../assets/images/exercises/lat-pulldown.png'),
    photoAlt: 'Foto de referencia para Lat Pulldown',
  },
  'e5f6a7b8-0001-4000-8000-000000000008': {
    descriptionEs: 'Levantamiento bisagra de cuerpo completo para espalda, gluteos e isquiotibiales. Coloca la barra cerca de las piernas, bracea fuerte y extiende cadera sin hiperextender la espalda.',
    photo: require('../../../assets/images/exercises/deadlift.png'),
    photoAlt: 'Foto de referencia para Deadlift',
  },
  'e5f6a7b8-0001-4000-8000-000000000009': {
    descriptionEs: 'Sentadilla con barra para cuadriceps, gluteos y core. Mantén el torso firme, rodillas siguiendo la linea de los pies y baja hasta una profundidad que puedas controlar.',
    photo: require('../../../assets/images/exercises/squat.png'),
    photoAlt: 'Foto de referencia para Squat',
  },
  'e5f6a7b8-0001-4000-8000-00000000000a': {
    descriptionEs: 'Prensa para trabajar piernas con soporte externo. Coloca los pies firmes, controla la bajada y evita bloquear agresivamente las rodillas al extender.',
    photo: require('../../../assets/images/exercises/leg-press.png'),
    photoAlt: 'Foto de referencia para Leg Press',
  },
  'e5f6a7b8-0001-4000-8000-00000000000b': {
    descriptionEs: 'Peso muerto rumano enfocado en isquiotibiales y gluteos. Empuja la cadera hacia atras, conserva rodillas suaves y baja hasta sentir tension sin perder espalda neutra.',
    photo: require('../../../assets/images/exercises/romanian-deadlift.png'),
    photoAlt: 'Foto de referencia para Romanian Deadlift',
  },
  'e5f6a7b8-0001-4000-8000-00000000000c': {
    descriptionEs: 'Curl femoral en maquina para aislar isquiotibiales. Ajusta el eje con la rodilla, flexiona sin levantar cadera y controla la fase de regreso.',
    photo: require('../../../assets/images/exercises/leg-curl.png'),
    photoAlt: 'Foto de referencia para Leg Curl',
  },
  'e5f6a7b8-0001-4000-8000-00000000000d': {
    descriptionEs: 'Extension de pierna en maquina para enfatizar cuadriceps. Ajusta el respaldo, extiende con control y pausa arriba sin balancear el torso.',
    photo: require('../../../assets/images/exercises/leg-extension.png'),
    photoAlt: 'Foto de referencia para Leg Extension',
  },
  'e5f6a7b8-0001-4000-8000-00000000000e': {
    descriptionEs: 'Press de hombro con mancuernas para deltoides y triceps. Empuja verticalmente, evita chocar las mancuernas arriba y mantén costillas abajo.',
    photo: require('../../../assets/images/exercises/shoulder-press.png'),
    photoAlt: 'Foto de referencia para Shoulder Press',
  },
  'e5f6a7b8-0001-4000-8000-00000000000f': {
    descriptionEs: 'Elevacion lateral para deltoide medio. Usa peso ligero, sube con codos ligeramente flexionados y evita encoger los hombros al final del rango.',
    photo: require('../../../assets/images/exercises/lateral-raise.png'),
    photoAlt: 'Foto de referencia para Lateral Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000010': {
    descriptionEs: 'Face pull en polea para deltoide posterior y estabilidad escapular. Tira la cuerda hacia la cara, abre los codos y controla la vuelta.',
    photo: require('../../../assets/images/exercises/face-pull.png'),
    photoAlt: 'Foto de referencia para Face Pull',
  },
  'e5f6a7b8-0001-4000-8000-000000000011': {
    descriptionEs: 'Curl con barra para biceps. Mantén codos cerca del torso, evita balancearte y controla la bajada para aprovechar toda la repeticion.',
    photo: require('../../../assets/images/exercises/barbell-curl.png'),
    photoAlt: 'Foto de referencia para Barbell Curl',
  },
  'e5f6a7b8-0001-4000-8000-000000000012': {
    descriptionEs: 'Curl martillo con mancuernas para biceps y braquial. Usa agarre neutro, sube sin girar muñecas y mantiene hombros estables.',
    photo: require('../../../assets/images/exercises/hammer-curl.png'),
    photoAlt: 'Foto de referencia para Hammer Curl',
  },
  'e5f6a7b8-0001-4000-8000-000000000013': {
    descriptionEs: 'Extension de triceps en polea para tension constante. Fija codos a los lados, extiende hasta bloquear suave y vuelve sin mover hombros.',
    photo: require('../../../assets/images/exercises/tricep-pushdown.png'),
    photoAlt: 'Foto de referencia para Tricep Pushdown',
  },
  'e5f6a7b8-0001-4000-8000-000000000014': {
    descriptionEs: 'Extension de triceps sobre la cabeza con mancuerna para enfatizar la cabeza larga. Mantén codos apuntando al frente y controla el estiramiento.',
    photo: require('../../../assets/images/exercises/overhead-tricep-extension.png'),
    photoAlt: 'Foto de referencia para Overhead Tricep Extension',
  },
  'e5f6a7b8-0001-4000-8000-000000000015': {
    descriptionEs: 'Elevacion de gemelos en maquina para pantorrilla. Baja con control, pausa brevemente abajo y sube completo sin rebotar.',
    photo: require('../../../assets/images/exercises/calf-raise.png'),
    photoAlt: 'Foto de referencia para Calf Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000016': {
    descriptionEs: 'Hip thrust con barra para gluteos. Apoya la espalda alta, alinea barbilla y costillas, y empuja la cadera hasta extender sin arquear la zona lumbar.',
    photo: require('../../../assets/images/exercises/hip-thrust.png'),
    photoAlt: 'Foto de referencia para Hip Thrust',
  },
  'e5f6a7b8-0001-4000-8000-000000000017': {
    descriptionEs: 'Plancha isometrica para core. Mantén cuerpo en linea, gluteos activos y respiracion controlada sin dejar caer la cadera.',
    photo: require('../../../assets/images/exercises/plank.png'),
    photoAlt: 'Foto de referencia para Plank',
  },
  'e5f6a7b8-0001-4000-8000-000000000018': {
    descriptionEs: 'Elevacion de piernas colgado para abdominales y flexores de cadera. Evita balancearte, sube con control y baja manteniendo tension.',
    photo: require('../../../assets/images/exercises/hanging-leg-raise.png'),
    photoAlt: 'Foto de referencia para Hanging Leg Raise',
  },
  'e5f6a7b8-0001-4000-8000-000000000019': {
    descriptionEs: 'Caminata del granjero con mancuernas para agarre, trapecio y core. Camina erguido, hombros abajo y pasos controlados con carga pesada.',
    photo: require('../../../assets/images/exercises/farmers-walk.png'),
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
```

- [ ] **Step 5: Run metadata tests**

Run:

```bash
pnpm test src/features/exercises/exerciseVisuals.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/images/exercises src/features/exercises/exerciseVisuals.ts src/features/exercises/exerciseVisuals.test.ts
git commit -m "feat: add exercise visual metadata"
```

---

### Task 3: Add Read-Only Exercise Discovery Cards

**Files:**
- Create: `src/components/exercise/ExerciseDiscoveryCard.tsx`
- Modify: `src/app/exercise/index.tsx`

- [ ] **Step 1: Create the visual card component**

Create `src/components/exercise/ExerciseDiscoveryCard.tsx`:

```tsx
import { Image, type ImageSource } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { Equipment } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';

export type ExerciseDiscoveryCardExercise = {
  id: string;
  name: string;
  equipment: Equipment;
  descriptionEs: string;
  photo: ImageSource;
  photoAlt: string;
  primaryMuscleName: string | null;
  primaryMuscleLabel: string | null;
  primaryMuscleColor: string | null;
};

type ExerciseDiscoveryCardProps = {
  exercise: ExerciseDiscoveryCardExercise;
  onPress: (exerciseId: string) => void;
};

const equipmentLabels: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Maquina',
  cable: 'Cable',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  smith_machine: 'Smith',
  ez_bar: 'Barra EZ',
  cardio_machine: 'Cardio',
  other: 'Otro',
};

function getEquipmentIcon(equipment: Equipment): SymbolViewProps['name'] {
  switch (equipment) {
    case 'bodyweight':
      return { ios: 'figure.strengthtraining.traditional', android: 'accessibility_new', web: 'accessibility_new' };
    case 'cardio_machine':
      return { ios: 'figure.run', android: 'directions_run', web: 'directions_run' };
    default:
      return { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' };
  }
}

function getMuscleColor(name: string | null, fallback: string | null, defaultColor: string) {
  if (name && name in muscleColors) {
    return muscleColors[name as MuscleGroupName];
  }

  return fallback ?? defaultColor;
}

function ExerciseDiscoveryCardComponent({ exercise, onPress }: ExerciseDiscoveryCardProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const muscleColor = getMuscleColor(exercise.primaryMuscleName, exercise.primaryMuscleColor, colors.mutedText);
  const muscleLabel = exercise.primaryMuscleLabel ?? 'Sin musculo';

  return (
    <Pressable
      accessibilityLabel={`Ver descripcion de ${exercise.name}`}
      accessibilityRole="button"
      onPress={() => onPress(exercise.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          opacity: pressed ? 0.78 : 1,
          padding: spacing.two,
        },
      ]}>
      <Image
        accessibilityLabel={exercise.photoAlt}
        contentFit="cover"
        source={exercise.photo}
        style={[styles.photo, { borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary }]}
      />

      <View style={[styles.content, { gap: spacing.one }]}>
        <ThemedText type="bodyMd" numberOfLines={1} style={styles.name}>
          {exercise.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" type="small" numberOfLines={2} style={styles.description}>
          {exercise.descriptionEs}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.muscleDot, { backgroundColor: muscleColor }]} />
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={1} style={styles.metaText}>
            {muscleLabel}
          </ThemedText>
          <SymbolView name={getEquipmentIcon(exercise.equipment)} size={13} tintColor={colors.textSecondary} />
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={1} style={styles.metaText}>
            {equipmentLabels[exercise.equipment]}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

export const ExerciseDiscoveryCard = memo(ExerciseDiscoveryCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 116,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
  },
  metaText: {
    flexShrink: 1,
  },
  muscleDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
  },
  photo: {
    height: 92,
    width: 92,
  },
});
```

- [ ] **Step 2: Update list item type and imports**

In `src/app/exercise/index.tsx`, replace the current `ExerciseCard`, `FAB`, and `SQLiteBoolean` imports with:

```tsx
import { ExerciseDiscoveryCard } from '@/components/exercise/ExerciseDiscoveryCard';
import { getExerciseVisual } from '@/features/exercises/exerciseVisuals';
import type { Equipment, Exercise, MuscleGroup } from '@/domain/entities';
```

Then update `ExerciseListItem`:

```ts
type ExerciseListItem = Exercise & {
  descriptionEs: string;
  photo: ReturnType<typeof getExerciseVisual>['photo'];
  photoAlt: string;
  primaryMuscleName: string | null;
  primaryMuscleLabel: string | null;
  primaryMuscleColor: string | null;
};
```

- [ ] **Step 3: Add visual metadata while mapping exercises**

In the `nextExercises` mapping inside `src/app/exercise/index.tsx`, replace the returned object with:

```ts
const visual = getExerciseVisual(exercise);

return {
  ...exercise,
  descriptionEs: visual.descriptionEs,
  photo: visual.photo,
  photoAlt: visual.photoAlt,
  primaryMuscleColor: primaryMuscle?.color ?? null,
  primaryMuscleLabel: primaryMuscle?.display_name_es ?? null,
  primaryMuscleName: primaryMuscle?.name ?? null,
};
```

- [ ] **Step 4: Remove write actions from the visual tab**

In `src/app/exercise/index.tsx`, delete:

```ts
const handleCreatePress = useCallback(() => {
  router.push('/exercise/create' as Href);
}, [router]);

const handleFavoriteToggle = useCallback(
  async (exerciseId: string) => {
    ...
  },
  [repositories],
);
```

Then replace `renderExercise` with:

```tsx
const renderExercise = useCallback(
  ({ item }: { item: ExerciseListItem }) => (
    <ExerciseDiscoveryCard exercise={item} onPress={handleExercisePress} />
  ),
  [handleExercisePress],
);
```

Delete the FAB container from the returned JSX:

```tsx
<View
  pointerEvents="box-none"
  style={[
    styles.fabContainer,
    {
      bottom: insets.bottom + 92,
      right: spacing.four,
    },
  ]}>
  <FAB accessibilityLabel="Crear ejercicio" onPress={handleCreatePress} />
</View>
```

Delete this style because it is no longer used:

```ts
fabContainer: {
  position: 'absolute',
},
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/exercise/ExerciseDiscoveryCard.tsx src/app/exercise/index.tsx
git commit -m "feat: make exercise library visual only"
```

---

### Task 4: Make Exercise Detail A Visual Description Page

**Files:**
- Modify: `src/app/exercise/[id].tsx`

- [ ] **Step 1: Update imports**

In `src/app/exercise/[id].tsx`, add:

```tsx
import { Image } from 'expo-image';
import { getExerciseVisual } from '@/features/exercises/exerciseVisuals';
```

Remove these imports:

```tsx
import { Alert } from 'react-native';
import { BestPerformanceCard } from '@/components/exercise/BestPerformanceCard';
import { ExercisePRList } from '@/components/exercise/ExercisePRList';
import { RecentHistoryList } from '@/components/exercise/RecentHistoryList';
import { ProgressChart } from '@/components/charts/ProgressChart';
import type { PersonalRecord, SetLog } from '@/domain/entities';
import {
  getBestMetrics,
  getSessionHistory,
  getProgressData,
  type SessionSets,
} from '@/domain/services/exerciseStats';
import { startWorkoutFlow } from '@/features/workout/StartWorkoutFlow';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
```

Keep `ActivityIndicator`, `Pressable`, `ScrollView`, `StyleSheet`, and `View` from `react-native`.

- [ ] **Step 2: Remove workout-stat state and helpers**

Delete `SetRow`, `groupSetsBySession`, `AllSets`, and these state values:

```ts
const [allSets, setAllSets] = useState<AllSets>([]);
const [sessionHistory, setSessionHistory] = useState<SessionSets[]>([]);
const [prs, setPrs] = useState<PersonalRecord[]>([]);
```

Delete these derived values and handlers:

```ts
const bestMetrics = getBestMetrics(allSets);
const history = getSessionHistory(sessionHistory);
const progressData = getProgressData(history, 'volume');
const handleDelete = useCallback(() => { ... }, [exercise, id, router]);
const handleEdit = useCallback(() => { ... }, [id, router]);
const handleQuickWorkout = useCallback(() => {
  void startWorkoutFlow({ exerciseId: id });
}, [id]);
```

- [ ] **Step 3: Simplify the data load**

Replace the `Promise.all` load block with:

```ts
const [exerciseData, muscleData] = await Promise.all([
  exerciseRepo.getById(id),
  exerciseRepo.getMuscles(id),
]);
```

Then keep:

```ts
setExercise(exerciseData);
setMuscles(muscleData);
```

- [ ] **Step 4: Render photo and description**

After `const isCustom = exercise.is_custom === 1;`, add:

```ts
const visual = getExerciseVisual(exercise);
```

Use `isCustom` only to show a small "Personalizado" pill:

```tsx
{isCustom ? (
  <View style={[styles.metaPill, { backgroundColor: colors.surfaceElevated, borderRadius: radius.pill }]}>
    <ThemedText type="small" themeColor="mutedText" style={styles.metaPillText}>
      Personalizado
    </ThemedText>
  </View>
) : null}
```

Immediately below the title/meta/muscle header, add:

```tsx
<Image
  accessibilityLabel={visual.photoAlt}
  contentFit="cover"
  source={visual.photo}
  style={[styles.heroPhoto, { borderRadius: radius.lg, backgroundColor: colors.surfaceElevated }]}
/>

<View style={[styles.descriptionPanel, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.three }]}>
  <ThemedText type="smallBold" style={styles.sectionTitle}>
    Descripcion
  </ThemedText>
  <ThemedText themeColor="textSecondary" style={styles.descriptionText}>
    {visual.descriptionEs}
  </ThemedText>
</View>
```

Delete the content sections and quick workout JSX:

```tsx
<View style={{ gap: spacing.three }}>
  <BestPerformanceCard {...bestMetrics} />
  <RecentHistoryList sessions={history} />
  <ProgressChart data={progressData} />
  <ExercisePRList prs={prs} />
</View>

<View style={[styles.quickWorkoutContainer, { marginTop: spacing.four }]}>
  ...
</View>
```

- [ ] **Step 5: Update styles**

Add:

```ts
descriptionPanel: {
  gap: 8,
  marginTop: 16,
},
descriptionText: {
  fontSize: 15,
  lineHeight: 22,
},
heroPhoto: {
  aspectRatio: 1,
  width: '100%',
},
sectionTitle: {
  textTransform: 'uppercase',
},
```

Delete unused styles:

```ts
actionButtons: { ... },
iconButton: { ... },
quickWorkoutButton: { ... },
quickWorkoutContainer: { ... },
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add 'src/app/exercise/[id].tsx'
git commit -m "feat: show visual exercise detail"
```

---

### Task 5: Verify Core Behavior

**Files:**
- No code changes unless a verification command fails.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm test src/components/app-tabs.config.test.ts src/features/exercises/exerciseVisuals.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS or only existing warnings unrelated to the changed files. If lint reports changed-file errors, fix them before continuing.

- [ ] **Step 5: Smoke test the tab on Expo web**

Run:

```bash
pnpm web
```

Open the local Expo web URL shown by the terminal. Verify:

- The bottom tab bar has five tabs.
- Rutinas uses a list icon, not the exercise/barbell icon.
- Ejercicios uses the dumbbell/fitness icon.
- Tapping Ejercicios opens `/exercise`.
- Search narrows visible exercises.
- Muscle and equipment filters still work.
- Exercise cards show photo, name, short description, muscle, and equipment.
- Tapping an exercise opens `/exercise/[id]`.
- Detail shows photo and description.
- There is no create exercise FAB on the exercise tab.
- There are no edit, delete, favorite, or quick workout controls in the exercise tab/detail visual path.

- [ ] **Step 6: Refresh graph after significant source changes**

Run:

```bash
/graphify src
```

Expected: command completes and `.graphify/GRAPH_REPORT.md` reflects the current HEAD or current working tree scope.

- [ ] **Step 7: Final commit**

```bash
git status --short
git add src/components/app-tabs.config.ts src/components/app-tabs.config.test.ts src/components/app-tabs.tsx src/features/exercises/exerciseVisuals.ts src/features/exercises/exerciseVisuals.test.ts src/components/exercise/ExerciseDiscoveryCard.tsx src/app/exercise/index.tsx 'src/app/exercise/[id].tsx' assets/images/exercises
git commit -m "feat: add visual exercises tab"
```

---

## Self-Review

- Spec coverage: The plan adds an exercises section to the tab system, uses a dumbbell icon for Ejercicios, changes the duplicated Rutinas workout icon to a list icon, and makes the tab read-only/visual with search, filters, descriptions, and photos.
- Placeholder scan: No implementation step uses deferred placeholder language. Image generation has exact file paths and one exact prompt template applied to every named exercise.
- Type consistency: `AppTabItem`, `ExerciseListItem`, and `SeededExerciseVisual` are defined before use; later references use the same names and fields.
