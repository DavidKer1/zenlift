# Accessible Exercise Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace exercise filter pills with two accessible filter controls, `Equipment` and `Muscle`, that open a partially expanded bottom modal list, close after selection, and filter exercises in both the Exercise tab and the Active Workout exercise picker.

**Architecture:** Add a small shared filter model under `src/features/exercises/`, then add reusable UI components under `src/components/exercise/`. The Exercise tab and shared `ExercisePicker` will consume the same option builders and bottom sheet, keeping filtering behavior consistent across the exercise library, active workout, and routine exercise selection flows without changing repositories or workout persistence.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript, Expo Router, `@gorhom/bottom-sheet`, `expo-image`, `FlashList`, Jest.

---

## Context And Constraints

- Product loop stays focused on `Crear rutina -> Iniciar workout -> Registrar sets -> Finalizar sesión -> Ver progreso`.
- Active Workout remains the highest-priority flow. The shared `ExercisePicker` is used by `src/app/workout/active.tsx`, `src/components/workout/ActiveWorkoutModal.tsx`, and routine editors, so this change must keep selection fast and reliable.
- Project rule says Expo docs must be checked before writing Expo/React Native code. Installed Expo is `~55.0.26`, which matches the project instruction to use SDK 55 docs.
- Graphify report exists but was built from commit `1d9f588`; current `HEAD` is `ff09e8a2068efcd205b5c42843f46fe7a03d2156`, so rely on direct file reads for this implementation.
- Documentation checked:
  - `docs/README.md`
  - `docs/ux_workflows.md`
  - `docs/architecture.md`
  - `DESIGN.md`
  - Expo SDK 55 docs: `https://docs.expo.dev/versions/v55.0.0/`
  - Context7 `/websites/expo_dev_versions_v55_0_0`: local image assets can be imported via Metro/`require`, and `expo-image` accepts local asset sources.
  - Context7 `/gorhom/react-native-bottom-sheet`: `BottomSheetModal` requires `BottomSheetModalProvider`; sheets use snap points; list content should use `BottomSheetFlatList`; rows can dismiss the modal after selection.

## File Structure

- Create: `assets/images/filters/filter-option-temp.png`
  - Temporary local image used for every filter option until final artwork is provided.
- Create: `src/features/exercises/exerciseFilterOptions.ts`
  - Shared labels, option types, local image reference, and selected-label helpers for equipment and muscles.
- Create: `src/features/exercises/__tests__/exerciseFilterOptions.test.ts`
  - Unit tests for option ordering, label lookup, and fallback labels.
- Create: `src/components/exercise/ExerciseFilterButton.tsx`
  - Accessible trigger button for `Equipment` and `Muscle`.
- Create: `src/components/exercise/ExerciseFilterSheet.tsx`
  - Bottom sheet modal with partial snap point and list rows with left image + filter name.
- Modify: `src/app/_layout.tsx`
  - Wrap app content with `BottomSheetModalProvider`.
- Modify: `src/app/exercise/index.tsx`
  - Replace pill rows with two filter buttons and two bottom-sheet modals.
  - Change muscle filtering from multi-select set to one selected muscle, because the new modal closes after a single filter selection.
- Modify: `src/components/routine/ExercisePicker.tsx`
  - Replace the old combined pills with the same two filter buttons and bottom-sheet modals.
  - Remove category filtering from the picker UI so it matches the requested two-filter system.

---

### Task 1: Add The Temporary Filter Image Asset

**Files:**
- Create: `assets/images/filters/filter-option-temp.png`

- [ ] **Step 1: Generate the local asset directory**

Run:

```bash
mkdir -p assets/images/filters
```

Expected: command exits with code `0`.

- [ ] **Step 2: Seed the temporary image from an existing exercise asset**

Run:

```bash
cp assets/images/exercises/bench-press.png assets/images/filters/filter-option-temp.png
```

Expected: command exits with code `0`.

- [ ] **Step 3: Verify the asset exists**

Run:

```bash
test -f assets/images/filters/filter-option-temp.png && file assets/images/filters/filter-option-temp.png
```

Expected: output includes `PNG image data`.

- [ ] **Step 4: Commit**

```bash
git add assets/images/filters/filter-option-temp.png
git commit -m "chore: add temporary exercise filter asset"
```

---

