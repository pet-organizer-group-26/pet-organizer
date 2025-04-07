import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Keyboard } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import DatePicker from '../components/common/DatePicker';
import theme from '../constants/theme';

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
};

const categories = ['Food', 'Medical', 'Supplies', 'Grooming', 'Training', 'Other'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Pet Food - Premium Kibble',
      amount: 45.99,
      date: new Date('2024-01-15'),
      category: 'Food'
    },
    {
      id: '2',
      description: 'Vet Checkup',
      amount: 75.00,
      date: new Date('2024-01-10'),
      category: 'Medical'
    }
  ]);

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

  const handleAddExpense = () => {
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

    const newExpense = {
      id: editingExpense ? editingExpense.id : Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category
    };

    if (editingExpense) {
      // Update existing expense
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id ? newExpense : exp
      ));
      
      // Add success message for editing
      Alert.alert(
        'Success',
        'Expense updated successfully',
        [{ text: 'OK' }]
      );
    } else {
      // Add new expense
      setExpenses([newExpense, ...expenses]);
      
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
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
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
          onPress: () => {
            setExpenses(expenses.filter(exp => exp.id !== id));
            
            // Add success message for deleting
            Alert.alert(
              'Success',
              'Expense deleted successfully',
              [{ text: 'OK' }]
            );
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
          <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseDate}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />{' '}
            {item.date.toLocaleDateString()}
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
      <Text style={styles.title}>Expense Tracker</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color={theme.colors.primary.light} />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first expense
            </Text>
          </View>
        )}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
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
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </Text>

            <InputField
              label="Description"
              placeholder="What did you purchase?"
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                if (text.trim()) setErrors({ ...errors, description: '' });
              }}
              error={errors.description}
              leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />}
            />

            <InputField
              label="Amount"
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(text) => {
                setFormData({ ...formData, amount: text });
                if (text.trim() && !isNaN(parseFloat(text))) {
                  setErrors({ ...errors, amount: '' });
                }
              }}
              keyboardType="decimal-pad"
              error={errors.amount}
              leftIcon={<Ionicons name="cash-outline" size={20} color={theme.colors.primary.main} />}
              rightIcon={
                <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary.main} />
                </TouchableOpacity>
              }
            />

            <DatePicker
              label="Expense Date"
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              displayFormat="medium"
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
              maxDate={new Date()}
            />

            <Text style={styles.inputLabel}>Category</Text>
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
                    color={formData.category === category ? 'white' : theme.colors.text.secondary} 
                    style={styles.categoryButtonIcon}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.selectedCategoryText,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title={editingExpense ? 'Save' : 'Add Expense'}
                onPress={handleAddExpense}
                variant="primary"
                size="medium"
                style={styles.actionButton}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setEditingExpense(null);
                  setErrors({ description: '', amount: '' });
                }}
                variant="outline"
                size="medium"
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
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
  emptyState: {
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
  emptySubtext: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
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
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
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
  categoryButtonIcon: {
    marginRight: theme.spacing.xs,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  selectedCategoryText: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.medium,
  },
  modalButtons: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
    flexDirection: 'column',
  },
  actionButton: {
    width: '100%',
    height: 50,
  },
  expenseContent: {
    flex: 1,
  },
});