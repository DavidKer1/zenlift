import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import type { FullRoutineDay } from '@/domain/entities';
import { createStartWorkoutFlowCopy, startWorkoutFlow } from '@/features/workout/StartWorkoutFlow';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type StartWorkoutButtonProps = {
  day: FullRoutineDay;
  routineId: string;
  routineName: string;
};

export function StartWorkoutButton({
  day,
  routineId,
  routineName,
}: StartWorkoutButtonProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const startWorkoutCopy = createStartWorkoutFlowCopy(t);

  const handlePress = useCallback(() => {
    void startWorkoutFlow({
      routineId,
      routineDayId: day.id,
      name: `${routineName} - ${day.name}`,
    }, startWorkoutCopy);
  }, [day.id, day.name, routineId, routineName, startWorkoutCopy]);

  return (
    <Pressable
      accessibilityLabel={String(t('routines.startWorkoutA11y', { day: day.name }))}
      testID={`routine-day-${day.id}-start-workout`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          minHeight: 56,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <ThemedText style={[styles.label, { color: colors.surface, fontSize: typography.size.md }]}>
        {t('routines.startWorkout')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontWeight: '700',
  },
});
