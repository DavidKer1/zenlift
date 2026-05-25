import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const ORANGE = '#F97316';
const TRACK_COLOR = '#E5E7EB';
const CIRCLE_RADIUS = 90;
const CIRCLE_STROKE_WIDTH = 8;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const CIRCLE_VIEWBOX_SIZE = (CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH) * 2;

export const REST_DURATIONS = [30, 60, 90, 120, 180] as const;

export type RestTimerProps = {
  targetEnd: number | null;
  onComplete: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  exerciseName?: string;
};

export function calculateRemaining(targetEnd: number): number {
  return Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
}

export function calculateTotalDuration(targetEnd: number, remaining: number): number {
  return Math.max(1, remaining);
}

function RestTimerComponent({
  targetEnd,
  onComplete,
  onSkip,
  onAddTime,
  exerciseName,
}: RestTimerProps) {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const rafRef = useRef<number | null>(null);
  const totalDurationRef = useRef<number>(0);
  const completedFiredRef = useRef<boolean>(false);
  const targetEndRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    targetEndRef.current = targetEnd;
    completedFiredRef.current = false;

    if (targetEnd === null) {
      setRemaining(0);
      return;
    }

    const initialRemaining = calculateRemaining(targetEnd);
    totalDurationRef.current = calculateTotalDuration(targetEnd, initialRemaining);
    setRemaining(initialRemaining);

    if (initialRemaining === 0) {
      if (!completedFiredRef.current) {
        completedFiredRef.current = true;
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Haptics may not be available
        }
        onCompleteRef.current();
      }
      return;
    }

    const tick = () => {
      const end = targetEndRef.current;
      if (end === null) return;

      if (!isPausedRef.current) {
        const r = calculateRemaining(end);
        setRemaining(r);

        if (r === 0 && !completedFiredRef.current) {
          completedFiredRef.current = true;
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            // Haptics may not be available
          }
          onCompleteRef.current();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetEnd]);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return gestureState.dx > 30 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > 80) {
          onSkip();
        }
      },
    }),
  ).current;

  if (targetEnd === null) {
    return null;
  }

  const progress = totalDurationRef.current > 0
    ? Math.min(1, Math.max(0, 1 - remaining / totalDurationRef.current))
    : 1;

  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);
  const displaySeconds = remaining;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container} {...panResponder.panHandlers}>
        <View style={styles.timerArea}>
          <View style={styles.svgContainer}>
            <Svg
              width={CIRCLE_VIEWBOX_SIZE}
              height={CIRCLE_VIEWBOX_SIZE}
              viewBox={`0 0 ${CIRCLE_VIEWBOX_SIZE} ${CIRCLE_VIEWBOX_SIZE}`}
            >
              <Circle
                cx={CIRCLE_VIEWBOX_SIZE / 2}
                cy={CIRCLE_VIEWBOX_SIZE / 2}
                r={CIRCLE_RADIUS}
                stroke={TRACK_COLOR}
                strokeWidth={CIRCLE_STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={CIRCLE_VIEWBOX_SIZE / 2}
                cy={CIRCLE_VIEWBOX_SIZE / 2}
                r={CIRCLE_RADIUS}
                stroke={ORANGE}
                strokeWidth={CIRCLE_STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${CIRCLE_VIEWBOX_SIZE / 2} ${CIRCLE_VIEWBOX_SIZE / 2})`}
              />
            </Svg>
          </View>

          <View style={styles.centerOverlay}>
            <ThemedText
              style={styles.countdown}
              accessibilityLabel={`${displaySeconds} segundos restantes`}
            >
              {displaySeconds}
            </ThemedText>
            <ThemedText style={styles.secondsLabel} themeColor="mutedText">
              seg
            </ThemedText>
          </View>
        </View>

        <View style={styles.labelsContainer}>
          <ThemedText style={styles.restLabel}>Descanso</ThemedText>
          {exerciseName ? (
            <ThemedText style={styles.exerciseName} themeColor="mutedText" numberOfLines={1}>
              {exerciseName}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.controls}>
          <Pressable
            accessibilityLabel="Pausar temporizador"
            accessibilityRole="button"
            onPress={handleTogglePause}
            style={({ pressed }) => [
              styles.controlButton,
              styles.pauseButton,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <ThemedText style={styles.controlButtonText}>
              {isPaused ? '▶' : '⏸'}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityLabel="Saltar descanso"
            accessibilityRole="button"
            onPress={onSkip}
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: theme.mutedText, opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
          </Pressable>

          <Pressable
            accessibilityLabel="Añadir 30 segundos"
            accessibilityRole="button"
            onPress={() => onAddTime(30)}
            style={({ pressed }) => [
              styles.controlButton,
              styles.addTimeButton,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <ThemedText style={styles.addTimeText}>+30s</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const RestTimer = memo(RestTimerComponent);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  container: {
    alignItems: 'center',
    gap: 16,
  },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  countdown: {
    fontSize: 52,
    fontWeight: '400',
    lineHeight: 60,
  },
  secondsLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  labelsContainer: {
    alignItems: 'center',
    gap: 2,
  },
  restLabel: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  controlButton: {
    alignItems: 'center',
    borderRadius: 100,
    height: 44,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 20,
  },
  pauseButton: {
    backgroundColor: '#EEF0F3',
    minWidth: 44,
    paddingHorizontal: 0,
  },
  addTimeButton: {
    backgroundColor: ORANGE,
  },
  controlButtonText: {
    color: '#0A0B0D',
    fontSize: 16,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addTimeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
