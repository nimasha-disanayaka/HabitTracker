import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'habits';
const COMPLETED_KEY = 'completed_dates';

export const saveHabits = async (habits: string[]) => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

export const getHabits = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
};

export const deleteHabit = async (habitName: string) => {
  try {
    const habits = await getHabits();
    const updated = habits.filter((h) => h !== habitName);
    await saveHabits(updated);
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
};

export const markHabitDone = async (habitName: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem(COMPLETED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[habitName]) data[habitName] = [];
    if (!data[habitName].includes(today)) {
      data[habitName].push(today);
    }
    await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error marking habit done:', error);
  }
};

export const getStreak = async (habitName: string): Promise<number> => {
  try {
    const raw = await AsyncStorage.getItem(COMPLETED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const dates: string[] = data[habitName] || [];

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } catch (error) {
    console.error('Error getting streak:', error);
    return 0;
  }
};

export const isCompletedToday = async (habitName: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem(COMPLETED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[habitName]?.includes(today) || false;
  } catch (error) {
    return false;
  }
};