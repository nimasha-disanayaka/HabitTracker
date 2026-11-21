// src/utils/streakUtils.js
import { getLocalDateString, getDaysDifference, getLastNDays } from './dateUtils.js';

/**
 * Calculates current consecutive streak and all-time longest streak
 * for a habit given its completed date strings [YYYY-MM-DD].
 */
export const calculateStreaks = (dates = []) => {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Deduplicate and sort chronologically
  const uniqueSorted = Array.from(new Set(dates)).sort();

  // 1. Calculate All-Time Longest Streak
  let longest = 0;
  let tempStreak = 0;
  for (let i = 0; i < uniqueSorted.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = getDaysDifference(uniqueSorted[i - 1], uniqueSorted[i]);
      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longest) longest = tempStreak;
  }

  // 2. Calculate Current Streak
  const todayStr = getLocalDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const completedToday = uniqueSorted.includes(todayStr);
  const completedYesterday = uniqueSorted.includes(yesterdayStr);

  let current = 0;
  if (completedToday || completedYesterday) {
    let checkDate = new Date();
    // If not completed today, start counting backward from yesterday
    if (!completedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const str = getLocalDateString(checkDate);
      if (uniqueSorted.includes(str)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current),
  };
};

/**
 * Computes individual habit performance statistics
 */
export const calculateHabitStats = (habit, todayStr = getLocalDateString()) => {
  const dates = habit.datesCompleted || [];
  const streaks = calculateStreaks(dates);
  const isCompletedToday = dates.includes(todayStr);

  // Weekly completion rate (last 7 days)
  const last7Days = getLastNDays(7);
  const completedLast7 = last7Days.filter((d) => dates.includes(d.dateString)).length;
  const weeklyRate = Math.round((completedLast7 / 7) * 100);

  return {
    isCompletedToday,
    totalCompletions: dates.length,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    weeklyRate,
  };
};

/**
 * Computes aggregate dashboard & statistics across all habits
 */
export const calculateDashboardStats = (habits = [], todayStr = getLocalDateString()) => {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      completedToday: 0,
      completionPercentage: 0,
      bestStreak: 0,
      totalCheckIns: 0,
      weeklyChartData: getLastNDays(7).map((d) => ({ ...d, completedCount: 0, total: 0, percentage: 0 })),
    };
  }

  let completedTodayCount = 0;
  let bestStreak = 0;
  let totalCheckIns = 0;

  habits.forEach((habit) => {
    const dates = habit.datesCompleted || [];
    if (dates.includes(todayStr)) {
      completedTodayCount++;
    }
    const streaks = calculateStreaks(dates);
    if (streaks.longestStreak > bestStreak) {
      bestStreak = streaks.longestStreak;
    }
    totalCheckIns += dates.length;
  });

  const completionPercentage = habits.length > 0 
    ? Math.round((completedTodayCount / habits.length) * 100) 
    : 0;

  // Weekly Chart Data
  const last7Days = getLastNDays(7);
  const weeklyChartData = last7Days.map((day) => {
    let completedOnDay = 0;
    habits.forEach((h) => {
      if ((h.datesCompleted || []).includes(day.dateString)) {
        completedOnDay++;
      }
    });
    const percentage = habits.length > 0 ? Math.round((completedOnDay / habits.length) * 100) : 0;
    return {
      ...day,
      completedCount: completedOnDay,
      total: habits.length,
      percentage,
    };
  });

  return {
    totalHabits: habits.length,
    completedToday: completedTodayCount,
    completionPercentage,
    bestStreak,
    totalCheckIns,
    weeklyChartData,
  };
};
