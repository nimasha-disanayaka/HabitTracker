import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  useColorScheme,
} from 'react-native';
import { getHabits, getCompletedDates } from '../storage/habitStorage';
import HabitCalendar from '../components/habitcalendar';
import { Colors, Spacing } from '../constants/theme';

type HabitWithDates = {
  name: string;
  dates: string[];
};

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [habits, setHabits] = useState<HabitWithDates[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const saved = await getHabits();
    const habitsWithDates = await Promise.all(
      saved.map(async (name) => ({
        name,
        dates: await getCompletedDates(name),
      }))
    );
    setHabits(habitsWithDates);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Calendar 📅</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your completed days
        </Text>
      </View>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add some habits to see your calendar!
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <HabitCalendar
              habitName={item.name}
              completedDates={item.dates}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
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
});