import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

type QuickAction = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/AddEvent' | '/expenses' | '/shoppingList' | '/emergency' | '/calendar';
  color: string;
};

// Event type definition to match database schema
type Event = {
  id: string;
  title: string;
  event_date: string; // format: "YYYY-MM-DD"
  event_time: string; // format: "HH:MM"
  category: string;
  location?: string;
  repeat?: string;
};

// Expense type definition for Supabase
type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string; // format: "YYYY-MM-DD"
  category: string;
  user_id: string;
};

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manualRefresh, setManualRefresh] = useState(0);

  // Generate next 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Format events for display
  const upcomingEvents = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const tomorrow = addDays(new Date(), 1).toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    return events
      .filter(event => {
        // Only show events for today and tomorrow in the upcoming list
        return event.event_date === today || event.event_date === tomorrow;
      })
      .map(event => {
        // Format the time
        const [hours, minutes] = event.event_time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const time = `${hour12}:${minutes} ${ampm}`;
        
        // Format the date label
        const dateLabel = event.event_date === today ? 'Today' : 'Tomorrow';
        
        return {
          id: event.id,
          title: event.title,
          time: time,
          date: dateLabel,
          category: event.category
        };
      })
      .sort((a, b) => {
        // First sort by date (Today comes before Tomorrow)
        if (a.date !== b.date) {
          return a.date === 'Today' ? -1 : 1;
        }
        // Then sort by time
        return a.time.localeCompare(b.time);
      })
      .slice(0, 3); // Only show up to 3 upcoming events
  }, [events]);

  // Format expenses for display
  const recentExpenses = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const yesterday = addDays(new Date(), -1).toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    return expenses
      .sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 3) // Only show up to 3 recent expenses
      .map(expense => {
        // Format the date label
        let dateLabel;
        if (expense.date === today) {
          dateLabel = 'Today';
        } else if (expense.date === yesterday) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = new Date(expense.date).toLocaleDateString();
        }
        
        return {
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: dateLabel,
          category: expense.category
        };
      });
  }, [expenses]);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setIsLoading(false);
        return;
      }

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);
      
      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        setEvents(eventsData || []);
      }

      // Fetch expenses (if expenses table exists)
      try {
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
        } else {
          setExpenses(expensesData || []);
        }
      } catch (error) {
        console.error('Failed to fetch expenses, the table might not exist yet:', error);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    let eventSubscription: ReturnType<typeof supabase.channel> | undefined;
    let expenseSubscription: ReturnType<typeof supabase.channel> | undefined;
    
    const setupSubscriptions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        // First fetch initial data
        await fetchData();
        
        // Set up events subscription
        eventSubscription = supabase
          .channel('home-events-channel-' + new Date().getTime())
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME EVENT INSERT RECEIVED:', payload);
            if (payload.new) {
              setEvents(current => [...current, payload.new as Event]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME EVENT UPDATE RECEIVED:', payload);
            if (payload.new) {
              setEvents(current => 
                current.map(evt => evt.id === (payload.new as Event).id ? (payload.new as Event) : evt)
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'events',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            console.log('REAL-TIME EVENT DELETE RECEIVED:', payload);
            if (payload.old) {
              setEvents(current => 
                current.filter(evt => evt.id !== (payload.old as Event).id)
              );
            }
          })
          .subscribe(status => {
            console.log('Real-time events subscription status:', status);
          });

        // Set up expenses subscription
        try {
          expenseSubscription = supabase
            .channel('home-expenses-channel-' + new Date().getTime())
            .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'expenses',
              filter: `user_id=eq.${user.id}`
            }, payload => {
              console.log('REAL-TIME EXPENSE INSERT RECEIVED:', payload);
              if (payload.new) {
                setExpenses(current => [payload.new as Expense, ...current]);
              }
            })
            .on('postgres_changes', { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'expenses',
              filter: `user_id=eq.${user.id}`
            }, payload => {
              console.log('REAL-TIME EXPENSE UPDATE RECEIVED:', payload);
              if (payload.new) {
                setExpenses(current => 
                  current.map(exp => exp.id === (payload.new as Expense).id ? (payload.new as Expense) : exp)
                );
              }
            })
            .on('postgres_changes', { 
              event: 'DELETE', 
              schema: 'public', 
              table: 'expenses',
              filter: `user_id=eq.${user.id}`
            }, payload => {
              console.log('REAL-TIME EXPENSE DELETE RECEIVED:', payload);
              if (payload.old) {
                setExpenses(current => 
                  current.filter(exp => exp.id !== (payload.old as Expense).id)
                );
              }
            })
            .subscribe(status => {
              console.log('Real-time expenses subscription status:', status);
            });
        } catch (error) {
          console.error('Error setting up expenses subscription, table might not exist:', error);
        }
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up subscriptions');
      if (eventSubscription) {
        supabase.removeChannel(eventSubscription);
      }
      if (expenseSubscription) {
        supabase.removeChannel(expenseSubscription);
      }
    };
  }, [manualRefresh]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {};
    }, [fetchData])
  );

  // Implement pull-to-refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => {
      setRefreshing(false);
    });
  }, [fetchData]);

  // Check if a date has events
  const hasEventsOnDate = useCallback((date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // format to YYYY-MM-DD
    return events.some(event => {
      // For "Forever" repeat events, check if the date is after the start date
      if (event.repeat === 'Forever') {
        const eventDate = new Date(event.event_date);
        return date >= eventDate;
      }
      // Otherwise, just check if the date matches
      return event.event_date === dateStr;
    });
  }, [events]);

  // Quick actions configuration (unchanged)
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
            const hasEvents = hasEventsOnDate(date);

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

      {/* Upcoming Events for selected date */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/calendar')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => router.push('/calendar')}
            >
              <View style={styles.eventContent}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time} · {event.date}</Text>
                </View>
                <View style={styles.eventCategoryContainer}>
                  <Text style={styles.eventCategory}>{event.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming events</Text>
          </View>
        )}
      </View>

      {/* Recent Expenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => router.push('/expenses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense) => (
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
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent expenses</Text>
          </View>
        )}
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
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  weekContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  dayContainer: {
    width: 54,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedDayContainer: {
    backgroundColor: '#00796b',
  },
  dayName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  selectedDayText: {
    color: '#fff',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f44336',
    marginTop: 6,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    padding: 16,
  },
  eventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  eventCategoryContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e0f2f1',
    borderRadius: 12,
  },
  eventCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00796b',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 13,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  }
});