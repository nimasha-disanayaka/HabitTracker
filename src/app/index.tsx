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
import { saveHabits, getHabits, deleteHabit } from '../storage/habitStorage';

export default function HomeScreen() {
  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [showInput, setShowInput] = useState(false);

  // Load habits when app starts
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const saved = await getHabits();
    setHabits(saved);
  };

  const handleSave = async () => {
    if (habitName.trim() === '') {
      Alert.alert('Oops!', 'Please enter a habit name');
      return;
    }
    const updated = [...habits, habitName];
    setHabits(updated);
    await saveHabits(updated);
    setHabitName('');
    setShowInput(false);
  };

  const handleDelete = async (name: string) => {
    Alert.alert('Delete Habit', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHabit(name);
          const updated = habits.filter((h) => h !== name);
          setHabits(updated);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Habits 💪</Text>

      {habits.length === 0 && (
        <Text style={styles.subtitle}>No habits yet. Add one!</Text>
      )}

      <FlatList
        data={habits}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <Text style={styles.habitText}>✅ {item}</Text>
            <TouchableOpacity onPress={() => handleDelete(item)}>
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
    color: '#333',
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