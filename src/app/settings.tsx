import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  deleteAllZenliftData,
  exportZenliftData,
  getAppMetadata,
  importZenliftData,
  pickZenliftImportFile,
} from '@/features/settings/dataPortability';
import {
  WEEKLY_GOAL_RANGE,
  type WeightUnit,
} from '@/features/settings/constants';
import { useSettings } from '@/features/settings/useSettings';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { ThemeMode } from '@/theme';

function getErrorMessage(error: unknown, fallback: string, t: TFunction): string {
  if (error instanceof Error && error.message) {
    return error.message.startsWith('settings.')
      ? String(t(error.message))
      : error.message;
  }

  return fallback;
}

function confirmLargeImport(
  name: string,
  copy: {
    body: string;
    cancel: string;
    import: string;
    title: string;
  },
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      copy.title,
      copy.body,
      [
        { text: copy.cancel, style: 'cancel', onPress: () => resolve(false) },
        { text: copy.import, onPress: () => resolve(true) },
      ],
    );
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, setMode } = useZenliftTheme();
  const { t } = useTranslation();
  const {
    weightUnit,
    themeMode,
    weeklyGoal,
    setWeightUnit,
    setThemeMode,
    setWeeklyGoal,
  } = useSettings();
  const metadata = useMemo(() => getAppMetadata(), []);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePromptVisible, setDeletePromptVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const isBusy = isExporting || isImporting || isDeleting;
  const deleteToken = String(t('settings.deleteModal.token'));
  const themeOptions = useMemo<{ label: string; value: ThemeMode }[]>(
    () => [
      { label: String(t('settings.theme.light')), value: 'light' },
      { label: String(t('settings.theme.dark')), value: 'dark' },
      { label: String(t('settings.theme.system')), value: 'system' },
    ],
    [t],
  );
  const weightUnitOptions = useMemo<{ label: string; value: WeightUnit }[]>(
    () => [
      { label: String(t('common.unit.kg')).toUpperCase(), value: 'kg' },
      { label: String(t('common.unit.lb')).toUpperCase(), value: 'lb' },
    ],
    [t],
  );

  const handleThemeChange = (nextMode: ThemeMode) => {
    setThemeMode(nextMode);
    setMode(nextMode);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await exportZenliftData();
    } catch (error) {
      Alert.alert(
        String(t('settings.alerts.exportFailedTitle')),
        getErrorMessage(error, String(t('common.retry')), t),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);

    try {
      const pickedFile = await pickZenliftImportFile();

      if (pickedFile.canceled) {
        return;
      }

      if (
        pickedFile.isLargeFile &&
        !(await confirmLargeImport(pickedFile.name, {
          body: String(t('settings.alerts.largeFileBody', { name: pickedFile.name })),
          cancel: String(t('common.cancel')),
          import: String(t('settings.actions.importData')),
          title: String(t('settings.alerts.largeFileTitle')),
        }))
      ) {
        return;
      }

      const result = await importZenliftData(pickedFile.uri);
      Alert.alert(
        String(t('settings.alerts.importCompleteTitle')),
        String(t('settings.alerts.importCompleteBody', { count: result.inserted })),
      );
    } catch (error) {
      Alert.alert(
        String(t('settings.alerts.importFailedTitle')),
        getErrorMessage(error, String(t('settings.alerts.importFailedFallback')), t),
      );
    } finally {
      setIsImporting(false);
    }
  };

  const requestDelete = () => {
    Alert.alert(
      String(t('settings.alerts.deleteTitle')),
      String(t('settings.alerts.deleteBody')),
      [
        { text: String(t('common.cancel')), style: 'cancel' },
        {
          text: String(t('common.continue')),
          style: 'destructive',
          onPress: () => {
            setDeleteConfirmation('');
            setDeletePromptVisible(true);
          },
        },
      ],
    );
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== deleteToken) {
      Alert.alert(
        String(t('settings.alerts.incorrectConfirmationTitle')),
        String(t('settings.alerts.incorrectConfirmationBody')),
      );
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAllZenliftData();
      setDeletePromptVisible(false);
      setDeleteConfirmation('');
      setMode('light');
      Alert.alert(
        String(t('settings.alerts.deleteCompleteTitle')),
        String(t('settings.alerts.deleteCompleteBody')),
      );
      router.replace('/');
    } catch (error) {
      Alert.alert(
        String(t('settings.alerts.deleteFailedTitle')),
        getErrorMessage(error, String(t('common.retry')), t),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              padding: spacing.four,
              paddingBottom: spacing.six + 96,
            },
          ]}>
          <View style={styles.header}>
            <ThemedText type="subtitle">{t('settings.title')}</ThemedText>
            <ThemedText themeColor="mutedText">
              {t('settings.subtitle')}
            </ThemedText>
          </View>

          <SettingsSection title={String(t('settings.sections.general'))}>
            <SettingRow label={String(t('settings.labels.weightUnit'))}>
              <SegmentedControl
                accessibilityLabel={String(t('settings.a11y.weightUnit'))}
                options={weightUnitOptions}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </SettingRow>

            <SettingRow label={String(t('settings.labels.theme'))}>
              <SegmentedControl
                accessibilityLabel={String(t('settings.a11y.theme'))}
                options={themeOptions}
                value={themeMode}
                onChange={handleThemeChange}
              />
            </SettingRow>

            <SettingRow label={String(t('settings.labels.weeklyGoal'))}>
              <Stepper
                accessibilityLabel={String(t('settings.a11y.weeklyGoal'))}
                decrementLabel={String(t('settings.a11y.decreaseWeeklyGoal'))}
                incrementLabel={String(t('settings.a11y.increaseWeeklyGoal'))}
                value={weeklyGoal}
                min={WEEKLY_GOAL_RANGE.min}
                max={WEEKLY_GOAL_RANGE.max}
                unit={String(t('common.workouts'))}
                onChange={setWeeklyGoal}
              />
            </SettingRow>
          </SettingsSection>

          <SettingsSection title={String(t('settings.sections.data'))}>
            <ActionButton
              label={String(t('settings.actions.exportData'))}
              onPress={handleExport}
              disabled={isBusy}
              loading={isExporting}
              accessibilityLabel={String(t('settings.a11y.exportData'))}
            />
            <ActionButton
              label={String(t('settings.actions.importData'))}
              onPress={handleImport}
              disabled={isBusy}
              loading={isImporting}
              variant="secondary"
              accessibilityLabel={String(t('settings.a11y.importData'))}
            />
            <ActionButton
              label={String(t('settings.actions.deleteAllData'))}
              onPress={requestDelete}
              disabled={isBusy}
              loading={isDeleting}
              variant="danger"
              accessibilityLabel={String(t('settings.a11y.deleteAllData'))}
            />
          </SettingsSection>

          <SettingsSection title={String(t('settings.sections.information'))}>
            <InfoRow label={String(t('settings.labels.app'))} value={metadata.appName} />
            <InfoRow label={String(t('settings.labels.version'))} value={metadata.appVersion} />
            <InfoRow label={String(t('settings.labels.build'))} value={metadata.buildNumber} />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={deletePromptVisible}
        onRequestClose={() => setDeletePromptVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.48)' }]}>
          <ThemedView
            type="surface"
            style={[
              styles.modalCard,
              {
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.four,
              },
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.danger }}>
              {t('settings.deleteModal.title')}
            </ThemedText>
            <ThemedText themeColor="mutedText">
              {t('settings.deleteModal.body')}
            </ThemedText>
            <TextInput
              accessibilityLabel={String(t('settings.deleteModal.inputA11y'))}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeleting}
              placeholder={deleteToken}
              placeholderTextColor={colors.mutedText}
              style={[
                styles.deleteInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
            />
            <View style={styles.modalActions}>
              <Pressable
                accessibilityLabel={String(t('settings.deleteModal.cancelA11y'))}
                disabled={isDeleting}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.surfaceElevated,
                    opacity: isDeleting ? 0.5 : 1,
                  },
                ]}
                onPress={() => setDeletePromptVisible(false)}>
                <ThemedText type="smallBold">{t('common.cancel')}</ThemedText>
              </Pressable>
              <Pressable
                accessibilityLabel={String(t('settings.deleteModal.confirmA11y'))}
                disabled={isDeleting || deleteConfirmation !== deleteToken}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.danger,
                    opacity: isDeleting || deleteConfirmation !== deleteToken ? 0.5 : 1,
                  },
                ]}
                onPress={confirmDelete}>
                {isDeleting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <ThemedText type="smallBold" style={[styles.dangerButtonText, { color: colors.surface }]}>
                    {t('common.delete')}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

type SectionProps = {
  children: ReactNode;
  title: string;
};

function SettingsSection({ children, title }: SectionProps) {
  const { colors, spacing, radius } = useZenliftTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="mutedText" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <ThemedView
        type="surface"
        style={[
          styles.sectionPanel,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.three,
          },
        ]}>
        {children}
      </ThemedView>
    </View>
  );
}

