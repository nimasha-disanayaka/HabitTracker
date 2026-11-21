// src/screens/TodayScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getHabits, toggleHabitCompletion, deleteHabit } from '../storage/habitStorage';
import { calculateDashboardStats } from '../utils/streakUtils';
import { getLocalDateString } from '../utils/dateUtils';
import DashboardHeader from '../components/DashboardHeader';
import CategoryFilter from '../components/CategoryFilter';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

export default function TodayScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [habits, setHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = useMemo(() => getLocalDateString(), []);

  const loadData = useCallback(async () => {
    try {
      const data = await getHabits();
      setHabits(data);
    } catch (e) {
      console.error('Failed to load habits in TodayScreen', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleHabit = async (id, targetDate) => {
    try {
      const updated = await toggleHabitCompletion(id, targetDate);
      setHabits(updated);
    } catch (e) {
      console.error('Failed to toggle habit', e);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await deleteHabit(id);
      await loadData();
    } catch (e) {
      console.error('Failed to delete habit', e);
    }
  };

  const handleEditHabit = (habit) => {
    navigation.navigate('AddHabit', { habit });
  };

  // Stats calculation
  const dashboardStats = useMemo(() => {
    return calculateDashboardStats(habits, todayStr);
  }, [habits, todayStr]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: habits.length };
    habits.forEach((h) => {
      const cat = (h.category || 'health').toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [habits]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter(
      (h) => (h.category || 'health').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [habits, selectedCategory]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <DashboardHeader
              stats={dashboardStats}
              onPressNewHabit={() => navigation.navigate('AddHabit')}
            />
            {habits.length > 0 && (
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryCounts={categoryCounts}
              />
            )}
          </>
        }
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            targetDate={todayStr}
            onToggleComplete={handleToggleHabit}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            isFiltered={selectedCategory !== 'all' && habits.length > 0}
            categoryName={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            onPressAdd={() => navigation.navigate('AddHabit', { initialCategory: selectedCategory })}
          />
        }
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 130, // Space for FAB + Tab bar
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modern Safe Floating Action Button */}
      <FloatingActionButton
        onPress={() => navigation.navigate('AddHabit', { initialCategory: selectedCategory })}
        label="Add Habit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
