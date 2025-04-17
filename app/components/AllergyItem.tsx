import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type AllergyProps = {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction?: string;
  diagnosed_date?: string;
  notes?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const AllergyItem = ({
  id,
  name,
  severity,
  reaction,
  diagnosed_date,
  notes,
  onEdit,
  onDelete,
}: AllergyProps) => {
  const formattedDate = diagnosed_date 
    ? format(new Date(diagnosed_date), 'MMM d, yyyy') 
    : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild':
        return '#4caf50';
      case 'Moderate':
        return '#ff9800';
      case 'Severe':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <View style={[
      styles.container, 
      { borderLeftColor: getSeverityColor(severity) }
    ]}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={[
            styles.severityIndicator, 
            { backgroundColor: getSeverityColor(severity) }
          ]}>
            <Text style={styles.severityText}>{severity}</Text>
          </View>
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

      {reaction && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Reaction:</Text>
          <Text style={styles.value}>{reaction}</Text>
        </View>
      )}

      {formattedDate && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Diagnosed:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
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
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  severityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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

export default AllergyItem; 