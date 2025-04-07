import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  // Get current theme
  const { colors } = useTheme();
  
  // Create dynamic styles based on current theme
  const styles = createStyles(colors);

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
          color={variant === 'primary' ? colors.primary.contrastText : colors.primary.main}
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

// Create dynamic styles based on theme
const createStyles = (colors: any) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12, // theme.borderRadius.md
    paddingHorizontal: 16, // theme.spacing.md
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: colors.secondary.main,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8, // theme.spacing.sm
  },
  smallButton: {
    height: 32,
    paddingHorizontal: 8, // theme.spacing.sm
  },
  mediumButton: {
    height: 40,
    paddingHorizontal: 16, // theme.spacing.md
  },
  largeButton: {
    height: 48,
    paddingHorizontal: 24, // theme.spacing.lg
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
    borderColor: colors.text.disabled,
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium', // theme.typography.fontFamily.medium
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.contrastText,
  },
  secondaryText: {
    color: colors.secondary.contrastText,
  },
  outlineText: {
    color: colors.primary.main,
  },
  textButtonText: {
    color: colors.primary.main,
  },
  smallText: {
    fontSize: 14, // theme.typography.fontSize.sm
  },
  mediumText: {
    fontSize: 16, // theme.typography.fontSize.md
  },
  largeText: {
    fontSize: 18, // theme.typography.fontSize.lg
  },
  disabledText: {
    color: colors.text.disabled,
  },
}); 