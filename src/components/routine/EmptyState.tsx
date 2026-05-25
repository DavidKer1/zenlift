import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type EmptyStateProps = {
  onCreatePress: () => void;
};

export function EmptyState({ onCreatePress }: EmptyStateProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.four }]}>
      <View
        style={[
          styles.iconShell,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
            borderRadius: radius.xl,
          },
        ]}>
        <SymbolView
          name={'figure.strengthtraining.traditional' as SymbolViewProps['name']}
          size={34}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          No tienes rutinas aún
        </ThemedText>
        <ThemedText themeColor="mutedText" style={styles.message}>
          Crea una rutina simple para llegar rápido a tu primer workout.
        </ThemedText>
      </View>

      <Pressable
        accessibilityLabel="Crear primera rutina"
        accessibilityRole="button"
        onPress={onCreatePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: radius.md,
            minHeight: 52,
            paddingHorizontal: spacing.four,
          },
        ]}>
        <SymbolView
          name={'plus' as SymbolViewProps['name']}
          size={18}
          tintColor={colors.surface}
        />
        <ThemedText type="smallBold" style={[styles.buttonText, { color: colors.surface }]}>
          Crear primera rutina
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
  },
  container: {
    alignItems: 'center',
    gap: 20,
    justifyContent: 'center',
    paddingVertical: 36,
  },
  copy: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 320,
  },
  iconShell: {
    alignItems: 'center',
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  message: {
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
  },
});
