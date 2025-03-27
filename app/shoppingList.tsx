import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ModalSystem from './components/ModalSystem';

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

  const handleAddItem = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ));
    } else {
      setItems([...items, { 
        ...formData, 
        id: Date.now().toString(),
        completed: false 
      }]);
    }

    setModalVisible(false);
    setEditingItem(null);
    setFormData({
      name: '',
      quantity: '',
      category: 'Food'
    });
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      category: item.category
    });
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
          onPress: () => setItems(items.filter(item => item.id !== id))
        }
      ]
    );
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => toggleComplete(item.id)}
      >
        <Ionicons 
          name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={item.completed ? "#00796b" : "#666"}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.itemContent}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item.id)}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, item.completed && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
        </View>
        {item.quantity && (
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantity (optional)"
        value={formData.quantity}
        onChangeText={(text) => setFormData({ ...formData, quantity: text })}
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
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Your shopping list is empty</Text>
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
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
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
        }}
        type="form"
        size="small"
        title={editingItem ? 'Edit Item' : 'Add Item'}
        actions={[
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
            },
            variant: 'secondary'
          },
          {
            label: editingItem ? 'Save' : 'Add',
            onPress: handleAddItem,
            variant: 'primary'
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
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 14,
    color: '#00796b',
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#00796b',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});