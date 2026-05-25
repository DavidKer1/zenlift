import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { SessionHistoryItem } from '@/domain/services/exerciseStats';

type RecentHistoryListProps = {
  sessions: SessionHistoryItem[];
};

export function RecentHistoryList({ sessions }: RecentHistoryListProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <View
      accessibilityLabel="Historial reciente"
      accessibilityRole="summary"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.three,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="mutedText" style={styles.title}>
        Historial reciente
      </ThemedText>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="mutedText" style={styles.emptyText}>
            Sin historial de uso
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {sessions.slice(0, 5).map((session, index) => (
            <View
              key={session.sessionId}
              style={[
                styles.row,
                index < Math.min(sessions.length - 1, 4) && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}>
              <View style={styles.dateColumn}>
                <ThemedText type="smallBold" style={styles.dateText}>
                  {formatDate(session.date)}
                </ThemedText>
              </View>
              <View style={styles.statsRow}>
                <ThemedText type="small" themeColor="mutedText" style={styles.statText}>
                  {session.setCount} series
                </ThemedText>
                <ThemedText type="small" style={[styles.statText, { color: colors.primary }]}>
                  {formatVolume(session.volume)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function formatVolume(volume: number): string {
  return `${Math.round(volume)} kg`;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    gap: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  statText: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
