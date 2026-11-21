// src/screens/AboutScreen.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero */}
        <View style={styles.brandHero}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
          >
            <Ionicons name="sparkles" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>HabitFlow</Text>
          <Text style={[styles.appTagline, { color: theme.primary }]}>
            Master Your Routine, One Day At A Time
          </Text>
          <View
            style={[
              styles.versionPill,
              { backgroundColor: theme.primarySoft, borderColor: theme.borderHighlight },
            ]}
          >
            <Text style={[styles.versionText, { color: theme.primary }]}>
              Version 1.0.0 (Production Release)
            </Text>
          </View>
        </View>

        {/* Feature Highlights Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Engineered for High Consistency
          </Text>

          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color={theme.success} style={styles.featureIcon} />
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>
                100% Offline & Private
              </Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                Zero tracking, no analytics, no external servers. Your habit data resides exclusively on your device.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="flame-outline" size={22} color={theme.warning} style={styles.featureIcon} />
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>
                Local Calendar Streaks
              </Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                Calculates consecutive days based on true local device midnight, ensuring accurate records across timezones.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="bar-chart-outline" size={22} color={theme.info} style={styles.featureIcon} />
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>
                Interactive Analytics
              </Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                Weekly consistency charts and monthly visual calendars with retroactive completion logging.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="color-palette-outline" size={22} color={theme.primary} style={styles.featureIcon} />
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureHeading, { color: theme.textPrimary }]}>
                Modern Light & Dark Engine
              </Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                Adaptive visual design crafted for comfortable viewing day and night.
              </Text>
            </View>
          </View>
        </View>

        {/* Tech Stack Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Technical Architecture
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Framework:</Text> React Native 0.88 + Expo SDK 58
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Navigation:</Text> React Navigation 7 (Stack & Tabs)
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Storage:</Text> @react-native-async-storage/async-storage
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Safe Area:</Text> react-native-safe-area-context
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Notifications:</Text> expo-notifications (Android Channels, Local Triggers)
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Icons:</Text> @expo/vector-icons (Ionicons)
          </Text>
          <Text style={[styles.techRow, { color: theme.textSecondary }]}>
            • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Application ID:</Text> com.nimuu.habitflow
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            HabitFlow • Built with passion for personal growth
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  versionPill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  techRow: {
    fontSize: 13,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