### Task 2: Add Shared Exercise Filter Option Model

**Files:**
- Create: `src/features/exercises/exerciseFilterOptions.ts`
- Create: `src/features/exercises/__tests__/exerciseFilterOptions.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/features/exercises/__tests__/exerciseFilterOptions.test.ts`:

```ts
import type { MuscleGroup } from '@/domain/entities';
import {
  buildMuscleFilterOptions,
  equipmentFilterOptions,
  getEquipmentFilterLabel,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';

function makeMuscle(overrides: Partial<MuscleGroup> = {}): MuscleGroup {
  return {
    id: 'mg-1',
    name: 'Chest',
    display_name_es: 'Pecho',
    color: '#FFFFFF',
    ...overrides,
  };
}

describe('exerciseFilterOptions', () => {
  it('keeps equipment options in the expected display order with all first', () => {
    expect(equipmentFilterOptions.map((option) => option.label)).toEqual([
      'Todos',
      'Barra',
      'Mancuernas',
      'Maquina',
      'Cable',
      'Peso corporal',
      'Kettlebell',
      'Smith',
      'Barra EZ',
      'Cardio',
      'Otro',
    ]);
  });

  it('returns selected equipment labels and falls back to Todos when empty', () => {
    expect(getEquipmentFilterLabel(null)).toBe('Todos');
    expect(getEquipmentFilterLabel('dumbbell')).toBe('Mancuernas');
  });

  it('builds muscle options with all first and readable labels', () => {
    const options = buildMuscleFilterOptions([
      makeMuscle({ id: 'mg-back', name: 'Back', display_name_es: 'Espalda' }),
      makeMuscle({ id: 'mg-legs', name: 'Legs', display_name_es: 'Pierna' }),
    ]);

    expect(options.map((option) => ({ value: option.value, label: option.label }))).toEqual([
      { value: null, label: 'Todos' },
      { value: 'mg-back', label: 'Espalda' },
      { value: 'mg-legs', label: 'Pierna' },
    ]);
  });

  it('returns selected muscle labels and falls back to Todos when selection is missing', () => {
    const muscles = [
      makeMuscle({ id: 'mg-back', name: 'Back', display_name_es: 'Espalda' }),
      makeMuscle({ id: 'mg-legs', name: 'Legs', display_name_es: 'Pierna' }),
    ];

    expect(getMuscleFilterLabel(muscles, null)).toBe('Todos');
    expect(getMuscleFilterLabel(muscles, 'mg-legs')).toBe('Pierna');
    expect(getMuscleFilterLabel(muscles, 'missing')).toBe('Todos');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand
```

Expected: FAIL because `@/features/exercises/exerciseFilterOptions` does not exist.

- [ ] **Step 3: Add the shared option model**

Create `src/features/exercises/exerciseFilterOptions.ts`:

