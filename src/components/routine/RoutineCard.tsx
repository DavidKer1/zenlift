import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { RoutineWithCounts } from '@/storage/repositories/RoutineRepo';

type RoutineCardProps = {
  routine: RoutineWithCounts;
  onArchive: (routine: RoutineWithCounts) => void;
  onPress?: (routine: RoutineWithCounts) => void;
};

export const RoutineCard = memo(function RoutineCard({
  routine,
  onArchive,
  onPress,
}: RoutineCardProps) {
  const { colors, radius, shadows, spacing } = useZenliftTheme();
  const { t } = useTranslation();

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
        accessibilityLabel={`${t('routines.archive')} ${routine.name}`}
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
          {t('routines.archive')}
        </ThemedText>
      </Pressable>
    ),
    [colors.danger, handleArchive, radius.xl, routine.name, spacing.three, t],
  );

  return (
    <Swipeable
      containerStyle={styles.swipeableContainer}
      overshootRight={false}
      renderRightActions={renderRightActions}
      rightThreshold={48}>
      <Pressable
        accessibilityHint={String(t('routines.cardOpenHint'))}
        accessibilityLabel={`${routine.name}, ${t('routines.day.configured', {
          count: routine.day_count,
        })}, ${t('routines.day.exerciseCount', { count: routine.exercise_count })}`}
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
                {t('routines.day.configured', { count: routine.day_count })}
              </ThemedText>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.primarySoft }]}>
              <ThemedText type="smallBold" style={[styles.metaText, { color: colors.primary }]}>
                {t('routines.day.exerciseCount', { count: routine.exercise_count })}
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
