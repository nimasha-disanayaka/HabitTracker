import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../constants/theme';

type Props = {
  habitName: string;
  completedDates: string[];
};

export default function HabitCalendar({ habitName, completedDates }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const markedDates = completedDates.reduce((acc, date) => {
    acc[date] = {
      selected: true,
      selectedColor: '#6C63FF',
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElement }]}>
      <Text style={[styles.habitName, { color: colors.text }]}>
        📅 {habitName}
      </Text>
      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.backgroundElement,
          calendarBackground: colors.backgroundElement,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: '#6C63FF',
          selectedDayTextColor: '#fff',
          todayTextColor: '#6C63FF',
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: '#6C63FF',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingLeft: 4,
  },
});