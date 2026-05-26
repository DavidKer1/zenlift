import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        accessibilityLabel="Agregar ejercicio"
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
        <ThemedText style={styles.addLabel}>Add Exercise</ThemedText>
      </Pressable>

      <Pressable
        accessibilityLabel="Finalizar entrenamiento"
        accessibilityRole="button"
        testID="active-workout-finish"
        disabled={finishDisabled}
        onPress={finishDisabled ? undefined : onFinish}
        style={({ pressed }) => [
          styles.finishButton,
          {
            backgroundColor: finishDisabled ? colors.mutedText : colors.danger,
            borderRadius: radius.pill,
            opacity: pressed && !finishDisabled ? 0.72 : 1,
          },
        ]}
      >
        <ThemedText style={styles.finishLabel}>Finish Workout</ThemedText>
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
