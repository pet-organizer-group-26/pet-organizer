import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type MedicationProps = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribed_by?: string;
  notes?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const MedicationItem = ({
  id,
  name,
  dosage,
  frequency,
  start_date,
  end_date,
  prescribed_by,
  notes,
  onEdit,
  onDelete,
}: MedicationProps) => {
  const formattedStartDate = start_date ? format(new Date(start_date), 'MMM d, yyyy') : 'Unknown';
  const formattedEndDate = end_date ? format(new Date(end_date), 'MMM d, yyyy') : null;
  
  const isActive = !end_date || new Date(end_date) >= new Date();
  const endsSoon = end_date ? 
    (new Date(end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 &&
    new Date(end_date) >= new Date() : false;

  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          {isActive && <View style={styles.activeIndicator} />}
        </View>
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
        <Text style={styles.label}>Dosage:</Text>
        <Text style={styles.value}>{dosage}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Frequency:</Text>
        <Text style={styles.value}>{frequency}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Start Date:</Text>
        <Text style={styles.value}>{formattedStartDate}</Text>
      </View>
      
      {formattedEndDate && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>End Date:</Text>
          <Text style={[
            styles.value, 
            endsSoon && styles.endingSoon
          ]}>
            {formattedEndDate}
            {endsSoon && ' (Ending soon)'}
          </Text>
        </View>
      )}
      
      {prescribed_by && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Prescribed by:</Text>
          <Text style={styles.value}>{prescribed_by}</Text>
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
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  inactiveContainer: {
    borderLeftColor: '#bdbdbd',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
    marginLeft: 8,
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
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  endingSoon: {
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

export default MedicationItem; 