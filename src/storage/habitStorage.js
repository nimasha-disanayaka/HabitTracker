// src/storage/habitStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { getLocalDateString } from '../utils/dateUtils.js';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
  cancelAllHabitReminders,
  reconcileScheduledReminders,
} from '../services/notificationService';

export const HABITS_STORAGE_KEY = 'habits';

/**
 * Normalizes a habit object so all expected fields exist,
 * guaranteeing backward compatibility with existing AsyncStorage data.
 */
const normalizeHabit = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  // If reminderTime is present and not 'None', reminderEnabled defaults to true if not explicitly set
  const hasReminderTime = Boolean(raw.reminderTime) && raw.reminderTime !== 'None';
  const reminderEnabled = raw.reminderEnabled !== undefined ? Boolean(raw.reminderEnabled) : hasReminderTime;

  return {
    id: raw.id || uuid.v4(),
    name: (raw.name || 'Untitled Habit').trim(),
    color: raw.color || '#6366F1',
    icon: raw.icon || '⭐',
    category: raw.category || 'health',
    reminderTime: raw.reminderTime || null,
    reminderEnabled,
    notificationId: raw.notificationId || null,
    createdAt: raw.createdAt || getLocalDateString(),
    datesCompleted: Array.isArray(raw.datesCompleted) ? Array.from(new Set(raw.datesCompleted)) : [],
  };
};

/**
 * Retrieve all habits from local AsyncStorage
 */
export const getHabits = async () => {
  try {
    const json = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHabit).filter(Boolean);
  } catch (e) {
    console.error('Failed to load habits from storage', e);
    return [];
  }
};

/**
 * Save a new habit, scheduling a reminder notification if enabled
 */
export const saveHabit = async (habitData) => {
  try {
    const habits = await getHabits();
    let newHabit = normalizeHabit({
      ...habitData,
      id: uuid.v4(),
      createdAt: getLocalDateString(),
      datesCompleted: habitData.datesCompleted || [],
    });

    // Schedule notification if reminder is enabled
    if (newHabit.reminderEnabled && newHabit.reminderTime && newHabit.reminderTime !== 'None') {
      const notificationId = await scheduleHabitReminder(newHabit);
      if (notificationId) {
        newHabit.notificationId = notificationId;
      }
    }

    const updated = [newHabit, ...habits];
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
    return newHabit;
  } catch (e) {
    console.error('Failed to save habit', e);
    throw e;
  }
};

/**
 * Update an existing habit and update its scheduled notification accordingly
 */
export const updateHabit = async (habitData) => {
  if (!habitData || !habitData.id) {
    throw new Error('Habit ID is required for update');
  }
  try {
    const habits = await getHabits();
    const existing = habits.find((h) => h.id === habitData.id);

    let updatedHabit = normalizeHabit({
      ...existing,
      ...habitData,
      // Preserve datesCompleted unless explicitly provided in update
      datesCompleted: habitData.datesCompleted !== undefined ? habitData.datesCompleted : existing?.datesCompleted,
    });

    // Handle notification updates
    if (updatedHabit.reminderEnabled && updatedHabit.reminderTime && updatedHabit.reminderTime !== 'None') {
      // Re-schedule notification (scheduleHabitReminder handles canceling previous notificationId)
      const newNotificationId = await scheduleHabitReminder(updatedHabit);
      updatedHabit.notificationId = newNotificationId || updatedHabit.notificationId;
    } else {
      // Reminders disabled - cancel existing notification
      if (existing?.notificationId) {
        await cancelHabitReminder(existing.notificationId);
      }
      updatedHabit.notificationId = null;
    }

    const updated = habits.map((h) => (h.id === habitData.id ? updatedHabit : h));
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
    return updatedHabit;
  } catch (e) {
    console.error('Failed to update habit', e);
    throw e;
  }
};

/**
 * Delete a habit by ID and cancel its scheduled notification
 */
export const deleteHabit = async (id) => {
  try {
    const habits = await getHabits();
    const target = habits.find((h) => h.id === id);

    if (target?.notificationId) {
      await cancelHabitReminder(target.notificationId);
    }

    const filtered = habits.filter((h) => h.id !== id);
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete habit', e);
    throw e;
  }
};

/**
 * Toggle habit completion for a specific local calendar date (defaults to today)
 */
export const toggleHabitCompletion = async (id, targetDate = getLocalDateString()) => {
  try {
    const habits = await getHabits();
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const completed = Array.isArray(h.datesCompleted) ? [...h.datesCompleted] : [];
      if (completed.includes(targetDate)) {
        // Unmark
        return { ...h, datesCompleted: completed.filter((d) => d !== targetDate) };
      } else {
        // Mark completed
        return { ...h, datesCompleted: [...completed, targetDate] };
      }
    });

    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to toggle habit completion', e);
    throw e;
  }
};

/**
 * Reset completion check-ins for today only (leaves habit definitions & history intact)
 */
export const resetTodayCompletions = async () => {
  const todayStr = getLocalDateString();
  try {
    const habits = await getHabits();
    const updated = habits.map((h) => ({
      ...h,
      datesCompleted: (h.datesCompleted || []).filter((d) => d !== todayStr),
    }));
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to reset today completions', e);
    throw e;
  }
};

/**
 * Permanently delete all habits, history, and cancel all notifications
 */
export const resetAllData = async () => {
  try {
    await cancelAllHabitReminders();
    await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to reset all data', e);
    throw e;
  }
};

/**
 * Reconcile all habit reminders with system scheduler and persist any adjustments
 */
export const reconcileAllHabitReminders = async () => {
  try {
    const habits = await getHabits();
    const { habits: reconciled, hasChanges } = await reconcileScheduledReminders(habits);
    if (hasChanges) {
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(reconciled));
    }
    return reconciled;
  } catch (e) {
    console.error('Failed to reconcile habit reminders', e);
    return [];
  }
};

/**
 * Export habits as JSON string for offline backup
 */
export const getHabitsBackupJson = async () => {
  const habits = await getHabits();
  return JSON.stringify(
    {
      app: 'HabitFlow',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      habits,
    },
    null,
    2
  );
};
