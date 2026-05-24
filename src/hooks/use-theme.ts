import { useZenliftTheme } from '@/providers/ThemeProvider';

export function useTheme() {
  const { colors } = useZenliftTheme();

  return colors;
}

export { useZenliftTheme };
