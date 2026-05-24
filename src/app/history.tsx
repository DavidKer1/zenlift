import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export default function HistoryScreen() {
  const { colors, spacing } = useZenliftTheme();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={[styles.content, { padding: spacing.four }]}>
        <ThemedText type="subtitle">Historial</ThemedText>
        <ThemedView
          type="surface"
          style={[styles.panel, { borderColor: colors.border, padding: spacing.three }]}>
          <ThemedText type="smallBold">Sesiones completadas</ThemedText>
          <ThemedText themeColor="mutedText">
            Aqui se consultaran workouts anteriores, volumen y resumen por sesion.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
});
