// src/components/FloatingActionButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function FloatingActionButton({ onPress, label = 'Add Habit' }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Ensure button is safely placed above bottom navigation bar and Android navigation area
  const bottomOffset = Math.max(insets.bottom, 16) + 70;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fab,
        {
          backgroundColor: theme.primary,
          bottom: bottomOffset,
          shadowColor: theme.primary,
        },
      ]}
      activeOpacity={0.85}
      accessibilityLabel="Add New Habit"
      accessibilityRole="button"
    >
      <Ionicons name="add" size={24} color="#FFFFFF" style={styles.fabIcon} />
      <Text style={styles.fabText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 28,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    zIndex: 999,
  },
  fabIcon: {
    marginRight: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
