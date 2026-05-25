import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { RoutineWithCounts } from '@/storage/repositories/RoutineRepo';

type RoutineCardProps = {
  routine: RoutineWithCounts;
  onArchive: (routine: RoutineWithCounts) => void;
  onPress?: (routine: RoutineWithCounts) => void;
};

function formatCount(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export const RoutineCard = memo(function RoutineCard({
  routine,
  onArchive,
  onPress,
}: RoutineCardProps) {
  const { colors, radius, shadows, spacing } = useZenliftTheme();

  const handlePress = useCallback(() => {
    onPress?.(routine);
  }, [onPress, routine]);

  const handleArchive = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      onArchive(routine);
    },
    [onArchive, routine],
  );

  const renderRightActions = useCallback(
    (_progress: unknown, _translation: unknown, swipeable: SwipeableMethods) => (
      <Pressable
        accessibilityLabel={`Archivar ${routine.name}`}
        accessibilityRole="button"
        onPress={() => handleArchive(swipeable)}
        style={({ pressed }) => [
          styles.archiveAction,
          {
            backgroundColor: colors.danger,
            borderRadius: radius.xl,
            marginBottom: spacing.three,
            opacity: pressed ? 0.72 : 1,
          },
        ]}>
        <SymbolView
          name={'archivebox.fill' as SymbolViewProps['name']}
          size={20}
          tintColor={colors.surface}
        />
        <ThemedText type="smallBold" style={[styles.archiveText, { color: colors.surface }]}>
          Archivar
        </ThemedText>
      </Pressable>
    ),
    [colors.danger, handleArchive, radius.xl, routine.name, spacing.three],
  );

  return (
    <Swipeable
      containerStyle={styles.swipeableContainer}
      overshootRight={false}
      renderRightActions={renderRightActions}
      rightThreshold={48}>
      <Pressable
        accessibilityHint="Abre los detalles de la rutina"
        accessibilityLabel={`${routine.name}, ${formatCount(
          routine.day_count,
          'día',
          'días',
        )}, ${formatCount(routine.exercise_count, 'ejercicio', 'ejercicios')}`}
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          {
            opacity: pressed ? 0.78 : 1,
          },
        ]}>
        <ThemedView
          type="surface"
          style={[
            styles.card,
            {
              borderRadius: radius.md,
              padding: spacing.three,
            },
          ]}>
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              <ThemedText type="smallBold" style={styles.name}>
                {routine.name}
              </ThemedText>
              {routine.description ? (
                <ThemedText
                  numberOfLines={2}
                  themeColor="mutedText"
                  type="small"
                  style={styles.description}>
                  {routine.description}
                </ThemedText>
              ) : null}
            </View>
            <SymbolView
              name={'chevron.right' as SymbolViewProps['name']}
              size={18}
              tintColor={colors.mutedText}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceElevated }]}>
              <ThemedText themeColor="mutedText" type="smallBold" style={styles.metaText}>
                {formatCount(routine.day_count, 'día', 'días')}
              </ThemedText>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.primarySoft }]}>
              <ThemedText type="smallBold" style={[styles.metaText, { color: colors.primary }]}>
                {formatCount(routine.exercise_count, 'ejercicio', 'ejercicios')}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </Pressable>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  archiveAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginLeft: 12,
    minWidth: 112,
    paddingHorizontal: 16,
  },
  archiveText: {
  },
  card: {
    borderWidth: 1,
    gap: 16,
  },
  description: {
    marginTop: 2,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
  },
  pressable: {
    marginBottom: 16,
  },
  swipeableContainer: {
    overflow: 'visible',
  },
  titleBlock: {
    flex: 1,
  },
});
