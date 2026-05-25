import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { ProgressDataPoint } from '@/domain/services/exerciseStats';

type ProgressChartProps = {
  data: ProgressDataPoint[];
  title?: string;
};

export function ProgressChart({ data, title = 'Progreso' }: ProgressChartProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  const chartData = data.map((point) => ({
    value: point.y,
    label: point.x,
  }));

  return (
    <View
      accessibilityLabel="Grafica de progreso"
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
        {title}
      </ThemedText>

      {chartData.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="mutedText" style={styles.emptyText}>
            Sin datos para mostrar
          </ThemedText>
        </View>
      ) : (
        <View style={styles.chartWrapper}>
          <LineChart
            areaChart
            color={colors.primary}
            curved
            data={chartData}
            dataPointsColor={colors.primary}
            height={200}
            hideDataPoints={chartData.length < 2}
            initialSpacing={chartData.length === 1 ? 40 : 20}
            noOfSections={4}
            scrollToEnd
            spacing={chartData.length < 5 ? 60 : undefined}
            startFillColor={colors.primary}
            startOpacity={0.15}
            textColor={colors.mutedText}
            textFontSize={11}
            thickness={3}
            xAxisColor={colors.border}
            yAxisColor={colors.border}
            yAxisTextStyle={{
              color: colors.mutedText,
              fontSize: 11,
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    overflow: 'hidden',
  },
  container: {
    borderWidth: 1,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
