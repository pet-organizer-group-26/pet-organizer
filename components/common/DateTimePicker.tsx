import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import theme from '../../constants/theme';

export interface DateTimePickerProps {
  /**
   * Current selected date and time
   */
  value: Date;
  
  /**
   * Callback function when date and time changes
   */
  onChange: (date: Date) => void;
  
  /**
   * Label to display above the date picker
   */
  dateLabel?: string;
  
  /**
   * Label to display above the time picker
   */
  timeLabel?: string;
  
  /**
   * Display format for the date
   */
  dateFormat?: 'short' | 'medium' | 'long';
  
  /**
   * Display format for the time (12 hour or 24 hour)
   */
  timeFormat?: '12h' | '24h';
  
  /**
   * Time interval in minutes
   */
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
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
  
  /**
   * Direction of the layout (row or column)
   * @default 'row'
   */
  direction?: 'row' | 'column';
}

/**
 * Combined date and time picker component that provides a consistent UI across platforms
 */
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  dateLabel = 'Date',
  timeLabel = 'Time',
  dateFormat = 'medium',
  timeFormat = '12h',
  minuteInterval = 1,
  minDate,
  maxDate,
  error,
  disabled = false,
  testID,
  style,
  direction = 'row',
}) => {
  // Separate handlers for date and time changes
  const handleDateChange = (newDate: Date) => {
    const updatedDate = new Date(value);
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());
    onChange(updatedDate);
  };
  
  const handleTimeChange = (newTime: Date) => {
    const updatedDate = new Date(value);
    updatedDate.setHours(newTime.getHours());
    updatedDate.setMinutes(newTime.getMinutes());
    updatedDate.setSeconds(newTime.getSeconds());
    onChange(updatedDate);
  };

  return (
    <View 
      style={[
        styles.container,
        direction === 'row' ? styles.rowContainer : styles.columnContainer,
        style
      ]}
      testID={testID}
    >
      <DatePicker
        value={value}
        onChange={handleDateChange}
        label={dateLabel}
        displayFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        error={error}
        disabled={disabled}
        testID={`${testID}-date`}
        style={direction === 'row' ? styles.rowItem : styles.columnItem}
      />
      
      <TimePicker
        value={value}
        onChange={handleTimeChange}
        label={timeLabel}
        format={timeFormat}
        minuteInterval={minuteInterval}
        error={error}
        disabled={disabled}
        testID={`${testID}-time`}
        style={direction === 'row' ? styles.rowItem : styles.columnItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  columnContainer: {
    flexDirection: 'column',
  },
  rowItem: {
    flex: 1,
  },
  columnItem: {
    width: '100%',
  },
});

export default DateTimePicker; 