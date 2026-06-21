import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  completed: number;
  total: number;
};

export default function ProgressBar({ completed, total }: Props) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Today's Progress</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.subLabel}>
        {completed} of {total} habits completed 🎯
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0eeff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },
  subLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});