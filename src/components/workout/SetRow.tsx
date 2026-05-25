import React, { memo, useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

const GREEN = '#22C55E';

type SetRowProps = {
  setId: string;
  setNumber: number;
  previousWeight?: number;
  previousReps?: number;
  weight: number;
  reps: number;
  setType: string;
  isCompleted: boolean;
  unit: string;
  increment: number;
  onComplete: (setId: string) => void;
  onWeightChange: (setId: string, weight: number) => void;
  onRepsChange: (setId: string, reps: number) => void;
};

function SetRowComponent({
  setId,
  setNumber,
  previousWeight,
  previousReps,
  weight,
  reps,
  setType: _setType,
  isCompleted,
  unit,
  increment,
  onComplete,
  onWeightChange,
  onRepsChange,
}: SetRowProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);

  const handleWeightChange = useCallback(
    (text: string) => {
      const parsed = parseFloat(text);
      if (!isNaN(parsed) && parsed >= 0) {
        onWeightChange(setId, parsed);
      } else if (text === '' || text === '0') {
        onWeightChange(setId, 0);
      }
    },
    [setId, onWeightChange],
  );

  const handleRepsChange = useCallback(
    (text: string) => {
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        onRepsChange(setId, parsed);
      } else if (text === '' || text === '0') {
        onRepsChange(setId, 0);
      }
    },
    [setId, onRepsChange],
  );

  const handleWeightStep = useCallback(
    (delta: number) => {
      const next = Math.max(0, weight + delta);
      onWeightChange(setId, Math.round(next * 100) / 100);
    },
    [setId, weight, onWeightChange],
  );

  const handleRepsStep = useCallback(
    (delta: number) => {
      const next = Math.max(0, reps + delta);
      onRepsChange(setId, next);
    },
    [setId, reps, onRepsChange],
  );

  const handleComplete = useCallback(() => {
    if (!isCompleted) {
      onComplete(setId);
    }
  }, [setId, isCompleted, onComplete]);

  const previousLabel =
    previousWeight !== undefined && previousReps !== undefined
      ? `${previousWeight} ${unit} x ${previousReps}`
      : undefined;

  return (
    <View
      style={[
        styles.row,
        {
          borderColor: colors.border,
          minHeight: 56,
          paddingHorizontal: spacing.one,
        },
      ]}
    >
      <View style={styles.setNumberCol}>
        <ThemedText
          type="smallBold"
          style={{
            color: isCompleted ? GREEN : colors.mutedText,
            fontSize: 16,
          }}
        >
          {setNumber}
        </ThemedText>
      </View>

      <View style={styles.prevCol}>
        {previousLabel ? (
          <ThemedText
            type="small"
            themeColor="mutedText"
            numberOfLines={2}
            style={{ fontSize: 11, lineHeight: 14 }}
          >
            {previousLabel}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.inputGroup}>
        <Pressable
          accessibilityLabel={`Reducir peso set ${setNumber}`}
          onPress={() => handleWeightStep(-increment)}
          style={({ pressed }) => [
            styles.stepper,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.sm,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>-</ThemedText>
        </Pressable>

        <TextInput
          ref={weightInputRef}
          accessibilityLabel={`Peso set ${setNumber}`}
          keyboardType="numeric"
          returnKeyType="next"
          onSubmitEditing={() => repsInputRef.current?.focus()}
          value={weight === 0 ? '' : String(weight)}
          onChangeText={handleWeightChange}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
          ]}
          placeholderTextColor={colors.mutedText}
        />

        <Pressable
          accessibilityLabel={`Aumentar peso set ${setNumber}`}
          onPress={() => handleWeightStep(increment)}
          style={({ pressed }) => [
            styles.stepper,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.sm,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>+</ThemedText>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <Pressable
          accessibilityLabel={`Reducir repeticiones set ${setNumber}`}
          onPress={() => handleRepsStep(-1)}
          style={({ pressed }) => [
            styles.stepper,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.sm,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>-</ThemedText>
        </Pressable>

        <TextInput
          ref={repsInputRef}
          accessibilityLabel={`Repeticiones set ${setNumber}`}
          keyboardType="numeric"
          returnKeyType="done"
          value={reps === 0 ? '' : String(reps)}
          onChangeText={handleRepsChange}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
          ]}
          placeholderTextColor={colors.mutedText}
        />

        <Pressable
          accessibilityLabel={`Aumentar repeticiones set ${setNumber}`}
          onPress={() => handleRepsStep(1)}
          style={({ pressed }) => [
            styles.stepper,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.sm,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>+</ThemedText>
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel={
          isCompleted
            ? `Set ${setNumber} completado`
            : `Completar set ${setNumber}`
        }
        accessibilityRole="button"
        disabled={isCompleted}
        onPress={handleComplete}
        style={({ pressed }) => [
          styles.checkButton,
          {
            backgroundColor: isCompleted ? `${GREEN}26` : 'transparent',
            borderColor: isCompleted ? GREEN : colors.border,
            borderRadius: 999,
            opacity: isCompleted ? 1 : pressed ? 0.6 : 1,
          },
        ]}
      >
        <ThemedText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: isCompleted ? GREEN : colors.mutedText,
          }}
        >
          ✓
        </ThemedText>
      </Pressable>
    </View>
  );
}

export const SetRow = memo(SetRowComponent, (prev, next) =>
  prev.setId === next.setId &&
  prev.weight === next.weight &&
  prev.reps === next.reps &&
  prev.isCompleted === next.isCompleted &&
  prev.setNumber === next.setNumber,
);

const styles = StyleSheet.create({
  checkButton: {
    alignItems: 'center',
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  input: {
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: 40,
    minWidth: 48,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  inputGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 2,
    maxWidth: 130,
  },
  prevCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 4,
  },
  setNumberCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
  },
  stepper: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 32,
  },
});
