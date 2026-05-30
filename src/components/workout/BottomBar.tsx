import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

const ORANGE = '#F97316';

type BottomBarProps = {
  onAddExercise: () => void;
  onFinish: () => void;
  finishDisabled?: boolean;
};

function BottomBarComponent({ onAddExercise, onFinish, finishDisabled = false }: BottomBarProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + spacing.two,
          paddingHorizontal: spacing.three,
          paddingTop: spacing.two,
        },
      ]}
    >
      <Pressable
        accessibilityLabel={String(t('workout.active.addExercise'))}
        accessibilityRole="button"
        testID="active-workout-add-exercise"
        onPress={onAddExercise}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: ORANGE,
            borderRadius: radius.pill,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
      >
        <ThemedText style={styles.addLabel}>{t('workout.active.addExercise')}</ThemedText>
      </Pressable>

      <Pressable
        accessibilityLabel={String(t('workout.active.finish'))}
        accessibilityRole="button"
        testID="active-workout-finish"
        disabled={finishDisabled}
        onPress={finishDisabled ? undefined : onFinish}
        style={({ pressed }) => [
          styles.finishButton,
          {
            backgroundColor: finishDisabled ? colors.mutedText : colors.success,
            borderRadius: radius.pill,
            opacity: pressed && !finishDisabled ? 0.72 : 1,
          },
        ]}
      >
        <ThemedText style={styles.finishLabel}>{t('workout.active.finishShort')}</ThemedText>
      </Pressable>
    </View>
  );
}

export const BottomBar = memo(BottomBarComponent);

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    flex: 1,
    height: 48,
    justifyContent: 'center',
    marginRight: 10,
  },
  addLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  container: {
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  finishButton: {
    alignItems: 'center',
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  finishLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