```ts
import type { ImageSourcePropType } from 'react-native';

import type { Equipment, MuscleGroup } from '@/domain/entities';

export type ExerciseFilterOption<Value extends string = string> = {
  value: Value | null;
  label: string;
  imageSource: ImageSourcePropType;
  accessibilityLabel: string;
};

const filterOptionImage = require('../../../assets/images/filters/filter-option-temp.png') as ImageSourcePropType;

export const equipmentLabels: Record<Equipment, string> = {
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

export const equipmentFilterOptions: ReadonlyArray<ExerciseFilterOption<Equipment>> = [
  {
    value: null,
    label: 'Todos',
    imageSource: filterOptionImage,
    accessibilityLabel: 'Mostrar todos los equipos',
  },
  ...Object.entries(equipmentLabels).map(([value, label]) => ({
    value: value as Equipment,
    label,
    imageSource: filterOptionImage,
    accessibilityLabel: `Filtrar por equipo ${label}`,
  })),
];

export function buildMuscleFilterOptions(
  muscles: MuscleGroup[],
): Array<ExerciseFilterOption<string>> {
  return [
    {
      value: null,
      label: 'Todos',
      imageSource: filterOptionImage,
      accessibilityLabel: 'Mostrar todos los musculos',
    },
    ...muscles.map((muscle) => ({
      value: muscle.id,
      label: muscle.display_name_es,
      imageSource: filterOptionImage,
      accessibilityLabel: `Filtrar por musculo ${muscle.display_name_es}`,
    })),
  ];
}

export function getEquipmentFilterLabel(value: Equipment | null): string {
  if (!value) return 'Todos';

  return equipmentLabels[value];
}

export function getMuscleFilterLabel(muscles: MuscleGroup[], selectedMuscleId: string | null): string {
  if (!selectedMuscleId) return 'Todos';

  return muscles.find((muscle) => muscle.id === selectedMuscleId)?.display_name_es ?? 'Todos';
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run:

```bash
pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/exercises/exerciseFilterOptions.ts src/features/exercises/__tests__/exerciseFilterOptions.test.ts
git commit -m "feat: share exercise filter options"
```

---

### Task 3: Add Reusable Accessible Filter UI Components

**Files:**
- Create: `src/components/exercise/ExerciseFilterButton.tsx`
- Create: `src/components/exercise/ExerciseFilterSheet.tsx`

- [ ] **Step 1: Create the filter trigger button**

Create `src/components/exercise/ExerciseFilterButton.tsx`:

```tsx
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ExerciseFilterButtonProps = {
  label: 'Equipment' | 'Muscle';
  valueLabel: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

export function ExerciseFilterButton({
  label,
  valueLabel,
  selected,
  onPress,
  accessibilityLabel,
}: ExerciseFilterButtonProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? colors.surfaceElevated : colors.surfaceSecondary,
          borderColor: selected ? colors.textPrimary : colors.outlineVariant,
          borderRadius: radius.md,
          paddingHorizontal: spacing.three,
          opacity: pressed ? 0.78 : 1,
        },
      ]}>
      <View style={styles.textGroup}>
        <ThemedText type="labelCaps" themeColor="textSecondary" numberOfLines={1}>
          {label}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={1}>
          {valueLabel}
        </ThemedText>
      </View>
      <SymbolView
        name={{ ios: 'chevron.up.chevron.down', android: 'unfold_more', web: 'unfold_more' }}
        size={20}
        tintColor={colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 56,
    minWidth: 0,
  },
  textGroup: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
});
```

- [ ] **Step 2: Create the bottom sheet modal**

Create `src/components/exercise/ExerciseFilterSheet.tsx`:

```tsx
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import type { ExerciseFilterOption } from '@/features/exercises/exerciseFilterOptions';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ExerciseFilterSheetProps<Value extends string> = {
  visible: boolean;
  title: 'Equipment' | 'Muscle';
  options: Array<ExerciseFilterOption<Value>>;
  selectedValue: Value | null;
  onSelect: (value: Value | null) => void;
  onDismiss: () => void;
};

export function ExerciseFilterSheet<Value extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onDismiss,
}: ExerciseFilterSheetProps<Value>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useZenliftTheme();
  const snapPoints = useMemo(() => ['52%'], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.52}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ExerciseFilterOption<Value> }) => {
      const selected = item.value === selectedValue;

      return (
        <Pressable
          accessibilityLabel={selected ? `${item.accessibilityLabel}, seleccionado` : item.accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => {
            onSelect(item.value);
            sheetRef.current?.dismiss();
          }}
          style={({ pressed }) => [
            styles.optionRow,
            {
              backgroundColor: selected ? colors.surfaceElevated : colors.surface,
              borderRadius: radius.md,
              opacity: pressed ? 0.78 : 1,
              paddingHorizontal: spacing.three,
            },
          ]}>
          <Image
            accessible={false}
            contentFit="cover"
            source={item.imageSource}
            style={[
              styles.optionImage,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.sm,
              },
            ]}
          />
          <ThemedText type="body" themeColor="textPrimary" numberOfLines={1} style={styles.optionLabel}>
            {item.label}
          </ThemedText>
          {selected ? (
            <ThemedText type="smallBold" themeColor="textSecondary">
              Seleccionado
            </ThemedText>
          ) : null}
        </Pressable>
      );
    },
    [colors.surface, colors.surfaceElevated, colors.surfaceSecondary, onSelect, radius.md, radius.sm, selectedValue, spacing.three],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      accessibilityLabel={`Seleccionar filtro de ${title}`}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      onDismiss={onDismiss}
      snapPoints={snapPoints}>
      <View style={[styles.contentHeader, { paddingHorizontal: spacing.four, paddingBottom: spacing.two }]}>
        <ThemedText type="labelCaps" themeColor="textSecondary">
          Filtro
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textPrimary">
          {title}
        </ThemedText>
      </View>
      <BottomSheetFlatList
        data={options}
        keyExtractor={(item) => item.value ?? 'all'}
        renderItem={renderItem}
        contentContainerStyle={{
          gap: spacing.two,
          paddingBottom: insets.bottom + spacing.four,
          paddingHorizontal: spacing.four,
        }}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentHeader: {
    gap: 4,
  },
  optionImage: {
    height: 48,
    width: 48,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
});
```

- [ ] **Step 3: Run typecheck to catch import and generic issues**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/exercise/ExerciseFilterButton.tsx src/components/exercise/ExerciseFilterSheet.tsx
git commit -m "feat: add accessible exercise filter sheets"
```

