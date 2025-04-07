import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  // Get current theme colors from context
  const { colors, isDarkMode } = useTheme();
  
  // Create dynamic styles based on current theme
  const dynamicStyles = createStyles(colors, isDarkMode);

  const getCardStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [dynamicStyles.card];

    switch (variant) {
      case 'elevated':
        baseStyles.push(dynamicStyles.elevated as ViewStyle);
        break;
      case 'outlined':
        baseStyles.push(dynamicStyles.outlined as ViewStyle);
        break;
      case 'flat':
        baseStyles.push(dynamicStyles.flat as ViewStyle);
        break;
      case 'layered':
        baseStyles.push(dynamicStyles.layered as ViewStyle);
        break;
      case 'floating':
        baseStyles.push(dynamicStyles.floating as ViewStyle);
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

// Create dynamic styles based on theme
const createStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: 12, // theme.borderRadius.md
    padding: 16, // theme.spacing.md
    margin: 4, // theme.spacing.xs
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.6)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.25 : 0.18,
        shadowRadius: 3.0,
      },
      android: {
        elevation: 4,
      },
    }),
    // Add some subtle border for better definition
    borderWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.divider,
  },
  flat: {
    backgroundColor: colors.background.paper,
  },
  layered: {
    ...Platform.select({
      ios: {
        shadowColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.8)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.25 : 0.15,
        shadowRadius: 3.5,
        // Use backgroundColor with slight transparency for softer edges
        backgroundColor: isDarkMode ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
      },
      android: {
        elevation: 6,
        // For Android, use a subtle border to enhance the elevation effect
        borderWidth: 0.5,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      },
    }),
  },
  floating: {
    ...Platform.select({
      ios: {
        shadowColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.35 : 0.22,
        shadowRadius: 7.0,
        backgroundColor: isDarkMode ? 'rgba(30,30,30,0.99)' : 'rgba(255,255,255,0.99)',
      },
      android: {
        elevation: 10,
        borderWidth: 0.5,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
      },
    }),
    transform: [{ translateY: -1 }], // Slight lift effect
    margin: 8, // theme.spacing.sm - Add more space for the shadow to be visible
  },
}); 