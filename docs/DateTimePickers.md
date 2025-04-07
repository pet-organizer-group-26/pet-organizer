# Date and Time Picker Components Documentation

This document outlines the design, features, and usage of the custom date and time picker components in the Pet Organizer app. These components provide a consistent user experience across both iOS and Android platforms, with proper accessibility support and integration with our theme system.

## Components Overview

We provide three main components for handling date and time selection:

1. **DatePicker** - For selecting dates only
2. **TimePicker** - For selecting times only
3. **DateTimePicker** - A combined component for selecting both date and time

All components follow the same visual design language and match our application's theme system. They provide consistent styling, behavior, and accessibility across platforms.

## Design Specifications

### Visual Design

- **Colors**: Uses the application theme colors for consistency
- **Typography**: Uses the application theme typography
- **Layout**: Consistent input field height (56px) with proper spacing
- **Icons**: Uses Ionicons for calendar, time, and dropdown indicators
- **States**: Includes normal, error, disabled, and focus states
- **Modals**: On iOS, displays a bottom sheet with proper header and controls

### Interaction Model

- **Touch Target**: Large, easily tappable areas (minimum 44×44 px)
- **Feedback**: Visual feedback on touch
- **Platform Specific**: 
  - iOS: Custom bottom sheet modal with spinner picker
  - Android: Uses the native date/time picker dialog

### Accessibility

All components are fully accessible and compliant with WCAG AA standards:

- **Screen Reader Support**: All elements have proper accessibility labels and hints
- **Keyboard Navigation**: Supports keyboard navigation on web
- **Role Assignment**: Proper accessibility roles for interactive elements
- **State Communication**: Communicates selected values and errors to screen readers
- **High Contrast**: Proper contrast ratios for text and interactive elements

## Component Props

### DatePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | Date | required | Selected date |
| onChange | (date: Date) => void | required | Function called when date changes |
| label | string | undefined | Label text shown above picker |
| displayFormat | 'short' \| 'medium' \| 'long' | 'medium' | Date format style |
| minDate | Date | undefined | Minimum selectable date |
| maxDate | Date | undefined | Maximum selectable date |
| placeholder | string | 'Select date' | Placeholder text when no date is selected |
| error | string | undefined | Error message to display |
| disabled | boolean | false | Disables the picker |
| testID | string | undefined | Test ID for testing |
| style | object | undefined | Additional styling for the container |

### TimePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | Date | required | Selected time |
| onChange | (date: Date) => void | required | Function called when time changes |
| label | string | undefined | Label text shown above picker |
| format | '12h' \| '24h' | '12h' | Time format (12 or 24 hour) |
| minuteInterval | 1 \| 5 \| 10 \| 15 \| 30 | 1 | Time interval in minutes |
| placeholder | string | 'Select time' | Placeholder text when no time is selected |
| error | string | undefined | Error message to display |
| disabled | boolean | false | Disables the picker |
| testID | string | undefined | Test ID for testing |
| style | object | undefined | Additional styling for the container |

### DateTimePicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | Date | required | Selected date and time |
| onChange | (date: Date) => void | required | Function called when date/time changes |
| dateLabel | string | 'Date' | Label for date picker |
| timeLabel | string | 'Time' | Label for time picker |
| dateFormat | 'short' \| 'medium' \| 'long' | 'medium' | Date format style |
| timeFormat | '12h' \| '24h' | '12h' | Time format (12 or 24 hour) |
| minuteInterval | 1 \| 5 \| 10 \| 15 \| 30 | 1 | Time interval in minutes |
| minDate | Date | undefined | Minimum selectable date |
| maxDate | Date | undefined | Maximum selectable date |
| error | string | undefined | Error message to display |
| disabled | boolean | false | Disables both pickers |
| testID | string | undefined | Test ID for testing |
| style | object | undefined | Additional styling for the container |
| direction | 'row' \| 'column' | 'row' | Layout direction |

## Usage Examples

### DatePicker Example

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from '../components/common/DatePicker';

const MyComponent = () => {
  const [date, setDate] = useState(new Date());
  
  return (
    <View>
      <DatePicker
        label="Appointment Date"
        value={date}
        onChange={setDate}
        displayFormat="medium"
        minDate={new Date()} // Today's date as minimum
      />
    </View>
  );
};
```

### TimePicker Example

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import TimePicker from '../components/common/TimePicker';

const MyComponent = () => {
  const [time, setTime] = useState(new Date());
  
  return (
    <View>
      <TimePicker
        label="Appointment Time"
        value={time}
        onChange={setTime}
        format="12h"
        minuteInterval={15}
      />
    </View>
  );
};
```

### DateTimePicker Example

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import DateTimePicker from '../components/common/DateTimePicker';

const MyComponent = () => {
  const [dateTime, setDateTime] = useState(new Date());
  
  return (
    <View>
      <DateTimePicker
        value={dateTime}
        onChange={setDateTime}
        dateLabel="Event Date"
        timeLabel="Event Time"
        direction="column"
      />
    </View>
  );
};
```

## Implementation Details

### Platform Specific Considerations

- On iOS, we use a custom bottom sheet modal with the native DateTimePicker in spinner mode
- On Android, we trigger the native date/time picker dialogs
- Both implementations maintain consistent visual styling for the input field

### Accessibility Implementation

- All components use proper accessibility roles, states, and properties
- Screen reader support includes context about the currently selected value
- Touch targets are sized appropriately (minimum 44×44px)
- Error states are communicated to screen readers

### Performance Considerations

- Components avoid unnecessary re-renders
- Modal/dialog is only rendered when needed
- Proper memoization is used where appropriate

## Application Integration

These date and time picker components are used in the following screens:

1. **Add Event Screen** - For selecting event date and time
2. **Expenses Screen** - For selecting expense date
3. **Pet Reminders** - For scheduling reminders
4. **Vet Appointments** - For scheduling vet visits

## Future Enhancements

Potential future improvements to consider:

1. **Date Range Selection** - For booking/scheduling spans of time
2. **Calendar View** - Alternative visual selector for dates
3. **Custom Time Scroller** - More visually rich time selection
4. **Theming Extensions** - Support for dark mode and additional themes
5. **Localization** - Support for different date/time formats by locale 