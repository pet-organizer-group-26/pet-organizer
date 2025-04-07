import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

export interface DatePickerProps {
  /**
   * Current selected date
   */
  value: Date;
  
  /**
   * Callback function when date changes
   */
  onChange: (date: Date) => void;
  
  /**
   * Label to display above the date picker
   */
  label?: string;
  
  /**
   * Display format for the date
   * @default 'ddd, MMM D, YYYY'
   */
  displayFormat?: 'short' | 'medium' | 'long';
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
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
 * Custom date picker component that provides a consistent UI across platforms
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  displayFormat = 'medium',
  minDate,
  maxDate,
  placeholder = 'Select date',
  error,
  disabled = false,
  testID,
  style,
}) => {
  const [date, setDate] = useState<Date>(value || new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if screen reader is enabled for accessibility
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsScreenReaderEnabled(screenReaderEnabled);
      }
    );
    
    // Update the internal date when the value prop changes
    if (value) {
      setDate(value);
    }
  }, [value]);
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      onChange(selectedDate);
    }
  };
  
  const showDatepicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };
  
  const hideDatePicker = () => {
    setShowPicker(false);
  };
  
  const formatDate = (date: Date): string => {
    if (!date) return placeholder;
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: displayFormat === 'short' ? undefined : 'short',
      month: displayFormat === 'long' ? 'long' : 'short',
      day: 'numeric',
      year: 'numeric'
    };
    
    if (displayFormat === 'short') {
      // MM/DD/YYYY format
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
    
    return date.toLocaleDateString('en-US', options);
  };
  
  const renderIOSPicker = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPicker}
        onRequestClose={hideDatePicker}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={hideDatePicker}
                accessibilityRole="button"
                accessibilityLabel="Cancel date selection"
                accessibilityHint="Closes the date picker without saving changes"
              >
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                onPress={() => {
                  onChange(date);
                  hideDatePicker();
                }}
                accessibilityRole="button"
                accessibilityLabel="Confirm date selection"
                accessibilityHint="Saves the selected date and closes the picker"
              >
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              testID={testID}
              value={date}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minDate}
              maximumDate={maxDate}
              style={styles.iosPicker}
              textColor={theme.colors.text.primary}
              accentColor={theme.colors.primary.main}
              accessibilityLabel="Date picker"
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
        onPress={showDatepicker}
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Select date, current date: ${formatDate(date)}`}
        accessibilityHint="Opens a date picker to select a new date"
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={disabled ? theme.colors.text.disabled : theme.colors.primary.main}
          style={styles.icon}
        />
        <Text
          style={[
            styles.dateText,
            disabled ? styles.textDisabled : null,
            !value ? styles.placeholder : null,
          ]}
        >
          {formatDate(date)}
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
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
            accessibilityLabel="Date picker"
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
  dateText: {
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

export default DatePicker; 