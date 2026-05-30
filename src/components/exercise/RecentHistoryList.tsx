import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { SessionHistoryItem } from '@/domain/services/exerciseStats';

type RecentHistoryListProps = {
  sessions: SessionHistoryItem[];
};

export function RecentHistoryList({ sessions }: RecentHistoryListProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const { formatShortDate, formatVolume } = useI18nFormatters();

  return (
    <View
      accessibilityLabel={String(t('exercises.stats.recentHistory'))}
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
        {t('exercises.stats.recentHistory')}
      </ThemedText>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="mutedText" style={styles.emptyText}>
            {t('exercises.stats.noHistory')}
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
                  {formatShortDate(session.date)}
                </ThemedText>
              </View>
              <View style={styles.statsRow}>
                <ThemedText type="small" themeColor="mutedText" style={styles.statText}>
                  {t('exercises.stats.setCount', { count: session.setCount })}
                </ThemedText>
                <ThemedText type="small" style={[styles.statText, { color: colors.primary }]}>
                  {formatVolume(Math.round(session.volume), 'kg')}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
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
