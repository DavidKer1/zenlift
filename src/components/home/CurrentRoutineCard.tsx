import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientCard } from '@/components/ui/GradientCard';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type CurrentRoutineCardData = {
  dayCount: number;
  id: string;
  name: string;
};

type CurrentRoutineCardProps = {
  routine: CurrentRoutineCardData | null;
};

export function CurrentRoutineCard({ routine }: CurrentRoutineCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();

  return (
    <GradientCard
      accessibilityLabel={String(t('home.currentRoutine.a11y'))}
      borderRadius={radius.xl}
      padding={spacing.paddingCard}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textPrimary,
            fontSize: typography.headlineMd.fontSize,
            fontWeight: typography.headlineMd.fontWeight,
            lineHeight: typography.headlineMd.lineHeight,
          },
        ]}>
        {t('home.currentRoutine.title')}
      </Text>

      {routine ? (
        <View style={[styles.routineRow, { gap: spacing.three }]}>
          <View style={[styles.routineText, { gap: spacing.one }]}>
            <Text
              style={[
                styles.routineName,
                {
                  color: colors.textBody,
                  fontSize: typography.bodyLg.fontSize,
                  fontWeight: typography.bodyLg.fontWeight,
                  lineHeight: typography.bodyLg.lineHeight,
                },
              ]}>
              {routine.name}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.bodyMd.fontSize,
                  lineHeight: typography.bodyMd.lineHeight,
                },
              ]}>
              {t('home.currentRoutine.dayCount', { count: routine.dayCount })}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={String(t('home.currentRoutine.startNamed', { name: routine.name }))}
            accessibilityRole="button"
            onPress={() => router.push('/routines')}
            style={({ pressed }) => [
              styles.startButton,
              {
                backgroundColor: colors.buttonPrimary,
                borderRadius: radius.md,
                minHeight: 48,
                opacity: pressed ? 0.9 : 1,
                paddingHorizontal: spacing.three,
              },
            ]}>
            <Text
              style={[
                styles.startLabel,
                {
                  color: colors.buttonPrimaryText,
                  fontSize: typography.bodyMd.fontSize,
                  fontWeight: typography.bodyMd.fontWeight,
                  lineHeight: typography.bodyMd.lineHeight,
                },
              ]}>
              {t('common.start')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.emptyContainer, { gap: spacing.two }]}>
          <SymbolView
            name={'plus.circle.fill' as SymbolViewProps['name']}
            size={30}
            tintColor={colors.textSecondary}
          />
          <View style={{ gap: spacing.one }}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.textBody,
                  fontSize: typography.bodyLg.fontSize,
                  fontWeight: typography.bodyLg.fontWeight,
                  lineHeight: typography.bodyLg.lineHeight,
                },
              ]}>
              {t('home.currentRoutine.noneTitle')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.bodyMd.fontSize,
                  lineHeight: typography.bodyMd.lineHeight,
                },
              ]}>
              {t('home.currentRoutine.noneBody')}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={String(t('home.currentRoutine.create'))}
            accessibilityRole="button"
            onPress={() => router.push('/routines')}
            style={({ pressed }) => [
              styles.createButton,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.md,
                minHeight: 48,
                opacity: pressed ? 0.9 : 1,
                paddingHorizontal: spacing.three,
              },
            ]}>
            <Text
              style={[
                styles.createLabel,
                {
                  color: colors.textBody,
                  fontSize: typography.bodyLg.fontSize,
                  fontWeight: typography.bodyLg.fontWeight,
                  lineHeight: typography.bodyLg.lineHeight,
                },
              ]}>
              {t('home.currentRoutine.create')}
            </Text>
          </Pressable>
        </View>
      )}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 16,
  },
  createButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    justifyContent: 'center',
  },
  createLabel: {
    letterSpacing: 0,
  },
  emptyContainer: {
    alignItems: 'flex-start',
  },
  emptyTitle: {
    letterSpacing: 0,
  },
  routineName: {
    letterSpacing: 0,
  },
  routineRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  routineText: {
    flex: 1,
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startLabel: {
    letterSpacing: 0,
  },
  subtitle: {
    letterSpacing: 0,
  },
});
