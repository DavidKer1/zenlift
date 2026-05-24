import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export default function RoutinesScreen() {
  const { colors, spacing } = useZenliftTheme();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={[styles.content, { padding: spacing.four }]}>
        <ThemedText type="subtitle">Rutinas</ThemedText>
        <ThemedView
          type="surface"
          style={[styles.panel, { borderColor: colors.border, padding: spacing.three }]}>
          <ThemedText type="smallBold">Biblioteca de rutinas</ThemedText>
          <ThemedText themeColor="mutedText">
            Aqui se crearan dias, ejercicios objetivo y el acceso para iniciar entrenamientos.
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
