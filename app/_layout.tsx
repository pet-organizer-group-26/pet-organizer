import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { app } from '../constants/firebaseConfig';

// Define which screens don't require authentication
const publicScreens = ['login', 'signup'];

// Define visible screens
const visibleScreens = ['index', 'calendar', 'pets', 'shoppingList'];

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const auth = getAuth(app);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check guest status
    AsyncStorage.getItem('isGuest').then(value => {
      setIsGuest(value === 'true');
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentScreen = segments[segments.length - 1];

      if (!user && !isGuest && !publicScreens.includes(currentScreen)) {
        // Redirect to login if user is not authenticated and not a guest
        router.replace('/login');
      } else if ((user || isGuest) && publicScreens.includes(currentScreen)) {
        // Redirect to home if user is authenticated or is a guest
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [segments, isGuest]);

  const handleLogout = async () => {
    try {
      if (isGuest) {
        // Clear guest status
        await AsyncStorage.removeItem('isGuest');
        setIsGuest(false);
      } else {
        // Sign out from Firebase
        await signOut(auth);
      }
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const CustomDrawerContent = (props: any) => {
    return (
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props}>
          {props.state.routeNames
            .filter((name: string) => visibleScreens.includes(name))
            .map((name: string) => {
              const isFocused = props.state.routes[props.state.index].name === name;
              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.drawerItem,
                    isFocused && styles.drawerItemFocused,
                  ]}
                  onPress={() => props.navigation.navigate(name)}
                >
                  <Ionicons
                    name={getIconName(name)}
                    size={24}
                    color={isFocused ? '#00796b' : '#666'}
                  />
                  <Text
                    style={[
                      styles.drawerLabel,
                      isFocused && styles.drawerLabelFocused,
                    ]}
                  >
                    {getScreenTitle(name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </DrawerContentScrollView>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={styles.logoutText}>
            {isGuest ? 'Exit Guest Mode' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getIconName = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'home-outline';
      case 'calendar':
        return 'calendar-outline';
      case 'pets':
        return 'paw-outline';
      case 'shoppingList':
        return 'cart-outline';
      default:
        return 'list-outline';
    }
  };

  const getScreenTitle = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'calendar':
        return 'Calendar';
      case 'pets':
        return 'Pets';
      case 'shoppingList':
        return 'Shopping List';
      default:
        return routeName;
    }
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
      <Drawer.Screen
        name="shoppingList"
        options={{
          title: 'Shopping List',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Screens */}
      <Drawer.Screen
        name="AddEvent"
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
          drawerIcon: () => null,
        }}
      />
      <Drawer.Screen
        name="login"
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
          drawerIcon: () => null,
          headerShown: false, // Hide header for login screen
        }}
      />
      <Drawer.Screen
        name="signup"
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
          drawerIcon: () => null,
          headerShown: false, // Hide header for signup screen
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
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  drawerItemFocused: {
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
  },
  drawerLabel: {
    marginLeft: 16,
    fontSize: 16,
    color: '#666',
  },
  drawerLabelFocused: {
    color: '#00796b',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '500',
  },
});