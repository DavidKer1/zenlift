import Slider from '@react-native-community/slider';
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
  DEFAULT_REST_RANGE,
  WEEKLY_GOAL_RANGE,
  type WeightUnit,
} from '@/features/settings/constants';
import { useSettings } from '@/features/settings/useSettings';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { ThemeMode } from '@/theme';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Sistema', value: 'system' },
];

const WEIGHT_UNIT_OPTIONS: { label: string; value: WeightUnit }[] = [
  { label: 'KG', value: 'kg' },
  { label: 'LB', value: 'lb' },
];

function formatRestTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function confirmLargeImport(name: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Archivo grande',
      `${name} supera 50 MB. Importarlo puede tardar en dispositivos de gama baja.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Importar', onPress: () => resolve(true) },
      ],
    );
  });
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, spacing, radius, setMode } = useZenliftTheme();
  const {
    weightUnit,
    themeMode,
    weeklyGoal,
    defaultRest,
    setWeightUnit,
    setThemeMode,
    setWeeklyGoal,
    setDefaultRest,
  } = useSettings();
  const metadata = useMemo(() => getAppMetadata(), []);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePromptVisible, setDeletePromptVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const isBusy = isExporting || isImporting || isDeleting;

  const handleThemeChange = (nextMode: ThemeMode) => {
    setThemeMode(nextMode);
    setMode(nextMode);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await exportZenliftData();
    } catch (error) {
      Alert.alert('No se pudo exportar', getErrorMessage(error, 'Intenta de nuevo.'));
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

      if (pickedFile.isLargeFile && !(await confirmLargeImport(pickedFile.name))) {
        return;
      }

      const result = await importZenliftData(pickedFile.uri);
      Alert.alert('Importacion completa', `${result.inserted} registros nuevos agregados.`);
    } catch (error) {
      Alert.alert(
        'No se pudo importar',
        getErrorMessage(error, 'El archivo no tiene un formato .zenlift valido.'),
      );
    } finally {
      setIsImporting(false);
    }
  };

  const requestDelete = () => {
    Alert.alert(
      'Borrar todos los datos',
      'Esta accion eliminara rutinas, ejercicios, sesiones, records y ajustes locales. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
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
    if (deleteConfirmation !== 'BORRAR') {
      Alert.alert('Confirmacion incorrecta', 'Escribe BORRAR exactamente para eliminar los datos.');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAllZenliftData();
      setDeletePromptVisible(false);
      setDeleteConfirmation('');
      setMode('light');
      Alert.alert('Datos borrados', 'Zenlift quedo reiniciado con los datos base.');
      router.replace('/');
    } catch (error) {
      Alert.alert('No se pudo borrar', getErrorMessage(error, 'Intenta de nuevo.'));
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
            <ThemedText type="subtitle">Ajustes</ThemedText>
            <ThemedText themeColor="mutedText">
              Preferencias locales, respaldo y control de datos.
            </ThemedText>
          </View>

          <SettingsSection title="General">
            <SettingRow label="Unidad de peso">
              <SegmentedControl
                accessibilityLabel="Seleccionar unidad de peso"
                options={WEIGHT_UNIT_OPTIONS}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </SettingRow>

            <SettingRow label="Tema">
              <SegmentedControl
                accessibilityLabel="Seleccionar tema"
                options={THEME_OPTIONS}
                value={themeMode}
                onChange={handleThemeChange}
              />
            </SettingRow>

            <SettingRow label="Meta semanal">
              <Stepper
                accessibilityLabel="Meta semanal de workouts"
                value={weeklyGoal}
                min={WEEKLY_GOAL_RANGE.min}
                max={WEEKLY_GOAL_RANGE.max}
                unit="workouts"
                onChange={setWeeklyGoal}
              />
            </SettingRow>

            <ThemedView type="surface" style={[styles.sliderRow, { borderColor: colors.border }]}>
              <View style={styles.rowHeader}>
                <ThemedText type="default">Descanso predeterminado</ThemedText>
                <ThemedText type="smallBold" style={{ color: colors.primary }}>
                  {formatRestTime(defaultRest)}
                </ThemedText>
              </View>
              <Slider
                accessibilityLabel="Ajustar descanso predeterminado"
                accessibilityValue={{ text: formatRestTime(defaultRest) }}
                minimumValue={DEFAULT_REST_RANGE.min}
                maximumValue={DEFAULT_REST_RANGE.max}
                step={DEFAULT_REST_RANGE.step}
                value={defaultRest}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                onSlidingComplete={setDefaultRest}
              />
              <View style={styles.sliderScale}>
                <ThemedText type="small" themeColor="mutedText">
                  0:30
                </ThemedText>
                <ThemedText type="small" themeColor="mutedText">
                  5:00
                </ThemedText>
              </View>
            </ThemedView>
          </SettingsSection>

          <SettingsSection title="Datos">
            <ActionButton
              label="Exportar datos"
              onPress={handleExport}
              disabled={isBusy}
              loading={isExporting}
              accessibilityLabel="Exportar datos de Zenlift"
            />
            <ActionButton
              label="Importar datos"
              onPress={handleImport}
              disabled={isBusy}
              loading={isImporting}
              variant="secondary"
              accessibilityLabel="Importar archivo de datos Zenlift"
            />
            <ActionButton
              label="Borrar todos los datos"
              onPress={requestDelete}
              disabled={isBusy}
              loading={isDeleting}
              variant="danger"
              accessibilityLabel="Borrar todos los datos de Zenlift"
            />
          </SettingsSection>

          <SettingsSection title="Informacion">
            <InfoRow label="App" value={metadata.appName} />
            <InfoRow label="Version" value={metadata.appVersion} />
            <InfoRow label="Build" value={metadata.buildNumber} />
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
              Confirmar borrado
            </ThemedText>
            <ThemedText themeColor="mutedText">
              Escribe BORRAR para eliminar permanentemente todos los datos locales.
            </ThemedText>
            <TextInput
              accessibilityLabel="Campo de confirmacion para borrar datos"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeleting}
              placeholder="BORRAR"
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
                accessibilityLabel="Cancelar borrado de datos"
                disabled={isDeleting}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.surfaceElevated,
                    opacity: isDeleting ? 0.5 : 1,
                  },
                ]}
                onPress={() => setDeletePromptVisible(false)}>
                <ThemedText type="smallBold">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                accessibilityLabel="Confirmar borrado de datos"
                disabled={isDeleting || deleteConfirmation !== 'BORRAR'}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.danger,
                    opacity: isDeleting || deleteConfirmation !== 'BORRAR' ? 0.5 : 1,
                  },
                ]}
                onPress={confirmDelete}>
                {isDeleting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <ThemedText type="smallBold" style={[styles.dangerButtonText, { color: colors.surface }]}>
                    Borrar
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
                color: selected ? colors.text : colors.mutedText,
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
  max: number;
  min: number;
  onChange: (value: number) => void;
  unit: string;
  value: number;
};

function Stepper({ accessibilityLabel, max, min, onChange, unit, value }: StepperProps) {
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
        accessibilityLabel={`${accessibilityLabel}: disminuir`}
        disabled={!canDecrement}
        onPress={() => onChange(value - 1)}
      />
      <ThemedText type="smallBold" style={styles.stepperValue}>
        {value}
      </ThemedText>
      <StepperButton
        label="+"
        accessibilityLabel={`${accessibilityLabel}: aumentar`}
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
      <ThemedText type="smallBold" style={[styles.stepperButtonText, { color: colors.text }]}>
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
  const textColor = variant === 'secondary' ? colors.text : variant === 'danger' ? colors.surface : colors.text;

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
  sliderRow: {
    borderTopWidth: 0,
    gap: 8,
    paddingTop: 2,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
