import { LineChart } from 'react-native-gifted-charts';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { ProgressDataPoint } from '@/domain/services/exerciseStats';

type ProgressChartProps = {
  data: ProgressDataPoint[];
  title?: string;
};

export function ProgressChart({ data, title = 'Progreso' }: ProgressChartProps) {
  const { colors, spacing } = useZenliftTheme();

  const chartData = data.map((point) => ({
    value: point.y,
    label: point.x,
    dataPointText: point.y > 0 ? `${point.y}` : '',
  }));

  return (
    <ThemedView
      accessibilityLabel="Grafica de progreso"
      accessibilityRole="summary"
      variant="glass"
      style={[styles.container, { padding: spacing.three }]}>
      <ThemedText type="titleSm" themeColor="mutedText" style={styles.title}>
        {title}
      </ThemedText>

      {chartData.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="bodySm" themeColor="mutedText">
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
            dataPointsRadius={5}
            dataPointsShape="circular"
            focusEnabled
            height={200}
            hideDataPoints={chartData.length < 2}
            initialSpacing={chartData.length === 1 ? 40 : 20}
            noOfSections={4}
            scrollToEnd
            showDataPointOnFocus
            showStripOnFocus
            spacing={chartData.length < 5 ? 60 : undefined}
            startFillColor={colors.primary}
            startOpacity={0.2}
            stripColor={colors.primarySoft}
            stripOpacity={0.15}
            textColor={colors.mutedText}
            textFontSize={11}
            thickness={3}
            xAxisColor={colors.border}
            yAxisColor="transparent"
            yAxisTextStyle={{
              color: colors.mutedText,
              fontSize: 11,
            }}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    overflow: 'hidden',
  },
  container: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 4,
  },
});
