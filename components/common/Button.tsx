import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import theme from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getButtonStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryButton as ViewStyle);
        break;
      case 'secondary':
        baseStyles.push(styles.secondaryButton as ViewStyle);
        break;
      case 'outline':
        baseStyles.push(styles.outlineButton as ViewStyle);
        break;
      case 'text':
        baseStyles.push(styles.textButton as ViewStyle);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.smallButton as ViewStyle);
        break;
      case 'large':
        baseStyles.push(styles.largeButton as ViewStyle);
        break;
    }

    // Disabled state
    if (disabled) {
      baseStyles.push(styles.disabledButton as ViewStyle);
    }

    return baseStyles;
  };

  const getTextStyles = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [styles.text];
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryText as TextStyle);
        break;
      case 'secondary':
        baseStyles.push(styles.secondaryText as TextStyle);
        break;
      case 'outline':
        baseStyles.push(styles.outlineText as TextStyle);
        break;
      case 'text':
        baseStyles.push(styles.textButtonText as TextStyle);
        break;
    }

    // Size text styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.smallText as TextStyle);
        break;
      case 'large':
        baseStyles.push(styles.largeText as TextStyle);
        break;
    }

    // Disabled text state
    if (disabled) {
      baseStyles.push(styles.disabledText as TextStyle);
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[...getButtonStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.primary.contrastText : theme.colors.primary.main}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[...getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary.main,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.sm,
  },
  smallButton: {
    height: 32,
    paddingHorizontal: theme.spacing.sm,
  },
  mediumButton: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
  },
  largeButton: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  disabledButton: {
    backgroundColor: theme.colors.text.disabled,
    borderColor: theme.colors.text.disabled,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.primary.contrastText,
  },
  secondaryText: {
    color: theme.colors.secondary.contrastText,
  },
  outlineText: {
    color: theme.colors.primary.main,
  },
  textButtonText: {
    color: theme.colors.primary.main,
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
}); 