import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ThemeMode } from '../constants/theme';

// Define the context type
type ThemeContextType = {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof lightColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeMode: 'system',
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
  isDarkMode: false,
});

// Storage key for persisting theme preference
const THEME_MODE_STORAGE_KEY = '@theme_mode';

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // Initialize state
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Load saved theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Update theme whenever themeMode or system theme changes
  useEffect(() => {
    let newTheme: 'light' | 'dark';
    
    if (themeMode === 'system') {
      newTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
    } else {
      newTheme = themeMode;
    }
    
    setTheme(newTheme);
  }, [themeMode, systemColorScheme]);
  
  // Save theme preference when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newThemeMode = theme === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
  };
  
  // Determine if dark mode is active
  const isDarkMode = theme === 'dark';
  
  // Get theme colors
  const colors = isDarkMode ? darkColors : lightColors;
  
  // Context value
  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    colors,
    toggleTheme,
    setThemeMode,
    isDarkMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme
export const useTheme = () => useContext(ThemeContext); 