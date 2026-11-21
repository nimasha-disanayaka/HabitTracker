// src/screens/SettingsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import {
  resetTodayCompletions,
  resetAllData,
  getHabitsBackupJson,
  reconcileAllHabitReminders,
  getHabits,
} from '../storage/habitStorage';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  getAllScheduledNotifications,
  getScheduledHabitRemindersCount,
  sendTestNotificationNow,
  initNotifications,
  getNotificationChannelStatus,
  NOTIFICATION_CHANNEL_ID,
} from '../services/notificationService';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme, isDark, themeMode, setThemeMode, toggleTheme } = useTheme();

  const [permissionInfo, setPermissionInfo] = useState({ granted: false, status: 'checking' });
  const [channelInfo, setChannelInfo] = useState({ available: false, channelId: NOTIFICATION_CHANNEL_ID, name: '' });
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isSyncingReminders, setIsSyncingReminders] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string, id?: string }

  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [backupJson, setBackupJson] = useState('');

  const loadNotificationStatus = useCallback(async () => {
    // 1. Check system permission
    const perm = await getNotificationPermissionStatus();
    setPermissionInfo(perm);

    // 2. Check Android notification channel
    const chan = await getNotificationChannelStatus();
    setChannelInfo(chan);

    // 3. Check scheduled habit reminders count
    const count = await getScheduledHabitRemindersCount();
    setScheduledCount(count);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotificationStatus();
    });
    loadNotificationStatus();
    return unsubscribe;
  }, [navigation, loadNotificationStatus]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (Platform.OS === 'android') {
      await initNotifications();
    }
    await loadNotificationStatus();
    if (granted) {
      Alert.alert('Permission Granted', 'HabitFlow has permission to display habit reminders.');
    } else {
      Alert.alert(
        'Permission Denied',
        'Notification permissions were not granted. To enable them, please visit Android Settings > Apps > HabitFlow > Notifications.'
      );
    }
  };

  const handleInitChannel = async () => {
    const result = await initNotifications();
    await loadNotificationStatus();
    if (result.success) {
      Alert.alert('Channel Initialized', `Android notification channel "${NOTIFICATION_CHANNEL_ID}" is active.`);
    } else {
      Alert.alert('Channel Error', `Failed to create notification channel: ${result.error}`);
    }
  };

  const handleSendTestNotification = async () => {
    setIsTestingNotification(true);
    setTestResult(null);

    const result = await sendTestNotificationNow('Hydration Flow', '💧');
    setIsTestingNotification(false);

    if (result.success) {
      const successMsg = `Notification scheduled! Appears in ~5 seconds (ID: ${result.notificationId?.slice(0, 8)}...).`;
      setTestResult({
        success: true,
        message: successMsg,
        id: result.notificationId,
      });

      Alert.alert(
        'Test Notification Scheduled',
        'A local reminder will trigger in approximately 5 seconds!\n\n• Stay on this screen to observe the heads-up banner.\n• Or press the phone Home button now to test delivery while minimized.'
      );
      await loadNotificationStatus();
    } else if (result.reason === 'permission_denied') {
      const errMsg = 'Permission required. Tap "Allow" above or enable notifications in Android Settings.';
      setTestResult({ success: false, message: errMsg });
      Alert.alert(
        'Permission Required',
        'Please allow notification permissions first using the "Allow" button above.'
      );
    } else {
      const errMsg = `Failed to schedule test notification: ${result.reason || 'Unknown error'}`;
      setTestResult({ success: false, message: errMsg });
      Alert.alert('Notification Error', errMsg);
    }
  };

  const handleReconcileReminders = async () => {
    setIsSyncingReminders(true);
    try {
      if (Platform.OS === 'android') {
        await initNotifications();
      }
      await reconcileAllHabitReminders();
      await loadNotificationStatus();
      Alert.alert(
        'Reminders Synchronized',
        'All habit reminders have been reconciled with the system scheduler.'
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to synchronize reminders.');
    } finally {
      setIsSyncingReminders(false);
    }
  };

  const handleResetToday = () => {
    Alert.alert(
      'Reset Today\'s Check-ins',
      'Are you sure you want to uncheck all habits for today? Your past history and streak records will be recalculated accordingly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Today',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetTodayCompletions();
              Alert.alert('Success', 'Today\'s habit completions have been reset.');
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to reset today\'s completions.');
            }
          },
        },
      ]
    );
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Habit Data',
      '⚠️ DANGER: This will permanently erase all habits, streaks, check-in history, and cancel all scheduled reminders. This action cannot be reversed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              await loadNotificationStatus();
              Alert.alert('Reset Complete', 'All habit data and reminders have been cleared.');
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to clear habit data.');
            }
          },
        },
      ]
    );
  };

  const handleOpenBackup = async () => {
    try {
      const json = await getHabitsBackupJson();
      setBackupJson(json);
      setBackupModalVisible(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate backup JSON.');
    }
  };

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
            PREFERENCES & DATA
          </Text>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
            Settings
          </Text>
        </View>

        {/* 1. Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            APPEARANCE
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            {/* Dark Mode Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    Dark Theme
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Mode Selector Buttons */}
            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.themeModesRow}>
              {['light', 'dark', 'system'].map((mode) => {
                const isActive = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    style={[
                      styles.modeBtn,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surfaceVariant,
                        borderColor: isActive ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeBtnText,
                        { color: isActive ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2. Notifications Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DAILY NOTIFICATIONS & REMINDERS
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            {/* Permission Status Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: permissionInfo.granted ? theme.successSoft : theme.warningSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={permissionInfo.granted ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                    size={20}
                    color={permissionInfo.granted ? theme.success : theme.warning}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    System Notification Permission
                  </Text>
                  <Text
                    style={[
                      styles.settingSub,
                      {
                        color: permissionInfo.granted ? (theme.isDark ? '#34D399' : '#059669') : theme.warning,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {permissionInfo.granted ? 'Granted (Notifications Active)' : 'Not Granted'}
                  </Text>
                </View>
              </View>

              {!permissionInfo.granted && (
                <TouchableOpacity
                  onPress={handleRequestPermission}
                  style={[styles.smallActionBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.smallActionBtnText}>Allow</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Android Notification Channel Status Row */}
            {Platform.OS === 'android' && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
                <View style={styles.settingRow}>
                  <View style={styles.settingLabelWrap}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: channelInfo.available ? theme.successSoft : theme.warningSoft,
                        },
                      ]}
                    >
                      <Ionicons
                        name={channelInfo.available ? 'hardware-chip-outline' : 'warning-outline'}
                        size={20}
                        color={channelInfo.available ? theme.success : theme.warning}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                        Android Notification Channel
                      </Text>
                      <Text
                        style={[
                          styles.settingSub,
                          {
                            color: channelInfo.available ? (theme.isDark ? '#34D399' : '#059669') : theme.warning,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {channelInfo.available ? `Active (${channelInfo.channelId})` : 'Not Initialized'}
                      </Text>
                    </View>
                  </View>

                  {!channelInfo.available && (
                    <TouchableOpacity
                      onPress={handleInitChannel}
                      style={[styles.smallActionBtn, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.smallActionBtnText}>Init</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Scheduled Reminders Status */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="time-outline" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    Active Scheduled Reminders
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    {scheduledCount} {scheduledCount === 1 ? 'habit reminder' : 'habit reminders'} registered in OS
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleReconcileReminders}
                disabled={isSyncingReminders}
                style={[
                  styles.smallActionBtn,
                  { backgroundColor: theme.surfaceVariant, borderColor: theme.border, borderWidth: 1 },
                ]}
              >
                <Ionicons name="refresh-outline" size={14} color={theme.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.smallActionBtnText, { color: theme.primary }]}>
                  {isSyncingReminders ? 'Syncing...' : 'Sync'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Test Notification Row (5-Second Delay) */}
            <TouchableOpacity
              onPress={handleSendTestNotification}
              disabled={isTestingNotification}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.infoSoft }]}>
                  {isTestingNotification ? (
                    <ActivityIndicator size="small" color={theme.info} />
                  ) : (
                    <Ionicons name="paper-plane-outline" size={20} color={theme.info} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    Test Notification (5-Second Delay)
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Triggers in 5s. Test foreground heads-up banner or lock phone
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>

            {/* Test Result Inline Feedback Banner */}
            {testResult && (
              <View
                style={[
                  styles.testResultBox,
                  {
                    backgroundColor: testResult.success ? theme.successSoft : theme.dangerSoft,
                    borderColor: testResult.success ? theme.success : theme.danger,
                  },
                ]}
              >
                <Ionicons
                  name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={testResult.success ? theme.success : theme.danger}
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.testResultTitle,
                      { color: testResult.success ? (theme.isDark ? '#34D399' : '#059669') : theme.danger },
                    ]}
                  >
                    {testResult.success ? 'Notification Scheduled' : 'Notification Failed'}
                  </Text>
                  <Text
                    style={[
                      styles.testResultText,
                      { color: testResult.success ? theme.textPrimary : theme.textSecondary },
                    ]}
                  >
                    {testResult.message}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Explanatory Info Callout */}
            <View style={styles.infoCalloutBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.textMuted}
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text style={[styles.infoCallout, { color: theme.textSecondary }]}>
                HabitFlow notifications run 100% offline via native Android notification channels without remote servers or cloud accounts.
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Data & Storage Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DATA & BACKUP
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            {/* View Backup JSON */}
            <TouchableOpacity
              onPress={handleOpenBackup}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.infoSoft }]}>
                  <Ionicons name="download-outline" size={20} color={theme.info} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    Export Offline Backup
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    View raw JSON backup of your habits
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Reset Today */}
            <TouchableOpacity
              onPress={handleResetToday}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.warningSoft }]}>
                  <Ionicons name="refresh-outline" size={20} color={theme.warning} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    Clear Today's Check-ins
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Uncheck all habits for today only
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            {/* Clear All Data */}
            <TouchableOpacity
              onPress={handleResetAllData}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.dangerSoft }]}>
                  <Ionicons name="trash-bin-outline" size={20} color={theme.danger} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.danger }]}>
                    Erase All Habits & Data
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Permanently wipe database and cancel all reminders
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. About & Portfolio Link */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ABOUT
          </Text>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('About')}
              style={styles.actionRow}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabelWrap}>
                <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                    About HabitFlow
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Version 1.0.0 • Offline Habit Tracker
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Backup JSON Viewer Modal */}
      <Modal
        visible={backupModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBackupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Offline Data Backup
              </Text>
              <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              All your habit records are stored securely in local device storage.
            </Text>

            <ScrollView style={[styles.jsonBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.jsonText, { color: theme.textPrimary }]}>
                {backupJson}
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setBackupModalVisible(false)}
              style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSub: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  themeModesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  smallActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  testResultTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  testResultText: {
    fontSize: 11,
    lineHeight: 16,
  },
  infoCalloutBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  infoCallout: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  jsonBox: {
    borderRadius: 12,
    padding: 12,
    maxHeight: 300,
    marginBottom: 16,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  closeModalBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
