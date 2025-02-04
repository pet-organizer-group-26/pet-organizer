// app/_layout.js
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#6200EE',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="pets"
        options={{
          title: 'Pets',
          drawerIcon: ({ color, size }) => <Ionicons name="paw-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
