import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';
import ModalSystem from './components/ModalSystem';
import DatePicker from '../components/common/DatePicker';
import TimePicker from '../components/common/TimePicker';
import theme from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Event = {
  id: string;
  title: string;    // e.g. "Vet Appointment"
  event_date: string;     // e.g. "2025-02-15" (YYYY-MM-DD)
  event_time: string;     // e.g. "14:30" (24-hour format)
  category: string;
  location?: string;
  repeat?: string;  // e.g. "Daily", "Weekly", "Forever", etc.
  pet_id?: string;  // optional pet reference
};

const categoryColors: { [key: string]: string } = {
  Vet: theme.colors.error.light,
  Grooming: theme.colors.secondary.light,
  Daily: theme.colors.warning.light,
  Training: theme.colors.success.light,
  Play: theme.colors.primary.light,
};

// Convert "HH:MM" (24-hour) -> "h:mm AM/PM"
function formatTime12(time24: string) {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Convert "YYYY-MM-DD" -> "Feb 15, 2025"
function formatDateString(dateStr: string) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

// Convert "HH:MM" (24-hour) into a Date object
function parseTimeString(timeStr: string) {
  if (!timeStr) return new Date();
  const [hourStr, minuteStr] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hourStr, 10) || 0);
  date.setMinutes(parseInt(minuteStr, 10) || 0);
  date.setSeconds(0, 0);
  return date;
}

