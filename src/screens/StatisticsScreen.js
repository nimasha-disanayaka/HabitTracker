// src/screens/StatisticsScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getHabits } from '../storage/habitStorage';
import { calculateDashboardStats, calculateHabitStats } from '../utils/streakUtils';
import { getLocalDateString } from '../utils/dateUtils';

export default function StatisticsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [habits, setHabits] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (e) {
      console.error('Failed to load stats data', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  const todayStr = useMemo(() => getLocalDateString(), []);
  const stats = useMemo(() => calculateDashboardStats(habits, todayStr), [habits, todayStr]);

  // Overall completion rate (all-time or 7-day average)
  const averageWeeklyRate = useMemo(() => {
    if (!stats.weeklyChartData || stats.weeklyChartData.length === 0) return 0;
    const sum = stats.weeklyChartData.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / stats.weeklyChartData.length);
  }, [stats]);

  // Ranked habits
  const rankedHabits = useMemo(() => {
    return habits
      .map((h) => ({
        ...h,
        stats: calculateHabitStats(h, todayStr),
      }))
      .sort((a, b) => {
        // Sort by current streak descending, then total completions
        if (b.stats.currentStreak !== a.stats.currentStreak) {
          return b.stats.currentStreak - a.stats.currentStreak;
        }
        return b.stats.totalCompletions - a.stats.totalCompletions;
      });
  }, [habits, todayStr]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
            PERFORMANCE & INSIGHTS
          </Text>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
            Statistics
          </Text>
        </View>

        {/* 2x2 Overview Metric Cards */}
        <View style={styles.metricsGrid}>
          {/* 1. Total Habits */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="checkbox-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {stats.totalHabits}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Active Habits
            </Text>
          </View>

          {/* 2. Completion Rate */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: theme.successSoft }]}>
              <Ionicons name="trending-up-outline" size={20} color={theme.success} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {averageWeeklyRate}%
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              7-Day Average
            </Text>
          </View>

          {/* 3. Best Streak */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: theme.warningSoft }]}>
              <Ionicons name="flame-outline" size={20} color={theme.warning} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {stats.bestStreak}d
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Longest Streak
            </Text>
          </View>

          {/* 4. Total Check-ins */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: theme.infoSoft }]}>
              <Ionicons name="checkmark-done-outline" size={20} color={theme.info} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
              {stats.totalCheckIns}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              Total Check-ins
            </Text>
          </View>
        </View>

        {/* Weekly Completion Bar Chart */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>
                Weekly Consistency
              </Text>
              <Text style={[styles.chartSubtitle, { color: theme.textSecondary }]}>
                Daily completion % over the last 7 days
              </Text>
            </View>
            <View
              style={[
                styles.chartBadge,
                { backgroundColor: theme.primarySoft, borderColor: theme.borderHighlight },
              ]}
            >
              <Text style={[styles.chartBadgeText, { color: theme.primary }]}>Last 7 Days</Text>
            </View>
          </View>

          {/* Bar Chart Container */}
          <View style={styles.barsContainer}>
            {stats.weeklyChartData.map((item, idx) => {
              const isFull = item.percentage === 100;
              const barHeightPct = Math.max(item.percentage, 6); // Min 6% height for visibility

              return (
                <View key={idx} style={styles.barColumn}>
                  {/* Percentage label */}
                  <Text style={[styles.barPctText, { color: theme.textMuted }]}>
                    {item.percentage}%
                  </Text>

                  {/* Bar Track */}
                  <View style={[styles.barTrack, { backgroundColor: theme.surfaceVariant }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: isFull
                            ? theme.success
                            : item.percentage > 0
                            ? theme.primary
                            : theme.surfaceMuted,
                        },
                      ]}
                    />
                  </View>

                  {/* Day Label & Date */}
                  <Text
                    style={[
                      styles.barDayText,
                      {
                        color: item.isToday ? theme.primary : theme.textPrimary,
                        fontWeight: item.isToday ? '800' : '600',
                      },
                    ]}
                  >
                    {item.dayLabel}
                  </Text>
                  <Text style={[styles.barDateText, { color: theme.textMuted }]}>
                    {item.dayNumber}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Habits Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Habit Consistency Leaderboard
          </Text>

          {rankedHabits.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No habit activity yet. Check off habits to see your stats!
              </Text>
            </View>
          ) : (
            rankedHabits.map((item, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.leaderboardCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      shadowColor: theme.cardShadow,
                    },
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{medal}</Text>
                  </View>

                  <View
                    style={[
                      styles.habitIconCircle,
                      { backgroundColor: item.color || theme.primary },
                    ]}
                  >
                    <Text style={styles.habitIconText}>{item.icon || '⭐'}</Text>
                  </View>

                  <View style={styles.habitInfo}>
                    <Text
                      style={[styles.habitName, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.habitCategory, { color: theme.textMuted }]}>
                      {item.category?.toUpperCase() || 'HEALTH'} • {item.stats.totalCompletions} checks
                    </Text>
                  </View>

                  <View style={styles.habitStreaks}>
                    <Text
                      style={[
                        styles.streakValue,
                        { color: item.stats.currentStreak > 0 ? (theme.isDark ? '#FBBF24' : '#D97706') : theme.textMuted },
                      ]}
                    >
                      🔥 {item.stats.currentStreak}d
                    </Text>
                    <Text style={[styles.streakSub, { color: theme.textMuted }]}>
                      Best: {item.stats.longestStreak}d
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chartBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  chartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barPctText: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 12,
  },
  barDateText: {
    fontSize: 10,
    marginTop: 1,
  },
  leaderboardSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  habitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  habitIconText: {
    fontSize: 18,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  habitCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  habitStreaks: {
    alignItems: 'flex-end',
  },
  streakValue: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  streakSub: {
    fontSize: 11,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
