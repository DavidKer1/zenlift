import React from 'react';
import { StyleSheet, View } from 'react-native';

type MuscleDotProps = {
  color: string;
  size?: number;
};

export const MuscleDot = React.memo(function MuscleDot({
  color,
  size = 12,
}: MuscleDotProps) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.dot,
        {
          backgroundColor: color,
          height: size,
          width: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  dot: {
    flexShrink: 0,
  },
});
