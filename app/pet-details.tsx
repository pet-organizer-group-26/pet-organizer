import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import theme from '../constants/theme';
import { Card } from '../components/common/Card';
import { useFocusEffect } from '@react-navigation/native';
import { VaccinationItem } from '../components/pet-health/VaccinationItem';
import { MedicationItem } from '../components/pet-health/MedicationItem';
import { VetVisitItem } from '../components/pet-health/VetVisitItem';
import { AllergyItem } from '../components/pet-health/AllergyItem';
import { AddRecordModal, RecordType } from '../components/pet-health/AddRecordModal';
import { Button } from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';

// Pet type definition from pets.tsx
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

type TabName = 'profile' | 'health' | 'weight' | 'care' | 'feeding' | 'activity';

type VaccinationType = {
  id: string;
  pet_id: string;
  name: string;
  date: string;
  expiration_date?: string;
  administered_by?: string;
  lot_number?: string;
  notes?: string;
};

type MedicationType = {
  id: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  time_of_day?: string;
  prescribed_by?: string;
  pharmacy?: string;
  refills?: number;
  notes?: string;
};

type VetVisitType = {
  id: string;
  pet_id: string;
  date: string;
  reason: string;
  vet_name?: string;
  clinic_name?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  follow_up_date?: string;
  notes?: string;
};

