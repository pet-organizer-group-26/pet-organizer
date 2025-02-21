import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff', shadowColor: 'transparent' },
        headerTintColor: '#00796b',
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Ionicons name="paw" size={24} color="#00796b" style={styles.headerIcon} />
            <Text style={styles.headerText}>FeedMi</Text>
          </View>
        ),
        drawerActiveTintColor: '#00796b',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* Visible Screens */}
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="pets"
        options={{
          title: 'Pets',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Screen (Style Hack) */}
      <Drawer.Screen
        name="AddEvent"
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
          // Optionally hide icon as well:
          drawerIcon: () => null,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
    letterSpacing: 1.2,
  },
});