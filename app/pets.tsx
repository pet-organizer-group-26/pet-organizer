import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#00796b',
  secondary: '#00a99e',
  background: '#fff',
  text: '#333',
  lightText: '#555',
  border: '#eee',
};

export default function PetsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPetIndex, setEditingPetIndex] = useState<number | null>(null);
  const [pets, setPets] = useState<{ name: string; type: string; image: string | null }[]>([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(null);

  const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'];

  const pickImage = async (useCamera = false) => {
    try {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 1,
      };

      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPetImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setPetName('');
    setPetType('Dog');
    setPetImage(null);
    setEditingPetIndex(null);
  };

  const addPet = () => {
    if (petName.trim()) {
      setPets([...pets, { name: petName, type: petType, image: petImage }]);
      setPetName('');
      setPetType('Dog');
      setPetImage(null);
      setModalVisible(false);
    }
  };

  const editPet = (index: number) => {
    const pet = pets[index];
    setPetName(pet.name);
    setPetType(pet.type);
    setPetImage(pet.image);
    setEditingPetIndex(index);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (petName.trim()) {
      if (editingPetIndex !== null) {
        // Update existing pet
        const updatedPets = [...pets];
        updatedPets[editingPetIndex] = { name: petName, type: petType, image: petImage };
        setPets(updatedPets);
      } else {
        // Add new pet
        setPets([...pets, { name: petName, type: petType, image: petImage }]);
      }
      // Reset form
      setPetName('');
      setPetType('Dog');
      setPetImage(null);
      setEditingPetIndex(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pets</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {pets.map((pet, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.petPanel}
            onPress={() => editPet(index)}
          >
            {pet.image && (
              <Image source={{ uri: pet.image }} style={styles.petImage} />
            )}
            <View style={styles.petInfo}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.petName}>{pet.name}</Text>
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.petType}>{pet.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setPetName('');
          setPetType('Dog');
          setPetImage(null);
          setEditingPetIndex(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingPetIndex !== null ? 'Edit Pet' : 'Add New Pet'}
          </Text>

          <View style={styles.imageContainer}>
            <View style={styles.imagePreviewContainer}>
              {petImage ? (
                <Image 
                  source={{ uri: petImage }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePickerText}>No image selected</Text>
                </View>
              )}
            </View>
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={[styles.imageButton, { marginRight: 10 }]} 
                onPress={() => pickImage(true)}
              >
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={() => pickImage(false)}
              >
                <Text style={styles.imageButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pet Name</Text>
            <TextInput
              placeholder="Enter pet name"
              value={petName}
              onChangeText={setPetName}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pet Type</Text>
            <TouchableOpacity 
              style={styles.typeSelector}
              onPress={() => setShowTypePicker(true)}
            >
              <Text style={styles.typeSelectorText}>{petType}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
          
          {showTypePicker && (
            <View style={styles.typePickerOverlay}>
              <View style={styles.typePickerContainer}>
                {petTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.typeOption}
                    onPress={() => {
                      setPetType(type);
                      setShowTypePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      petType === type && styles.selectedTypeText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
            <Text style={styles.modalButtonText}>
              {editingPetIndex !== null ? 'Save Changes' : 'Add Pet'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={handleModalClose}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: COLORS.background 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: COLORS.primary
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  petPanel: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petInfo: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  label: { fontSize: 16, color: COLORS.lightText, width: 50 },
  petName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  petType: { fontSize: 18, color: COLORS.text, flex: 1 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, marginBottom: 8, color: COLORS.text },
  input: { 
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    fontSize: 16
  },
  typeSelector: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  typeSelectorText: {
    fontSize: 16,
    color: '#333'
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666'
  },
  typePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  typePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  typeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  typeOptionText: {
    fontSize: 16,
    color: '#333'
  },
  selectedTypeText: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  cancelButton: { 
    backgroundColor: COLORS.secondary
  },
  modalButtonText: { color: 'white', fontSize: 18 },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    width: 200,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  imagePickerText: {
    color: COLORS.lightText,
    fontSize: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  imageButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    maxWidth: 150,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});