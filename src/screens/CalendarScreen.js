// src/screens/CalendarScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getHabits, toggleHabitCompletion } from '../storage/habitStorage';
import {
  getLocalDateString,
  getMonthGrid,
  formatFullDate,
  parseLocalDate,
} from '../utils/dateUtils';
import HabitCard from '../components/HabitCard';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [habits, setHabits] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const loadData = useCallback(async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (e) {
      console.error('Failed to load habits in CalendarScreen', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(getLocalDateString());
  };

  // Calendar cells
  const monthCells = useMemo(() => {
    return getMonthGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Map of dateString -> { count, percentage }
  const dateCompletionMap = useMemo(() => {
    const map = {};
    if (habits.length === 0) return map;

    habits.forEach((h) => {
      (h.datesCompleted || []).forEach((dStr) => {
        if (!map[dStr]) map[dStr] = 0;
        map[dStr]++;
      });
    });
    return map;
  }, [habits]);

  // Toggle habit on selected date
  const handleToggleHabit = async (id, targetDate) => {
    try {
      const updated = await toggleHabitCompletion(id, targetDate);
      setHabits(updated);
    } catch (e) {
      console.error('Failed to toggle habit', e);
    }
  };

  // Stats for selected date
  const selectedDateStats = useMemo(() => {
    const total = habits.length;
    const completed = habits.filter((h) =>
      (h.datesCompleted || []).includes(selectedDate)
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [habits, selectedDate]);

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
        {/* Header: Title and Today button */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
              HABIT HISTORY
            </Text>
            <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
              Calendar
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleGoToToday}
            style={[
              styles.todayButton,
              { backgroundColor: theme.primarySoft, borderColor: theme.borderHighlight },
            ]}
          >
            <Ionicons name="today-outline" size={16} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.todayButtonText, { color: theme.primary }]}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Month Navigation Bar */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <View style={styles.monthNavRow}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={[styles.navArrowBtn, { backgroundColor: theme.surfaceVariant }]}
              accessibilityLabel="Previous Month"
            >
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>

            <Text style={[styles.monthNavTitle, { color: theme.textPrimary }]}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.navArrowBtn, { backgroundColor: theme.surfaceVariant }]}
              accessibilityLabel="Next Month"
            >
              <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdayRow}>
            {WEEK_DAYS.map((dayName, idx) => (
              <View key={idx} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: theme.textMuted }]}>
                  {dayName}
                </Text>
              </View>
            ))}
          </View>

          {/* Month Days Grid */}
          <View style={styles.gridContainer}>
            {monthCells.map((cell, idx) => {
              if (cell.empty) {
                return <View key={cell.key} style={styles.dayCell} />;
              }

              const isSelected = selectedDate === cell.dateString;
              const completedCount = dateCompletionMap[cell.dateString] || 0;
              const hasHabits = habits.length > 0;
              const isAllCompleted = hasHabits && completedCount === habits.length;
              const isPartiallyCompleted = hasHabits && completedCount > 0 && completedCount < habits.length;

              return (
                <TouchableOpacity
                  key={cell.key}
                  onPress={() => setSelectedDate(cell.dateString)}
                  style={[
                    styles.dayCell,
                    isSelected && {
                      backgroundColor: theme.primary,
                      borderRadius: 14,
                    },
                    cell.isToday && !isSelected && {
                      borderWidth: 1.5,
                      borderColor: theme.primary,
                      borderRadius: 14,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : cell.isToday
                          ? theme.primary
                          : theme.textPrimary,
                        fontWeight: isSelected || cell.isToday ? '800' : '500',
                      },
                    ]}
                  >
                    {cell.day}
                  </Text>

                  {/* Indicator Dot */}
                  <View style={styles.dotContainer}>
                    {isAllCompleted && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#FFFFFF' : theme.success },
                        ]}
                      />
                    )}
                    {isPartiallyCompleted && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#FFFFFF' : theme.primaryLight },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={[styles.legendRow, { borderTopColor: theme.borderLight }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                100% Done
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.primaryLight }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                Partial
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendRing, { borderColor: theme.primary }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                Today
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Day Details Section */}
        <View style={styles.selectedDaySection}>
          <View style={styles.selectedDayHeader}>
            <View>
              <Text style={[styles.selectedDateTitle, { color: theme.textPrimary }]}>
                {formatFullDate(parseLocalDate(selectedDate))}
              </Text>
              <Text style={[styles.selectedDateSubtitle, { color: theme.textSecondary }]}>
                {selectedDateStats.completed} of {selectedDateStats.total} habits completed ({selectedDateStats.percentage}%)
              </Text>
            </View>

            <View
              style={[
                styles.selectedPercentageBadge,
                {
                  backgroundColor:
                    selectedDateStats.percentage === 100
                      ? theme.successSoft
                      : theme.primarySoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.selectedPercentageText,
                  {
                    color:
                      selectedDateStats.percentage === 100
                        ? (theme.isDark ? '#34D399' : '#059669')
                        : theme.primary,
                  },
                ]}
              >
                {selectedDateStats.percentage}%
              </Text>
            </View>
          </View>

          {/* Habits list for selected date */}
          {habits.length === 0 ? (
            <View
              style={[
                styles.emptyDayBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.emptyDayText, { color: theme.textSecondary }]}>
                No habits added yet.
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                targetDate={selectedDate}
                onToggleComplete={handleToggleHabit}
                onEdit={() => navigation.navigate('AddHabit', { habit })}
                onDelete={async (id) => {
                  const { deleteHabit } = require('../storage/habitStorage');
                  await deleteHabit(id);
                  loadData();
                }}
              />
            ))
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 20,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
  },
  dotContainer: {
    height: 5,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedDaySection: {
    marginTop: 4,
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selectedDateTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  selectedDateSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  selectedPercentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectedPercentageText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyDayBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
  },
});
