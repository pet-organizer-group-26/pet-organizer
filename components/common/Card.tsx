import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import theme from '../../constants/theme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat' | 'layered' | 'floating';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  onPress,
  ...props
}) => {
  const getCardStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.card];

    switch (variant) {
      case 'elevated':
        baseStyles.push(styles.elevated as ViewStyle);
        break;
      case 'outlined':
        baseStyles.push(styles.outlined as ViewStyle);
        break;
      case 'flat':
        baseStyles.push(styles.flat as ViewStyle);
        break;
      case 'layered':
        baseStyles.push(styles.layered as ViewStyle);
        break;
      case 'floating':
        baseStyles.push(styles.floating as ViewStyle);
        break;
    }

    return baseStyles;
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[...getCardStyles(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : undefined}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
  },
  elevated: {
    ...theme.shadows.md,
    // Add some subtle border for better definition
    borderWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  flat: {
    backgroundColor: theme.colors.background.paper,
  },
  layered: {
    ...theme.shadows.layered,
    // For iOS, create layered shadow effect with dual shadows
    ...(Platform.OS === 'ios' ? {
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.5,
      // Use backgroundColor with slight transparency for softer edges
      backgroundColor: 'rgba(255,255,255,0.98)',
    } : {
      // For Android, use a subtle border to enhance the elevation effect
      borderWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.03)',
    }),
  },
  floating: {
    ...theme.shadows.floating,
    transform: [{ translateY: -1 }], // Slight lift effect
    margin: theme.spacing.sm, // Add more space for the shadow to be visible
    // For iOS, create a more pronounced floating effect
    ...(Platform.OS === 'ios' ? {
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 7.0,
      backgroundColor: 'rgba(255,255,255,0.99)',
    } : {
      // For Android, use a subtle border to enhance the elevation effect
      elevation: 10,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.5)',
    }),
  },
}); 