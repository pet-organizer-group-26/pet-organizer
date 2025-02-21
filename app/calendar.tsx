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
import { firestore } from '../constants/firebaseConfig';
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

import * as Notifications from 'expo-notifications';

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
    const unsubscribe = onSnapshot(collection(firestore, 'events'), (snapshot) => {
      const eventData: Event[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Event)
      );
      setEvents(eventData);
    });
    return unsubscribe;
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
            await deleteDoc(doc(firestore, 'events', eventId));
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
      const eventRef = doc(firestore, 'events', editedEvent.id);
      await updateDoc(eventRef, {
        title: editedEvent.title,
        date: editedEvent.date,
        time: editedEvent.time,
        category: editedEvent.category,
        location: editedEvent.location || '',
      });
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
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedEvent(null);
          setIsEditing(false);
          setEditedEvent(null);
          setShowCategoryDropdown(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedEvent && !isEditing && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar-outline" size={24} color="#555" style={styles.icon} />
                  <Text style={styles.modalInfoText}>
                    {formatDateString(selectedEvent.date)}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons name="time-outline" size={24} color="#555" style={styles.icon} />
                  <Text style={styles.modalInfoText}>
                    {formatTime12(selectedEvent.time)}
                  </Text>
                </View>
                {['Vet', 'Grooming', 'Training'].includes(selectedEvent.category) &&
                  selectedEvent.location && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="location-outline" size={24} color="#555" style={styles.icon} />
                      <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
                    </View>
                  )}
                {selectedEvent.repeat && selectedEvent.repeat !== 'Never' && (
                  <View style={styles.repeatContainer}>
                    <Ionicons name="repeat" size={14} color="#00796b" style={{ marginRight: 4 }} />
                    <Text style={styles.repeatLabel}>{selectedEvent.repeat}</Text>
                  </View>
                )}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setIsEditing(true);
                      setEditedEvent(selectedEvent);
                    }}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(selectedEvent.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setSelectedEvent(null);
                    setIsEditing(false);
                    setEditedEvent(null);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedEvent && isEditing && editedEvent && (
              <>
                <Text style={styles.editSubtitle}>Edit Event</Text>
                <TextInput
                  style={styles.formField}
                  value={editedEvent.title}
                  onChangeText={(text) =>
                    setEditedEvent({ ...editedEvent, title: text })
                  }
                  placeholder="Title"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={[styles.formField, { justifyContent: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.fieldValue}>
                    {editedEvent.date ? formatDateString(editedEvent.date) : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      editedEvent.date
                        ? new Date(`${editedEvent.date}T00:00:00`)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={(event, selectedD) => {
                      setShowDatePicker(false);
                      if (selectedD) {
                        const isoDate = selectedD.toISOString().split('T')[0];
                        setEditedEvent({ ...editedEvent, date: isoDate });
                      }
                    }}
                  />
                )}
                <TouchableOpacity
                  style={[styles.formField, { justifyContent: 'center' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.fieldValue}>
                    {editedEvent.time ? formatTime12(editedEvent.time) : 'Select Time'}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={parseTimeString(editedEvent.time)}
                    mode="time"
                    display="spinner"
                    is24Hour={false}
                    onChange={(event, selectedT) => {
                      setShowTimePicker(false);
                      if (selectedT) {
                        const hh = selectedT.getHours().toString().padStart(2, '0');
                        const mm = selectedT.getMinutes().toString().padStart(2, '0');
                        setEditedEvent({ ...editedEvent, time: `${hh}:${mm}` });
                      }
                    }}
                  />
                )}
                <View style={styles.dropdownWrapper}>
                  <TouchableOpacity
                    style={[styles.formField, { justifyContent: 'center' }]}
                    onPress={() => setShowCategoryDropdown((prev) => !prev)}
                  >
                    <Text style={styles.fieldValue}>
                      {editedEvent.category || 'Select Category'}
                    </Text>
                  </TouchableOpacity>
                  {showCategoryDropdown && (
                    <View style={styles.dropdown}>
                      {Object.keys(categoryColors).map((cat) => (
                        <Pressable
                          key={cat}
                          style={({ pressed }) => [
                            styles.dropdownItem,
                            pressed && { backgroundColor: '#e0e0e0' },
                          ]}
                          onPress={() => {
                            setEditedEvent({ ...editedEvent, category: cat });
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
                <TextInput
                  style={styles.formField}
                  value={editedEvent.location || ''}
                  onChangeText={(text) =>
                    setEditedEvent({ ...editedEvent, location: text })
                  }
                  placeholder="Location"
                  placeholderTextColor="#999"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.editButton} onPress={handleSaveEdit}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      setIsEditing(false);
                      setEditedEvent(null);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: { marginRight: 8 },
  modalInfoText: { fontSize: 16, color: '#555' },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  editSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#00796b',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#bbb',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  formField: {
    width: '100%',
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  dropdownWrapper: {
    width: '100%',
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    zIndex: 999,
    elevation: 6,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  repeatLabel: {
    fontSize: 12,
    color: '#00796b',
  },
});