---

### Task 4: Provide The Bottom Sheet Modal Context

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Wrap app content with `BottomSheetModalProvider`**

Update `src/app/_layout.tsx`:

```tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMMKV } from 'react-native-mmkv';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import ActiveWorkoutModal from '@/components/workout/ActiveWorkoutModal';
import AppTabs from '@/components/app-tabs';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';
import { SETTINGS_KEYS, SETTINGS_MMKV_ID } from '@/features/settings/constants';
import {
  ThemeProvider as ZenliftThemeProvider,
  useZenliftTheme,
} from '@/providers/ThemeProvider';

const onboardingStorage = createMMKV({ id: SETTINGS_MMKV_ID });

function RootNavigation() {
  const [needsOnboarding, setNeedsOnboarding] = useState(
    () => onboardingStorage.getString(SETTINGS_KEYS.onboardingCompleted) !== 'true',
  );
  const { navigationTheme } = useZenliftTheme();

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <GestureHandlerRootView style={styles.root}>
        <BottomSheetModalProvider>
          <AnimatedSplashOverlay />
          {needsOnboarding ? (
            <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
          ) : (
            <>
              <AppTabs />
              <ActiveWorkoutModal />
            </>
          )}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NavigationThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ZenliftThemeProvider>
      <RootNavigation />
    </ZenliftThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: provide bottom sheet modal context"
```

---

### Task 5: Replace Exercise Tab Pills With Two Filter Buttons

**Files:**
- Modify: `src/app/exercise/index.tsx`

- [ ] **Step 1: Update imports**

In `src/app/exercise/index.tsx`, remove:

```tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { FilterChip } from '@/components/ui/FilterChip';
```

Add:

```tsx
import { StyleSheet, View } from 'react-native';

import { ExerciseFilterButton } from '@/components/exercise/ExerciseFilterButton';
import { ExerciseFilterSheet } from '@/components/exercise/ExerciseFilterSheet';
import {
  buildMuscleFilterOptions,
  equipmentFilterOptions,
  getEquipmentFilterLabel,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';
```

- [ ] **Step 2: Replace muscle selection state**

Replace:

```tsx
const [selectedMuscleIds, setSelectedMuscleIds] = useState<Set<string>>(() => new Set());
const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
```

With:

```tsx
const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
const [activeFilterSheet, setActiveFilterSheet] = useState<'equipment' | 'muscle' | null>(null);
```

- [ ] **Step 3: Replace selected muscle memoization**

Remove:

```tsx
const selectedMuscleIdsArray = useMemo(
  () => Array.from(selectedMuscleIds).sort(),
  [selectedMuscleIds],
);
const selectedMuscleIdsKey = selectedMuscleIdsArray.join(',');
```

Add:

```tsx
const muscleFilterOptions = useMemo(
  () => buildMuscleFilterOptions(muscleGroups),
  [muscleGroups],
);

const selectedEquipmentLabel = getEquipmentFilterLabel(selectedEquipment);
const selectedMuscleLabel = getMuscleFilterLabel(muscleGroups, selectedMuscleId);
```

- [ ] **Step 4: Update filtering logic**

Replace the muscle filter block inside `loadExercises()`:

```tsx
if (selectedMuscleIdsArray.length > 0) {
  const muscleExerciseGroups = await Promise.all(
    selectedMuscleIdsArray.map((muscleId) => repos.exerciseRepo.getByMuscle(muscleId)),
  );
  const muscleMatches = mergeUniqueExercises(muscleExerciseGroups);
  filteredExercises = applyExerciseIntersection(filteredExercises, muscleMatches);
}
```

