import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

export interface TimePickerProps {
  /**
   * Current selected time
   */
  value: Date;
  
  /**
   * Callback function when time changes
   */
  onChange: (date: Date) => void;
  
  /**
   * Label to display above the time picker
   */
  label?: string;
  
  /**
   * Display format for the time (12 hour or 24 hour)
   * @default '12h'
   */
  format?: '12h' | '24h';
  
  /**
   * Time interval in minutes
   * @default 1
   */
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  
  /**
   * Custom placeholder text
   */
  placeholder?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * If true, the picker is disabled
   */
  disabled?: boolean;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Additional style for the container
   */
  style?: object;
}

/**
 * Custom time picker component that provides a consistent UI across platforms
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  format = '12h',
  minuteInterval = 1,
  placeholder = 'Select time',
  error,
  disabled = false,
  testID,
  style,
}) => {
  const [time, setTime] = useState<Date>(value || new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if screen reader is enabled for accessibility
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );
    
    // Update the internal time when the value prop changes
    if (value) {
      setTime(value);
    }
  }, [value]);
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      setTime(selectedTime);
      onChange(selectedTime);
    }
  };
  
  const showTimepicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };
  
  const hideTimePicker = () => {
    setShowPicker(false);
  };
  
  const formatTime = (time: Date): string => {
    if (!time) return placeholder;
    
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    if (format === '24h') {
      // 24-hour format: HH:MM
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // 12-hour format: hh:MM AM/PM
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  };
  
  const renderIOSPicker = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPicker}
        onRequestClose={hideTimePicker}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={hideTimePicker}
                accessibilityRole="button"
                accessibilityLabel="Cancel time selection"
                accessibilityHint="Closes the time picker without saving changes"
              >
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity 
                onPress={() => {
                  onChange(time);
                  hideTimePicker();
                }}
                accessibilityRole="button"
                accessibilityLabel="Confirm time selection"
                accessibilityHint="Saves the selected time and closes the picker"
              >
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              testID={testID}
              value={time}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              style={styles.iosPicker}
              textColor={theme.colors.text.primary}
              minuteInterval={minuteInterval}
              accentColor={theme.colors.primary.main}
              is24Hour={format === '24h'}
              accessibilityLabel="Time picker"
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={showTimepicker}
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Select time, current time: ${formatTime(time)}`}
        accessibilityHint="Opens a time picker to select a new time"
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={disabled ? theme.colors.text.disabled : theme.colors.primary.main}
          style={styles.icon}
        />
        <Text
          style={[
            styles.timeText,
            disabled ? styles.textDisabled : null,
            !value ? styles.placeholder : null,
          ]}
        >
          {formatTime(time)}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
        />
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
      
      {/* Render different pickers based on platform */}
      {Platform.OS === 'ios' ? (
        renderIOSPicker()
      ) : (
        showPicker && (
          <DateTimePicker
            testID={testID}
            value={time}
            mode="time"
            is24Hour={format === '24h'}
            display="default"
            onChange={handleTimeChange}
            minuteInterval={minuteInterval}
            accessibilityLabel="Time picker"
          />
        )
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    height: 56,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background.paper,
    opacity: 0.7,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  timeText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  placeholder: {
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs,
  },
  // Modal styles for iOS
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background.default,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  modalCancelButton: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  modalDoneButton: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary.main,
  },
  iosPicker: {
    height: 200,
    width: width,
  },
});

export default TimePicker; 