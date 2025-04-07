import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  helperStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  // Get current theme
  const { colors } = useTheme();
  
  // Create dynamic styles based on current theme
  const styles = createStyles(colors);

  const getInputStyles = (): TextStyle[] => {
    const inputStyles: TextStyle[] = [styles.input];

    if (error) {
      inputStyles.push(styles.inputError as TextStyle);
    }

    if (leftIcon) {
      inputStyles.push(styles.inputWithLeftIcon);
    }

    if (rightIcon) {
      inputStyles.push(styles.inputWithRightIcon);
    }

    if (inputStyle) {
      inputStyles.push(inputStyle);
    }

    return inputStyles;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={getInputStyles()}
          placeholderTextColor={colors.text.disabled}
          {...props}
        />
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text style={[styles.helper, helperStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 16, // theme.spacing.md
  },
  label: {
    fontSize: 14, // theme.typography.fontSize.sm
    color: colors.text.primary,
    marginBottom: 4, // theme.spacing.xs
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium', // theme.typography.fontFamily.medium
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8, // theme.borderRadius.sm
    backgroundColor: colors.background.default,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8, // theme.spacing.sm
    fontSize: 16, // theme.typography.fontSize.md
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // theme.typography.fontFamily.regular
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  iconContainer: {
    paddingHorizontal: 8, // theme.spacing.sm
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colors.error.main,
  },
  error: {
    color: colors.error.main,
    fontSize: 14, // theme.typography.fontSize.sm
    marginTop: 4, // theme.spacing.xs
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // theme.typography.fontFamily.regular
  },
  helper: {
    color: colors.text.secondary,
    fontSize: 14, // theme.typography.fontSize.sm
    marginTop: 4, // theme.spacing.xs
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // theme.typography.fontFamily.regular
  },
}); 