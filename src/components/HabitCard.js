// src/components/HabitCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { calculateStreaks } from '../utils/streakUtils';
import { getLocalDateString } from '../utils/dateUtils';

export default function HabitCard({
  habit,
  targetDate = getLocalDateString(),
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  const { theme } = useTheme();
  const dates = habit.datesCompleted || [];
  const isCompleted = dates.includes(targetDate);
  const { currentStreak, longestStreak } = calculateStreaks(dates);

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(habit.id, targetDate);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete(habit.id);
          },
        },
      ]
    );
  };

  const habitColor = habit.color || theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isCompleted ? theme.border : theme.border,
          shadowColor: theme.cardShadow,
        },
      ]}
    >
      {/* Left accent color strip */}
      <View style={[styles.colorStrip, { backgroundColor: habitColor }]} />

      {/* Main interactive check button */}
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          styles.checkbox,
          {
            borderColor: isCompleted ? habitColor : theme.border,
            backgroundColor: isCompleted ? habitColor : 'transparent',
          },
        ]}
        activeOpacity={0.7}
        accessibilityLabel={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
        accessibilityRole="checkbox"
      >
        {isCompleted && (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Center content */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Text style={styles.iconText}>{habit.icon || '⭐'}</Text>
          <Text
            style={[
              styles.title,
              {
                color: isCompleted ? theme.textMuted : theme.textPrimary,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
        </View>

        {/* Badges: Category, Streak & Reminder */}
        <View style={styles.badgesRow}>
          {habit.category && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
              </Text>
            </View>
          )}

          {/* Streak indicator */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: currentStreak > 0 ? theme.warningSoft : theme.surfaceVariant,
                borderColor: currentStreak > 0 ? theme.warning : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: currentStreak > 0 ? (theme.isDark ? '#FBBF24' : '#D97706') : theme.textMuted,
                  fontWeight: currentStreak > 0 ? '700' : '500',
                },
              ]}
            >
              🔥 {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>

          {/* Reminder time if configured */}
          {habit.reminderTime && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.primarySoft, borderColor: theme.borderHighlight },
              ]}
            >
              <Ionicons name="time-outline" size={11} color={theme.primary} style={{ marginRight: 2 }} />
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {habit.reminderTime}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action buttons (Edit & Delete) */}
      <View style={styles.actionsContainer}>
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(habit)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={`Edit ${habit.name}`}
          >
            <Ionicons name="pencil-outline" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleDelete}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={`Delete ${habit.name}`}
        >
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  colorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconText: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  iconButton: {
    padding: 6,
  },
});
