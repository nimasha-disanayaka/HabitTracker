// src/services/notificationService.js
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const NOTIFICATION_CHANNEL_ID = 'habit-reminders';
export const FALLBACK_CHANNEL_ID = 'default';

/**
 * Configure global notification presentation behavior at module load time.
 * In Expo SDK 58 / modern expo-notifications:
 * - `shouldShowBanner: true` displays the heads-up banner while the app is in foreground.
 * - `shouldShowList: true` keeps the notification in the Android notification shade/drawer.
 * - `shouldPlaySound: true` ensures alert audio fires.
 * Calling this at top-level module scope guarantees the native listener is registered
 * immediately when the JavaScript bundle loads, before any components mount.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldPresentAlert: true,
    shouldPresentBanner: true,
    shouldPresentList: true,
    shouldPresentSound: true,
  }),
});

/**
 * Configure Android notification channel.
 *
 * CRITICAL FIX FOR ANDROID NULLPOINTEREXCEPTION & SILENT NOTIFICATION DROPS:
 * Do NOT pass `sound: 'default'` in setNotificationChannelAsync.
 * In AndroidXNotificationsChannelManager / SoundResolver, passing string 'default'
 * causes Expo to search for a raw bundled resource (res/raw/default.wav).
 * When not found, it returns null and triggers Kotlin NullPointerException in
 * NotificationChannelManagerModule.kt (channelSerializer.toBundle).
 * On Android 8.0+ (API 26+), posting notifications to a missing or failed channel
 * causes Android to silently drop the notification.
 * Omitting the `sound` parameter allows Android to automatically assign the system default notification URI.
 */
export const initNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      console.log(`[NotificationService] Registering Android notification channel: "${NOTIFICATION_CHANNEL_ID}"`);

      // 1. Primary HabitFlow daily reminders channel
      const primaryChannel = await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Habit Flow Daily Reminders',
        description: 'Daily notifications reminding you to complete your habits.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC ?? 1,
        bypassDnd: false,
      });

      console.log(`[NotificationService] Primary channel ready:`, primaryChannel?.id || NOTIFICATION_CHANNEL_ID);

      // 2. Safe fallback channel for general alerts
      try {
        await Notifications.setNotificationChannelAsync(FALLBACK_CHANNEL_ID, {
          name: 'General Reminders',
          description: 'General HabitFlow alerts and reminders.',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          showBadge: true,
        });
      } catch (fallbackError) {
        console.log('[NotificationService] Note on fallback channel creation:', fallbackError?.message);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('[NotificationService] Failed to initialize notification channels:', error);
    return { success: false, error: error?.message || String(error) };
  }
};

/**
 * Retrieve current status of the Android notification channel
 */
export const getNotificationChannelStatus = async () => {
  if (Platform.OS !== 'android') {
    return { available: true, channelId: 'ios-native', name: 'iOS Notifications' };
  }
  try {
    const channel = await Notifications.getNotificationChannelAsync(NOTIFICATION_CHANNEL_ID);
    if (channel) {
      return {
        available: true,
        channelId: channel.id,
        name: channel.name,
        importance: channel.importance,
      };
    }
    return {
      available: false,
      channelId: NOTIFICATION_CHANNEL_ID,
      reason: 'Channel not yet created',
    };
  } catch (error) {
    return {
      available: false,
      channelId: NOTIFICATION_CHANNEL_ID,
      error: error?.message || String(error),
    };
  }
};

/**
 * Get current system notification permission status
 */
export const getNotificationPermissionStatus = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync();
    const isGranted =
      settings.granted ||
      settings.status === 'granted' ||
      settings.ios?.status === Notifications.IosAuthorizationStatus?.PROVISIONAL;
    return {
      granted: Boolean(isGranted),
      status: settings.status || 'unknown',
      canAskAgain: settings.canAskAgain !== false,
    };
  } catch (error) {
    console.warn('[NotificationService] Error checking permissions:', error);
    return { granted: false, status: 'error', canAskAgain: true };
  }
};

/**
 * Prompt user for system notification permissions (Android 13+ POST_NOTIFICATIONS)
 */
