import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { firestore } from '../constants/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';

const categoryColors: { [key: string]: string } = {
  Vet: '#D32F2F',
  Grooming: '#7B1FA2',
  Daily: '#388E3C',
  Training: '#FBC02D',
  Play: '#1976D2',
};

export default function EventDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id, title, date, time, category, location } = params;

  const categoryColor = categoryColors[category as string] || '#333';
  const showLocation = category === 'Vet' || category === 'Grooming' || category === 'Training';

  const handleDelete = async () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            if (!id) {
              console.error("Error: Event ID is missing.");
              return;
            }
            await deleteDoc(doc(firestore, 'events', id.toString()));
            router.replace('/'); // Navigate back to home after deletion
            router.replace('/'); // Ensure UI updates immediately
          } catch (error) {
            console.error("Error deleting event:", error);
          }
        },
        style: "destructive"
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: categoryColor }]}> 
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.details}>📅 Date: {date}</Text>
        <Text style={styles.details}>⏰ Time: {time}</Text>
        {showLocation && location && <Text style={styles.details}>📍 Location: {location}</Text>}
        <Text style={[styles.categoryTag, { borderColor: categoryColor, color: categoryColor }]}>
          {category}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/EditEvent')}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  details: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  categoryTag: {
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
