import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import theme from '../constants/theme';
import { useRouter } from 'expo-router';

export default function PetsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPetIndex, setEditingPetIndex] = useState<number | null>(null);
  const [pets, setPets] = useState<{ name: string; type: string; image: string | null }[]>([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const router = useRouter();

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
    setNameError('');
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
    // Validate inputs
    if (!petName.trim()) {
      setNameError('Pet name is required');
      return;
    }

    if (editingPetIndex !== null) {
      // Update existing pet
      const updatedPets = [...pets];
      updatedPets[editingPetIndex] = { name: petName, type: petType, image: petImage };
      setPets(updatedPets);
      
      // Add success message for editing
      Alert.alert(
        'Success',
        'Pet updated successfully',
        [{ text: 'OK' }]
      );
    } else {
      // Add new pet
      setPets([...pets, { name: petName, type: petType, image: petImage }]);
      
      // Add success message for adding
      Alert.alert(
        'Success',
        'Pet added successfully',
        [{ text: 'OK' }]
      );
    }
    // Reset form
    setPetName('');
    setPetType('Dog');
    setPetImage(null);
    setEditingPetIndex(null);
    setNameError('');
    setModalVisible(false);
  };

  // Add delete pet function
  const deletePet = (index: number) => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedPets = [...pets];
            updatedPets.splice(index, 1);
            setPets(updatedPets);
            
            // Add success message for deleting
            Alert.alert(
              'Success',
              'Pet deleted successfully',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pets</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {pets.length > 0 ? (
          pets.map((pet, index) => (
            <Card key={index} variant="layered" style={styles.petPanel}>
              <TouchableOpacity onPress={() => editPet(index)}>
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
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deletePet(index)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error.main} />
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw" size={60} color={theme.colors.primary.light} />
            <Text style={styles.emptyText}>No pets added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the button below to add your first pet
            </Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setPetName('');
          setPetType('Dog');
          setPetImage(null);
          setEditingPetIndex(null);
          setNameError('');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="white" />
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
              <Button
                title="Take Photo"
                onPress={() => pickImage(true)}
                variant="outline"
                size="small"
                leftIcon={<Ionicons name="camera-outline" size={18} color={theme.colors.primary.main} />}
                style={styles.imageButton}
              />
              <Button
                title="Choose Photo"
                onPress={() => pickImage(false)}
                variant="outline"
                size="small"
                leftIcon={<Ionicons name="image-outline" size={18} color={theme.colors.primary.main} />}
                style={styles.imageButton}
              />
            </View>
          </View>

          <InputField
            label="Pet Name"
            placeholder="Enter pet name"
            value={petName}
            onChangeText={(text) => {
              setPetName(text);
              if (text.trim()) setNameError('');
            }}
            error={nameError}
            leftIcon={<Ionicons name="paw-outline" size={22} color={theme.colors.primary.main} />}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pet Type</Text>
            <TouchableOpacity 
              style={styles.typeSelector}
              onPress={() => setShowTypePicker(true)}
            >
              <Text style={styles.typeSelectorText}>{petType}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
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

          <Button
            title={editingPetIndex !== null ? 'Save Changes' : 'Add Pet'}
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.modalButton}
          />
          <Button
            title="Cancel"
            onPress={handleModalClose}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.background.default,
  },
  title: { 
    fontSize: theme.typography.fontSize.xxl, 
    fontFamily: theme.typography.fontFamily.bold, 
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  petPanel: {
    padding: theme.spacing.md,
    marginBottom: 0,
  },
  petInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  petName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  petType: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
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
  modalContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.default,
  },
  typeSelectorText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
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
    width: '80%',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    maxHeight: '70%',
  },
  typeOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  typeOptionText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  selectedTypeText: {
    color: theme.colors.primary.main,
    fontFamily: theme.typography.fontFamily.bold,
  },
  modalButton: {
    marginTop: theme.spacing.md,
    height: 50,
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    height: 50,
  },
  petImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imagePreviewContainer: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.paper,
    marginBottom: theme.spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.paper,
  },
  imagePickerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: theme.spacing.md,
  },
  imageButton: {
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },
});