export const requestNotificationPermission = async () => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.status === 'granted') {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });
    const isGranted = requested.granted || requested.status === 'granted';
    console.log(`[NotificationService] Permission request result: ${isGranted ? 'GRANTED' : 'DENIED'}`);
    return isGranted;
  } catch (error) {
    console.warn('[NotificationService] Error requesting permissions:', error);
    return false;
  }
};

/**
 * Parses time strings such as "08:00 AM", "08:30 PM", "14:00" into 24h { hour, minute }
 */
export const parseTimeStringToHourMinute = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || timeStr === 'None') {
    return { hour: 9, minute: 0 };
  }

  const trimmed = timeStr.trim().toUpperCase();

  // Match 12-hour format: "08:30 AM" or "8:30PM"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = parseInt(match12[2], 10);
    const period = match12[3];

    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return {
      hour: Math.min(Math.max(hour, 0), 23),
      minute: Math.min(Math.max(minute, 0), 59),
    };
  }

  // Match 24-hour format: "14:30" or "08:00"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    return {
      hour: Math.min(Math.max(hour, 0), 23),
      minute: Math.min(Math.max(minute, 0), 59),
    };
  }

  return { hour: 9, minute: 0 };
};

/**
 * Formats hour and minute into "HH:MM AM/PM"
 */
export const formatHourMinuteToString = (hour, minute) => {
  const h = Number(hour) || 0;
  const m = Number(minute) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMinute = String(m).padStart(2, '0');
  const paddedHour = String(displayHour).padStart(2, '0');
  return `${paddedHour}:${displayMinute} ${period}`;
};

/**
 * Schedule a repeating daily notification for a habit.
 * Automatically cancels any previously scheduled notification for this habit to prevent duplicates.
 */
export const scheduleHabitReminder = async (habit) => {
  if (!habit || !habit.reminderEnabled || !habit.reminderTime || habit.reminderTime === 'None') {
    return null;
  }

  try {
    // Ensure notification channel is ready
    if (Platform.OS === 'android') {
      await initNotifications();
    }

    // Cancel previous notification if one was already registered
    if (habit.notificationId) {
      await cancelHabitReminder(habit.notificationId);
    }

    const { hour, minute } = parseTimeStringToHourMinute(habit.reminderTime);
    const habitIcon = habit.icon || '⭐';

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      channelId: NOTIFICATION_CHANNEL_ID,
    };

    console.log(
      `[NotificationService] Scheduling daily reminder for "${habit.name}" at ${hour}:${String(minute).padStart(2, '0')} (channel: ${NOTIFICATION_CHANNEL_ID})`
    );

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${habit.name}! ${habitIcon}`,
        body: 'Keep your streak going! Tap to mark complete in HabitFlow.',
        data: {
          habitId: habit.id,
          habitName: habit.name,
          reminderTime: habit.reminderTime,
          isHabitReminder: true,
          sourceApp: 'HabitFlow',
        },
        sound: true,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
      trigger,
    });

    console.log(
      `[NotificationService] Reminder scheduled successfully for "${habit.name}". Notification ID: ${notificationId}`
    );
    return notificationId;
  } catch (error) {
    console.error(
      `[NotificationService] Failed to schedule reminder for habit "${habit.name}":`,
      error
    );
    return null;
  }
};

/**
 * Cancel a scheduled notification by identifier
 */
export const cancelHabitReminder = async (notificationId) => {
  if (!notificationId) return;
  try {
    console.log(`[NotificationService] Canceling scheduled notification: ${notificationId}`);
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn(`[NotificationService] Failed to cancel notification ${notificationId}:`, error);
  }
};

/**
 * Cancel all scheduled HabitFlow habit reminders without touching unrelated notifications
 */
export const cancelAllHabitReminders = async () => {
  try {
    const scheduledList = await getAllScheduledNotifications();
    for (const item of scheduledList) {
      const isHabitReminder =
        item.content?.data?.isHabitReminder === true ||
        Boolean(item.content?.data?.habitId);
      if (isHabitReminder) {
        await cancelHabitReminder(item.identifier);
      }
    }
  } catch (error) {
    console.warn('[NotificationService] Failed to cancel habit reminders:', error);
  }
};

/**
 * Retrieve list of all currently scheduled notifications in the OS scheduler
 */
export const getAllScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[NotificationService] Failed to get scheduled notifications:', error);
    return [];
  }
};

/**
 * Returns count of active notifications that specifically belong to HabitFlow habits
 */
export const getScheduledHabitRemindersCount = async () => {
  try {
    const scheduled = await getAllScheduledNotifications();
    const habitReminders = scheduled.filter(
      (item) =>
        item.content?.data?.isHabitReminder === true ||
        Boolean(item.content?.data?.habitId)
    );
    return habitReminders.length;
  } catch (error) {
    return 0;
  }
};

/**
 * Send a test notification scheduled 5 seconds after pressing the button.
 * Allows user to verify both:
 * 1) Heads-up foreground banner with sound while looking at the app.
 * 2) Background delivery if they minimize or lock the phone within 5 seconds.
 */
export const sendTestNotificationNow = async (habitName = 'Hydration Flow', icon = '💧') => {
  try {
    console.log('[NotificationService] Checking permissions for test notification...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('[NotificationService] Notification permission was denied');
      return { success: false, reason: 'permission_denied' };
    }

    // Ensure notification channel is registered
    if (Platform.OS === 'android') {
      const channelResult = await initNotifications();
      if (!channelResult.success) {
        console.warn('[NotificationService] Channel warning before test:', channelResult.error);
      }
    }

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL || 'timeInterval',
      seconds: 5,
      repeats: false,
      channelId: NOTIFICATION_CHANNEL_ID,
    };

    console.log(
      `[NotificationService] Scheduling test notification with 5-second delay on channel "${NOTIFICATION_CHANNEL_ID}"...`
    );

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${habitName}! ${icon}`,
        body: 'HabitFlow local reminder test. Notifications are functioning properly! 🎉',
        data: {
          test: true,
          sourceApp: 'HabitFlow',
          timestamp: Date.now(),
        },
        sound: true,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
      trigger,
    });

    console.log(`[NotificationService] Test notification successfully scheduled! ID: ${id}`);
    return {
      success: true,
      notificationId: id,
      delaySeconds: 5,
      channelId: NOTIFICATION_CHANNEL_ID,
    };
  } catch (error) {
    console.error('[NotificationService] Error sending test notification:', error);
    return { success: false, reason: error?.message || String(error) };
  }
};

