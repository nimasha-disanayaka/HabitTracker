import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState('');

  const handleSave = () => {
    if (habitName.trim() === '') {
      Alert.alert('Oops!', 'Please enter a habit name');
      return;
    }
    Alert.alert('Success!', `Habit "${habitName}" saved! 🎉`);
    setHabitName('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Habit ✏️</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Drink water, Exercise..."
        value={habitName}
        onChangeText={setHabitName}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Habit 💾</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6C63FF',
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