import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type VetVisitProps = {
  id: string;
  date: string;
  reason: string;
  vet_name?: string;
  clinic_name?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  follow_up_date?: string;
  notes?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const VetVisitItem = ({
  id,
  date,
  reason,
  vet_name,
  clinic_name,
  diagnosis,
  treatment,
  cost,
  follow_up_date,
  notes,
  onEdit,
  onDelete,
}: VetVisitProps) => {
  const formattedDate = date ? format(new Date(date), 'MMM d, yyyy') : 'Unknown date';
  const formattedFollowUpDate = follow_up_date ? format(new Date(follow_up_date), 'MMM d, yyyy') : null;
  const formattedCost = cost ? `$${cost.toFixed(2)}` : null;
  
  const needsFollowUp = follow_up_date && new Date(follow_up_date) > new Date();
  const followUpSoon = follow_up_date && 
    (new Date(follow_up_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7 &&
    new Date(follow_up_date) > new Date();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateReasonContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.reason}>{reason}</Text>
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
      
      {(vet_name || clinic_name) && (
        <View style={styles.vetInfo}>
          {vet_name && <Text style={styles.vetInfoText}>{vet_name}</Text>}
          {clinic_name && <Text style={styles.vetInfoText}>{vet_name ? ` at ${clinic_name}` : clinic_name}</Text>}
        </View>
      )}
      
      {diagnosis && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Diagnosis:</Text>
          <Text style={styles.value}>{diagnosis}</Text>
        </View>
      )}
      
      {treatment && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Treatment:</Text>
          <Text style={styles.value}>{treatment}</Text>
        </View>
      )}
      
      {formattedCost && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cost:</Text>
          <Text style={styles.value}>{formattedCost}</Text>
        </View>
      )}
      
      {formattedFollowUpDate && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Follow-up:</Text>
          <View style={styles.followUpContainer}>
            <Text style={[
              styles.value, 
              followUpSoon && styles.followUpSoon
            ]}>
              {formattedFollowUpDate}
            </Text>
            {needsFollowUp && (
              <View style={[
                styles.followUpIndicator,
                followUpSoon && styles.followUpSoonIndicator
              ]}>
                <Text style={styles.followUpText}>
                  {followUpSoon ? 'Soon' : 'Scheduled'}
                </Text>
              </View>
            )}
          </View>
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateReasonContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reason: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  vetInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vetInfoText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 90,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  followUpContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUpIndicator: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  followUpSoonIndicator: {
    backgroundColor: '#ff9800',
  },
  followUpText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  followUpSoon: {
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

export default VetVisitItem; 