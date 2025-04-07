import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

interface HeaderProps {
  title: string;
  leftIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  rightIcon?: {
    name: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  iconColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  containerStyle,
  titleStyle,
  iconColor = theme.colors.primary.main,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftContainer}>
        {leftIcon && (
          <TouchableOpacity
            onPress={leftIcon.onPress}
            style={styles.iconButton}
          >
            <Ionicons
              name={leftIcon.name}
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity
            onPress={rightIcon.onPress}
            style={styles.iconButton}
          >
            <Ionicons
              name={rightIcon.name}
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 