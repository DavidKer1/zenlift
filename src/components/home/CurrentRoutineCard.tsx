import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  const { colors, radius, shadows, spacing, typography } = useZenliftTheme();

  return (
    <View
      accessibilityLabel="Current routine card"
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.three,
        },
      ]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            fontFamily: typography.families.sans,
            fontSize: typography.size.md,
            fontWeight: typography.weight.bold,
            lineHeight: typography.lineHeight.md,
          },
        ]}>
        Current routine
      </Text>

      {routine ? (
        <View style={[styles.routineRow, { gap: spacing.three }]}>
          <View style={[styles.routineText, { gap: spacing.one }]}>
            <Text
              style={[
                styles.routineName,
                {
                  color: colors.text,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                  lineHeight: typography.lineHeight.lg,
                },
              ]}>
              {routine.name}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.mutedText,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.sm,
                  lineHeight: typography.lineHeight.sm,
                },
              ]}>
              {routine.dayCount} {routine.dayCount === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={`Start ${routine.name}`}
            accessibilityRole="button"
            onPress={() => router.push('/routines')}
            style={({ pressed }) => [
              styles.startButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.lg,
                minHeight: 48,
                opacity: pressed ? 0.72 : 1,
                paddingHorizontal: spacing.three,
              },
            ]}>
            <Text
              style={[
                styles.startLabel,
                {
                  color: colors.surface,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.bold,
                  lineHeight: typography.lineHeight.sm,
                },
              ]}>
              Start
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.emptyContainer, { gap: spacing.two }]}>
          <SymbolView
            name={'plus.circle.fill' as SymbolViewProps['name']}
            size={30}
            tintColor={colors.primary}
          />
          <View style={{ gap: spacing.one }}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.md,
                  fontWeight: typography.weight.bold,
                  lineHeight: typography.lineHeight.md,
                },
              ]}>
              No routine set
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.mutedText,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.sm,
                  lineHeight: typography.lineHeight.sm,
                },
              ]}>
              Create a routine to track your progress
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Create Routine"
            accessibilityRole="button"
            onPress={() => router.push('/routines')}
            style={({ pressed }) => [
              styles.createButton,
              {
                backgroundColor: colors.primarySoft,
                borderColor: colors.border,
                borderRadius: radius.lg,
                minHeight: 48,
                opacity: pressed ? 0.72 : 1,
                paddingHorizontal: spacing.three,
              },
            ]}>
            <Text
              style={[
                styles.createLabel,
                {
                  color: colors.text,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.md,
                  fontWeight: typography.weight.bold,
                  lineHeight: typography.lineHeight.md,
                },
              ]}>
              Create Routine
            </Text>
          </Pressable>
        </View>
      )}
    </View>
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
