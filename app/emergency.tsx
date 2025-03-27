import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';

type Contact = {
  id: string;
  name: string;
  phone: string;
  type: string; // e.g., 'Vet', 'Pet Sitter', 'Emergency Contact'
  notes?: string;
};

const contactTypes = ['Vet', 'Pet Sitter', 'Emergency Contact', 'Family', 'Friend', 'Other'];

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Metro Animal Hospital',
      phone: '(555) 123-4567',
      type: 'Vet',
      notes: '24/7 Emergency Services'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '(555) 987-6543',
      type: 'Pet Sitter',
      notes: 'Available weekends'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Omit<Contact, 'id'>>({
    name: '',
    phone: '',
    type: 'Vet',
    notes: ''
  });

  const handleAddContact = () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    if (editingContact) {
      setContacts(contacts.map(contact =>
        contact.id === editingContact.id
          ? { ...formData, id: contact.id }
          : contact
      ));
    } else {
      setContacts([...contacts, { ...formData, id: Date.now().toString() }]);
    }

    setModalVisible(false);
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      type: 'Vet',
      notes: ''
    });
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      type: contact.type,
      notes: contact.notes || ''
    });
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
          onPress: () => setContacts(contacts.filter(contact => contact.id !== id))
        }
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity 
        style={styles.contactContent}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactType}>{item.type}</Text>
        </View>
        <Text style={styles.contactPhone}>{item.phone}</Text>
        {item.notes && <Text style={styles.contactNotes}>{item.notes}</Text>}
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => handleCall(item.phone)}
      >
        <Ionicons name="call-outline" size={20} color="#fff" />
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <View style={styles.typeContainer}>
        {contactTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              formData.type === type && styles.selectedType,
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

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Notes (optional)"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No emergency contacts yet</Text>
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
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
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
        }}
        type="form"
        size="medium"
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        actions={[
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
            },
            variant: 'secondary'
          },
          {
            label: editingContact ? 'Save' : 'Add',
            onPress: handleAddContact,
            variant: 'primary'
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
    backgroundColor: '#fff',
    padding: 16,
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactContent: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactType: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  contactNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796b',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  callButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    marginRight: 8,
  },
  selectedType: {
    backgroundColor: '#00796b',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeText: {
    color: '#fff',
  },
});