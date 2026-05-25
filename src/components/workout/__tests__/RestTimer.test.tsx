import React from 'react';
import { Pressable, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { calculateRemaining, calculateTotalDuration, RestTimer, REST_DURATIONS } from '../RestTimer';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  const MockSvg = View;
  const MockCircle = View;
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Circle: MockCircle,
    G: View,
    Path: View,
    Rect: View,
    Text: View,
    Line: View,
    Ellipse: View,
  };
});

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    background: '#F7F7F7',
    surface: '#FFFFFF',
    surfaceElevated: '#EEF0F3',
    primary: '#0052FF',
    primaryPressed: '#003ECC',
    primarySoft: '#E6EEFF',
    accent: '#0EA5E9',
    success: '#05B169',
    warning: '#F4B000',
    danger: '#CF202F',
    text: '#0A0B0D',
    mutedText: '#5B616E',
    border: '#DEE1E6',
    backgroundElement: '#EEF0F3',
    backgroundSelected: '#DEE1E6',
    textSecondary: '#5B616E',
  }),
}));

const originalRAF = globalThis.requestAnimationFrame;
const originalCAF = globalThis.cancelAnimationFrame;

beforeAll(() => {
  (globalThis as Record<string, unknown>).requestAnimationFrame = jest.fn((cb: FrameRequestCallback): number => {
    setTimeout(() => cb(Date.now()), 16);
    return 1;
  });
  (globalThis as Record<string, unknown>).cancelAnimationFrame = jest.fn();
});

afterAll(() => {
  (globalThis as Record<string, unknown>).requestAnimationFrame = originalRAF;
  (globalThis as Record<string, unknown>).cancelAnimationFrame = originalCAF;
});

describe('calculateRemaining', () => {
  it('returns positive remaining seconds when targetEnd is in the future', () => {
    const targetEnd = Date.now() + 90_000;
    const remaining = calculateRemaining(targetEnd);
    expect(remaining).toBeGreaterThanOrEqual(89);
    expect(remaining).toBeLessThanOrEqual(90);
  });

  it('returns 0 when targetEnd is in the past', () => {
    const targetEnd = Date.now() - 10_000;
    const remaining = calculateRemaining(targetEnd);
    expect(remaining).toBe(0);
  });

  it('returns 0 when targetEnd equals now (exact boundary)', () => {
    const targetEnd = Date.now();
    const remaining = calculateRemaining(targetEnd);
    expect(remaining).toBe(0);
  });

  it('never returns negative numbers', () => {
    const remaining = calculateRemaining(Date.now() - 999_999);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('rounds up fractional seconds', () => {
    const targetEnd = Date.now() + 5_500;
    const remaining = calculateRemaining(targetEnd);
    expect(remaining).toBe(6);
  });

  it('returns correct value at exactly 1 second boundary', () => {
    const targetEnd = Date.now() + 1_000;
    const remaining = calculateRemaining(targetEnd);
    expect(remaining).toBe(1);
  });
});

describe('calculateTotalDuration', () => {
  it('returns remaining as total at mount time (fresh timer)', () => {
    const now = Date.now();
    const targetEnd = now + 90_000;
    const remaining = 90;
    const total = calculateTotalDuration(targetEnd, remaining);
    expect(total).toBe(90);
  });

  it('returns at least 1 to avoid division by zero', () => {
    const total = calculateTotalDuration(Date.now(), 0);
    expect(total).toBe(1);
  });
});

describe('REST_DURATIONS', () => {
  it('contains the expected values', () => {
    expect(REST_DURATIONS).toEqual([30, 60, 90, 120, 180]);
  });
});

describe('RestTimer component', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();
  const mockOnAddTime = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function findElementByText(
    elements: renderer.ReactTestInstance[],
    text: string,
  ): renderer.ReactTestInstance | undefined {
    return elements.find(
      (el) =>
        el.type === Text &&
        typeof el.props.children === 'string' &&
        el.props.children === text,
    );
  }

  it('renders null when targetEnd is null', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={null}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('renders countdown and controls when targetEnd is provided', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const instance = tree!.root;
    const all = instance.findAll(() => true);
    expect(findElementByText(all, 'Descanso')).toBeTruthy();
    expect(findElementByText(all, 'Skip')).toBeTruthy();
    expect(findElementByText(all, '+30s')).toBeTruthy();
    expect(findElementByText(all, 'seg')).toBeTruthy();
  });

  it('renders exercise name when provided', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
          exerciseName="Bench Press"
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    expect(findElementByText(all, 'Bench Press')).toBeTruthy();
  });

  it('renders Descanso label', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    expect(findElementByText(all, 'Descanso')).toBeTruthy();
  });

  it('renders pause and skip controls with correct labels', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    expect(findElementByText(all, 'Skip')).toBeTruthy();
    expect(findElementByText(all, '+30s')).toBeTruthy();
    expect(findElementByText(all, '⏸')).toBeTruthy();
  });

  it('renders pause icon and toggles on press', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);

    const pauseEl = findElementByText(all, '⏸');
    expect(pauseEl).toBeTruthy();

    act(() => {
      pauseEl!.parent!.parent!.props.onClick?.();
    });

    const updated = tree!.root.findAll(() => true);
    expect(findElementByText(updated, '▶')).toBeTruthy();
    expect(findElementByText(updated, '⏸')).toBeFalsy();

    act(() => {
      const playEl = findElementByText(updated, '▶')!;
      playEl.parent!.parent!.props.onClick?.();
    });

    const reupdated = tree!.root.findAll(() => true);
    expect(findElementByText(reupdated, '⏸')).toBeTruthy();
  });

  it('calls onSkip when Skip is pressed', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    const skipEl = findElementByText(all, 'Skip')!;
    const pressableView = skipEl.parent!.parent!;

    act(() => {
      pressableView.props.onClick?.();
    });

    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onAddTime with 30 when +30s is pressed', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    const addTimeEl = findElementByText(all, '+30s')!;
    const pressableView = addTimeEl.parent!.parent!;

    act(() => {
      pressableView.props.onClick?.();
    });

    expect(mockOnAddTime).toHaveBeenCalledWith(30);
  });

  it('countdown has accessibility label', () => {
    const targetEnd = Date.now() + 90_000;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    const all = tree!.root.findAll(() => true);
    const countdownEl = all.find(
      (el) =>
        typeof el.props.accessibilityLabel === 'string' &&
        el.props.accessibilityLabel.includes('segundos restantes'),
    );
    expect(countdownEl).toBeTruthy();
  });

  it('immediately shows 0 and triggers onComplete when targetEnd is in the past', () => {
    const targetEnd = Date.now() - 10_000;

    act(() => {
      renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete more than once for same targetEnd', () => {
    const targetEnd = Date.now() + 100;
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <RestTimer
          targetEnd={targetEnd}
          onComplete={mockOnComplete}
          onSkip={mockOnSkip}
          onAddTime={mockOnAddTime}
        />,
      );
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });
});
