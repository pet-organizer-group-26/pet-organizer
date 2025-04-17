import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import theme from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export type AllergyType = {
  id: string;
  pet_id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction?: string;
  diagnosed_date?: string;
  notes?: string;
};

type AllergyItemProps = {
  allergy: AllergyType;
  onEdit: (allergy: AllergyType) => void;
  onDelete: (id: string) => void;
};

export const AllergyItem: React.FC<AllergyItemProps> = ({
  allergy,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild':
        return colors.success.main;
      case 'Moderate':
        return colors.warning.main;
      case 'Severe':
        return colors.error.main;
      default:
        return colors.text.disabled;
    }
  };

  return (
    <Card variant="layered" style={[
      styles.container, 
      { borderLeftColor: getSeverityColor(allergy.severity) }
    ]}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.title}>{allergy.name}</Text>
          <View style={[
            styles.severityIndicator, 
            { backgroundColor: getSeverityColor(allergy.severity) }
          ]}>
            <Text style={styles.severityText}>{allergy.severity}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(allergy)}
          >
            <Ionicons name="pencil" size={18} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(allergy.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>

      {allergy.reaction && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Reaction:</Text>
          <Text style={styles.value}>{allergy.reaction}</Text>
        </View>
      )}

      {allergy.diagnosed_date && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Diagnosed:</Text>
          <Text style={styles.value}>{formatDate(allergy.diagnosed_date)}</Text>
        </View>
      )}

      {allergy.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesContent}>{allergy.notes}</Text>
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
      borderLeftWidth: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      flexWrap: 'wrap',
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: colors.text.primary,
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
      padding: 6,
      marginLeft: 8,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      width: 100,
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