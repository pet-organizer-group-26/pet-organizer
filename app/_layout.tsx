import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Define which screens don't require authentication
const publicScreens = ['login', 'signup'];

// Define visible screens
const visibleScreens = ['index', 'calendar', 'pets', 'shoppingList', 'expenses', 'emergency', 'settings'];

// App layout with ThemeProvider wrapper
export default function AppRoot() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

// Main layout with theme-aware styling
function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { colors, isDarkMode } = useTheme();

  // Update styles based on theme
  const styles = createStyles(colors);

  useEffect(() => {
    // Check guest status
    AsyncStorage.getItem('isGuest').then(value => {
      setIsGuest(value === 'true');
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      const currentScreen = segments[segments.length - 1];

      if (!session?.user && !isGuest && !publicScreens.includes(currentScreen)) {
        // Redirect to login if user is not authenticated and not a guest
        router.replace('/login');
      } else if ((session?.user || isGuest) && publicScreens.includes(currentScreen)) {
        // Redirect to home if user is authenticated or is a guest
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [segments, isGuest]);

  const handleLogout = async () => {
    try {
      if (isGuest) {
        // Clear guest status
        await AsyncStorage.removeItem('isGuest');
        setIsGuest(false);
      } else {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      // Redirect to login
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const CustomDrawerContent = (props: any) => {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.default }}>
        <DrawerContentScrollView 
          {...props} 
          style={{ backgroundColor: colors.background.default }}
        >
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
                    color={isFocused ? colors.primary.main : colors.text.secondary}
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
      case 'expenses':
        return 'wallet-outline';
      case 'emergency':
        return 'alert-circle-outline';
      case 'settings':
        return 'settings-outline';
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
      case 'expenses':
        return 'Expenses';
      case 'emergency':
        return 'Emergency';
      case 'settings':
        return 'Settings';
      default:
        return routeName;
    }
  };

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { 
          backgroundColor: colors.background.default, 
          shadowColor: 'transparent' 
        },
        headerTintColor: colors.primary.main,
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Ionicons name="paw" size={24} color={colors.primary.main} style={styles.headerIcon} />
            <Text style={styles.headerText}>FeedMi</Text>
          </View>
        ),
        drawerActiveTintColor: colors.primary.main,
        drawerInactiveTintColor: colors.text.secondary,
        drawerStyle: {
          backgroundColor: colors.background.default,
        },
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
      <Drawer.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
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
        }}
      />
      <Drawer.Screen
        name="signup"
        options={{
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
          drawerIcon: () => null,
        }}
      />
    </Drawer>
  );
}

// Create styles as a function to use dynamic theme colors
const createStyles = (colors: any) => StyleSheet.create({
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 2,
  },
  drawerItemFocused: {
    backgroundColor: colors.primary.light + '20', // 20% opacity
  },
  drawerLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: colors.text.primary,
  },
  drawerLabelFocused: {
    color: colors.primary.main,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#ff4444',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
});