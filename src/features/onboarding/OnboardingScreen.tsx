import { createMMKV } from 'react-native-mmkv';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SETTINGS_KEYS, SETTINGS_MMKV_ID, WEEKLY_GOAL_RANGE, type WeightUnit } from '@/features/settings/constants';
import { useZenliftTheme } from '@/providers/ThemeProvider';

const storage = createMMKV({ id: SETTINGS_MMKV_ID });

const STEPS = ['welcome', 'unit', 'goal'] as const;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingScreenProps = {
  onComplete?: () => void;
};

function WelcomeStep({ onEmpezar }: { onEmpezar: () => void }) {
  const { colors, spacing, radius, typography } = useZenliftTheme();

  return (
    <View style={[styles.stepContainer, { paddingHorizontal: spacing.four }]}>
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.logoText,
            {
              color: colors.primary,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.display,
              letterSpacing: 4,
            },
          ]}
          accessibilityRole="header">
          ZENLIFT
        </Text>

        <Text
          style={[
            styles.heading,
            {
              color: colors.text,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.xxl,
            },
          ]}>
          Bienvenido a tu entrenamiento
        </Text>

        <Text
          style={[
            styles.subheading,
            {
              color: colors.mutedText,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.regular,
              fontSize: typography.size.md,
              lineHeight: typography.lineHeight.md,
            },
          ]}>
          Registra, progresa y supera tus propios límites
        </Text>
      </View>

      <Pressable
        onPress={onEmpezar}
        style={({ pressed }) => [
          styles.ctaButton,
          {
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: radius.xl,
            paddingVertical: spacing.three,
            paddingHorizontal: spacing.five,
            minHeight: 56,
          },
        ]}
        accessibilityLabel="Empezar configuración"
        accessibilityRole="button">
        <Text
          style={[
            styles.ctaText,
            {
              color: colors.surface,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
            },
          ]}>
          Empezar
        </Text>
      </Pressable>
    </View>
  );
}

