import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import {
  getTotalCompletions,
  getBestStreak,
  getCompletionRate,
  getHabits,
} from '../storage/habitStorage';
import { Colors, Spacing } from '../constants/theme';

type StatCardProps = {
  emoji: string;
  label: string;
  value: string | number;
  color: string;
  bg: string;
};

function StatCard({ emoji, label, value, color, bg }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={[styles.cardLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [totalHabits, setTotalHabits] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const habits = await getHabits();
    const completions = await getTotalCompletions();
    const streak = await getBestStreak();
    const rate = await getCompletionRate();

    setTotalHabits(habits.length);
    setTotalCompletions(completions);
    setBestStreak(streak);
    setCompletionRate(rate);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Stats 📈</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep up the great work!
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          emoji="🎯"
          label="Total Habits"
          value={totalHabits}
          color="#6C63FF"
          bg="#EEF0FF"
        />
        <StatCard
          emoji="✅"
          label="Total Completions"
          value={totalCompletions}
          color="#4CAF50"
          bg="#E8F5E9"
        />
        <StatCard
          emoji="🔥"
          label="Best Streak"
          value={`${bestStreak} days`}
          color="#FF6B6B"
          bg="#FFE8E8"
        />
        <StatCard
          emoji="📊"
          label="Completion Rate"
          value={`${completionRate}%`}
          color="#FF9800"
          bg="#FFF3E0"
        />
      </View>

      {totalHabits === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add some habits to see your stats!
          </Text>
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardLabel: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
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