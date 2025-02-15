import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { firestore } from '../constants/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const categoryColors: { [key: string]: string } = {
  Vet: '#FF8FAB',
  Grooming: '#C3A6FF',
  Daily: '#FFCF81',
  Training: '#e1e650',
  Play: '#89CFF0',
};

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  location?: string;
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'events'), (snapshot) => {
      const eventData: Event[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventData);
    });
    return unsubscribe;
  }, []);

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={(day: { dateString: string }) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          ...events.reduce((acc, event) => {
            acc[event.date] = { marked: true, dotColor: '#00796b' };
            return acc;
          }, {} as Record<string, { marked: boolean; dotColor: string }>),
          [selectedDate]: { selected: true, selectedColor: '#d3d3d3', selectedTextColor: '#000' },
        }}
      />

      {selectedDate && (
        <View style={styles.eventHeader}>
          <Text style={styles.subtitle}>
            {selectedDate === today ? 'Events for Today' : `Events for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
          </Text>
        </View>
      )}

      <FlatList
        data={events.filter(event => event.date === selectedDate)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/EventDetails', params: item })}>
            <View style={styles.card}>
              <View style={styles.eventHeaderRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.categoryTag, { backgroundColor: categoryColors[item.category] || '#ccc' }]}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>{item.time} {item.location ? `• ${item.location}` : ''}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/AddEvent')}>
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  calendar: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  eventHeader: { backgroundColor: '#f4f4f4', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  subtitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardText: { fontSize: 14, color: '#555' },
  addButton: { backgroundColor: '#00796b', padding: 12, borderRadius: 25, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  eventHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryTag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignSelf: 'flex-start' },
  categoryText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
});
