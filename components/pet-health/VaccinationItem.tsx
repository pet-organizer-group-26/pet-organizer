import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import theme from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type VaccinationType = {
  id: string;
  pet_id: string;
  name: string;
  date: string;
  expiration_date?: string;
  notes?: string;
  reminder: boolean;
  reminder_date?: string;
};

type VaccinationItemProps = {
  vaccination: VaccinationType;
  onEdit: (vaccination: VaccinationType) => void;
  onDelete: (id: string) => void;
};

export const VaccinationItem: React.FC<VaccinationItemProps> = ({
  vaccination,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = () => {
    if (!vaccination.expiration_date) return false;
    const today = new Date();
    const expirationDate = new Date(vaccination.expiration_date);
    return today > expirationDate;
  };

  const isExpiringSoon = () => {
    if (!vaccination.expiration_date) return false;
    const today = new Date();
    const expirationDate = new Date(vaccination.expiration_date);
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 30 && daysDiff > 0;
  };

  return (
    <Card variant="layered" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{vaccination.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(vaccination)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(vaccination.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(vaccination.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Expiration:</Text>
          <Text style={[
            styles.value,
            isExpired() && styles.expired,
            isExpiringSoon() && styles.expiringSoon
          ]}>
            {formatDate(vaccination.expiration_date)}
            {isExpired() && ' (EXPIRED)'}
            {isExpiringSoon() && ' (Expiring soon)'}
          </Text>
        </View>
        {vaccination.reminder && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Reminder:</Text>
            <Text style={styles.value}>
              {vaccination.reminder_date 
                ? `Set for ${formatDate(vaccination.reminder_date)}` 
                : 'Enabled'}
            </Text>
          </View>
        )}
      </View>

      {vaccination.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesContent}>{vaccination.notes}</Text>
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
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: colors.text.primary,
      flex: 1,
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
    expired: {
      color: colors.error.main,
      fontWeight: '600',
    },
    expiringSoon: {
      color: colors.warning.main,
      fontWeight: '600',
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