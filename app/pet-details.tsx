import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import theme from '../constants/theme';
import { Card } from '../components/common/Card';
import { useFocusEffect } from '@react-navigation/native';

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

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('profile');

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

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPetDetails();
      return () => {};
    }, [fetchPetDetails])
  );

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
            <Card variant="layered" style={styles.infoCard}>
              <Text style={styles.sectionTitle}>General Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{pet.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{pet.type}</Text>
              </View>
              {pet.breed && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Breed:</Text>
                  <Text style={styles.infoValue}>{pet.breed}</Text>
                </View>
              )}
              {pet.gender && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{pet.gender}</Text>
                </View>
              )}
              {pet.birthdate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Birthdate:</Text>
                  <Text style={styles.infoValue}>{new Date(pet.birthdate).toLocaleDateString()}</Text>
                </View>
              )}
              {pet.microchip_id && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Microchip ID:</Text>
                  <Text style={styles.infoValue}>{pet.microchip_id}</Text>
                </View>
              )}
              {pet.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.infoLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{pet.notes}</Text>
                </View>
              )}
            </Card>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                Alert.alert('Coming Soon', 'Edit profile feature will be available in the next update.');
              }}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
              <Ionicons name="pencil" size={18} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
        );
      
      case 'health':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="medkit" size={60} color={theme.colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Health Records</Text>
              <Text style={styles.comingSoonText}>
                Track vaccinations, medications, and vet visits. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      case 'weight':
        return (
          <View style={styles.tabContent}>
            <View style={styles.comingSoonContainer}>
              <Ionicons name="scale" size={60} color={theme.colors.primary.light} />
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
              <Ionicons name="paw" size={60} color={theme.colors.primary.light} />
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
              <Ionicons name="restaurant" size={60} color={theme.colors.primary.light} />
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
              <Ionicons name="fitness" size={60} color={theme.colors.primary.light} />
              <Text style={styles.comingSoonTitle}>Activity Tracker</Text>
              <Text style={styles.comingSoonText}>
                Log walks, playtime, and other activities. Coming soon!
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Pet Details' }} />
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Pet Details' }} />
        <Ionicons name="alert-circle" size={60} color={theme.colors.error.main} />
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
          <Image source={{ uri: pet.image_url }} style={styles.petImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="paw" size={80} color={theme.colors.primary.light} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petType}>{pet.type}</Text>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
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
              color={activeTab === tab.name ? theme.colors.primary.main : theme.colors.text.secondary} 
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
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.lg,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  backButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
  header: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    marginLeft: theme.spacing.lg,
  },
  petName: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  petType: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  tabBarContent: {
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.main,
  },
  tabLabel: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  activeTabLabel: {
    color: theme.colors.primary.main,
    fontFamily: theme.typography.fontFamily.medium,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  tabContent: {
    flex: 1,
  },
  infoCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    width: 100,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    flex: 1,
  },
  notesContainer: {
    marginTop: theme.spacing.sm,
  },
  notesText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.paper,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  editButtonText: {
    color: theme.colors.primary.main,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: theme.spacing.xs,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  comingSoonTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  comingSoonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