type AllergyType = {
  id: string;
  pet_id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction?: string;
  diagnosed_date?: string;
  notes?: string;
};

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('profile');
  
  // Health records state
  const [vaccinations, setVaccinations] = useState<VaccinationType[]>([]);
  const [medications, setMedications] = useState<MedicationType[]>([]);
  const [vetVisits, setVetVisits] = useState<VetVisitType[]>([]);
  const [allergies, setAllergies] = useState<AllergyType[]>([]);
  const [healthRecordsLoading, setHealthRecordsLoading] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('vaccination');
  const [selectedRecord, setSelectedRecord] = useState<VaccinationType | MedicationType | VetVisitType | AllergyType | null>(null);

  // Fetch pet details from Supabase
  const fetchPetDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching pet details:', error);
        Alert.alert('Error', 'Failed to load pet details');
        router.back();
        return;
      }
      
      if (data) {
        setPet(data as Pet);
      } else {
        Alert.alert('Error', 'Pet not found');
        router.back();
      }
    } catch (error) {
      console.error('Error in fetchPetDetails:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Fetch health records
  const fetchHealthRecords = useCallback(async () => {
    if (!id) return;
    
    setHealthRecordsLoading(true);
    
    try {
      // Fetch vaccinations
      const { data: vaccinationData, error: vaccinationError } = await supabase
        .from('pet_vaccinations')
        .select('*')
        .eq('pet_id', id)
        .order('date', { ascending: false });
      
      if (vaccinationError) {
        console.error('Error fetching vaccinations:', vaccinationError);
      } else {
        setVaccinations(vaccinationData as VaccinationType[]);
      }
      
      // Fetch medications
      const { data: medicationData, error: medicationError } = await supabase
        .from('pet_medications')
        .select('*')
        .eq('pet_id', id)
        .order('start_date', { ascending: false });
      
      if (medicationError) {
        console.error('Error fetching medications:', medicationError);
      } else {
        setMedications(medicationData as MedicationType[]);
      }
      
      // Fetch vet visits
      const { data: vetVisitData, error: vetVisitError } = await supabase
        .from('pet_vet_visits')
        .select('*')
        .eq('pet_id', id)
        .order('date', { ascending: false });
      
      if (vetVisitError) {
        console.error('Error fetching vet visits:', vetVisitError);
      } else {
        setVetVisits(vetVisitData as VetVisitType[]);
      }
      
      // Fetch allergies
      const { data: allergyData, error: allergyError } = await supabase
        .from('pet_allergies')
        .select('*')
        .eq('pet_id', id)
        .order('name', { ascending: true });
      
      if (allergyError) {
        console.error('Error fetching allergies:', allergyError);
      } else {
        setAllergies(allergyData as AllergyType[]);
      }
    } catch (error) {
      console.error('Error fetching health records:', error);
      Alert.alert('Error', 'Failed to load health records');
    } finally {
      setHealthRecordsLoading(false);
    }
  }, [id]);

  // Save record to Supabase
  const saveRecord = async (record: VaccinationType | MedicationType | VetVisitType | AllergyType) => {
    if (!id) return;
    
    try {
      let tableName: string;
      const recordWithPetId = { ...record, pet_id: id };
      
      if ('expiration_date' in record) {
        tableName = 'pet_vaccinations';
      } else if ('dosage' in record) {
        tableName = 'pet_medications';
      } else if ('reason' in record) {
        tableName = 'pet_vet_visits';
      } else if ('severity' in record) {
        tableName = 'pet_allergies';
      } else {
        Alert.alert('Error', 'Unknown record type');
        return;
      }
      
      const isUpdate = record.id;
      
      if (isUpdate) {
        // Update existing record
        const { error } = await supabase
          .from(tableName)
          .update(recordWithPetId)
          .eq('id', record.id);
        
        if (error) {
          console.error(`Error updating ${tableName}:`, error);
          Alert.alert('Error', `Failed to update record`);
          return;
        }
        
        Alert.alert('Success', 'Record updated successfully');
      } else {
        // Insert new record
        const { error } = await supabase
          .from(tableName)
          .insert(recordWithPetId);
        
        if (error) {
          console.error(`Error inserting ${tableName}:`, error);
          Alert.alert('Error', `Failed to add record`);
          return;
        }
        
        Alert.alert('Success', 'Record added successfully');
      }
      
      // Refresh data
      fetchHealthRecords();
      
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Delete record
  const deleteRecord = async (id: string, type: RecordType) => {
    // Ask for confirmation
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this record? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              let tableName: string;
              
              switch (type) {
                case 'vaccination':
                  tableName = 'pet_vaccinations';
                  break;
                case 'medication':
                  tableName = 'pet_medications';
                  break;
                case 'vet_visit':
                  tableName = 'pet_vet_visits';
                  break;
                case 'allergy':
                  tableName = 'pet_allergies';
                  break;
              }
              
              const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);
              
              if (error) {
                console.error(`Error deleting from ${tableName}:`, error);
                Alert.alert('Error', 'Failed to delete record');
                return;
              }
              
              // Refresh data
              fetchHealthRecords();
              Alert.alert('Success', 'Record deleted successfully');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  // Open modal to add or edit a record
  const openModal = (type: RecordType, record?: VaccinationType | MedicationType | VetVisitType | AllergyType) => {
    setRecordType(type);
    setSelectedRecord(record || null);
    setModalVisible(true);
  };

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPetDetails();
      if (activeTab === 'health') {
        fetchHealthRecords();
      }
      return () => {};
    }, [fetchPetDetails, fetchHealthRecords, activeTab])
  );

  // Fetch health records when switching to health tab
  useEffect(() => {
    if (activeTab === 'health') {
      fetchHealthRecords();
    }
  }, [activeTab, fetchHealthRecords]);

  // Tab configuration
  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: 'profile', label: 'Profile', icon: 'information-circle-outline' },
    { name: 'health', label: 'Health', icon: 'medkit-outline' },
    { name: 'weight', label: 'Weight', icon: 'scale-outline' },
    { name: 'care', label: 'Care', icon: 'paw-outline' },
    { name: 'feeding', label: 'Feeding', icon: 'restaurant-outline' },
    { name: 'activity', label: 'Activity', icon: 'fitness-outline' },
  ];

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!pet) return null;

    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <ScrollView style={styles.scrollView}>
              {pet?.image_url && (
                <Image 
                  source={{ uri: pet.image_url }} 
                  style={styles.petImage} 
                  resizeMode="cover"
                />
              )}
              
              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pet Type:</Text>
                  <Text style={styles.infoValue}>{pet?.type || 'Not specified'}</Text>
                </View>
                
                {pet?.breed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Breed:</Text>
                    <Text style={styles.infoValue}>{pet.breed}</Text>
                  </View>
                )}
                
                {pet?.birthdate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Birthdate:</Text>
                    <Text style={styles.infoValue}>{new Date(pet.birthdate).toLocaleDateString()}</Text>
                  </View>
                )}
                
                {pet?.gender && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gender:</Text>
                    <Text style={styles.infoValue}>{pet.gender}</Text>
                  </View>
                )}
                
                {pet?.microchip_id && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Microchip ID:</Text>
                    <Text style={styles.infoValue}>{pet.microchip_id}</Text>
                  </View>
                )}
                
                {pet?.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{pet.notes}</Text>
                  </View>
                )}
              </Card>
            </ScrollView>
          </View>
        );
      
      case 'health':
        const [activeHealthTab, setActiveHealthTab] = useState('vaccinations');
        
        return (
          <View style={styles.tabContent}>
            <View style={styles.healthTabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.healthTabs}>
                <TouchableOpacity 
                  style={[
                    styles.healthTab, 
                    activeHealthTab === 'vaccinations' && styles.activeHealthTab
                  ]} 
                  onPress={() => setActiveHealthTab('vaccinations')}
                >
                  <Text style={[
                    styles.healthTabText,
                    activeHealthTab === 'vaccinations' && styles.activeHealthTabText
                  ]}>Vaccinations</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.healthTab, 
                    activeHealthTab === 'medications' && styles.activeHealthTab
                  ]} 
                  onPress={() => setActiveHealthTab('medications')}
                >
                  <Text style={[
                    styles.healthTabText,
                    activeHealthTab === 'medications' && styles.activeHealthTabText
                  ]}>Medications</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.healthTab, 
                    activeHealthTab === 'vet_visits' && styles.activeHealthTab
                  ]} 
                  onPress={() => setActiveHealthTab('vet_visits')}
                >
                  <Text style={[
                    styles.healthTabText,
                    activeHealthTab === 'vet_visits' && styles.activeHealthTabText
                  ]}>Vet Visits</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.healthTab, 
                    activeHealthTab === 'allergies' && styles.activeHealthTab
                  ]} 
                  onPress={() => setActiveHealthTab('allergies')}
                >
                  <Text style={[
                    styles.healthTabText,
                    activeHealthTab === 'allergies' && styles.activeHealthTabText
                  ]}>Allergies</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.addButtonContainer}>
              <Button 
                title={`Add ${
                  activeHealthTab === 'vaccinations' ? 'Vaccination' :
                  activeHealthTab === 'medications' ? 'Medication' :
                  activeHealthTab === 'vet_visits' ? 'Vet Visit' :
                  'Allergy'
                }`}
                onPress={() => openModal(
                  activeHealthTab === 'vaccinations' ? 'vaccination' :
                  activeHealthTab === 'medications' ? 'medication' :
                  activeHealthTab === 'vet_visits' ? 'vet_visit' :
                  'allergy'
                )}
                icon={<Ionicons name="add-circle-outline" size={18} color="white" />}
              />
            </View>
            
            {healthRecordsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Loading health records...</Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView}>
                {activeHealthTab === 'vaccinations' && (
                  <>
                    {vaccinations.length === 0 ? (
                      <View style={styles.emptyStateContainer}>
                        <Ionicons name="medical-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No vaccinations recorded yet</Text>
                      </View>
                    ) : (
                      vaccinations.map(vaccination => (
                        <VaccinationItem 
                          key={vaccination.id}
                          {...vaccination}
                          onEdit={() => openModal('vaccination', vaccination)}
                          onDelete={() => deleteRecord(vaccination.id, 'vaccination')}
                        />
                      ))
                    )}
                  </>
                )}
                
                {activeHealthTab === 'medications' && (
                  <>
                    {medications.length === 0 ? (
                      <View style={styles.emptyStateContainer}>
                        <Ionicons name="medkit-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No medications recorded yet</Text>
                      </View>
                    ) : (
                      medications.map(medication => (
                        <MedicationItem 
                          key={medication.id}
                          {...medication}
                          onEdit={() => openModal('medication', medication)}
                          onDelete={() => deleteRecord(medication.id, 'medication')}
                        />
                      ))
                    )}
                  </>
                )}
                
                {activeHealthTab === 'vet_visits' && (
                  <>
                    {vetVisits.length === 0 ? (
                      <View style={styles.emptyStateContainer}>
                        <Ionicons name="medical-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No vet visits recorded yet</Text>
                      </View>
                    ) : (
                      vetVisits.map(visit => (
                        <VetVisitItem 
                          key={visit.id}
                          {...visit}
                          onEdit={() => openModal('vet_visit', visit)}
                          onDelete={() => deleteRecord(visit.id, 'vet_visit')}
                        />
                      ))
                    )}
                  </>
                )}
                
                {activeHealthTab === 'allergies' && (
                  <>
                    {allergies.length === 0 ? (
                      <View style={styles.emptyStateContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No allergies recorded yet</Text>
                      </View>
                    ) : (
                      allergies.map(allergy => (
                        <AllergyItem 
                          key={allergy.id}
                          {...allergy}
                          onEdit={() => openModal('allergy', allergy)}
                          onDelete={() => deleteRecord(allergy.id, 'allergy')}
                        />
                      ))
                    )}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        );
      
      case 'weight':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="scale" size={60} color={colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Weight Tracking</Text>
              <Text style={styles.comingSoonText}>
                Monitor your pet's weight and growth over time. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      case 'care':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="paw" size={60} color={colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Care Reminders</Text>
              <Text style={styles.comingSoonText}>
                Set reminders for grooming, nail trimming, and other care tasks. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      case 'feeding':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="restaurant" size={60} color={colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Feeding Schedule</Text>
              <Text style={styles.comingSoonText}>
                Track food, feeding times, and set reminders. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      case 'activity':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="fitness" size={60} color={colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Activity Tracker</Text>
              <Text style={styles.comingSoonText}>
                Log walks, playtime, and other activities. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>Coming soon!</Text>
            </View>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Pet Details' }} />
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Pet Details' }} />
        <Ionicons name="alert-circle" size={60} color={colors.error.main} />
        <Text style={styles.errorText}>Pet not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: pet.name }} />
      
      {/* Pet Header */}
      <View style={styles.header}>
        {pet.image_url ? (
          <Image 
            source={{ uri: pet.image_url }} 
            style={styles.petImage} 
          />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Ionicons name="paw" size={40} color={colors.primary.main} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>{pet.type}{pet.breed ? ` • ${pet.breed}` : ''}</Text>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              activeTab === tab.name && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.name)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.name ? colors.primary.main : colors.text.secondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.name && styles.activeTabLabel
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Tab Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  petImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    marginLeft: 16,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  petType: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.main,
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabLabel: {
    color: theme.colors.primary.main,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    paddingBottom: 20,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  editButtonText: {
    color: theme.colors.primary.main,
    fontWeight: '500',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#e53935',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginTop: 12,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  addButtonsContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  addButton: {
    marginBottom: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  recordsCard: {
    padding: 16,
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordsTitleIcon: {
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary.light,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: 'white',
  },
  healthTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  healthTabs: {
    flexDirection: 'row',
  },
  healthTab: {
    padding: 12,
  },
  activeHealthTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.main,
  },
  healthTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeHealthTabText: {
    color: theme.colors.primary.main,
    fontWeight: '500',
  },
  addButtonContainer: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