type SettingRowProps = {
  children: ReactNode;
  label: string;
};

function SettingRow({ children, label }: SettingRowProps) {
  const { colors } = useZenliftTheme();

  return (
    <ThemedView type="surface" style={[styles.settingRow, { borderColor: colors.border }]}>
      <ThemedText type="default" style={styles.settingLabel}>
        {label}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

type SegmentedControlProps<T extends string> = {
  accessibilityLabel: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, radius } = useZenliftTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      style={[
        styles.segmented,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
        },
      ]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityLabel={`${accessibilityLabel}: ${option.label}`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.value}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? colors.primary : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
            onPress={() => onChange(option.value)}>
            <ThemedText
              type="smallBold"
              style={{
                color: selected ? colors.surface : colors.mutedText,
              }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

type StepperProps = {
  accessibilityLabel: string;
  decrementLabel: string;
  incrementLabel: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  unit: string;
  value: number;
};

function Stepper({
  accessibilityLabel,
  decrementLabel,
  incrementLabel,
  max,
  min,
  onChange,
  unit,
  value,
}: StepperProps) {
  const { colors, radius } = useZenliftTheme();
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: `${value} ${unit}` }}
      style={[
        styles.stepper,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
        },
      ]}>
      <StepperButton
        label="-"
        accessibilityLabel={decrementLabel}
        disabled={!canDecrement}
        onPress={() => onChange(value - 1)}
      />
      <ThemedText type="smallBold" style={styles.stepperValue}>
        {value}
      </ThemedText>
      <StepperButton
        label="+"
        accessibilityLabel={incrementLabel}
        disabled={!canIncrement}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}

