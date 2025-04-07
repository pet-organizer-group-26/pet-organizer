import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Design tokens
const MODAL_TOKENS = {
  colors: {
    light: {
      background: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
      text: {
        primary: '#2d3436',
        secondary: '#636e72',
        inverse: '#ffffff',
      },
      border: '#e0e0e0',
      primary: '#00796b',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#FF5252',
      surface: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        elevated: '#ffffff',
      },
    },
    dark: {
      background: '#1a1a1a',
      overlay: 'rgba(0, 0, 0, 0.7)',
      text: {
        primary: '#ffffff',
        secondary: '#a0a0a0',
        inverse: '#2d3436',
      },
      border: '#333333',
      primary: '#26a69a',
      success: '#66BB6A',
      warning: '#FFD54F',
      error: '#FF5252',
      surface: {
        primary: '#2d2d2d',
        secondary: '#333333',
        elevated: '#404040',
      },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 9999,
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: Platform.select({
      ios: 'ease-in-out',
      android: 'ease-in-out',
    }),
  },
  elevation: {
    low: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    high: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

type ModalType = 'alert' | 'form' | 'confirmation' | 'success' | 'error';
type ModalSize = 'small' | 'medium' | 'large' | 'full';

interface ModalSystemProps {
  visible: boolean;
  onClose: () => void;
  type?: ModalType;
  size?: ModalSize;
  title: string;
  message?: string;
  children?: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  closeOnOverlayPress?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
}

const ModalSystem: React.FC<ModalSystemProps> = ({
  visible,
  onClose,
  type = 'alert',
  size = 'medium',
  title,
  message,
  children,
  actions = [],
  closeOnOverlayPress = true,
  animationType = 'fade',
}) => {
  const colorScheme = useColorScheme();
  const colors = MODAL_TOKENS.colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: MODAL_TOKENS.animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Announce modal for screen readers
      AccessibilityInfo.announceForAccessibility(`${title} modal opened`);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: MODAL_TOKENS.animation.duration.fast,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, title]);

  const getModalWidth = () => {
    const { width } = Dimensions.get('window');
    switch (size) {
      case 'small':
        return Math.min(width * 0.8, 400);
      case 'medium':
        return Math.min(width * 0.9, 600);
      case 'large':
        return Math.min(width * 0.95, 800);
      case 'full':
        return width;
      default:
        return Math.min(width * 0.9, 600);
    }
  };

  const getIconByType = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle-outline', color: colors.success };
      case 'error':
        return { name: 'alert-circle-outline', color: colors.error };
      case 'confirmation':
        return { name: 'help-circle-outline', color: colors.warning };
      default:
        return { name: 'information-circle-outline', color: colors.primary };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={closeOnOverlayPress ? onClose : undefined}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor: colors.surface.primary,
              width: getModalWidth(),
            },
          ]}
        >
          <View style={styles.header}>
            {type !== 'form' && (
              <View style={[styles.iconContainer, { backgroundColor: `${getIconByType().color}10` }]}>
                <Ionicons
                  name={getIconByType().name as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={getIconByType().color}
                />
              </View>
            )}
            <Text
              style={[styles.title, { color: colors.text.primary }]}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {closeOnOverlayPress && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <Ionicons name="close-outline" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            {message && (
              <Text style={[styles.message, { color: colors.text.secondary }]}>
                {message}
              </Text>
            )}
            {children}
          </View>

          {actions.length > 0 && (
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        action.variant === 'primary'
                          ? colors.primary
                          : action.variant === 'danger'
                          ? colors.error
                          : colors.surface.secondary,
                      width: '100%',
                    },
                  ]}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color:
                          action.variant === 'primary' || action.variant === 'danger'
                            ? colors.text.inverse
                            : colors.text.primary,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODAL_TOKENS.spacing.md,
  },
  modalContainer: {
    borderRadius: MODAL_TOKENS.borderRadius.md,
    maxHeight: '90%',
    ...MODAL_TOKENS.elevation.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: MODAL_TOKENS.spacing.lg,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: MODAL_TOKENS.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MODAL_TOKENS.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: MODAL_TOKENS.spacing.xs,
    marginLeft: MODAL_TOKENS.spacing.sm,
  },
  content: {
    padding: MODAL_TOKENS.spacing.lg,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: MODAL_TOKENS.spacing.md,
  },
  actions: {
    flexDirection: 'column',
    padding: MODAL_TOKENS.spacing.md,
    borderTopWidth: 1,
    gap: MODAL_TOKENS.spacing.sm,
  },
  actionButton: {
    paddingVertical: MODAL_TOKENS.spacing.md,
    paddingHorizontal: MODAL_TOKENS.spacing.lg,
    borderRadius: MODAL_TOKENS.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ModalSystem;
export { MODAL_TOKENS };
export type { ModalType, ModalSize, ModalSystemProps }; 