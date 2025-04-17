import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import theme from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type MedicationType = {
  id: string;
  pet_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  reminder: boolean;
  reminder_time?: string;
  active: boolean;
};

type MedicationItemProps = {
  medication: MedicationType;
  onEdit: (medication: MedicationType) => void;
  onDelete: (id: string) => void;
};

export const MedicationItem: React.FC<MedicationItemProps> = ({
  medication,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const isOngoing = () => {
    return !medication.end_date || new Date(medication.end_date) > new Date();
  };

  return (
    <Card variant="layered" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{medication.name}</Text>
          {medication.active && (
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, isOngoing() ? styles.activeIndicator : styles.completedIndicator]} />
              <Text style={[styles.statusText, isOngoing() ? styles.activeText : styles.completedText]}>
                {isOngoing() ? 'Active' : 'Completed'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(medication)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(medication.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dosage:</Text>
          <Text style={styles.value}>{medication.dosage}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Frequency:</Text>
          <Text style={styles.value}>{medication.frequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Started:</Text>
          <Text style={styles.value}>{formatDate(medication.start_date)}</Text>
        </View>
        {medication.end_date && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ends:</Text>
            <Text style={styles.value}>{formatDate(medication.end_date)}</Text>
          </View>
        )}
        {medication.reminder && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Reminder:</Text>
            <Text style={styles.value}>
              {medication.reminder_time 
                ? `Daily at ${formatTime(medication.reminder_time)}` 
                : 'Enabled'}
            </Text>
          </View>
        )}
      </View>

      {medication.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesContent}>{medication.notes}</Text>
        </View>
      )}
    </Card>
  );
};

const createStyles = () => {
  const { colors } = useTheme();
  
  return StyleSheet.create({
    container: {
      marginVertical: 8,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 4,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    activeIndicator: {
      backgroundColor: colors.success.main,
    },
    completedIndicator: {
      backgroundColor: colors.text.disabled,
    },
    statusText: {
      fontSize: theme.typography.fontSize.sm,
    },
    activeText: {
      color: colors.success.main,
    },
    completedText: {
      color: colors.text.disabled,
    },
    actions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 6,
      marginLeft: 8,
    },
    infoSection: {
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      width: 85,
    },
    value: {
      fontSize: theme.typography.fontSize.sm,
      color: colors.text.primary,
      flex: 1,
    },
    notes: {
      backgroundColor: colors.background.paper,
      padding: 10,
      borderRadius: theme.borderRadius.sm,
      marginTop: 6,
    },
    notesLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 4,
    },
    notesContent: {
      fontSize: theme.typography.fontSize.sm,
      color: colors.text.primary,
    },
  });
}; 