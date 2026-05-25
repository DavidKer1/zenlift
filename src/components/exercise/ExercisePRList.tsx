import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { PersonalRecord } from '@/domain/entities';

type ExercisePRListProps = {
  prs: PersonalRecord[];
};

const prTypeLabels: Record<string, string> = {
  max_weight: 'Peso maximo',
  max_volume: 'Volumen maximo',
  max_reps: 'Repeticiones',
  estimated_1rm: '1RM estimado',
  max_session_volume: 'Vol. sesion',
};

export function ExercisePRList({ prs }: ExercisePRListProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <View
      accessibilityLabel="Records personales"
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
        Records personales
      </ThemedText>

      {prs.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="mutedText" style={styles.emptyText}>
            Sin records personales
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {prs.map((pr, index) => (
            <View
              key={pr.id}
              style={[
                styles.row,
                index < prs.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}>
              <View style={styles.prInfo}>
                <ThemedText type="smallBold" style={styles.prType}>
                  {prTypeLabels[pr.type] ?? pr.type}
                </ThemedText>
                <ThemedText type="small" themeColor="mutedText" style={styles.prDate}>
                  {formatDate(pr.achieved_at)}
                </ThemedText>
              </View>
              <View>
                <ThemedText type="smallBold" style={[styles.prValue, { color: colors.primary }]}>
                  {formatPRValue(pr)}
                </ThemedText>
                {pr.weight !== null && pr.reps !== null ? (
                  <ThemedText type="small" themeColor="mutedText" style={styles.prDetail}>
                    {pr.weight} kg x {pr.reps}
                  </ThemedText>
                ) : null}
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

function formatPRValue(pr: PersonalRecord): string {
  const value = Math.round(pr.value);

  switch (pr.type) {
    case 'max_reps':
      return `${value} reps`;
    case 'estimated_1rm':
    case 'max_weight':
      return `${value} kg`;
    case 'max_volume':
    case 'max_session_volume':
      return `${value} kg`;
    default:
      return `${value}`;
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    gap: 12,
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
  prDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  prDetail: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  prInfo: {
    flex: 1,
    gap: 2,
  },
  prType: {
    fontSize: 15,
    lineHeight: 20,
  },
  prValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
