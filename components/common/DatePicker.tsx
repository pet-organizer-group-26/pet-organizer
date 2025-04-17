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
import { useTheme } from '../../context/ThemeContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

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
  
  // Get current theme
  const { colors, isDarkMode } = useTheme();
  
  // Create dynamic styles based on current theme
  const styles = createStyles(colors, isDarkMode);
  
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
              textColor={colors.text.primary}
              accentColor={colors.primary.main}
              accessibilityLabel="Date picker"
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  const [isDatePickerVisible, setDatePickerVisible] = React.useState(false);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const closeModalDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    closeModalDatePicker();
    onChange(selectedDate);
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
          color={disabled ? colors.text.disabled : colors.primary.main}
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
          color={disabled ? colors.text.disabled : colors.text.secondary}
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
      ) : showPicker && (
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
      )}
    </View>
  );
};

// Create dynamic styles based on theme
const createStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    marginBottom: 16, // theme.spacing.md
  },
  label: {
    fontSize: 14, // theme.typography.fontSize.sm
    color: colors.text.primary,
    marginBottom: 4, // theme.spacing.xs
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8, // theme.borderRadius.sm
    backgroundColor: colors.background.default,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  inputDisabled: {
    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(0, 0, 0, 0.05)',
    borderColor: colors.divider,
  },
  icon: {
    marginRight: 8, // theme.spacing.sm
  },
  dateText: {
    flex: 1,
    fontSize: 16, // theme.typography.fontSize.md
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  textDisabled: {
    color: colors.text.disabled,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 12, // theme.typography.fontSize.xs
    color: colors.error.main,
    marginTop: 4, // theme.spacing.xs
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: 16, // theme.borderRadius.lg
    borderTopRightRadius: 16, // theme.borderRadius.lg
    paddingBottom: 24, // theme.spacing.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // theme.spacing.sm
    paddingHorizontal: 16, // theme.spacing.md
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 18, // theme.typography.fontSize.lg
    fontWeight: '500',
    color: colors.text.primary,
  },
  modalCancelButton: {
    fontSize: 16, // theme.typography.fontSize.md
    color: colors.text.secondary,
    padding: 8, // theme.spacing.sm
  },
  modalDoneButton: {
    fontSize: 16, // theme.typography.fontSize.md
    color: colors.primary.main,
    fontWeight: '500',
    padding: 8, // theme.spacing.sm
  },
  iosPicker: {
    backgroundColor: colors.background.paper,
    height: 200,
    width: '100%',
  },
});

export default DatePicker; 