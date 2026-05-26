import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type SuggestedRoutineTemplate = {
  id: 'ppl' | 'upper-lower' | 'full-body';
  name: string;
  description: string;
  dayCount: number;
};

const templates: SuggestedRoutineTemplate[] = [
  {
    id: 'ppl',
    name: 'PPL',
    description: 'Push, pull y piernas para progresar con volumen.',
    dayCount: 6,
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower',
    description: 'Torso y pierna con frecuencia equilibrada.',
    dayCount: 4,
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Todo el cuerpo en sesiones compactas.',
    dayCount: 3,
  },
];

type SuggestedTemplatesProps = {
  onTemplatePress: (template: SuggestedRoutineTemplate) => void;
};

function formatDays(dayCount: number) {
  return `${dayCount} ${dayCount === 1 ? 'día' : 'días'}`;
}

export function SuggestedTemplates({ onTemplatePress }: SuggestedTemplatesProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <View style={styles.section}>
      <View style={[styles.heading, { paddingHorizontal: spacing.four }]}>
        <ThemedText type="smallBold" style={styles.headingTitle}>
          Plantillas sugeridas
        </ThemedText>
        <ThemedText themeColor="mutedText" type="small">
          Empieza con una estructura probada y ajústala luego.
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.four,
          },
        ]}
        showsHorizontalScrollIndicator={false}>
        {templates.map((template) => (
          <Pressable
            accessibilityLabel={`${template.name}, ${formatDays(template.dayCount)}`}
            accessibilityRole="button"
            testID={`routine-template-${template.id}`}
            key={template.id}
            onPress={() => onTemplatePress(template)}
            style={({ pressed }) => [
              styles.templatePressable,
              {
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <ThemedView
              type="surface"
              style={[
                styles.templateCard,
                {
                  borderRadius: radius.md,
                  padding: spacing.three,
                },
              ]}>
              <View
                style={[
                  styles.templateIcon,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderRadius: radius.sm,
                  },
                ]}>
                <SymbolView
                  name={'dumbbell.fill' as SymbolViewProps['name']}
                  size={18}
                  tintColor={colors.primary}
                />
              </View>
              <View style={styles.templateCopy}>
                <ThemedText type="smallBold" style={styles.templateName}>
                  {template.name}
                </ThemedText>
                <ThemedText numberOfLines={2} themeColor="mutedText" type="small">
                  {template.description}
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={[styles.dayBadge, { color: colors.primary }]}>
                {formatDays(template.dayCount)}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dayBadge: {
    fontSize: 12,
    lineHeight: 16,
  },
  heading: {
    gap: 4,
  },
  headingTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  section: {
    gap: 12,
  },
  templateCard: {
    borderWidth: 1,
    gap: 12,
    minHeight: 174,
    width: 184,
  },
  templateCopy: {
    flex: 1,
    gap: 4,
  },
  templateIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  templateName: {
    fontSize: 18,
    lineHeight: 24,
  },
  templatePressable: {
    width: 184,
  },
});
