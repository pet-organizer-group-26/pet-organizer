import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, themeMode, setThemeMode, isDarkMode } = useTheme();
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Create styles with the dynamic theme colors
  const styles = createStyles(colors);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Check if user is in guest mode
      const isGuest = await AsyncStorage.getItem('isGuest');
      
      if (isGuest === 'true') {
        // Clear guest status
        await AsyncStorage.removeItem('isGuest');
      } else {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'There was an error logging out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Here you would implement the account deletion
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              router.replace('/login');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleToggleNotifications = () => {
    setAreNotificationsEnabled(!areNotificationsEnabled);
    // In a real app, you would also persist this setting and update notification settings
  };

  // For now, we'll just alert that this feature is coming soon
  const handleResetPassword = () => {
    Alert.alert('Coming Soon', 'Password reset feature will be available in a future update.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={30} color={colors.primary.main} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleResetPassword}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.primary.main} />
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingInfo}>
            <Ionicons name="log-out-outline" size={24} color={colors.error.main} />
            <Text style={[styles.settingText, { color: colors.error.main }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.themeSection}>
          <Text style={styles.themeTitle}>Theme Mode</Text>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              themeMode === 'light' && styles.selectedThemeOption
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Ionicons 
              name="sunny-outline" 
              size={22} 
              color={themeMode === 'light' ? '#fff' : colors.text.primary} 
            />
            <Text style={[
              styles.themeOptionText,
              themeMode === 'light' && styles.selectedThemeOptionText
            ]}>
              Light
            </Text>
            {themeMode === 'light' && (
              <Ionicons name="checkmark" size={18} color="#fff" style={styles.checkmark} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              themeMode === 'dark' && styles.selectedThemeOption
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Ionicons 
              name="moon-outline" 
              size={22} 
              color={themeMode === 'dark' ? '#fff' : colors.text.primary} 
            />
            <Text style={[
              styles.themeOptionText,
              themeMode === 'dark' && styles.selectedThemeOptionText
            ]}>
              Dark
            </Text>
            {themeMode === 'dark' && (
              <Ionicons name="checkmark" size={18} color="#fff" style={styles.checkmark} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.themeOption, 
              themeMode === 'system' && styles.selectedThemeOption
            ]}
            onPress={() => setThemeMode('system')}
          >
            <Ionicons 
              name="phone-portrait-outline" 
              size={22} 
              color={themeMode === 'system' ? '#fff' : colors.text.primary} 
            />
            <Text style={[
              styles.themeOptionText,
              themeMode === 'system' && styles.selectedThemeOptionText
            ]}>
              System Default
            </Text>
            {themeMode === 'system' && (
              <Ionicons name="checkmark" size={18} color="#fff" style={styles.checkmark} />
            )}
          </TouchableOpacity>
          
          <Text style={styles.themeDescription}>
            {themeMode === 'system' 
              ? 'Follows your device settings'
              : themeMode === 'dark'
                ? 'Uses dark theme throughout the app'
                : 'Uses light theme throughout the app'
            }
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary.main} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: "#ccc", true: colors.primary.light }}
            thumbColor={areNotificationsEnabled ? colors.primary.main : "#f4f3f4"}
            ios_backgroundColor="#ccc"
            onValueChange={handleToggleNotifications}
            value={areNotificationsEnabled}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="help-circle-outline" size={24} color={colors.primary.main} />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary.main} />
            <Text style={styles.settingText}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </Card>

      <Card style={{...styles.dangerSection, borderColor: colors.error.light}}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <Button 
          variant="outline"
          title="Delete Account" 
          onPress={handleDeleteAccount}
          loading={isLoading}
          style={{...styles.deleteButton, borderColor: colors.error.main}}
          textStyle={{ color: colors.error.main }}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FeedMi v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

// Dynamic styles based on theme
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 10,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.background.paper,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  dangerSection: {
    marginBottom: 16,
    padding: 16,
    borderColor: colors.error.light,
    backgroundColor: colors.background.paper,
  },
  deleteButton: {
    borderColor: colors.error.main,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  themeSection: {
    marginVertical: 8,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  selectedThemeOption: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  themeOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  selectedThemeOptionText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: 8,
  },
  themeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
    fontStyle: 'italic',
  },
}); 