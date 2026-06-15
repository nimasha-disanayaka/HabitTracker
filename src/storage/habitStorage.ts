import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'habits';

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