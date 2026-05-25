import React, { memo } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

const ORANGE = '#F97316';

type WorkoutHeaderProps = {
  sessionName: string;
  elapsedSeconds: number;
  onCancel: () => void;
};

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function WorkoutHeaderComponent({
  sessionName,
  elapsedSeconds,
  onCancel,
}: WorkoutHeaderProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  const handleCancelPress = () => {
    Alert.alert(
      'Cancelar entrenamiento?',
      'Los datos registrados se conservaran.',
      [
        { text: 'Seguir entrenando', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => onCancel(),
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: 'rgba(0,0,0,0.08)',
          paddingTop: spacing.four + 16,
          paddingBottom: spacing.two,
          paddingHorizontal: spacing.three,
        },
      ]}
    >
      <View style={styles.info}>
        <ThemedText
          type="smallBold"
          themeColor="mutedText"
          style={styles.label}
        >
          {sessionName.toUpperCase()}
        </ThemedText>

        <View style={styles.timerRow}>
          <View
            style={[styles.timerDot, { backgroundColor: ORANGE }]}
          />
          <ThemedText
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            {formatTime(elapsedSeconds)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Cancelar entrenamiento"
        accessibilityRole="button"
        onPress={handleCancelPress}
        style={({ pressed }) => [
          styles.cancelButton,
          {
            backgroundColor: colors.danger,
            borderRadius: radius.pill,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
      >
        <ThemedText
          type="smallBold"
          style={{ color: '#FFFFFF', fontSize: 13 }}
        >
          Finalizar
        </ThemedText>
      </Pressable>
    </View>
  );
}

export const WorkoutHeader = memo(WorkoutHeaderComponent);

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    minWidth: 90,
    paddingHorizontal: 20,
  },
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  info: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  timerDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  timerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
