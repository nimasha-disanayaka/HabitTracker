// src/navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';

import TabNavigator from './TabNavigator';
import AddHabitScreen from '../screens/AddHabitScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontWeight: '700',
          color: theme.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={({ route }) => ({
          title: route.params?.habit ? 'Edit Habit' : 'New Habit',
          headerShown: true,
          headerBackTitle: 'Cancel',
        })}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About HabitFlow',
          headerShown: true,
          headerBackTitle: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}
