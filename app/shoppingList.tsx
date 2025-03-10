import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';


interface Item {
  title: string;
  content: string;
}

export default function ShoppingList() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const addItem = () => {
    if (!title && !content) return;
    setItems((prevItems) => [...prevItems, { title, content }]);
    setTitle('');
    setContent('');
    setModalVisible(false);
  };

  const removeItem = (index: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setItems((prevItems) => prevItems.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const updateItem = (index: number, key: keyof Item, value: string) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      if (newItems[index]) {
        newItems[index][key] = value;
      }
      return newItems;
    });
  };

  const renderItem = ({ item, index }: { item: Item; index: number }) => (
    <View style={styles.itemContainer}>
      <TextInput
        style={styles.itemTitle}
        value={item.title}
        onChangeText={(text) => updateItem(index, 'title', text)}
        placeholder="Title"
      />
      <View style={styles.separator} />
      <TextInput
        style={styles.itemContent}
        value={item.content}
        onChangeText={(text) => updateItem(index, 'content', text)}
        placeholder="Content"
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(index)}>
        <Ionicons name="remove-circle" size={24} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.header}>SpitzNotes</Text>
      <FlatList
        data={items}
        keyExtractor={(item: Item, index: number) => index.toString()}
        renderItem={renderItem}
      />
      <TouchableOpacity style={styles.plusButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={70} color="#00796b" />
      </TouchableOpacity>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder=""
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
  },
  contentInput: {
    height: 100, // Increase the height of the content input
    textAlignVertical: 'top', // Align text to the top
  },
  addButton: {
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'column',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    position: 'relative',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: -10,
  },
  itemContent: {
    fontSize: 16,
    marginBottom: -5,
    textAlignVertical: 'top', // Align text to the top
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 17,
    right: 10,
  },
  plusButton: {
    position: 'absolute',
    bottom: 25,
    right: '50%',
    transform: [{ translateX: 20 },],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});