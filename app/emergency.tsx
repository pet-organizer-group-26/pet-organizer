import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Linking, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import theme from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Contact = {
  id: string;
  name: string;
  phone: string;
  type: string; // e.g., 'Vet', 'Pet Sitter', 'Emergency Contact'
  notes?: string;
  user_id?: string;
  created_at?: string;
};

const contactTypes = ['Vet', 'Pet Sitter', 'Emergency Contact', 'Family', 'Friend', 'Other'];

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Omit<Contact, 'id' | 'user_id' | 'created_at'>>({
    name: '',
    phone: '',
    type: 'Vet',
    notes: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch contacts from Supabase
  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching contacts:', error);
        Alert.alert('Error', 'Failed to load emergency contacts');
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading contacts');
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
        await fetchContacts();
        
        // Set up real-time subscription
        subscription = supabase
          .channel('emergency-contacts-channel-' + new Date().getTime())
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'emergency_contacts',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              setContacts(current => [payload.new as Contact, ...current]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'emergency_contacts',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              setContacts(current => 
                current.map(contact => 
                  contact.id === (payload.new as Contact).id ? (payload.new as Contact) : contact
                )
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'emergency_contacts',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.old) {
              setContacts(current => 
                current.filter(contact => contact.id !== (payload.old as Contact).id)
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
  }, [fetchContacts]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
      return () => {};
    }, [fetchContacts])
  );

  const handleAddContact = async () => {
    // Reset errors
    const newErrors = { name: '', phone: '' };
    let hasError = false;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      hasError = true;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add contacts');
        setIsSubmitting(false);
        return;
      }

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: formData.name,
            phone: formData.phone,
            type: formData.type,
            notes: formData.notes
          })
          .eq('id', editingContact.id);

        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Contact updated successfully',
          [{ text: 'OK' }]
        );
      } else {
        // Add new contact
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            name: formData.name,
            phone: formData.phone,
            type: formData.type,
            notes: formData.notes,
            user_id: user.id
          });

        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Contact added successfully',
          [{ text: 'OK' }]
        );
      }

      setModalVisible(false);
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        type: 'Vet',
        notes: ''
      });
      setErrors({ name: '', phone: '' });
    } catch (error: any) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', error.message || 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      type: contact.type,
      notes: contact.notes || ''
    });
    setErrors({ name: '', phone: '' });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('emergency_contacts')
                .delete()
                .eq('id', id);
              
              if (error) throw error;
              
              Alert.alert(
                'Success',
                'Contact deleted successfully',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', error.message || 'Failed to delete contact');
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vet': return theme.colors.error.light;
      case 'Pet Sitter': return theme.colors.success.light;
      case 'Emergency Contact': return theme.colors.warning.light;
      case 'Family': return theme.colors.secondary.light;
      case 'Friend': return theme.colors.primary.light;
      default: return theme.colors.primary.light;
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <Card variant="layered" style={styles.contactItem as ViewStyle}>
      <TouchableOpacity 
        style={styles.contactContent as ViewStyle}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.contactHeader as ViewStyle}>
          <Text style={styles.contactName as TextStyle}>{item.name}</Text>
          <View style={[styles.typeTag as ViewStyle, { backgroundColor: `${getTypeColor(item.type)}30` }]}>
            <Text style={[styles.contactType as TextStyle, { color: theme.colors.text.primary }]}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.contactRow as ViewStyle}>
          <Ionicons name="call-outline" size={16} color={theme.colors.text.secondary} style={styles.contactIcon as TextStyle} />
          <Text style={styles.contactPhone as TextStyle}>{item.phone}</Text>
        </View>
        {item.notes && (
          <View style={styles.contactRow as ViewStyle}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} style={styles.contactIcon as TextStyle} />
            <Text style={styles.contactNotes as TextStyle}>{item.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Button
        title="Call"
        onPress={() => handleCall(item.phone)}
        variant="primary"
        size="small"
        leftIcon={<Ionicons name="call-outline" size={16} color="white" />}
        style={styles.callButton as ViewStyle}
      />
    </Card>
  );

  const renderModalContent = () => (
    <View>
      <InputField
        label="Name"
        placeholder="Contact name"
        value={formData.name}
        onChangeText={(text) => {
          setFormData({ ...formData, name: text });
          if (text.trim()) setErrors({ ...errors, name: '' });
        }}
        error={errors.name}
        leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.primary.main} />}
      />

      <InputField
        label="Phone Number"
        placeholder="(555) 123-4567"
        value={formData.phone}
        onChangeText={(text) => {
          setFormData({ ...formData, phone: text });
          if (text.trim()) setErrors({ ...errors, phone: '' });
        }}
        keyboardType="phone-pad"
        error={errors.phone}
        leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.primary.main} />}
      />

      <Text style={styles.inputLabel as TextStyle}>Contact Type</Text>
      <View style={styles.typeContainer as ViewStyle}>
        {contactTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton as ViewStyle,
              formData.type === type && (styles.selectedType as ViewStyle),
            ]}
            onPress={() => setFormData({ ...formData, type })}
          >
            <Text
              style={[
                styles.typeButtonText as TextStyle,
                formData.type === type && (styles.selectedTypeText as TextStyle),
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <InputField
        label="Notes (Optional)"
        placeholder="Add any additional information"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        multiline
        numberOfLines={3}
        leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />}
      />
    </View>
  );

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.title as TextStyle}>Emergency Contacts</Text>
        <TouchableOpacity
          style={styles.addButton as ViewStyle}
          onPress={() => {
            setEditingContact(null);
            setFormData({
              name: '',
              phone: '',
              type: 'Vet',
              notes: ''
            });
            setErrors({ name: '', phone: '' });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer as ViewStyle}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText as TextStyle}>Loading contacts...</Text>
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer as ViewStyle}>
          <Ionicons name="call-outline" size={80} color={theme.colors.text.secondary} />
          <Text style={styles.emptyText as TextStyle}>No emergency contacts</Text>
          <Text style={styles.emptySubText as TextStyle}>Add contacts for quick access during emergencies</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent as ViewStyle}
        />
      )}

      <ModalSystem
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingContact(null);
          setFormData({
            name: '',
            phone: '',
            type: 'Vet',
            notes: ''
          });
          setErrors({ name: '', phone: '' });
        }}
        title={editingContact ? "Edit Contact" : "Add Contact"}
        actions={[
          {
            label: isSubmitting ? "Saving..." : "Save",
            onPress: handleAddContact,
            variant: "primary"
          },
          {
            label: "Cancel",
            onPress: () => {
              setModalVisible(false);
              setEditingContact(null);
              setFormData({
                name: '',
                phone: '',
                type: 'Vet',
                notes: ''
              });
              setErrors({ name: '', phone: '' });
            },
            variant: "secondary"
          },
        ]}
      >
        {renderModalContent()}
      </ModalSystem>
    </View>
  );
}

// Define style types to fix type errors
type Styles = {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  emptySubText: TextStyle;
  listContent: ViewStyle;
  addButton: ViewStyle;
  contactItem: ViewStyle;
  contactContent: ViewStyle;
  contactHeader: ViewStyle;
  contactName: TextStyle;
  typeTag: ViewStyle;
  contactType: TextStyle;
  contactRow: ViewStyle;
  contactIcon: TextStyle;
  contactPhone: TextStyle;
  contactNotes: TextStyle;
  callButton: ViewStyle;
  inputLabel: TextStyle;
  typeContainer: ViewStyle;
  typeButton: ViewStyle;
  selectedType: ViewStyle;
  typeButtonText: TextStyle;
  selectedTypeText: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  contactContent: {
    marginBottom: theme.spacing.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  contactName: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  typeTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  contactType: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactPhone: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  contactNotes: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  callButton: {
    marginTop: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background.default,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  selectedType: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  typeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  selectedTypeText: {
    color: 'white',
  },
});