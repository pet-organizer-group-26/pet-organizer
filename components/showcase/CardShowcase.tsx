import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../common/Card';
import theme from '../../constants/theme';

/**
 * CardShowcase Component
 * 
 * Demonstrates the different card shadow styles available in the application.
 * This component can be used for design system documentation and testing.
 */
export const CardShowcase = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Card Shadow Styles</Text>
      
      <View style={styles.cardRow}>
        <View style={styles.cardWrapper}>
          <Text style={styles.cardLabel}>Flat</Text>
          <Card variant="flat" style={styles.card}>
            <Text style={styles.cardTitle}>Flat Card</Text>
            <Text style={styles.cardText}>No shadow, just background color.</Text>
          </Card>
        </View>
        
        <View style={styles.cardWrapper}>
          <Text style={styles.cardLabel}>Outlined</Text>
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.cardTitle}>Outlined Card</Text>
            <Text style={styles.cardText}>Border only, no shadow.</Text>
          </Card>
        </View>
      </View>
      
      <View style={styles.cardRow}>
        <View style={styles.cardWrapper}>
          <Text style={styles.cardLabel}>Elevated (Default)</Text>
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Elevated Card</Text>
            <Text style={styles.cardText}>Standard elevation shadow.</Text>
          </Card>
        </View>
        
        <View style={styles.cardWrapper}>
          <Text style={styles.cardLabel}>Layered</Text>
          <Card variant="layered" style={styles.card}>
            <Text style={styles.cardTitle}>Layered Card</Text>
            <Text style={styles.cardText}>Enhanced depth with layered shadow.</Text>
          </Card>
        </View>
      </View>
      
      <View style={styles.cardWrapper}>
        <Text style={styles.cardLabel}>Floating</Text>
        <Card variant="floating" style={styles.card}>
          <Text style={styles.cardTitle}>Floating Card</Text>
          <Text style={styles.cardText}>Prominent shadow with lift effect for important elements.</Text>
        </Card>
      </View>
      
      <Text style={styles.note}>
        Each card style has platform-specific optimizations for iOS and Android to ensure
        consistent visual depth across devices.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: theme.spacing.lg,
  },
  cardLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  card: {
    minHeight: 100,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  note: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
}); 