import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore } from '../constants/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const categoryOptions = [
  { name: 'Vet', color: '#D32F2F' },
  { name: 'Grooming', color: '#7B1FA2' },
  { name: 'Daily', color: '#388E3C' },
  { name: 'Training', color: '#FBC02D' },
  { name: 'Play', color: '#1976D2' }
];

type Event = {
  title: string;
  date: string;
  time: string;
  category: string;
  location: string;
};

export default function AddEvent() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [category, setCategory] = useState(categoryOptions[0].name);
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!title || !location) return;
    try {
      await addDoc(collection(firestore, 'events'), {
        title,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category,
        location,
      });
      router.back();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>🐾 Bark It on the Calendar</Text>
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Event Title" 
          placeholderTextColor="#888"
          value={title} 
          onChangeText={setTitle} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Event Location" 
          placeholderTextColor="#888"
          value={location} 
          onChangeText={setLocation} 
        />

        {/* Date Picker */}
        <TouchableOpacity 
          onPress={() => {
            setShowDatePicker(true);
            setShowTimePicker(false);
          }} 
          style={styles.inputButton}
        >
          <Text style={styles.inputText}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <>
            <DateTimePicker 
              value={date} 
              mode="date" 
              display="spinner" 
              onChange={(event, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
            />
            <TouchableOpacity style={styles.closePickerButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.closePickerText}>Dismiss</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Time Picker */}
        <TouchableOpacity 
          onPress={() => {
            setShowTimePicker(true);
            setShowDatePicker(false);
          }} 
          style={styles.inputButton}
        >
          <Text style={styles.inputText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <>
            <DateTimePicker 
              value={time} 
              mode="time" 
              display="spinner" 
              onChange={(event, selectedTime) => {
                if (selectedTime) setTime(selectedTime);
              }}
            />
            <TouchableOpacity style={styles.closePickerButton} onPress={() => setShowTimePicker(false)}>
              <Text style={styles.closePickerText}>Dismiss</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.categoryContainer}>
          {categoryOptions.map((option) => (
            <TouchableOpacity 
              key={option.name} 
              style={[styles.categoryButton, category === option.name && { backgroundColor: option.color }]} 
              onPress={() => setCategory(option.name)}
            >
              <Text style={[styles.categoryText, category === option.name && { color: '#fff' }]} numberOfLines={1} ellipsizeMode="tail">{option.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Event</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f6f8' },
    headerContainer: { alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#00796b' },
    input: { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 14, borderRadius: 15, marginBottom: 12, textAlign: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
    inputButton: { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 14, borderRadius: 15, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
    inputText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    closePickerButton: { marginTop: 10, marginBottom: 20, padding: 10, borderRadius: 20, backgroundColor: '#E0E0E0', alignItems: 'center', alignSelf: 'center', width: '50%' },
    closePickerText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
    categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    categoryButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    categoryText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', flexWrap: 'wrap' },
    saveButton: { backgroundColor: '#00796b', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
  });