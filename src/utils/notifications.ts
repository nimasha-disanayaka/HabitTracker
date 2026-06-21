import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleDailyReminder = async (
  habitName: string,
  hour: number = 9,
  minute: number = 0
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 Habit Reminder!',
        body: `Don't forget to: ${habitName}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};