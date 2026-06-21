import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import {
  saveHabits,
  getHabits,
  deleteHabit,
  markHabitDone,
  getStreak,
  isCompletedToday,
} from '../storage/habitStorage';
import ProgressBar from '../components/progressBar';
import { Colors, Spacing } from '../constants/theme';
import {
  requestPermissions,
  scheduleDailyReminder,
} from '../utils/notifications';

type Habit = {
  name: string;
  streak: number;
  completedToday: boolean;
};

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadHabits();
    requestPermissions();
  }, []);

  const loadHabits = async () => {
    const saved = await getHabits();
    const habitsWithStreak = await Promise.all(
      saved.map(async (name) => ({
        name,
        streak: await getStreak(name),
        completedToday: await isCompletedToday(name),
      }))
    );
    setHabits(habitsWithStreak);
  };

  const handleSave = async () => {
    if (habitName.trim() === '') {
      Alert.alert('Oops!', 'Please enter a habit name');
      return;
    }
    const names = habits.map((h) => h.name);
    const updated = [...names, habitName];
    await saveHabits(updated);
    await scheduleDailyReminder(habitName, 9, 0);
    setHabitName('');
    setShowInput(false);
    loadHabits();
    Alert.alert('✅ Habit Added!', `Daily reminder set for ${habitName} at 9:00 AM!`);
  };

  const handleDelete = async (name: string) => {
    Alert.alert('Delete Habit', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(name);
          loadHabits();
        },
      },
    ]);
  };

  const handleComplete = async (name: string) => {
    await markHabitDone(name);
    loadHabits();
  };

  const completedCount = habits.filter((h) => h.completedToday).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Habits 💪</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date().toDateString()}
        </Text>
      </View>

      {/* Progress Bar */}
      <ProgressBar completed={completedCount} total={habits.length} />

      {/* Habit List */}
      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No habits yet. Add one to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.habitCard, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitText, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.streakText, { color: colors.textSecondary }]}>
                  🔥 {item.streak} day streak
                </Text>
              </View>
              <View style={styles.habitActions}>
                <TouchableOpacity
                  style={[
                    styles.doneButton,
                    { backgroundColor: item.completedToday ? '#4CAF50' : '#6C63FF' },
                  ]}
                  onPress={() => handleComplete(item.name)}
                  disabled={item.completedToday}
                >
                  <Text style={styles.doneButtonText}>
                    {item.completedToday ? '✅' : '○'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.name)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Habit Input */}
      {showInput && (
        <View style={[styles.inputContainer, { backgroundColor: colors.backgroundElement }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: '#6C63FF' }]}
            placeholder="e.g. Drink water, Exercise..."
            placeholderTextColor={colors.textSecondary}
            value={habitName}
            onChangeText={setHabitName}
            autoFocus
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save 💾</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: showInput ? '#FF6B6B' : '#6C63FF' }]}
        onPress={() => setShowInput(!showInput)}
      >
        <Text style={styles.buttonText}>
          {showInput ? '✕ Cancel' : '+ Add Habit'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.three,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: Spacing.four,
  },
  habitCard: {
    padding: Spacing.three,
    borderRadius: 14,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakText: {
    fontSize: 13,
    marginTop: 4,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doneButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
  },
  inputContainer: {
    padding: Spacing.three,
    borderRadius: 14,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  addButton: {
    padding: Spacing.three,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});