With:

```tsx
if (selectedMuscleId) {
  const muscleMatches = await repos.exerciseRepo.getByMuscle(selectedMuscleId);
  filteredExercises = applyExerciseIntersection(filteredExercises, muscleMatches);
}
```

Then replace the effect dependency array:

```tsx
}, [debouncedSearchText, repositories, selectedEquipment, selectedMuscleIdsArray, selectedMuscleIdsKey]);
```

With:

```tsx
}, [debouncedSearchText, repositories, selectedEquipment, selectedMuscleId]);
```

- [ ] **Step 5: Remove obsolete toggle callbacks**

Remove:

```tsx
const toggleMuscleFilter = useCallback((muscleId: string) => {
  setSelectedMuscleIds((current) => {
    const next = new Set(current);

    if (next.has(muscleId)) {
      next.delete(muscleId);
    } else {
      next.add(muscleId);
    }

    return next;
  });
}, []);

const toggleEquipmentFilter = useCallback((equipment: Equipment | null) => {
  setSelectedEquipment((current) => (current === equipment ? null : equipment));
}, []);
```

Add:

```tsx
const handleEquipmentSelect = useCallback((equipment: Equipment | null) => {
  setSelectedEquipment(equipment);
  setActiveFilterSheet(null);
}, []);

const handleMuscleSelect = useCallback((muscleId: string | null) => {
  setSelectedMuscleId(muscleId);
  setActiveFilterSheet(null);
}, []);
```

- [ ] **Step 6: Replace the chip sections in JSX**

Replace both `<View style={styles.filterSection}>...</View>` blocks in the header with:

```tsx
<View style={styles.filterButtonRow}>
  <ExerciseFilterButton
    label="Equipment"
    valueLabel={selectedEquipmentLabel}
    selected={selectedEquipment !== null}
    accessibilityLabel={`Filtro Equipment, seleccion actual: ${selectedEquipmentLabel}`}
    onPress={() => setActiveFilterSheet('equipment')}
  />
  <ExerciseFilterButton
    label="Muscle"
    valueLabel={selectedMuscleLabel}
    selected={selectedMuscleId !== null}
    accessibilityLabel={`Filtro Muscle, seleccion actual: ${selectedMuscleLabel}`}
    onPress={() => setActiveFilterSheet('muscle')}
  />
</View>
```

Then render the sheets before the closing `</ThemedView>`:

```tsx
<ExerciseFilterSheet
  visible={activeFilterSheet === 'equipment'}
  title="Equipment"
  options={[...equipmentFilterOptions]}
  selectedValue={selectedEquipment}
  onSelect={handleEquipmentSelect}
  onDismiss={() => setActiveFilterSheet(null)}
/>

<ExerciseFilterSheet
  visible={activeFilterSheet === 'muscle'}
  title="Muscle"
  options={muscleFilterOptions}
  selectedValue={selectedMuscleId}
  onSelect={handleMuscleSelect}
  onDismiss={() => setActiveFilterSheet(null)}
/>
```

- [ ] **Step 7: Update styles**

Remove these styles:

```tsx
chipRow: {
  gap: 8,
  paddingRight: 24,
},
filterLabel: {
  fontSize: 12,
  lineHeight: 16,
  textTransform: 'uppercase',
},
filterSection: {
  gap: 8,
},
```

Add:

```tsx
filterButtonRow: {
  flexDirection: 'row',
  gap: 12,
},
```

- [ ] **Step 8: Run checks**

Run:

```bash
pnpm typecheck
pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand
```

Expected: both commands PASS.

- [ ] **Step 9: Commit**

```bash
git add src/app/exercise/index.tsx
git commit -m "feat: replace exercise tab filter pills"
```

---

### Task 6: Replace Shared Exercise Picker Pills With Two Filter Buttons

**Files:**
- Modify: `src/components/routine/ExercisePicker.tsx`

- [ ] **Step 1: Update imports**

In `src/components/routine/ExercisePicker.tsx`, remove `ScrollView` from the `react-native` import:

```tsx
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
```

Add:

```tsx
import { ExerciseFilterButton } from '@/components/exercise/ExerciseFilterButton';
import { ExerciseFilterSheet } from '@/components/exercise/ExerciseFilterSheet';
import {
  buildMuscleFilterOptions,
  equipmentFilterOptions,
  equipmentLabels,
  getEquipmentFilterLabel,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';
```

