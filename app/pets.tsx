import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import theme from '../constants/theme';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

// Pet type definition for Supabase
type Pet = {
  id: string;
  name: string;
  type: string;
  image_url: string | null;
  birthdate?: string;
  breed?: string;
  gender?: string;
  microchip_id?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export default function PetsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'];

  // Fetch pets from Supabase
  const fetchPets = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching pets:', error);
        Alert.alert('Error', 'Failed to load pets');
      } else {
        setPets(data || []);
      }
    } catch (error) {
      console.error('Error in fetchPets:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading pets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | undefined;
    
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        // Initial fetch
        await fetchPets();
        
        // Set up real-time subscription
        subscription = supabase
          .channel('pets-channel-' + new Date().getTime())
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'pets',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              // Add the new pet to the state
              const newPet = payload.new as Pet;
              setPets(current => [...current, newPet]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'pets',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              // Update the existing pet in the state
              const updatedPet = payload.new as Pet;
              setPets(current => 
                current.map(pet => 
                  pet.id === updatedPet.id ? updatedPet : pet
                )
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'pets',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.old) {
              // Remove the deleted pet from the state
              const deletedPet = payload.old as Pet;
              setPets(current => 
                current.filter(pet => pet.id !== deletedPet.id)
              );
            }
          })
          .subscribe();
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchPets]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPets();
      return () => {};
    }, [fetchPets])
  );

  // Upload image to Supabase Storage
  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Convert to base64 and upload
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const fileName = `pet_${new Date().getTime()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('pet_images')
        .upload(filePath, base64, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      return null;
    }
  };

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
    setEditingPet(null);
    setNameError('');
  };

  const editPet = (pet: Pet) => {
    setPetName(pet.name);
    setPetType(pet.type);
    setPetImage(pet.image_url);
    setEditingPet(pet);
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validate inputs
    if (!petName.trim()) {
      setNameError('Pet name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add pets');
        setIsSubmitting(false);
        return;
      }

      // Upload image if new or changed
      let imageUrl = petImage;
      if (petImage && (editingPet === null || petImage !== editingPet.image_url)) {
        if (petImage.startsWith('file://')) {
          imageUrl = await uploadImage(petImage);
        }
      }

      if (editingPet) {
        // Update existing pet
        const { error } = await supabase
          .from('pets')
          .update({
            name: petName,
            type: petType,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPet.id);

        if (error) {
          console.error('Update pet error details:', JSON.stringify(error));
          throw error;
        }
        
        // Fallback update in case real-time update fails
        setPets(pets.map(pet => 
          pet.id === editingPet.id 
            ? {
                ...editingPet,
                name: petName,
                type: petType,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
              } 
            : pet
        ));
        
        // Add success message for editing
        Alert.alert(
          'Success',
          'Pet updated successfully',
          [{ text: 'OK' }]
        );
      } else {
        // Add new pet
        const { data, error } = await supabase
          .from('pets')
          .insert([{
            name: petName,
            type: petType,
            image_url: imageUrl,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select();

        if (error) {
          console.error('Insert pet error details:', JSON.stringify(error));
          throw error;
        }

        // Fallback update in case real-time update fails
        if (data && data.length > 0) {
          const newPet = data[0] as Pet;
          setPets([...pets, newPet]);
        }
        
        // Add success message for adding
        Alert.alert(
          'Success',
          'Pet added successfully',
          [{ text: 'OK' }]
        );
      }

      // Reset form and close modal
      setPetName('');
      setPetType('Dog');
      setPetImage(null);
      setEditingPet(null);
      setNameError('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete pet function
  const deletePet = (pet: Pet) => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('pets')
                .delete()
                .eq('id', pet.id);

              if (error) {
                console.error('Delete pet error details:', JSON.stringify(error));
                throw error;
              }

              // Fallback update in case real-time update fails
              setPets(pets.filter(p => p.id !== pet.id));
              
              // Add success message for deleting
              Alert.alert(
                'Success',
                'Pet deleted successfully',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('Error', 'Failed to delete pet. Please try again.');
            }
          }
        }
      ]
    );
  };

  // View pet details
  const viewPetDetails = (pet: Pet) => {
    router.push(`/pet-details?id=${pet.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pets</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading pets...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <Card key={pet.id} variant="layered" style={styles.petPanel}>
                <TouchableOpacity onPress={() => viewPetDetails(pet)}>
                  {pet.image_url && (
                    <Image source={{ uri: pet.image_url }} style={styles.petImage} />
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
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => editPet(pet)}
                  >
                    <Ionicons name="pencil" size={20} color={theme.colors.primary.main} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deletePet(pet)}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error.main} />
                  </TouchableOpacity>
                </View>
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
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setPetName('');
          setPetType('Dog');
          setPetImage(null);
          setEditingPet(null);
          setNameError('');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingPet !== null ? 'Edit Pet' : 'Add New Pet'}
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
            title={editingPet !== null ? 'Save Changes' : 'Add Pet'}
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.modalButton}
            disabled={isSubmitting}
          />
          <Button
            title="Cancel"
            onPress={handleModalClose}
            variant="outline"
            size="large"
            style={styles.cancelButton}
            disabled={isSubmitting}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
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
  actionButtons: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    flexDirection: 'row',
  },
  editButton: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background.paper,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});