/**
 * Reconcile stored habits with OS scheduler.
 * Cancels orphaned HabitFlow notifications and reschedules any active habits missing from the scheduler.
 * Safety Guard: Never touches unrelated scheduled notifications or test notifications.
 */
export const reconcileScheduledReminders = async (habits = []) => {
  try {
    const scheduledList = await getAllScheduledNotifications();
    const scheduledIds = new Set(scheduledList.map((item) => item.identifier));

    const validHabitNotificationIds = new Set();
    const updatedHabits = [];
    let hasChanges = false;

    for (const habit of habits) {
      let currentHabit = { ...habit };

      if (habit.reminderEnabled && habit.reminderTime && habit.reminderTime !== 'None') {
        const isScheduled = habit.notificationId && scheduledIds.has(habit.notificationId);

        if (!isScheduled) {
          // Missing or outdated in scheduler - schedule fresh without creating duplicates
          const newId = await scheduleHabitReminder(habit);
          if (newId) {
            currentHabit.notificationId = newId;
            validHabitNotificationIds.add(newId);
            hasChanges = true;
          }
        } else {
          validHabitNotificationIds.add(habit.notificationId);
        }
      } else if (habit.notificationId) {
        // Reminders disabled but still has notificationId - cancel it
        await cancelHabitReminder(habit.notificationId);
        currentHabit.notificationId = null;
        hasChanges = true;
      }

      updatedHabits.push(currentHabit);
    }

    // Safety Guard: Only cancel orphan notifications that specifically belong to HabitFlow habits.
    // If a notification has no habitId/isHabitReminder, leave it completely untouched!
    for (const item of scheduledList) {
      const isHabitReminder =
        item.content?.data?.isHabitReminder === true ||
        Boolean(item.content?.data?.habitId);

      if (isHabitReminder && !validHabitNotificationIds.has(item.identifier)) {
        await cancelHabitReminder(item.identifier);
      }
    }

    return { habits: updatedHabits, hasChanges };
  } catch (error) {
    console.warn('[NotificationService] Error reconciling reminders:', error);
    return { habits, hasChanges: false };
  }
};
