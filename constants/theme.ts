import { Platform } from 'react-native';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Light theme colors
export const lightColors = {
  primary: {
    main: '#00796b',
    light: '#00a99e',
    dark: '#004c40',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f50057',
    light: '#ff4081',
    dark: '#bb002f',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    dark: '#121212',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  divider: '#e0e0e0',
};

// Dark theme colors
export const darkColors = {
  primary: {
    main: '#00a99e',
    light: '#4ebaaa',
    dark: '#00796b',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff4081',
    light: '#ff79b0',
    dark: '#c60055',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    dark: '#0a0a0a',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    disabled: '#666666',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  divider: '#333333',
};

export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 1.5,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 3.0,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6.0,
    },
    android: {
      elevation: 8,
    },
  }),
  layered: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.5,
    },
    android: {
      elevation: 6,
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 5.0,
    },
    android: {
      elevation: 10,
    },
  }),
};

export const zIndex = {
  modal: 1000,
  overlay: 900,
  drawer: 800,
  header: 700,
  tooltip: 600,
  dropdown: 500,
};

// Default theme is light theme
export const colors = lightColors;

export default {
  colors,
  lightColors,
  darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
}; 