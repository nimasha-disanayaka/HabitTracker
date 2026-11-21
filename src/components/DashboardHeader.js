// src/components/DashboardHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { formatDateHeader, getGreeting } from '../utils/dateUtils';

export default function DashboardHeader({
  stats,
  onPressStats,
  onPressNewHabit,
}) {
  const { theme, isDark, toggleTheme } = useTheme();
  const greeting = getGreeting();
  const dateFormatted = formatDateHeader();

  const total = stats.totalHabits || 0;
  const completed = stats.completedToday || 0;
  const percentage = stats.completionPercentage || 0;

  let motivation = 'Ready to start your streak? Check off your first habit!';
  if (total === 0) {
    motivation = 'Start your journey by adding your first habit below.';
  } else if (percentage === 100) {
    motivation = 'Perfection! All habits accomplished today! 🏆';
  } else if (percentage >= 50) {
    motivation = 'More than halfway there! Keep that momentum going! 🔥';
  } else if (percentage > 0) {
    motivation = 'Great progress today! Step by step to consistency. ✨';
  }

  return (
    <View style={styles.container}>
      {/* Top Greeting Row */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingTextContainer}>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {dateFormatted.toUpperCase()}
          </Text>
          <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>
            {greeting.text} {greeting.emoji}
          </Text>
        </View>

        {/* Quick Theme Switch button */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeToggleBtn,
            { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
          ]}
          accessibilityLabel="Toggle Dark/Light Mode"
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Hero Progress Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              Daily Progress
            </Text>
            <Text style={[styles.progressValue, { color: theme.textPrimary }]}>
              {completed} of {total} completed
            </Text>
          </View>
          <View
            style={[
              styles.percentageBadge,
              {
                backgroundColor: percentage === 100 ? theme.successSoft : theme.primarySoft,
                borderColor: percentage === 100 ? theme.success : theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.percentageText,
                { color: percentage === 100 ? (theme.isDark ? '#34D399' : '#059669') : theme.primary },
              ]}
            >
              {percentage}%
            </Text>
          </View>
        </View>

        {/* Progress Bar Track */}
        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceVariant }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                backgroundColor: percentage === 100 ? theme.success : theme.primary,
              },
            ]}
          />
        </View>

        {/* Motivation note */}
        <Text style={[styles.motivationText, { color: theme.textSecondary }]}>
          {motivation}
        </Text>

        {/* Mini stats highlights */}
        <View style={[styles.statsDivider, { backgroundColor: theme.borderLight }]} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Best Streak</Text>
            <Text style={[styles.statItemValue, { color: theme.textPrimary }]}>
              🔥 {stats.bestStreak || 0} {stats.bestStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={[styles.statVerticalDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statItemLabel, { color: theme.textMuted }]}>Total Check-ins</Text>
            <Text style={[styles.statItemValue, { color: theme.textPrimary }]}>
              ✓ {stats.totalCheckIns || 0}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  themeToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  motivationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  statsDivider: {
    height: 1,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statItemValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statVerticalDivider: {
    width: 1,
    height: 24,
  },
});
