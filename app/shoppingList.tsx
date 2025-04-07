import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';
import { Card } from '../components/common/Card';
import { InputField } from '../components/common/InputField';
import { Button } from '../components/common/Button';
import theme from '../constants/theme';

type Item = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
};

const categories = ['Food', 'Supplies', 'Medicine', 'Toys', 'Other'];

export default function ShoppingList() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Omit<Item, 'id' | 'completed'>>({
    name: '',
    quantity: '',
    category: 'Food'
  });
  const [nameError, setNameError] = useState('');

  const handleAddItem = () => {
    if (!formData.name.trim()) {
      setNameError('Item name is required');
      return;
    }

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ));
      
      Alert.alert(
        'Success',
        'Item updated successfully',
        [{ text: 'OK' }]
      );
    } else {
      setItems([...items, { 
        ...formData, 
        id: Date.now().toString(),
        completed: false 
      }]);
      
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
          onPress: () => {
            setItems(items.filter(item => item.id !== id));
            
            Alert.alert(
              'Success',
              'Item deleted successfully',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
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
        onPress={() => toggleComplete(item.id)}
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
      <Text style={styles.header}>Shopping List</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={60} color={theme.colors.primary.light} />
            <Text style={styles.emptyText}>Your shopping list is empty</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add items to your shopping list
            </Text>
          </View>
        )}
      />
      
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
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      
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
        type="form"
        size="small"
        title={editingItem ? 'Edit Item' : 'Add Item'}
        actions={[
          {
            label: editingItem ? 'Save' : 'Add',
            onPress: handleAddItem,
            variant: 'primary'
          },
          {
            label: 'Cancel',
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
            variant: 'secondary'
          }
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
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
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
  addButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});