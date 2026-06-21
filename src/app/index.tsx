import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
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

type Habit = {
  name: string;
  streak: number;
  completedToday: boolean;
};

export default function HomeScreen() {
  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadHabits();
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
    setHabitName('');
    setShowInput(false);
    loadHabits();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Habits 💪</Text>

      <ProgressBar
        completed={habits.filter((h) => h.completedToday).length}
        total={habits.length}
      />

      {habits.length === 0 && (
        <Text style={styles.subtitle}>No habits yet. Add one!</Text>
      )}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View>
              <Text style={styles.habitText}>{item.name}</Text>
              <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.doneButton,
                item.completedToday && styles.doneButtonCompleted,
              ]}
              onPress={() => handleComplete(item.name)}
              disabled={item.completedToday}
            >
              <Text style={styles.doneButtonText}>
                {item.completedToday ? '✅ Done' : 'Mark Done'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.name)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drink water, Exercise..."
            value={habitName}
            onChangeText={setHabitName}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save 💾</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowInput(!showInput)}
      >
        <Text style={styles.buttonText}>
          {showInput ? '✕ Cancel' : '+ Add Habit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  habitCard: {
    backgroundColor: '#f0eeff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  streakText: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 8,
  },
  doneButtonCompleted: {
    backgroundColor: '#4CAF50',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  deleteText: {
    fontSize: 20,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});