// Helper to parse a date string ("YYYY-MM-DD") to a Date object at midnight
function parseDate(dateStr: string) {
  return new Date(dateStr + 'T00:00');
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [manualRefresh, setManualRefresh] = useState(0);

  // For showing category dropdown in edit mode
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const router = useRouter();
  
  // Force refresh when coming back to this screen
  const refreshEvents = () => {
    setManualRefresh(prev => prev + 1);
  };

  // Use useFocusEffect to refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Calendar screen focused - refreshing events');
      refreshEvents();
      
      return () => {
        // cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | undefined;
    
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        console.log('Setting up real-time subscription for user:', user.id);
        
        // First, get the initial events
        console.log('Fetching initial events data');
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        console.log('Initial events loaded:', eventsData?.length || 0);
        setEvents(eventsData || []);
        
        // More comprehensive subscription setup that handles all event types explicitly
        subscription = supabase
          .channel('events-channel-' + new Date().getTime()) // Unique channel name to avoid conflicts
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME INSERT RECEIVED:', payload);
            // For inserts, we can just add the new event to the existing array
            if (payload.new) {
              setEvents(current => [...current, payload.new as Event]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME UPDATE RECEIVED:', payload);
            // For updates, replace the corresponding event in the array
            if (payload.new) {
              setEvents(current => 
                current.map(evt => evt.id === (payload.new as Event).id ? (payload.new as Event) : evt)
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME DELETE RECEIVED:', payload);
            // For deletes, remove the event from the array
            if (payload.old) {
              setEvents(current => 
                current.filter(evt => evt.id !== (payload.old as Event).id)
              );
            }
          })
          .subscribe(status => {
            console.log('Real-time subscription status:', status);
          });
      } catch (error) {
        console.error('Error setting up events subscription:', error);
      }
    };

    fetchEvents();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up subscription');
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [manualRefresh]); // Re-run when manual refresh is triggered

  const today = new Date().toLocaleDateString('en-CA');

  // Delete event function
  const handleDelete = async (eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('events')
              .delete()
              .eq('id', eventId);

            if (error) throw error;

            // Close the modal after deleting
            setSelectedEvent(null);
            setIsEditing(false);
            setEditedEvent(null);
            
            // Fallback manual update in case real-time doesn't work
            setEvents(current => current.filter(evt => evt.id !== eventId));
            
            // Show success message
            Alert.alert(
              'Success',
              'Event deleted successfully',
              [{ text: 'OK' }]
            );
            
            console.log('Event deleted, waiting for real-time update');
          } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'Failed to delete the event. Please try again.');
          }
        },
      },
    ]);
  };

  // Save edit function
  const handleSaveEdit = async () => {
    if (!editedEvent) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: editedEvent.title,
          event_date: editedEvent.event_date,
          event_time: editedEvent.event_time,
          category: editedEvent.category,
          location: editedEvent.location || '',
        })
        .eq('id', editedEvent.id);

      if (error) throw error;

      // Fallback manual update in case real-time doesn't work
      setEvents(current => 
        current.map(evt => evt.id === editedEvent.id ? editedEvent : evt)
      );
      
      // Update the selected event with the edited values
      setSelectedEvent(editedEvent);
      setIsEditing(false);
      setEditedEvent(null);
      setShowCategoryDropdown(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Event updated successfully',
        [{ text: 'OK' }]
      );
      
      console.log('Event updated, waiting for real-time update');
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to update the event. Please try again.');
    }
  };

  // Modified filtering logic:
  // For events with repeat === "Forever", show them on every day on or after their start date.
  const dailyEvents = events.filter((event) => {
    if (event.repeat === 'Forever') {
      const eventDate = parseDate(event.event_date);
      const selected = parseDate(selectedDate);
      return eventDate <= selected;
    }
    return event.event_date === selectedDate;
  }).sort((a, b) => a.event_time.localeCompare(b.event_time));

  const renderEventDetails = () => (
    <View>
      <View style={styles.modalInfoRow}>
        <Ionicons name="calendar-outline" size={24} color={theme.colors.text.secondary} style={styles.icon} />
        <Text style={styles.modalInfoText}>
          {selectedEvent && formatDateString(selectedEvent.event_date)}
        </Text>
      </View>
      <View style={styles.modalInfoRow}>
        <Ionicons name="time-outline" size={24} color={theme.colors.text.secondary} style={styles.icon} />
        <Text style={styles.modalInfoText}>
          {selectedEvent && formatTime12(selectedEvent.event_time)}
        </Text>
      </View>
      {selectedEvent && ['Vet', 'Grooming', 'Training'].includes(selectedEvent.category) &&
        selectedEvent.location && (
          <View style={styles.modalInfoRow}>
            <Ionicons name="location-outline" size={24} color={theme.colors.text.secondary} style={styles.icon} />
            <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
          </View>
        )}
      {selectedEvent && selectedEvent.repeat && selectedEvent.repeat !== 'Never' && (
        <View style={styles.repeatContainer}>
          <Ionicons name="repeat" size={14} color={theme.colors.primary.main} style={{ marginRight: 4 }} />
          <Text style={styles.repeatLabel}>{selectedEvent.repeat}</Text>
        </View>
      )}
    </View>
  );

  const renderEditForm = () => (
    <View>
      <TextInput
        style={styles.formField}
        placeholder="Event Title"
        value={editedEvent?.title || ''}
        onChangeText={(text) => setEditedEvent(prev => ({ ...prev!, title: text }))}
      />
      
      <DatePicker
        label="Event Date"
        value={editedEvent?.event_date ? new Date(editedEvent.event_date) : new Date()}
        onChange={(date) => {
          setEditedEvent(prev => ({ 
            ...prev!, 
            event_date: format(date, 'yyyy-MM-dd')
          }));
        }}
        displayFormat="medium"
        minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} 
        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))}
      />

      <TimePicker
        label="Event Time"
        value={editedEvent?.event_time ? parseTimeString(editedEvent.event_time) : new Date()}
        onChange={(time) => {
          setEditedEvent(prev => ({ 
            ...prev!, 
            event_time: format(time, 'HH:mm') 
          }));
        }}
        format="12h"
        minuteInterval={5}
      />

      <TouchableOpacity
        style={styles.formField}
        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
      >
        <Text style={styles.fieldValue}>
          {editedEvent?.category || 'Select Category'}
        </Text>
      </TouchableOpacity>

      {showCategoryDropdown && (
        <View style={styles.dropdown}>
          {Object.keys(categoryColors).map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.dropdownItem}
              onPress={() => {
                setEditedEvent(prev => ({ ...prev!, category }));
                setShowCategoryDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {['Vet', 'Grooming', 'Training'].includes(editedEvent?.category || '') && (
        <TextInput
          style={styles.formField}
          placeholder="Location"
          value={editedEvent?.location || ''}
          onChangeText={(text) => setEditedEvent(prev => ({ ...prev!, location: text }))}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{
          ...events.reduce((acc, event) => {
            acc[event.event_date] = { marked: true, dotColor: theme.colors.primary.main };
            return acc;
          }, {} as Record<string, { marked: boolean; dotColor: string }>),
          [selectedDate]: {
            selected: true,
            selectedColor: theme.colors.background.paper,
            selectedTextColor: theme.colors.text.primary,
          },
        }}
        theme={{
          todayTextColor: theme.colors.primary.main,
          arrowColor: theme.colors.primary.main,
          monthTextColor: theme.colors.text.primary,
          textMonthFontFamily: theme.typography.fontFamily.bold,
          textDayFontFamily: theme.typography.fontFamily.regular,
          textDayHeaderFontFamily: theme.typography.fontFamily.medium,
        }}
      />

      {selectedDate && (
        <View style={styles.eventHeader}>
          <Text style={styles.subtitle}>
            {selectedDate === today
              ? 'Events for Today'
              : `Events for ${new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}`}
          </Text>
        </View>
      )}

      <FlatList
        data={dailyEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedEvent(item);
              setIsEditing(false);
              setEditedEvent(null);
            }}
          >
            <View style={styles.card}>
              <View style={styles.eventHeaderRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: categoryColors[item.category] || '#ccc' },
                  ]}
                >
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              {item.repeat && item.repeat !== 'Never' && (
                <View style={styles.repeatContainer}>
                  <Ionicons name="repeat" size={14} color={theme.colors.primary.main} style={{ marginRight: 4 }} />
                  <Text style={styles.repeatLabel}>{item.repeat}</Text>
                </View>
              )}
              <Text style={styles.cardText}>
                {formatTime12(item.event_time)}
                {item.location ? ` • ${item.location}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color={theme.colors.primary.light} />
            <Text style={styles.emptyStateText}>No events for this day</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add an event</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: '/AddEvent',
            params: { date: selectedDate || today },
          })
        }
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {selectedEvent && (
        <ModalSystem
          visible={!!selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setIsEditing(false);
            setEditedEvent(null);
            setShowCategoryDropdown(false);
          }}
          type="form"
          size="medium"
          title={isEditing ? 'Edit Event' : selectedEvent.title}
          actions={isEditing ? [
            {
              label: 'Cancel',
              onPress: () => {
                setIsEditing(false);
                setEditedEvent(null);
                setShowCategoryDropdown(false);
              },
              variant: 'secondary'
            },
            {
              label: 'Save',
              onPress: handleSaveEdit,
              variant: 'primary'
            }
          ] : [
            {
              label: 'Edit',
              onPress: () => {
                setIsEditing(true);
                setEditedEvent(selectedEvent);
              },
              variant: 'primary'
            },
            {
              label: 'Delete',
              onPress: () => handleDelete(selectedEvent.id),
              variant: 'danger'
            }
          ]}
        >
          {isEditing ? renderEditForm() : renderEventDetails()}
        </ModalSystem>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.md,
  },
  calendar: {
    marginBottom: theme.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.xs,
    marginLeft: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#fff',
  },
  cardText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  repeatLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary.main,
  },
  addButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  modalInfoText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  formField: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.paper,
  },
  fieldValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  dropdownItemText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
});