type StepperButtonProps = {
  accessibilityLabel: string;
  disabled: boolean;
  label: string;
  onPress: () => void;
};

function StepperButton({ accessibilityLabel, disabled, label, onPress }: StepperButtonProps) {
  const { colors } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[
        styles.stepperButton,
        {
          backgroundColor: colors.primary,
          opacity: disabled ? 0.35 : 1,
        },
      ]}
      onPress={onPress}>
      <ThemedText type="smallBold" style={[styles.stepperButtonText, { color: colors.surface }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type ActionButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

function ActionButton({
  accessibilityLabel,
  disabled,
  label,
  loading,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  const { colors, radius } = useZenliftTheme();
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : colors.surfaceElevated;
  const textColor = variant === 'secondary' ? colors.text : variant === 'danger' ? colors.surface : colors.surface;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          borderColor: variant === 'danger' ? colors.danger : colors.border,
          borderRadius: radius.md,
          opacity: disabled ? 0.58 : pressed ? 0.78 : 1,
        },
      ]}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.text} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  const { colors } = useZenliftTheme();

  return (
    <View style={[styles.infoRow, { borderColor: colors.border }]}>
      <ThemedText type="default">{label}</ThemedText>
      <ThemedText type="smallBold" themeColor="mutedText">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 24,
  },
  header: {
    gap: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0,
    paddingHorizontal: 4,
  },
  sectionPanel: {
    borderWidth: 1,
    gap: 12,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minHeight: 64,
    paddingBottom: 12,
  },
  settingLabel: {
    flex: 1,
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 62,
    paddingHorizontal: 12,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 4,
  },
  stepperButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepperButtonText: {
    fontSize: 18,
    lineHeight: 22,
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderWidth: 1,
    gap: 16,
    maxWidth: 420,
    width: '100%',
  },
  deleteInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  dangerButtonText: {},
});
