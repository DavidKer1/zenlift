export const BOTTOM_TAB_TOP_PADDING = 6;
export const BOTTOM_TAB_BUTTON_MIN_HEIGHT = 52;
export const BOTTOM_TAB_BOTTOM_PADDING_MIN = 8;

export const ACTIVE_WORKOUT_MINIMIZED_HEADER_HEIGHT = 56;

export function getBottomTabBarHeight(bottomInset: number): number {
  return (
    BOTTOM_TAB_TOP_PADDING
    + BOTTOM_TAB_BUTTON_MIN_HEIGHT
    + Math.max(bottomInset, BOTTOM_TAB_BOTTOM_PADDING_MIN)
  );
}
