import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { firestore } from '../constants/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Category color options
const categoryOptions = [
  { name: 'Vet', color: '#FF8FAB' },
  { name: 'Grooming', color: '#C3A6FF' },
  { name: 'Daily', color: '#FFCF81' },
  { name: 'Training', color: '#e1e650' },
  { name: 'Play', color: '#89CFF0' },
];

// Updated repeat options now include "Forever"
const repeatOptions = ['Never', 'Daily', 'Weekly', 'Forever'];

// Notification options now include an option for sending notification at the event time
const notificationOptionsList = [
  'None',
  'At Event Time',
  '1 Hour Before',
  '2 Hours Before',
  '1 Day Before',
];

export default function AddEvent() {
  const { date: queryDate } = useLocalSearchParams();
  const router = useRouter();
  const initialDate = queryDate ? new Date(queryDate + 'T00:00') : new Date();

  // Basic fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(new Date());
  const [category, setCategory] = useState(categoryOptions[0].name);

  // Repeat-related
  const [repeat, setRepeat] = useState('Never'); // "Never" | "Daily" | "Weekly" | "Forever"
  const [repeatCount, setRepeatCount] = useState('1'); // Only used if repeat !== "Never"/"Forever"

  // Notification option
  const [notificationOption, setNotificationOption] = useState('None');

  // Controls for DateTimePicker modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Request notification permissions once on mount
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Reset form whenever this screen refocuses
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [queryDate])
  );

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDate(queryDate ? new Date(queryDate + 'T00:00') : new Date());
    setTime(new Date());
    setCategory(categoryOptions[0].name);
    setRepeat('Never');
    setRepeatCount('1');
    setNotificationOption('None');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  // Generate one or multiple event objects based on repeat settings
  const generateRepeats = (baseDate: Date, baseTime: Date) => {
    const hh = baseTime.getHours().toString().padStart(2, '0');
    const mm = baseTime.getMinutes().toString().padStart(2, '0');

    if (repeat === 'Forever') {
      return [
        {
          title,
          date: baseDate.toISOString().split('T')[0],
          time: `${hh}:${mm}`,
          category,
          location,
          repeat: 'Forever',
        },
      ];
    }

    const occurrences = repeat === 'Never' ? 1 : parseInt(repeatCount, 10) || 1;
    const eventsData = [];

    for (let i = 0; i < occurrences; i++) {
      const newDate = new Date(baseDate);
      if (repeat === 'Daily') {
        newDate.setDate(baseDate.getDate() + i);
      } else if (repeat === 'Weekly') {
        newDate.setDate(baseDate.getDate() + i * 7);
      }
      const dateStr = newDate.toISOString().split('T')[0];
      const timeStr = `${hh}:${mm}`;
      eventsData.push({
        title,
        date: dateStr,
        time: timeStr,
        category,
        location,
      });
    }
    return eventsData;
  };

  const handleSave = async () => {
    if (!title || !location) return;

    try {
      const newEvents = generateRepeats(date, time);
      const savePromises = newEvents.map((evt) =>
        addDoc(collection(firestore, 'events'), evt)
      );
      await Promise.all(savePromises);

      // Schedule notifications if an option is chosen
      if (notificationOption !== 'None') {
        newEvents.forEach((evt) => {
          // Parse evt.date and evt.time as local values:
          const [year, month, day] = evt.date.split('-').map(Number);
          const [hour, minute] = evt.time.split(':').map(Number);
          const eventDateTime = new Date(year, month - 1, day, hour, minute, 0);

          let offsetMinutes = 0;
          if (notificationOption === 'At Event Time') {
            offsetMinutes = 0;
          } else if (notificationOption === '1 Hour Before') {
            offsetMinutes = 60;
          } else if (notificationOption === '2 Hours Before') {
            offsetMinutes = 120;
          } else if (notificationOption === '1 Day Before') {
            offsetMinutes = 1440;
          }
          const triggerDate = new Date(
            eventDateTime.getTime() - offsetMinutes * 60 * 1000
          );

          if (triggerDate > new Date()) {
            const secondsUntilTrigger = Math.floor(
              (triggerDate.getTime() - Date.now()) / 1000
            );
            // Only schedule if there are at least 30 seconds until trigger
            if (secondsUntilTrigger > 30) {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Upcoming Event Reminder',
                  body: `Your event "${evt.title}" is coming up.`,
                },
                trigger: ({
                  seconds: secondsUntilTrigger,
                  repeats: false,
                } as unknown) as Notifications.NotificationTriggerInput,
              });
            }
          }
        });
      }

      resetForm();
      router.push('/calendar');
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push('/calendar');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            🐾 Bark It on the Calendar
          </Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#888"
            value={location}
            onChangeText={setLocation}
          />

          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => {
              setShowDatePicker(true);
              setShowTimePicker(false);
            }}
          >
            <Text style={styles.inputButtonText}>
              {date.toDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
                if (Platform.OS !== 'ios') setShowDatePicker(false);
              }}
              style={styles.dateTimePicker}
            />
          )}

          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => {
              setShowTimePicker(true);
              setShowDatePicker(false);
            }}
          >
            <Text style={styles.inputButtonText}>
              {time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour={false}
              onChange={(event, selectedTime) => {
                if (selectedTime) setTime(selectedTime);
                if (Platform.OS !== 'ios') setShowTimePicker(false);
              }}
              style={styles.dateTimePicker}
            />
          )}

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.categoryButton,
                  category === option.name && {
                    backgroundColor: option.color,
                  },
                ]}
                onPress={() => setCategory(option.name)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === option.name && { color: '#fff' },
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Repeat</Text>
          <View style={styles.repeatRow}>
            {repeatOptions.map((rOpt) => (
              <TouchableOpacity
                key={rOpt}
                style={[
                  styles.repeatButton,
                  repeat === rOpt && { backgroundColor: '#00796b' },
                ]}
                onPress={() => setRepeat(rOpt)}
              >
                <Text
                  style={[
                    styles.repeatButtonText,
                    repeat === rOpt && { color: '#fff' },
                  ]}
                >
                  {rOpt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {repeat !== 'Never' && repeat !== 'Forever' && (
            <View>
              <Text style={[styles.label, { marginTop: 8 }]}>
                Occurrences
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Number of times (e.g. 5)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={repeatCount}
                onChangeText={setRepeatCount}
              />
            </View>
          )}

          <Text style={styles.label}>Notification</Text>
          <View style={styles.notificationRow}>
            {notificationOptionsList.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.notificationButton,
                  notificationOption === option && {
                    backgroundColor: '#00796b',
                  },
                ]}
                onPress={() => setNotificationOption(option)}
              >
                <Text
                  style={[
                    styles.notificationButtonText,
                    notificationOption === option && { color: '#fff' },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f4f4f4' },
  header: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#00796b',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  inputButton: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  inputButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dateTimePicker: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  repeatButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  repeatButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  notificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  notificationButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  notificationButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#bbb',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});