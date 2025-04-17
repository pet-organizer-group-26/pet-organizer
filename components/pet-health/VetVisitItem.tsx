import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import theme from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type VetVisitType = {
  id: string;
  pet_id: string;
  date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  follow_up_date?: string;
  reminder: boolean;
  reminder_date?: string;
  notes?: string;
  cost?: number;
};

type VetVisitItemProps = {
  vetVisit: VetVisitType;
  onEdit: (vetVisit: VetVisitType) => void;
  onDelete: (id: string) => void;
};

export const VetVisitItem: React.FC<VetVisitItemProps> = ({
  vetVisit,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  const hasFollowUp = () => {
    return !!vetVisit.follow_up_date;
  };

  const isFollowUpDue = () => {
    if (!vetVisit.follow_up_date) return false;
    const today = new Date();
    const followUpDate = new Date(vetVisit.follow_up_date);
    return today >= followUpDate;
  };

  return (
    <Card variant="layered" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{vetVisit.reason}</Text>
          <Text style={styles.date}>{formatDate(vetVisit.date)}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(vetVisit)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(vetVisit.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        {vetVisit.diagnosis && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Diagnosis:</Text>
            <Text style={styles.value}>{vetVisit.diagnosis}</Text>
          </View>
        )}
        {vetVisit.treatment && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Treatment:</Text>
            <Text style={styles.value}>{vetVisit.treatment}</Text>
          </View>
        )}
        {vetVisit.cost !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cost:</Text>
            <Text style={styles.value}>{formatCurrency(vetVisit.cost)}</Text>
          </View>
        )}
        {vetVisit.follow_up_date && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Follow-up:</Text>
            <Text style={[
              styles.value,
              isFollowUpDue() && styles.followUpDue
            ]}>
              {formatDate(vetVisit.follow_up_date)}
              {isFollowUpDue() && ' (Due)'}
            </Text>
          </View>
        )}
        {vetVisit.reminder && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Reminder:</Text>
            <Text style={styles.value}>
              {vetVisit.reminder_date 
                ? `Set for ${formatDate(vetVisit.reminder_date)}` 
                : 'Enabled'}
            </Text>
          </View>
        )}
      </View>

      {vetVisit.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesContent}>{vetVisit.notes}</Text>
        </View>
      )}

      {hasFollowUp() && (
        <View style={styles.followUpContainer}>
          <Ionicons 
            name="calendar" 
            size={16} 
            color={isFollowUpDue() ? colors.error.main : colors.primary.main} 
          />
          <Text style={[
            styles.followUpText,
            isFollowUpDue() && styles.followUpDue
          ]}>
            {isFollowUpDue() 
              ? 'Follow-up visit is due' 
              : 'Upcoming follow-up visit scheduled'}
          </Text>
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
    },
    date: {
      fontSize: theme.typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: 2,
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
    followUpDue: {
      color: colors.error.main,
      fontWeight: '600',
    },
    notes: {
      backgroundColor: colors.background.paper,
      padding: 10,
      borderRadius: theme.borderRadius.sm,
      marginTop: 6,
      marginBottom: 10,
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
    followUpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: colors.background.paper,
      borderRadius: theme.borderRadius.sm,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary.main,
    },
    followUpText: {
      fontSize: theme.typography.fontSize.sm,
      color: colors.text.primary,
      marginLeft: 8,
    },
  });
}; 