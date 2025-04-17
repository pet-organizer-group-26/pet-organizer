import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { Button } from '../components/common/Button';
import theme from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

type Item = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
};

const categories = ['Food', 'Supplies', 'Medicine', 'Toys', 'Other'];

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Omit<Item, 'id' | 'completed' | 'user_id' | 'created_at'>>({
    name: '',
    quantity: '',
    category: 'Food'
  });
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch items from Supabase
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shopping items:', error);
        Alert.alert('Error', 'Failed to load shopping list');
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error in fetchItems:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading shopping list');
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
        await fetchItems();
        
        // Set up real-time subscription
        subscription = supabase
          .channel('shopping-items-channel-' + new Date().getTime())
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'shopping_items',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              setItems(current => [payload.new as Item, ...current]);
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'shopping_items',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.new) {
              setItems(current => 
                current.map(item => 
                  item.id === (payload.new as Item).id ? (payload.new as Item) : item
                )
              );
            }
          })
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'shopping_items',
            filter: `user_id=eq.${user.id}`
          }, payload => {
            if (payload.old) {
              setItems(current => 
                current.filter(item => item.id !== (payload.old as Item).id)
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
  }, [fetchItems]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchItems();
      return () => {};
    }, [fetchItems])
  );

  const handleAddItem = async () => {
    if (!formData.name.trim()) {
      setNameError('Item name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add items');
        setIsSubmitting(false);
        return;
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('shopping_items')
          .update({
            name: formData.name,
            quantity: formData.quantity,
            category: formData.category
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Item updated successfully',
          [{ text: 'OK' }]
        );
      } else {
        // Add new item
        const { error } = await supabase
          .from('shopping_items')
          .insert({
            name: formData.name,
            quantity: formData.quantity,
            category: formData.category,
            completed: false,
            user_id: user.id
          });

        if (error) throw error;
        
        Alert.alert(
          'Success',
          'Item added successfully',
          [{ text: 'OK' }]
        );
      }

      setModalVisible(false);
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: '',
        category: 'Food'
      });
      setNameError('');
    } catch (error: any) {
      console.error('Error saving item:', error);
      Alert.alert('Error', error.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      category: item.category
    });
    setNameError('');
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('shopping_items')
                .delete()
                .eq('id', id);
              
              if (error) throw error;
              
              Alert.alert(
                'Success',
                'Item deleted successfully',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', error.message || 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ completed: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error toggling item completion:', error);
      Alert.alert('Error', error.message || 'Failed to update item status');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return 'fast-food-outline';
      case 'Supplies': return 'basket-outline';
      case 'Medicine': return 'medkit-outline';
      case 'Toys': return 'happy-outline';
      default: return 'pricetag-outline';
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <Card variant="layered" style={styles.itemContainer}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleComplete(item.id, item.completed)}
      >
        <Ionicons 
          name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={item.completed ? theme.colors.success.main : theme.colors.text.secondary} 
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.itemContent}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemNameContainer}>
            <Text style={[styles.itemName, item.completed && styles.completedText]}>
              {item.name}
            </Text>
            {item.quantity && (
              <Text style={styles.itemQuantity}>
                <Ionicons name="layers-outline" size={14} color={theme.colors.text.secondary} />{' '}
                Qty: {item.quantity}
              </Text>
            )}
          </View>
          
          <View style={[styles.categoryTag, { backgroundColor: `${theme.colors.primary.light}30` }]}>
            <Ionicons name={getCategoryIcon(item.category)} size={14} color={theme.colors.primary.main} style={{ marginRight: 4 }} />
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderModalContent = () => (
    <View>
      <InputField
        label="Item Name"
        placeholder="Enter item name"
        value={formData.name}
        onChangeText={(text) => {
          setFormData({ ...formData, name: text });
          if (text.trim()) setNameError('');
        }}
        error={nameError}
        leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.primary.main} />}
      />

      <InputField
        label="Quantity (optional)"
        placeholder="Enter quantity"
        value={formData.quantity}
        onChangeText={(text) => setFormData({ ...formData, quantity: text })}
        leftIcon={<Ionicons name="layers-outline" size={20} color={theme.colors.primary.main} />}
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
              style={{ marginRight: 4 }}
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
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              quantity: '',
              category: 'Food'
            });
            setNameError('');
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={80} color={theme.colors.text.secondary} />
          <Text style={styles.emptyText}>Your shopping list is empty</Text>
          <Text style={styles.emptySubText}>Add items to get started</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ModalSystem
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
          setFormData({
            name: '',
            quantity: '',
            category: 'Food'
          });
          setNameError('');
        }}
        title={editingItem ? "Edit Item" : "Add Item"}
        actions={[
          {
            label: isSubmitting ? "Saving..." : "Save",
            onPress: handleAddItem,
            variant: "primary"
          },
          {
            label: "Cancel",
            onPress: () => {
              setModalVisible(false);
              setEditingItem(null);
              setFormData({
                name: '',
                quantity: '',
                category: 'Food'
              });
              setNameError('');
            },
            variant: "secondary"
          },
        ]}
      >
        {renderModalContent()}
      </ModalSystem>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary.main,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
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
  listContent: {
    paddingBottom: 80,
    gap: theme.spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  checkbox: {
    marginRight: theme.spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemNameContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  itemCategory: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary.main,
  },
  itemQuantity: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.disabled,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.background.paper,
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
});