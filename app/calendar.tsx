import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';
import ModalSystem from './components/ModalSystem';
import CustomDatePicker from './components/CustomDatePicker';

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
  date: string;     // e.g. "2025-02-15" (YYYY-MM-DD)
  time: string;     // e.g. "14:30" (24-hour format)
  category: string;
  location?: string;
  repeat?: string;  // e.g. "Daily", "Weekly", "Forever", etc.
};

const categoryColors: { [key: string]: string } = {
  Vet: '#FF8FAB',
  Grooming: '#C3A6FF',
  Daily: '#FFCF81',
  Training: '#e1e650',
  Play: '#89CFF0',
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

  // For showing the DateTimePickers and category dropdown in edit mode
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Subscribe to changes
        const subscription = supabase
          .channel('events_channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'events',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              // Fetch all events again when there's a change
              const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id);
              
              if (error) {
                console.error('Error fetching events:', error);
                return;
              }

              setEvents(events);
            }
          )
          .subscribe();

        // Initial fetch
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        setEvents(events);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up events subscription:', error);
      }
    };

    fetchEvents();
  }, []);

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

            setSelectedEvent(null);
            setIsEditing(false);
            setEditedEvent(null);
          } catch (error) {
            console.error('Error deleting event:', error);
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
          date: editedEvent.date,
          time: editedEvent.time,
          category: editedEvent.category,
          location: editedEvent.location || '',
        })
        .eq('id', editedEvent.id);

      if (error) throw error;

      setSelectedEvent(editedEvent);
      setIsEditing(false);
      setEditedEvent(null);
      setShowCategoryDropdown(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Modified filtering logic:
  // For events with repeat === "Forever", show them on every day on or after their start date.
  const dailyEvents = events.filter((event) => {
    if (event.repeat === 'Forever') {
      const eventDate = parseDate(event.date);
      const selected = parseDate(selectedDate);
      return eventDate <= selected;
    }
    return event.date === selectedDate;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const renderEventDetails = () => (
    <View>
      <View style={styles.modalInfoRow}>
        <Ionicons name="calendar-outline" size={24} color="#555" style={styles.icon} />
        <Text style={styles.modalInfoText}>
          {selectedEvent && formatDateString(selectedEvent.date)}
        </Text>
      </View>
      <View style={styles.modalInfoRow}>
        <Ionicons name="time-outline" size={24} color="#555" style={styles.icon} />
        <Text style={styles.modalInfoText}>
          {selectedEvent && formatTime12(selectedEvent.time)}
        </Text>
      </View>
      {selectedEvent && ['Vet', 'Grooming', 'Training'].includes(selectedEvent.category) &&
        selectedEvent.location && (
          <View style={styles.modalInfoRow}>
            <Ionicons name="location-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
          </View>
        )}
      {selectedEvent && selectedEvent.repeat && selectedEvent.repeat !== 'Never' && (
        <View style={styles.repeatContainer}>
          <Ionicons name="repeat" size={14} color="#00796b" style={{ marginRight: 4 }} />
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
      
      <CustomDatePicker
        label="Date"
        value={editedEvent?.date ? new Date(editedEvent.date) : new Date()}
        onChange={(date) => setEditedEvent(prev => ({ ...prev!, date: date.toISOString() }))}
        mode="date"
      />

      <CustomDatePicker
        label="Time"
        value={editedEvent?.time ? new Date(`2000-01-01T${editedEvent.time}`) : new Date()}
        onChange={(date) => setEditedEvent(prev => ({ 
          ...prev!, 
          time: format(date, 'HH:mm') 
        }))}
        mode="time"
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
            acc[event.date] = { marked: true, dotColor: '#00796b' };
            return acc;
          }, {} as Record<string, { marked: boolean; dotColor: string }>),
          [selectedDate]: {
            selected: true,
            selectedColor: '#d3d3d3',
            selectedTextColor: '#000',
          },
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
                  <Ionicons name="repeat" size={14} color="#00796b" style={{ marginRight: 4 }} />
                  <Text style={styles.repeatLabel}>{item.repeat}</Text>
                </View>
              )}
              <Text style={styles.cardText}>
                {formatTime12(item.time)}
                {item.location ? ` • ${item.location}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
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
  container: { flex: 1, padding: 16 },
  calendar: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardText: { fontSize: 14, color: '#555', marginTop: 5 },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  icon: {
    marginRight: 12,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#555',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  repeatLabel: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  formField: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    width: '100%',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});