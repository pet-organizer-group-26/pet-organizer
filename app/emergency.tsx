import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import theme from '../constants/theme';

type Contact = {
  id: string;
  name: string;
  phone: string;
  type: string; // e.g., 'Vet', 'Pet Sitter', 'Emergency Contact'
  notes?: string;
};

const contactTypes = ['Vet', 'Pet Sitter', 'Emergency Contact', 'Family', 'Friend', 'Other'];

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Omit<Contact, 'id'>>({
    name: '',
    phone: '',
    type: 'Vet',
    notes: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: ''
  });

  const handleAddContact = () => {
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

    if (editingContact) {
      setContacts(contacts.map(contact =>
        contact.id === editingContact.id
          ? { ...formData, id: contact.id }
          : contact
      ));
      
      // Add success message for editing
      Alert.alert(
        'Success',
        'Contact updated successfully',
        [{ text: 'OK' }]
      );
    } else {
      setContacts([...contacts, { ...formData, id: Date.now().toString() }]);
      
      // Add success message for adding
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
          onPress: () => {
            setContacts(contacts.filter(contact => contact.id !== id));
            
            // Add success message for deleting
            Alert.alert(
              'Success',
              'Contact deleted successfully',
              [{ text: 'OK' }]
            );
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
    <Card variant="layered" style={styles.contactItem}>
      <TouchableOpacity 
        style={styles.contactContent}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <View style={[styles.typeTag, { backgroundColor: `${getTypeColor(item.type)}30` }]}>
            <Text style={[styles.contactType, { color: theme.colors.text.primary }]}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={16} color={theme.colors.text.secondary} style={styles.contactIcon} />
          <Text style={styles.contactPhone}>{item.phone}</Text>
        </View>
        {item.notes && (
          <View style={styles.contactRow}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.secondary} style={styles.contactIcon} />
            <Text style={styles.contactNotes}>{item.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Button
        title="Call"
        onPress={() => handleCall(item.phone)}
        variant="primary"
        size="small"
        leftIcon={<Ionicons name="call-outline" size={16} color="white" />}
        style={styles.callButton}
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

      <Text style={styles.inputLabel}>Contact Type</Text>
      <View style={styles.typeContainer}>
        {contactTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              formData.type === type && styles.selectedType,
              formData.type === type && { backgroundColor: theme.colors.primary.main },
            ]}
            onPress={() => setFormData({ ...formData, type })}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === type && styles.selectedTypeText,
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <InputField
        label="Notes (optional)"
        placeholder="Additional information"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        multiline
        numberOfLines={3}
        inputStyle={styles.notesInput}
        leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color={theme.colors.primary.light} />
            <Text style={styles.emptyText}>No emergency contacts yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first contact
            </Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
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
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

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
        type="form"
        size="medium"
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        actions={[
          {
            label: editingContact ? 'Save' : 'Add',
            onPress: handleAddContact,
            variant: 'primary'
          },
          {
            label: 'Cancel',
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
            variant: 'secondary'
          }
        ]}
      >
        {renderModalContent()}
      </ModalSystem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: 80,
    gap: theme.spacing.md,
  },
  contactItem: {
    padding: theme.spacing.md,
    marginBottom: 0,
  },
  contactContent: {
    marginBottom: theme.spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  contactName: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  contactType: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  contactIcon: {
    marginRight: theme.spacing.xs,
  },
  contactPhone: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  contactNotes: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  callButton: {
    alignSelf: 'flex-start',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  selectedType: {
    borderColor: theme.colors.primary.main,
  },
  typeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  selectedTypeText: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.medium,
  },
});