// src/components/EmptyState.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function EmptyState({
  isFiltered = false,
  categoryName = '',
  onPressAdd,
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.primarySoft, borderColor: theme.borderHighlight },
        ]}
      >
        <Ionicons
          name={isFiltered ? 'filter-circle-outline' : 'sparkles-outline'}
          size={48}
          color={theme.primary}
        />
      </View>

      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {isFiltered ? `No ${categoryName} Habits Yet` : 'Build Habits, Create Flow'}
      </Text>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {isFiltered
          ? `You don't have any habits in this category. Tap below to add one or switch to 'All'.`
          : 'Consistent small daily choices create massive life transformations. Add your first habit today!'}
      </Text>

      {onPressAdd && (
        <TouchableOpacity
          onPress={onPressAdd}
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>
            {isFiltered ? `Add ${categoryName} Habit` : 'Create Your First Habit'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
