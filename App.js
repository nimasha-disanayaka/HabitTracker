// App.js - Entry point for HabitFlow
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initNotifications } from './src/services/notificationService';
import { reconcileAllHabitReminders } from './src/storage/habitStorage';

function NavigationWrapper() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // 1. Configure Android notification channel & foreground handler
    initNotifications();
    // 2. Reconcile habit reminders with system scheduler to restore after app restart
    reconcileAllHabitReminders();
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={theme.background}
      />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationWrapper />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
