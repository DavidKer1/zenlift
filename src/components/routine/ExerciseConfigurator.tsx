import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type ExerciseConfiguration = {
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
};

type ExerciseConfiguratorProps = {
  visible: boolean;
  exerciseName: string;
  initialValues?: Partial<ExerciseConfiguration>;
  isSaving?: boolean;
  onCancel: () => void;
  onConfirm: (configuration: ExerciseConfiguration) => void;
};

export function ExerciseConfigurator({
  visible,
  exerciseName,
  initialValues,
  isSaving = false,
  onCancel,
  onConfirm,
}: ExerciseConfiguratorProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const [targetSets, setTargetSets] = useState('3');
  const [targetRepsMin, setTargetRepsMin] = useState('8');
  const [targetRepsMax, setTargetRepsMax] = useState('12');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setTargetSets(String(initialValues?.targetSets ?? 3));
    setTargetRepsMin(formatOptional(initialValues?.targetRepsMin ?? 8));
    setTargetRepsMax(formatOptional(initialValues?.targetRepsMax ?? 12));
    setError(null);
  }, [initialValues, visible]);

  const stylesWithTheme = useMemo(
    () => ({
      sheet: [
        styles.sheet,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          padding: spacing.four,
        },
      ],
      input: [
        styles.input,
        {
          borderColor: colors.border,
          color: colors.text,
          fontSize: typography.size.md,
          minHeight: 48,
        },
      ],
      primaryButton: [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
        },
      ],
      secondaryButton: [
        styles.button,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
        },
      ],
    }),
    [colors, radius, spacing, typography],
  );

  function handleConfirm() {
    const parsedSets = parseInteger(targetSets);
    const parsedMin = parseOptionalInteger(targetRepsMin);
    const parsedMax = parseOptionalInteger(targetRepsMax);

    if (!parsedSets || parsedSets < 1) {
      setError(String(t('routines.validation.minSets')));
      return;
    }

    if ((parsedMin !== undefined && parsedMin < 1) || (parsedMax !== undefined && parsedMax < 1)) {
      setError(String(t('routines.exerciseConfig.minRepsError')));
      return;
    }

    setError(null);
    onConfirm({
      targetSets: parsedSets,
      targetRepsMin: parsedMin,
      targetRepsMax: parsedMax,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <ThemedView type="surface" style={stylesWithTheme.sheet}>
          <ThemedText type="smallBold" themeColor="mutedText">
            {t('routines.exerciseConfig.title')}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            {exerciseName}
          </ThemedText>

          {error ? (
            <ThemedView
              type="primarySoft"
              style={[styles.errorBox, { borderColor: colors.primary, borderRadius: radius.md }]}>
              <ThemedText type="smallBold" style={{ color: colors.danger }}>
                ! {error}
              </ThemedText>
            </ThemedView>
          ) : null}

          <View style={styles.grid}>
            <ConfigInput
              label={String(t('routines.exerciseConfig.sets'))}
              value={targetSets}
              onChangeText={setTargetSets}
              accessibilityLabel={String(t('routines.exerciseConfig.setsA11y'))}
              style={stylesWithTheme.input}
            />
            <ConfigInput
              label={String(t('routines.exerciseConfig.repsMin'))}
              value={targetRepsMin}
              onChangeText={setTargetRepsMin}
              accessibilityLabel={String(t('routines.exerciseConfig.repsMinA11y'))}
              style={stylesWithTheme.input}
            />
            <ConfigInput
              label={String(t('routines.exerciseConfig.repsMax'))}
              value={targetRepsMax}
              onChangeText={setTargetRepsMax}
              accessibilityLabel={String(t('routines.exerciseConfig.repsMaxA11y'))}
              style={stylesWithTheme.input}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel={String(t('routines.exerciseConfig.cancelA11y'))}
              disabled={isSaving}
              onPress={onCancel}
              style={({ pressed }) => [stylesWithTheme.secondaryButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold">{t('common.cancel')}</ThemedText>
            </Pressable>
            <Pressable
              accessibilityLabel={String(t('routines.exerciseConfig.confirmA11y'))}
              testID="exercise-configurator-confirm"
              disabled={isSaving}
              onPress={handleConfirm}
              style={({ pressed }) => [
                stylesWithTheme.primaryButton,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}>
              {isSaving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <ThemedText type="smallBold" style={[styles.primaryText, { color: colors.surface }]}>
                  {t('common.confirm')}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

function ConfigInput({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
  style: object;
}) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText type="smallBold" themeColor="mutedText">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        testID={`exercise-configurator-${label.toLowerCase().replace(/\s+/g, '-')}`}
        keyboardType="numeric"
        onChangeText={onChangeText}
        returnKeyType="done"
        style={style}
        value={value}
      />
    </View>
  );
}

function parseInteger(value: string): number | undefined {
  if (value.trim().length === 0) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalInteger(value: string): number | undefined {
  return parseInteger(value);
}

function formatOptional(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  errorBox: {
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  grid: {
    gap: 14,
    marginTop: 20,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontWeight: '700',
    paddingHorizontal: 14,
  },
  inputGroup: {
    gap: 6,
  },
  pressed: {
    opacity: 0.74,
  },
  primaryText: {
  },
  sheet: {
    borderTopWidth: 1,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: 4,
  },
});
