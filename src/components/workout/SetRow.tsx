import React, { memo, useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

const GREEN = '#22C55E';

export type SetRowProps = {
  setId: string;
  setNumber: number;
  previousWeight?: number;
  previousReps?: number;
  weight: number;
  reps: number;
  setType: string;
  isCompleted: boolean;
  unit: string;
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
  onComplete,
  onWeightChange,
  onRepsChange,
}: SetRowProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
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

  const handleComplete = useCallback(() => {
    onComplete(setId);
  }, [setId, onComplete]);

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
          minHeight: 64,
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
        <TextInput
          ref={weightInputRef}
          accessibilityLabel={String(t('workout.active.a11y.weightInput', { number: setNumber }))}
          testID={`active-set-${setNumber}-weight-input`}
          keyboardType="numeric"
          returnKeyType="next"
          onSubmitEditing={() => repsInputRef.current?.focus()}
          value={weight === 0 ? '' : String(weight)}
          onChangeText={handleWeightChange}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
          ]}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          ref={repsInputRef}
          accessibilityLabel={String(t('workout.active.a11y.repsInput', { number: setNumber }))}
          testID={`active-set-${setNumber}-reps-input`}
          keyboardType="numeric"
          returnKeyType="done"
          value={reps === 0 ? '' : String(reps)}
          onChangeText={handleRepsChange}
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: radius.sm,
            },
          ]}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Pressable
        accessibilityLabel={
          isCompleted
            ? String(t('workout.active.a11y.setComplete', { number: setNumber }))
            : String(t('workout.active.a11y.setIncomplete', { number: setNumber }))
        }
        accessibilityRole="button"
        testID={`active-set-${setNumber}-complete`}
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

export function areSetRowPropsEqual(
  prev: SetRowProps,
  next: SetRowProps,
): boolean {
  return (
    prev.setId === next.setId &&
    prev.setNumber === next.setNumber &&
    prev.previousWeight === next.previousWeight &&
    prev.previousReps === next.previousReps &&
    prev.weight === next.weight &&
    prev.reps === next.reps &&
    prev.setType === next.setType &&
    prev.isCompleted === next.isCompleted &&
    prev.unit === next.unit
  );
}

export const SetRow = memo(SetRowComponent, areSetRowPropsEqual);

const styles = StyleSheet.create({
  checkButton: {
    alignItems: 'center',
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  input: {
    borderWidth: 1,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    height: 48,
    minWidth: 64,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  inputGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    maxWidth: 112,
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
});