- [ ] **Step 2: Remove local equipment labels and icon labels**

Remove:

```tsx
const equipmentLabels: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuerna',
  machine: 'Maquina',
  cable: 'Cable',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  smith_machine: 'Smith',
  ez_bar: 'Barra EZ',
  cardio_machine: 'Cardio',
  other: 'Otro',
};

const equipmentIconLabels: Record<Equipment, string> = {
  barbell: 'BB',
  dumbbell: 'DB',
  machine: 'MA',
  cable: 'CB',
  bodyweight: 'BW',
  kettlebell: 'KB',
  smith_machine: 'SM',
  ez_bar: 'EZ',
  cardio_machine: 'CA',
  other: 'OT',
};
```

Keep `categoryLabels`, because exercise rows still display category metadata.

- [ ] **Step 3: Update filter state**

Replace:

```tsx
const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
```

With:

```tsx
const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);
const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
const [activeFilterSheet, setActiveFilterSheet] = useState<'equipment' | 'muscle' | null>(null);
```

- [ ] **Step 4: Remove category filtering from search**

Remove this block from `runSearch()`:

```tsx
if (selectedCategory) {
  nextRows = nextRows.filter((exercise) => exercise.category === selectedCategory);
}
```

Then replace the effect dependency array:

```tsx
}, [debouncedQuery, selectedCategory, selectedEquipment, selectedMuscleId, visible]);
```

With:

```tsx
}, [debouncedQuery, selectedEquipment, selectedMuscleId, visible]);
```

- [ ] **Step 5: Replace option memoization**

Remove:

```tsx
const equipmentOptions = useMemo(
  () => Array.from(new Set(allExercises.map((exercise) => exercise.equipment))).sort(),
  [allExercises],
);

const categoryOptions = useMemo(
  () => Array.from(new Set(allExercises.map((exercise) => exercise.category))).sort(),
  [allExercises],
);
```

Add:

```tsx
const visibleEquipmentOptions = useMemo(() => {
  const availableEquipment = new Set(allExercises.map((exercise) => exercise.equipment));

  return equipmentFilterOptions.filter(
    (option) => option.value === null || availableEquipment.has(option.value),
  );
}, [allExercises]);

const muscleFilterOptions = useMemo(
  () => buildMuscleFilterOptions(muscles),
  [muscles],
);

const selectedEquipmentLabel = getEquipmentFilterLabel(selectedEquipment);
const selectedMuscleLabel = getMuscleFilterLabel(muscles, selectedMuscleId);
```

- [ ] **Step 6: Update the exercise row icon**

Replace:

```tsx
<ThemedText type="code" style={{ color: colors.primary }}>
  {equipmentIconLabels[item.equipment]}
</ThemedText>
```

With:

```tsx
<ThemedText type="code" style={{ color: colors.primary }}>
  {equipmentLabels[item.equipment].slice(0, 2).toUpperCase()}
</ThemedText>
```

- [ ] **Step 7: Replace the horizontal chip scroll**

Replace the entire `<ScrollView ...>...</ScrollView>` filter block with:

```tsx
<View style={styles.filterButtonRow}>
  <ExerciseFilterButton
    label="Equipment"
    valueLabel={selectedEquipmentLabel}
    selected={selectedEquipment !== null}
    accessibilityLabel={`Filtro Equipment, seleccion actual: ${selectedEquipmentLabel}`}
    onPress={() => setActiveFilterSheet('equipment')}
  />
  <ExerciseFilterButton
    label="Muscle"
    valueLabel={selectedMuscleLabel}
    selected={selectedMuscleId !== null}
    accessibilityLabel={`Filtro Muscle, seleccion actual: ${selectedMuscleLabel}`}
    onPress={() => setActiveFilterSheet('muscle')}
  />
</View>
```

Render the sheets after the `FlashList` and before `</ThemedView>`:

