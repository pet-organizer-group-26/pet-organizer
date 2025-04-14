import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Keyboard } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { DatePicker } from '../components/common/DatePicker';
import theme from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
  category: string;
  user_id?: string;
};

const categories = ['Food', 'Medical', 'Supplies', 'Grooming', 'Training', 'Other'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date(),
    category: 'Food'
  });
  const [errors, setErrors] = useState({
    description: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch expenses from Supabase
  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        Alert.alert('Error', 'Failed to load expenses');
      } else {
        // Transform date strings to Date objects for the UI
        const formattedExpenses = data?.map(expense => ({
          ...expense,
          date: new Date(expense.date)
        })) || [];
        
        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error('Error in fetchExpenses:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | undefined;
    
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        // Initial fetch
        await fetchExpenses();
        
        // Set up real-time subscription
        subscription = supabase
          .channel('expenses-channel-' + new Date().getTime())
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'expenses',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              // Add the new expense to the state
              const newExpense = payload.new as Expense;
              setExpenses(current => [
                { ...newExpense, date: new Date(newExpense.date as string) },
                ...current
              ]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'expenses',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              // Update the existing expense in the state
              const updatedExpense = payload.new as Expense;
              setExpenses(current => 
                current.map(exp => 
                  exp.id === updatedExpense.id 
                    ? { ...updatedExpense, date: new Date(updatedExpense.date as string) }
                    : exp
                )
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'expenses',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.old) {
              // Remove the deleted expense from the state
              const deletedExpense = payload.old as Expense;
              setExpenses(current => 
                current.filter(exp => exp.id !== deletedExpense.id)
              );
            }
          })
          .subscribe();
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchExpenses]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
      return () => {};
    }, [fetchExpenses])
  );

  const handleAddExpense = async () => {
    // Reset errors
    const newErrors = { description: '', amount: '' };
    let hasError = false;

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      hasError = true;
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
      hasError = true;
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add expenses');
        setIsSubmitting(false);
        return;
      }

      // Format the date for Supabase (YYYY-MM-DD)
      const dateString = formData.date.toISOString().split('T')[0];

      if (editingExpense) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update({
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: dateString,
            category: formData.category,
          })
          .eq('id', editingExpense.id);

        if (error) {
          console.error('Update expense error details:', JSON.stringify(error));
          throw error;
        }

        // Fallback update in case real-time update fails
        setExpenses(expenses.map(exp => 
          exp.id === editingExpense.id 
            ? {
                id: editingExpense.id,
                description: formData.description,
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                user_id: user.id
              } 
            : exp
        ));
        
        // Add success message for editing
        Alert.alert(
          'Success',
          'Expense updated successfully',
          [{ text: 'OK' }]
        );
      } else {
        // Add new expense
        const { data, error } = await supabase
          .from('expenses')
          .insert([{
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: dateString,
            category: formData.category,
            user_id: user.id
          }])
          .select();

        if (error) {
          console.error('Insert expense error details:', JSON.stringify(error));
          throw error;
        }

        // Fallback update in case real-time update fails
        if (data && data.length > 0) {
          const newExpense = {
            id: data[0].id,
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date,
            category: formData.category,
            user_id: user.id
          };
          
          setExpenses([newExpense, ...expenses]);
        }
        
        // Add success message for adding
        Alert.alert(
          'Success',
          'Expense added successfully',
          [{ text: 'OK' }]
        );
      }

      // Reset form and close modal
      setFormData({
        description: '',
        amount: '',
        date: new Date(),
        category: 'Food'
      });
      setErrors({ description: '', amount: '' });
      setEditingExpense(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: typeof expense.amount === 'number' 
        ? expense.amount.toString() 
        : String(expense.amount),
      date: expense.date instanceof Date ? expense.date : new Date(expense.date),
      category: expense.category
    });
    setErrors({ description: '', amount: '' });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);
              
              if (error) {
                throw error;
              }
              
              // Fallback deletion in case real-time update fails
              setExpenses(expenses.filter(exp => exp.id !== id));
              
              // Add success message for deleting
              Alert.alert(
                'Success',
                'Expense deleted successfully',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return 'fast-food-outline';
      case 'Medical': return 'medical-outline';
      case 'Supplies': return 'basket-outline';
      case 'Grooming': return 'cut-outline';
      case 'Training': return 'school-outline';
      default: return 'pricetag-outline';
    }
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <Card variant="floating" style={styles.expenseItem}>
      <TouchableOpacity 
        style={styles.expenseContent}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.expenseHeader}>
          <View style={styles.expenseDescriptionContainer}>
            <Ionicons name={getCategoryIcon(item.category)} size={20} color={theme.colors.primary.main} style={styles.categoryIcon} />
            <Text style={styles.expenseDescription}>{item.description}</Text>
          </View>
          <Text style={styles.expenseAmount}>${typeof item.amount === 'number' ? item.amount.toFixed(2) : Number(item.amount).toFixed(2)}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseDate}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />{' '}
            {item.date instanceof Date ? item.date.toLocaleDateString() : new Date(item.date).toLocaleDateString()}
          </Text>
          <View style={[styles.categoryTag, { backgroundColor: getBackgroundColor(item.category) }]}>
            <Text style={styles.expenseCategory}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const getBackgroundColor = (category: string) => {
    switch (category) {
      case 'Food': return `${theme.colors.success.light}80`;
      case 'Medical': return `${theme.colors.error.light}80`;
      case 'Supplies': return `${theme.colors.warning.light}80`;
      case 'Grooming': return `${theme.colors.primary.light}80`;
      case 'Training': return `${theme.colors.secondary.light}80`;
      default: return `${theme.colors.secondary.light}80`;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Expense Tracker</Text>
            <Button 
              title="Add Expense"
              variant="primary" 
              onPress={() => {
                setEditingExpense(null);
                setFormData({
                  description: '',
                  amount: '',
                  date: new Date(),
                  category: 'Food'
                });
                setErrors({ description: '', amount: '' });
                setModalVisible(true);
              }}
              style={styles.addButton}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={theme.colors.text.secondary} />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubText}>Your expenses will appear here</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </Text>

            <InputField
              label="Description"
              placeholder="What did you spend on?"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              error={errors.description}
              autoCapitalize="sentences"
            />

            <View style={styles.row}>
              <View style={styles.flex}>
                <InputField
                  label="Amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  keyboardType="decimal-pad"
                  error={errors.amount}
                  leftIcon={<Ionicons name="cash-outline" size={20} color={theme.colors.primary.main} />}
                  rightIcon={<TouchableOpacity onPress={() => Keyboard.dismiss()}>
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary.main} />
                  </TouchableOpacity>}
                />
              </View>
            </View>

            <Text style={styles.label}>Date</Text>
            <DatePicker
              value={formData.date}
              onChange={(date: Date) => setFormData({ ...formData, date })}
              style={styles.datePicker}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.selectedCategory,
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Ionicons
                    name={getCategoryIcon(category)}
                    size={16}
                    color={
                      formData.category === category
                        ? '#fff'
                        : theme.colors.primary.main
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? 'Saving...' : editingExpense ? 'Update' : 'Add Expense'}
                variant="primary"
                onPress={handleAddExpense}
                style={styles.submitButton}
                disabled={isSubmitting}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: 80,
    gap: theme.spacing.md,
  },
  expenseItem: {
    padding: theme.spacing.md,
    marginBottom: 0,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  expenseDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: theme.spacing.xs,
  },
  expenseDescription: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  expenseAmount: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary.main,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseDate: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  expenseCategory: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  addButton: {
    padding: theme.spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  datePicker: {
    marginBottom: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 20,
    backgroundColor: theme.colors.background.paper,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  selectedCategoryText: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.medium,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
    flexDirection: 'column',
  },
  submitButton: {
    width: '100%',
    height: 50,
  },
  cancelButton: {
    width: '100%',
    height: 50,
  },
  expenseContent: {
    flex: 1,
  },
});