function UnitStep({
  selected,
  onSelect,
}: {
  selected: WeightUnit;
  onSelect: (unit: WeightUnit) => void;
}) {
  const { colors, spacing, radius, typography } = useZenliftTheme();

  return (
    <View style={[styles.stepContainer, { paddingHorizontal: spacing.four }]}>
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepHeading,
            {
              color: colors.text,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.xxl,
            },
          ]}>
          ¿Qué unidad prefieres?
        </Text>

        <Text
          style={[
            styles.stepSubheading,
            {
              color: colors.mutedText,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.regular,
              fontSize: typography.size.md,
            },
          ]}>
          Puedes cambiarlo después en ajustes
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => onSelect('kg')}
          style={[
            styles.toggleOption,
            {
              borderRadius: radius.lg,
              minHeight: 56,
              minWidth: 80,
              backgroundColor:
                selected === 'kg' ? colors.primarySoft : 'transparent',
              borderWidth: 2,
              borderColor:
                selected === 'kg' ? colors.primary : colors.border,
            },
          ]}
          accessibilityLabel="Seleccionar kilogramos"
          accessibilityRole="button"
          accessibilityState={{ selected: selected === 'kg' }}>
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  selected === 'kg' ? colors.primary : colors.mutedText,
                fontFamily: typography.families.sans,
                fontWeight:
                  selected === 'kg'
                    ? typography.weight.bold
                    : typography.weight.medium,
                fontSize: typography.size.xl,
              },
            ]}>
            kg
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelect('lb')}
          style={[
            styles.toggleOption,
            {
              borderRadius: radius.lg,
              minHeight: 56,
              minWidth: 80,
              backgroundColor:
                selected === 'lb' ? colors.primarySoft : 'transparent',
              borderWidth: 2,
              borderColor:
                selected === 'lb' ? colors.primary : colors.border,
            },
          ]}
          accessibilityLabel="Seleccionar libras"
          accessibilityRole="button"
          accessibilityState={{ selected: selected === 'lb' }}>
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  selected === 'lb' ? colors.primary : colors.mutedText,
                fontFamily: typography.families.sans,
                fontWeight:
                  selected === 'lb'
                    ? typography.weight.bold
                    : typography.weight.medium,
                fontSize: typography.size.xl,
              },
            ]}>
            lb
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function GoalStep({
  value,
  onChange,
  onFinish,
}: {
  value: number;
  onChange: (v: number) => void;
  onFinish: () => void;
}) {
  const { colors, spacing, radius, typography } = useZenliftTheme();

  const decrement = useCallback(() => {
    onChange(Math.max(WEEKLY_GOAL_RANGE.min, value - 1));
  }, [value, onChange]);

  const increment = useCallback(() => {
    onChange(Math.min(WEEKLY_GOAL_RANGE.max, value + 1));
  }, [value, onChange]);

  return (
    <View style={[styles.stepContainer, { paddingHorizontal: spacing.four }]}>
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepHeading,
            {
              color: colors.text,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.xxl,
            },
          ]}>
          ¿Cuántos días por semana?
        </Text>

        <Text
          style={[
            styles.stepSubheading,
            {
              color: colors.mutedText,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.regular,
              fontSize: typography.size.md,
            },
          ]}>
          Define tu objetivo semanal de entrenamiento
        </Text>
      </View>

      <View style={styles.stepperRow}>
        <Pressable
          onPress={decrement}
          style={({ pressed }) => [
            styles.stepperButton,
            {
              backgroundColor: pressed
                ? colors.primaryPressed
                : colors.primarySoft,
              borderRadius: radius.pill,
              width: 56,
              height: 56,
            },
          ]}
          accessibilityLabel="Reducir objetivo semanal"
          accessibilityRole="button">
          <Text
            style={[
              styles.stepperButtonText,
              {
                color: colors.primary,
                fontFamily: typography.families.sans,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.xl,
              },
            ]}>
            −
          </Text>
        </Pressable>

        <Text
          style={[
            styles.stepperValue,
            {
              color: colors.text,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.bold,
              fontSize: typography.size.display,
            },
          ]}
          accessibilityLabel={`Objetivo semanal: ${value} días`}>
          {value}
        </Text>

        <Pressable
          onPress={increment}
          style={({ pressed }) => [
            styles.stepperButton,
            {
              backgroundColor: pressed
                ? colors.primaryPressed
                : colors.primarySoft,
              borderRadius: radius.pill,
              width: 56,
              height: 56,
            },
          ]}
          accessibilityLabel="Aumentar objetivo semanal"
          accessibilityRole="button">
          <Text
            style={[
              styles.stepperButtonText,
              {
                color: colors.primary,
                fontFamily: typography.families.sans,
                fontWeight: typography.weight.bold,
                fontSize: typography.size.xl,
              },
            ]}>
            +
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onFinish}
        style={({ pressed }) => [
          styles.ctaButton,
          {
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderRadius: radius.xl,
            paddingVertical: spacing.three,
            paddingHorizontal: spacing.five,
            minHeight: 56,
          },
        ]}
        accessibilityLabel="Comenzar a entrenar"
        accessibilityRole="button">
        <Text
          style={[
            styles.ctaText,
            {
              color: colors.surface,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
            },
          ]}>
          Comenzar
        </Text>
      </Pressable>
    </View>
  );
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors, radius, typography } = useZenliftTheme();
  const flatListRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weeklyGoal, setWeeklyGoal] = useState(3);

  const completeOnboarding = useCallback(() => {
    storage.set(SETTINGS_KEYS.weightUnit, weightUnit);
    storage.set(SETTINGS_KEYS.weeklyGoal, String(weeklyGoal));
    storage.set(SETTINGS_KEYS.onboardingCompleted, 'true');
    onComplete?.();
  }, [weightUnit, weeklyGoal, onComplete]);

  const goToStep = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback<ListRenderItem<string>>(
    ({ item }) => {
      switch (item) {
        case 'welcome':
          return <WelcomeStep onEmpezar={() => goToStep(1)} />;
        case 'unit':
          return <UnitStep selected={weightUnit} onSelect={setWeightUnit} />;
        case 'goal':
          return (
            <GoalStep
              value={weeklyGoal}
              onChange={setWeeklyGoal}
              onFinish={completeOnboarding}
            />
          );
        default:
          return null;
      }
    },
    [weightUnit, weeklyGoal, completeOnboarding, goToStep],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={completeOnboarding}
        style={({ pressed }) => [
          styles.skipButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
        accessibilityLabel="Saltar onboarding"
        accessibilityRole="button">
        <Text
          style={[
            styles.skipText,
            {
              color: colors.mutedText,
              fontFamily: typography.families.sans,
              fontWeight: typography.weight.medium,
              fontSize: typography.size.md,
            },
          ]}>
          Saltar
        </Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={STEPS as unknown as string[]}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        getItemLayout={(_data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      <View style={styles.dotsRow}>
        {STEPS.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => goToStep(index)}
            style={styles.dotTouchTarget}
            accessibilityLabel={`Ir al paso ${index + 1}`}
            accessibilityRole="button">
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.primary : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 10,
  },
  skipText: {
    textAlign: 'right',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
    width: SCREEN_WIDTH,
  },
  stepContent: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  logoText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  heading: {
    textAlign: 'center',
  },
  subheading: {
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  stepHeading: {
    textAlign: 'center',
  },
  stepSubheading: {
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  ctaText: {
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  toggleOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  toggleText: {
    textAlign: 'center',
  },
  stepperRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 32,
    marginBottom: 40,
  },
  stepperButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    textAlign: 'center',
  },
  stepperValue: {
    minWidth: 80,
    textAlign: 'center',
  },
  dotsRow: {
    alignItems: 'center',
    bottom: 40,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
  },
  dotTouchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  dot: {
    height: 10,
    width: 10,
  },
});
