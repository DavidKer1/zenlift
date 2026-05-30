import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import type { ExerciseFilterOption } from '@/features/exercises/exerciseFilterOptions';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ExerciseFilterSheetProps<Value extends string> = {
  visible: boolean;
  title: string;
  options: ExerciseFilterOption<Value>[];
  selectedValue: Value | null;
  onSelect: (value: Value | null) => void;
  onDismiss: () => void;
};

export function ExerciseFilterSheet<Value extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onDismiss,
}: ExerciseFilterSheetProps<Value>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const snapPoints = useMemo(() => ['52%'], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.52}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ExerciseFilterOption<Value> }) => {
      const selected = item.value === selectedValue;

      return (
        <Pressable
          accessibilityLabel={
            selected
              ? `${item.accessibilityLabel}, ${t('exercises.selected')}`
              : item.accessibilityLabel
          }
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => {
            onSelect(item.value);
            sheetRef.current?.dismiss();
          }}
          style={({ pressed }) => [
            styles.optionRow,
            {
              backgroundColor: selected ? colors.surfaceElevated : colors.surface,
              borderRadius: radius.md,
              opacity: pressed ? 0.78 : 1,
              paddingHorizontal: spacing.three,
            },
          ]}>
          <Image
            accessible={false}
            contentFit="cover"
            source={item.imageSource}
            style={[
              styles.optionImage,
              {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: radius.sm,
              },
            ]}
          />
          <ThemedText
            type="bodyMd"
            themeColor="textPrimary"
            numberOfLines={1}
            style={styles.optionLabel}>
            {item.label}
          </ThemedText>
          {selected ? (
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t('exercises.selected')}
            </ThemedText>
          ) : null}
        </Pressable>
      );
    },
    [
      colors.surface,
      colors.surfaceElevated,
      colors.surfaceSecondary,
      onSelect,
      radius.md,
      radius.sm,
      selectedValue,
      spacing.three,
      t,
    ],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      accessibilityLabel={String(t('exercises.a11y.filterPicker', { filter: title }))}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      enableDynamicSizing={false}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      onDismiss={onDismiss}
      snapPoints={snapPoints}>
      <View style={[styles.contentHeader, { paddingHorizontal: spacing.four, paddingBottom: spacing.two }]}>
        <ThemedText type="labelCaps" themeColor="textSecondary">
          {t('exercises.filter')}
        </ThemedText>
        <ThemedText type="subtitle" themeColor="textPrimary">
          {title}
        </ThemedText>
      </View>
      <BottomSheetFlatList
        data={options}
        keyExtractor={(item) => item.value ?? 'all'}
        renderItem={renderItem}
        contentContainerStyle={{
          gap: spacing.two,
          paddingBottom: insets.bottom + spacing.four,
          paddingHorizontal: spacing.four,
        }}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  contentHeader: {
    gap: 4,
  },
  optionImage: {
    height: 48,
    width: 48,
  },
  optionLabel: {
    flex: 1,
    minWidth: 0,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
});
