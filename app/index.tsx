import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, isSameDay } from 'date-fns';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

type QuickAction = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/AddEvent' | '/expenses' | '/shoppingList' | '/emergency' | '/calendar';
  color: string;
};

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate next 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch updated data here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Mock data for demonstration
  const upcomingEvents = [
    { id: '1', title: 'Vet Appointment', time: '2:30 PM', date: 'Today', category: 'Vet' },
    { id: '2', title: 'Grooming Session', time: '11:00 AM', date: 'Tomorrow', category: 'Grooming' }
  ];

  const recentExpenses = [
    { id: '1', description: 'Pet Food', amount: 45.99, date: 'Today' },
    { id: '2', description: 'Vet Visit', amount: 75.00, date: 'Yesterday' }
  ];

  const quickActions: QuickAction[] = [
    { id: '1', title: 'Add Event', icon: 'calendar-outline', route: '/AddEvent', color: '#4CAF50' },
    { id: '2', title: 'New Expense', icon: 'wallet-outline', route: '/expenses', color: '#2196F3' },
    { id: '3', title: 'Shopping List', icon: 'cart-outline', route: '/shoppingList', color: '#9C27B0' },
    { id: '4', title: 'Emergency', icon: 'alert-circle-outline', route: '/emergency', color: '#F44336' }
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Keep your pets happy and healthy</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="paw-outline" size={32} color="#00796b" />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              onPress={() => router.push(action.route)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Week View Calendar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <TouchableOpacity onPress={() => router.push('/calendar')}>
            <Text style={styles.seeAll}>Full Calendar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekContainer}
        >
          {weekDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const hasEvents = upcomingEvents.some(event => 
              event.date === (isSameDay(date, new Date()) ? 'Today' : 
                           isSameDay(date, addDays(new Date(), 1)) ? 'Tomorrow' : '')
            );

            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDayContainer
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.selectedDayText]}>
                  {format(date, 'd')}
                </Text>
                {hasEvents && <View style={styles.eventDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Recent Expenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => router.push('/expenses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentExpenses.map((expense) => (
          <TouchableOpacity
            key={expense.id}
            style={styles.expenseRow}
            onPress={() => router.push('/expenses')}
          >
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              <Text style={styles.expenseDate}>{expense.date}</Text>
            </View>
            <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#f0f7f6',
    marginBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  weekContainer: {
    paddingVertical: 8,
  },
  dayContainer: {
    width: 54,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDayContainer: {
    backgroundColor: '#00796b',
  },
  dayName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2d3436',
  },
  selectedDayText: {
    color: '#fff',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00796b',
    marginTop: 4,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00796b',
  },
});