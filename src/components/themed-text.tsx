import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontFamilies, type ThemeColor } from '@/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'displayLg' | 'headlineLg' | 'headlineLgMobile' | 'headlineMd' | 'bodyLg' | 'bodyMd' | 'dataLg' | 'dataMd' | 'labelCaps';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const colorKey = themeColor ?? (type === 'linkPrimary' ? 'primary' : 'text');

  return (
    <Text
      style={[
        { color: theme[colorKey] },
        type === 'default' && styles.bodyMd,
        type === 'title' && styles.headlineLgMobile,
        type === 'small' && styles.bodyMd,
        type === 'smallBold' && styles.labelCaps,
        type === 'subtitle' && styles.headlineMd,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.link,
        type === 'code' && styles.dataMd,
        type === 'displayLg' && styles.displayLg,
        type === 'headlineLg' && styles.headlineLg,
        type === 'headlineLgMobile' && styles.headlineLgMobile,
        type === 'headlineMd' && styles.headlineMd,
        type === 'bodyLg' && styles.bodyLg,
        type === 'bodyMd' && styles.bodyMd,
        type === 'dataLg' && styles.dataLg,
        type === 'dataMd' && styles.dataMd,
        type === 'labelCaps' && styles.labelCaps,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  displayLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38.4,
    letterSpacing: -0.64,
  },
  headlineLgMobile: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 33.6,
    letterSpacing: -0.28,
  },
  headlineMd: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  bodyLg: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  dataLg: {
    fontFamily: fontFamilies?.mono ?? 'JetBrains Mono',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 28.8,
    letterSpacing: -0.48,
  },
  dataMd: {
    fontFamily: fontFamilies?.mono ?? 'JetBrains Mono',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
  },
  labelCaps: {
    fontFamily: fontFamilies?.sans ?? 'Inter',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12,
    letterSpacing: 0.6,
  },
  link: {
    fontSize: 14,
    lineHeight: 21,
  },
});
