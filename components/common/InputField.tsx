import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import theme from '../../constants/theme';

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
  const getInputStyles = (): TextStyle[] => {
    const inputStyles: TextStyle[] = [componentStyles.input];

    if (error) {
      inputStyles.push(componentStyles.inputError as TextStyle);
    }

    if (leftIcon) {
      inputStyles.push(componentStyles.inputWithLeftIcon);
    }

    if (rightIcon) {
      inputStyles.push(componentStyles.inputWithRightIcon);
    }

    if (inputStyle) {
      inputStyles.push(inputStyle);
    }

    return inputStyles;
  };

  return (
    <View style={[componentStyles.container, containerStyle]}>
      {label && (
        <Text style={[componentStyles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={componentStyles.inputContainer}>
        {leftIcon && (
          <View style={componentStyles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={getInputStyles()}
          placeholderTextColor={theme.colors.text.disabled}
          {...props}
        />
        {rightIcon && (
          <View style={componentStyles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={[componentStyles.error, errorStyle]}>
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text style={[componentStyles.helper, helperStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const componentStyles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.default,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  iconContainer: {
    paddingHorizontal: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  error: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  helper: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
}); 