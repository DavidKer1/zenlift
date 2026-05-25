import { SymbolView } from 'expo-symbols';
import { Keyboard, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar ejercicio...',
  inputProps,
}: SearchBarProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const hasValue = value.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={20}
        tintColor={colors.mutedText}
      />

      <TextInput
        accessibilityLabel="Buscar ejercicio"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        onChangeText={onChangeText}
        onSubmitEditing={Keyboard.dismiss}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        returnKeyType="search"
        style={[
          styles.input,
          {
            color: colors.text,
            fontSize: typography.size.md,
            lineHeight: typography.lineHeight.md,
          },
        ]}
        value={value}
        {...inputProps}
      />

      {hasValue ? (
        <Pressable
          accessibilityLabel="Limpiar busqueda"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
            size={18}
            tintColor={colors.mutedText}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
  },
  input: {
    flex: 1,
    minHeight: 48,
    padding: 0,
  },
  clearButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pressed: {
    opacity: 0.72,
  },
});
