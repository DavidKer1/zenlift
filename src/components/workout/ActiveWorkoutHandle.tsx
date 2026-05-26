import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const ORANGE = '#F97316';

type Props = {
  sessionName: string;
  elapsed: string;
  isExpanded: boolean;
  surfaceColor: string;
  mutedTextColor: string;
  onExpand: () => void;
  onMinimize: () => void;
};

export default function ActiveWorkoutHandle({
  sessionName,
  elapsed,
  isExpanded,
  surfaceColor,
  mutedTextColor,
  onExpand,
  onMinimize,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.row}>
        {/* Session name */}
        <View style={styles.left}>
          <ThemedText
            type="smallBold"
            themeColor="mutedText"
            numberOfLines={1}
            style={styles.sessionLabel}
          >
            {sessionName.toUpperCase()}
          </ThemedText>
        </View>

        {/* Timer */}
        <View style={styles.center}>
          <View style={[styles.dot, { backgroundColor: ORANGE }]} />
          <ThemedText style={styles.timer}>{elapsed}</ThemedText>
        </View>

        {/* Chevron */}
        <Pressable
          onPress={isExpanded ? onMinimize : onExpand}
          hitSlop={12}
          accessibilityLabel={isExpanded ? 'Minimizar' : 'Expandir'}
          style={styles.chevron}
        >
          <Ionicons
            name={isExpanded ? 'chevron-down' : 'chevron-up'}
            size={22}
            color={mutedTextColor}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  left: {
    flex: 1,
  },
  sessionLabel: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 12,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  timer: {
    color: '#e6e0e9',
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    padding: 4,
  },
});
