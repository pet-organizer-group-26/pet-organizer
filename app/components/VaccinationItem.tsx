import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type VaccinationProps = {
  id: string;
  name: string;
  date: string;
  expiration_date?: string;
  administered_by?: string;
  lot_number?: string;
  notes?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const VaccinationItem = ({
  id,
  name,
  date,
  expiration_date,
  administered_by,
  lot_number,
  notes,
  onEdit,
  onDelete,
}: VaccinationProps) => {
  const formattedDate = date ? format(new Date(date), 'MMM d, yyyy') : 'Unknown date';
  const formattedExpirationDate = expiration_date ? format(new Date(expiration_date), 'MMM d, yyyy') : null;
  
  const isExpired = expiration_date ? new Date(expiration_date) < new Date() : false;
  const expiresIn30Days = expiration_date ? 
    (new Date(expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 30 &&
    new Date(expiration_date) >= new Date() : false;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(id)} style={styles.actionButton}>
            <Ionicons name="pencil" size={18} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{formattedDate}</Text>
      </View>
      
      {formattedExpirationDate && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Expires:</Text>
          <Text style={[
            styles.value, 
            isExpired && styles.expired,
            expiresIn30Days && styles.expiringSoon
          ]}>
            {formattedExpirationDate}
            {isExpired && ' (Expired)'}
            {expiresIn30Days && !isExpired && ' (Soon)'}
          </Text>
        </View>
      )}
      
      {administered_by && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Administered by:</Text>
          <Text style={styles.value}>{administered_by}</Text>
        </View>
      )}
      
      {lot_number && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Lot #:</Text>
          <Text style={styles.value}>{lot_number}</Text>
        </View>
      )}
      
      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 110,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  expired: {
    color: '#e53935',
    fontWeight: '500',
  },
  expiringSoon: {
    color: '#ff9800',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
});

export default VaccinationItem; 