```tsx
<ExerciseFilterSheet
  visible={activeFilterSheet === 'equipment'}
  title="Equipment"
  options={[...visibleEquipmentOptions]}
  selectedValue={selectedEquipment}
  onSelect={(equipment) => {
    setSelectedEquipment(equipment);
    setActiveFilterSheet(null);
  }}
  onDismiss={() => setActiveFilterSheet(null)}
/>

<ExerciseFilterSheet
  visible={activeFilterSheet === 'muscle'}
  title="Muscle"
  options={muscleFilterOptions}
  selectedValue={selectedMuscleId}
  onSelect={(muscleId) => {
    setSelectedMuscleId(muscleId);
    setActiveFilterSheet(null);
  }}
  onDismiss={() => setActiveFilterSheet(null)}
/>
```

- [ ] **Step 8: Remove the local `FilterChip` component**

Delete the `function FilterChip(...)` block at the bottom of `src/components/routine/ExercisePicker.tsx`.

- [ ] **Step 9: Update styles**

Remove these styles:

```tsx
chip: {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  minWidth: 48,
  paddingHorizontal: 16,
},
filterContent: {
  gap: 8,
  paddingVertical: 12,
},
filterScroll: {
  flexGrow: 0,
},
```

Add:

```tsx
filterButtonRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 16,
},
```

- [ ] **Step 10: Run checks**

Run:

```bash
pnpm typecheck
pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand
```

Expected: both commands PASS.

- [ ] **Step 11: Commit**

```bash
git add src/components/routine/ExercisePicker.tsx
git commit -m "feat: replace exercise picker filter pills"
```

---

### Task 7: Verify The Full Filter Flow

**Files:**
- Verify only; no expected source edits.

- [ ] **Step 1: Run unit tests**

Run:

```bash
pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Smoke test on Expo web**

Run:

```bash
pnpm web
```

Expected: Expo starts and prints a local web URL.

Open the local URL with `agent-browser` and verify:

```text
1. Navigate to Ejercicios.
2. Type "press" in the search field.
3. Press Equipment.
4. Confirm a bottom modal opens partially, not fullscreen.
5. Confirm rows show a left image and filter name.
6. Select Barra.
7. Confirm the modal closes and the list remains filtered.
8. Press Muscle.
9. Select Pecho if available.
10. Confirm the modal closes and filtering applies.
11. Start or resume an Active Workout.
12. Press Agregar ejercicio.
13. Repeat Equipment and Muscle selection in the exercise picker.
14. Select an exercise and confirm it is added to the workout.
```

Expected: no visible errors, no overlapping text, both filter buttons have 48px+ touch targets, and selection closes the sheet.

- [ ] **Step 5: Manual accessibility check**

Use VoiceOver on macOS/iOS simulator or TalkBack on Android and verify:

```text
1. Each trigger announces "Filtro Equipment..." or "Filtro Muscle..." plus current selection.
2. The selected state is announced on selected triggers and selected rows.
3. Each row can be activated without drag gestures.
4. The backdrop or swipe-down closes the sheet.
5. Focus does not land behind the open sheet while selecting a row.
6. Images do not create duplicate announcements because the row text already names the filter.
```

Expected: the flow is operable without relying on color or horizontal scrolling.

- [ ] **Step 6: Final commit if verification edits were needed**

If any source edits were made during verification:

```bash
git add src app assets
git commit -m "fix: polish accessible exercise filters"
```

If no source edits were needed, skip this commit.

---

## Self-Review

- Spec coverage:
  - Exercise tab search filters: Task 5.
  - Active Workout add-exercise picker filters: Task 6 through shared `ExercisePicker`.
  - Pills replaced by only `Equipment` and `Muscle`: Tasks 5 and 6.
  - Bottom modal is partially open: Task 3 uses `snapPoints={['52%']}`.
  - Modal list shows filter name and left image: Task 3 rows render `Image` before label.
  - Selection closes modal and filters: Tasks 5 and 6 set selection and clear active sheet.
  - Temporary image saved under `assets`: Task 1.
  - Accessibility improvement: Tasks 3, 5, 6, and 7 include roles, labels, selected state, touch target sizing, single-pointer selection, and manual screen-reader checks.
- Placeholder scan:
  - No unresolved markers, vague "add validation", or undefined functions.
  - The asset is intentionally temporary and has an exact path and generation command.
- Type consistency:
  - `Equipment | null` and `string | null` are used consistently across option helpers, sheet props, and both screens.
  - `ExerciseFilterSheet` accepts generic string values, so it supports `Equipment` and muscle UUID strings without duplicating components.
