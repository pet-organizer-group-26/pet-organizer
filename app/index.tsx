import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';

type EventCategory = 'Vet' | 'Grooming' | 'Daily' | 'Training' | 'Play';

const categoryColors: { [key in EventCategory]: string } = {
  Vet: '#D32F2F', // Red
  Grooming: '#7B1FA2', // Purple
  Daily: '#388E3C', // Green
  Training: '#FBC02D', // Yellow
  Play: '#1976D2', // Blue
};

const events: { id: string; title: string; date: string; time: string; category: EventCategory }[] = [
  { id: '1', title: 'Vet Appointment', date: '2025-02-10', time: '10:00 AM', category: 'Vet' },
  { id: '2', title: 'Grooming Session', date: '2025-02-12', time: '2:00 PM', category: 'Grooming' },
  { id: '3', title: 'Daily Feeding', date: '2025-02-15', time: '8:00 AM', category: 'Daily' },
  { id: '4', title: 'Training Class', date: '2025-02-18', time: '11:00 AM', category: 'Training' },
  { id: '5', title: 'Playdate at Park', date: '2025-02-20', time: '4:00 PM', category: 'Play' },
  { id: '6', title: 'Extra Training', date: '2025-02-20', time: '6:00 PM', category: 'Training' },
];

type Day = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState('');

  const filteredEvents = events.filter(event => event.date === selectedDate);

  const markedDates = events.reduce((acc, event) => {
    if (event.category !== 'Daily') {
      acc[event.date] = { marked: true, dotColor: '#00796b' };
    }
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string }>);

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={(day: Day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#4a4a4a' },
        }}
        theme={{
          backgroundColor: '#f4f6f8',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#4a4a4a',
          todayTextColor: '#00796b',
          dayTextColor: '#333333',
          arrowColor: '#00796b',
          monthTextColor: '#00796b',
          selectedDayBackgroundColor: '#4a4a4a',
          selectedDayTextColor: '#ffffff',
        }}
      />

      <Text style={styles.subtitle}>{selectedDate ? `Events for ${selectedDate}` : 'Select a date to view events'}</Text>

      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.categoryTag, { borderColor: categoryColors[item.category] }]}> 
                <Text style={[styles.categoryText, { color: categoryColors[item.category] }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <Text style={styles.cardText}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },
  calendar: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#004d40',
  },
  cardText: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 14,
  },
});
