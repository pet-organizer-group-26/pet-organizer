import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import DatePicker from '../components/common/DatePicker';
import TimePicker from '../components/common/TimePicker';
import theme from '../constants/theme';

// Category color options
const categoryOptions = [
  { name: 'Vet', color: theme.colors.error.light, icon: 'medkit-outline' as const },
  { name: 'Grooming', color: theme.colors.secondary.light, icon: 'cut-outline' as const },
  { name: 'Daily', color: theme.colors.warning.light, icon: 'calendar-outline' as const },
  { name: 'Training', color: theme.colors.success.light, icon: 'school-outline' as const },
  { name: 'Play', color: theme.colors.primary.light, icon: 'happy-outline' as const },
];

// Updated repeat options now include "Forever"
const repeatOptions = ['Never', 'Daily', 'Weekly', 'Forever'];

// Updated notification options for local notifications
const notificationOptionsList = [
  'None',
  'At Event Time',
  '15 Minutes Before',
  '30 Minutes Before',
  '1 Hour Before',
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
  
  // Form validation
  const [titleError, setTitleError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [repeatCountError, setRepeatCountError] = useState('');

  // Add loading state
  const [isSaving, setIsSaving] = useState(false);

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
    setTitleError('');
    setLocationError('');
    setRepeatCountError('');
  };

  // Generate one or multiple event objects based on repeat settings
  const generateRepeats = (baseDate: Date, baseTime: Date) => {
    const hh = baseTime.getHours().toString().padStart(2, '0');
    const mm = baseTime.getMinutes().toString().padStart(2, '0');

    if (repeat === 'Forever') {
      return [
        {
          title,
          event_date: baseDate.toISOString().split('T')[0],
          event_time: `${hh}:${mm}`,
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
        event_date: dateStr,
        event_time: timeStr,
        category,
        location,
      });
    }
    return eventsData;
  };

  // Set up notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const scheduleLocalNotification = async (evt: any, offsetMinutes: number) => {
    try {
      // Parse event date and time
      const [year, month, day] = evt.event_date.split('-').map(Number);
      const [hour, minute] = evt.event_time.split(':').map(Number);
      const eventDateTime = new Date(year, month - 1, day, hour, minute, 0);

      // Calculate trigger time
      const triggerTime = new Date(eventDateTime.getTime() - offsetMinutes * 60 * 1000);
      const secondsUntilTrigger = Math.floor((triggerTime.getTime() - Date.now()) / 1000);

      // Only schedule if the trigger time is in the future
      if (secondsUntilTrigger > 0) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: evt.category === 'Vet' ? '🏥 Vet Appointment' : 
                   evt.category === 'Grooming' ? '✨ Grooming Time' :
                   evt.category === 'Daily' ? '📅 Daily Task' :
                   evt.category === 'Training' ? '🎯 Training Session' :
                   evt.category === 'Play' ? '🎾 Play Time' : '🐾 Pet Event',
            body: `${evt.title}${evt.location ? ` at ${evt.location}` : ''}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            seconds: secondsUntilTrigger,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
        });
        console.log(`Scheduled notification ${identifier} for ${triggerTime}`);
        return identifier;
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
    return null;
  };

  const handleSave = async () => {
    // Reset errors
    setTitleError('');
    setLocationError('');
    setRepeatCountError('');
    
    // Validate form
    let hasError = false;
    
    if (!title.trim()) {
      setTitleError('Event title is required');
      hasError = true;
    }
    
    if (!location.trim()) {
      setLocationError('Location is required');
      hasError = true;
    }
    
    if ((repeat === 'Daily' || repeat === 'Weekly') && 
        (!repeatCount.trim() || isNaN(parseInt(repeatCount)) || parseInt(repeatCount) < 1)) {
      setRepeatCountError('Please enter a valid number of occurrences');
      hasError = true;
    }
    
    if (hasError) return;

    setIsSaving(true);

    try {
      const newEvents = generateRepeats(date, time);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        setIsSaving(false);
        return;
      }

      console.log('Creating events with data:', newEvents);
      
      // Save events to Supabase
      const savePromises = newEvents.map((evt) =>
        supabase
          .from('events')
          .insert([{ ...evt, user_id: user.id }])
          .select()
      );

      const savedEvents = await Promise.all(savePromises);
      console.log('Events saved successfully:', savedEvents);

      // Schedule notifications if an option is chosen
      if (notificationOption !== 'None') {
        let offsetMinutes = 0;
        switch (notificationOption) {
          case 'At Event Time':
            offsetMinutes = 0;
            break;
          case '15 Minutes Before':
            offsetMinutes = 15;
            break;
          case '30 Minutes Before':
            offsetMinutes = 30;
            break;
          case '1 Hour Before':
            offsetMinutes = 60;
            break;
        }

        // Schedule notifications for each event
        const notificationPromises = newEvents.map(evt => 
          scheduleLocalNotification(evt, offsetMinutes)
        );
        await Promise.all(notificationPromises);
      }

      // Reset form but don't navigate away in Expo
      setIsSaving(false);
      resetForm();
      
      // Show success message with only one option
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          { 
            text: 'Go to Calendar', 
            onPress: () => router.push('/calendar')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save the event. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    router.push('/calendar');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Add Event
          </Text>
          <Button
            title="Save"
            onPress={handleSave}
            variant="primary"
            size="small"
          />
        </View>

        <Card variant="layered" style={styles.card}>
          <InputField
            label="Event Title"
            placeholder="What's the event?"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (text.trim()) setTitleError('');
            }}
            error={titleError}
            leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />}
          />
          
          <InputField
            label="Location"
            placeholder="Where is it happening?"
            value={location}
            onChangeText={(text) => {
              setLocation(text);
              if (text.trim()) setLocationError('');
            }}
            error={locationError}
            leftIcon={<Ionicons name="location-outline" size={20} color={theme.colors.primary.main} />}
          />

          <View style={styles.dateTimeContainer}>
            <DatePicker
              label="Event Date"
              value={date}
              onChange={setDate}
              displayFormat="medium"
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} // Allow events up to 1 year in the past
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))} // Allow events up to 5 years in the future
            />
            
            <TimePicker
              label="Event Time"
              value={time}
              onChange={setTime}
              format="12h"
              minuteInterval={5}
            />
          </View>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.categoryButton,
                  category === option.name && {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setCategory(option.name)}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={category === option.name ? 'white' : theme.colors.text.secondary} 
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === option.name && { color: 'white', fontFamily: theme.typography.fontFamily.medium },
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Repeat</Text>
          <View style={styles.repeatContainer}>
            {repeatOptions.map((rOpt) => (
              <TouchableOpacity
                key={rOpt}
                style={[
                  styles.repeatButton,
                  repeat === rOpt && { 
                    backgroundColor: theme.colors.primary.main,
                    borderColor: theme.colors.primary.main,
                  },
                ]}
                onPress={() => setRepeat(rOpt)}
              >
                <Text
                  style={[
                    styles.repeatButtonText,
                    repeat === rOpt && { 
                      color: 'white',
                      fontFamily: theme.typography.fontFamily.medium,
                    },
                  ]}
                >
                  {rOpt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {repeat !== 'Never' && repeat !== 'Forever' && (
            <InputField
              label="Number of Occurrences"
              placeholder="How many times? (e.g. 5)"
              value={repeatCount}
              onChangeText={(text) => {
                setRepeatCount(text);
                if (text.trim() && !isNaN(parseInt(text)) && parseInt(text) > 0) {
                  setRepeatCountError('');
                }
              }}
              keyboardType="numeric"
              error={repeatCountError}
              leftIcon={<Ionicons name="repeat-outline" size={20} color={theme.colors.primary.main} />}
            />
          )}

          <Text style={styles.sectionLabel}>Notification</Text>
          <View style={styles.notificationContainer}>
            {notificationOptionsList.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.notificationButton,
                  notificationOption === option && {
                    backgroundColor: theme.colors.primary.main,
                    borderColor: theme.colors.primary.main,
                  },
                ]}
                onPress={() => setNotificationOption(option)}
              >
                <Text
                  style={[
                    styles.notificationButtonText,
                    notificationOption === option && { 
                      color: 'white',
                      fontFamily: theme.typography.fontFamily.medium,
                    },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              size="medium"
              style={styles.cancelButton}
            />
            <Button
              title="Save Event"
              onPress={handleSave}
              variant="primary"
              size="medium"
              style={styles.saveButton}
              leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="white" />}
              disabled={isSaving}
            />
          </View>
        </Card>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  card: {
    padding: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  dateTimeContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.background.paper,
    marginBottom: theme.spacing.xs,
  },
  categoryIcon: {
    marginRight: theme.spacing.xs,
  },
  categoryButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  repeatButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.background.paper,
  },
  repeatButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  notificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  notificationButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.background.paper,
    marginBottom: theme.spacing.xs,
  },
  notificationButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 50,
  },
  saveButton: {
    flex: 1,
    height: 50,
  },
});