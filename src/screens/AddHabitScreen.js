// src/screens/AddHabitScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { HABIT_COLORS, HABIT_ICONS, CATEGORIES } from '../theme/colors';
import { saveHabit, updateHabit } from '../storage/habitStorage';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  formatHourMinuteToString,
  parseTimeStringToHourMinute,
} from '../services/notificationService';

const REMINDER_PRESETS = [
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '12:00 PM',
  '05:00 PM',
  '08:00 PM',
  '09:30 PM',
  '10:00 PM',
];

const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function AddHabitScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // If editing, existing habit object is passed
  const existingHabit = route.params?.habit || null;
  const initialCategory = route.params?.initialCategory || 'health';
  const isEditing = Boolean(existingHabit);

  const [name, setName] = useState(existingHabit?.name || '');
  const [category, setCategory] = useState(
    existingHabit?.category || (initialCategory === 'all' ? 'health' : initialCategory)
  );
  const [color, setColor] = useState(existingHabit?.color || HABIT_COLORS[0]);
  const [icon, setIcon] = useState(existingHabit?.icon || '💧');

  // Reminder states
  const initialReminderTime = existingHabit?.reminderTime || '08:00 AM';
  const initialReminderEnabled =
    existingHabit?.reminderEnabled ??
    Boolean(existingHabit?.reminderTime && existingHabit?.reminderTime !== 'None');

  const [reminderEnabled, setReminderEnabled] = useState(initialReminderEnabled);
  const [reminderTime, setReminderTime] = useState(initialReminderTime);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Time Picker Modal State
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const parsedTime = parseTimeStringToHourMinute(reminderTime);
  const [pickerHour, setPickerHour] = useState(
    parsedTime.hour % 12 === 0 ? 12 : parsedTime.hour % 12
  );
  const [pickerMinute, setPickerMinute] = useState(parsedTime.minute);
  const [pickerPeriod, setPickerPeriod] = useState(parsedTime.hour >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Habit' : 'New Habit',
    });
    checkPermissions();
  }, [navigation, isEditing]);

  const checkPermissions = async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionGranted(status.granted);
  };

  const handleToggleReminder = async (enabled) => {
    setReminderEnabled(enabled);
    if (enabled) {
      const granted = await requestNotificationPermission();
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert(
          'Notification Permission Needed',
          'To receive daily habit reminders on your device, please grant notification permissions for HabitFlow in your device Settings.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleRequestPermissionDirectly = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      Alert.alert('Permission Granted', 'HabitFlow can now send you daily reminders.');
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in Android Settings > Apps > HabitFlow > Notifications.'
      );
    }
  };

  const handleOpenCustomTimePicker = () => {
    const { hour, minute } = parseTimeStringToHourMinute(reminderTime);
    setPickerHour(hour % 12 === 0 ? 12 : hour % 12);
    setPickerMinute(minute);
    setPickerPeriod(hour >= 12 ? 'PM' : 'AM');
    setTimePickerVisible(true);
  };

  const adjustMinute = (delta) => {
    setPickerMinute((prev) => {
      let next = (prev + delta) % 60;
      if (next < 0) next += 60;
      return next;
    });
  };

  const adjustHour = (delta) => {
    setPickerHour((prev) => {
      let next = prev + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const handleApplyCustomTime = () => {
    let final24Hour = pickerHour % 12;
    if (pickerPeriod === 'PM') final24Hour += 12;

    const formatted = formatHourMinuteToString(final24Hour, pickerMinute);
    setReminderTime(formatted);
    setTimePickerVisible(false);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Please enter a name for your habit.');
      return;
    }
    if (trimmedName.length < 2) {
      Alert.alert('Validation Error', 'Habit name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        category: category.toLowerCase(),
        color,
        icon,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : null,
      };

      if (isEditing) {
        await updateHabit({ ...payload, id: existingHabit.id });
      } else {
        await saveHabit(payload);
      }

      navigation.goBack();
    } catch (e) {
      console.error('Error saving habit', e);
      Alert.alert('Error', 'Unable to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Preview Card */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: theme.surface,
              borderColor: color,
              shadowColor: theme.cardShadow,
            },
          ]}
        >
          <View style={[styles.previewIconBox, { backgroundColor: color }]}>
            <Text style={styles.previewIcon}>{icon}</Text>
          </View>
          <View style={styles.previewContent}>
            <View style={styles.previewBadgeRow}>
              <Text style={[styles.previewLabel, { color: theme.textMuted }]}>
                {category.toUpperCase()} • PREVIEW
              </Text>
              {reminderEnabled && (
                <View style={[styles.miniReminderBadge, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons
                    name="notifications-outline"
                    size={10}
                    color={theme.primary}
                    style={{ marginRight: 2 }}
                  />
                  <Text style={[styles.miniReminderText, { color: theme.primary }]}>
                    {reminderTime}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.previewTitle,
                { color: name.trim() ? theme.textPrimary : theme.textMuted },
              ]}
              numberOfLines={1}
            >
              {name.trim() || 'e.g. Morning Hydration'}
            </Text>
          </View>
        </View>

        {/* 1. Habit Name Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Habit Name *</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            placeholder="e.g. Drink 2L Water, Read 20 mins, Workout"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={40}
            autoFocus={!isEditing}
          />
        </View>

        {/* 2. Category Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Category</Text>
          <View style={styles.optionsWrap}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const isSelected = category.toLowerCase() === cat.id.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Icon Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose an Icon</Text>
          <View style={styles.iconsGrid}>
            {HABIT_ICONS.map((emoji) => {
              const isSelected = icon === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setIcon(emoji)}
                  style={[
                    styles.iconCell,
                    {
                      backgroundColor: isSelected ? theme.primarySoft : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Color Palette Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Theme Color</Text>
          <View style={styles.colorsGrid}>
            {HABIT_COLORS.map((hex) => {
              const isSelected = color === hex;
              return (
                <TouchableOpacity
                  key={hex}
                  onPress={() => setColor(hex)}
                  style={[styles.colorCell, { backgroundColor: hex }]}
                  activeOpacity={0.8}
                >
                  {isSelected && <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Daily Reminder Notifications Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.reminderCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            {/* Toggle Row */}
            <View style={styles.reminderToggleRow}>
              <View style={styles.reminderLabelWrap}>
                <View
                  style={[
                    styles.reminderIconBox,
                    {
                      backgroundColor: reminderEnabled ? theme.primarySoft : theme.surfaceVariant,
                    },
                  ]}
                >
                  <Ionicons
                    name={reminderEnabled ? 'notifications' : 'notifications-off-outline'}
                    size={20}
                    color={reminderEnabled ? theme.primary : theme.textMuted}
                  />
                </View>
                <View>
                  <Text style={[styles.reminderCardTitle, { color: theme.textPrimary }]}>
                    Daily Habit Reminder
                  </Text>
                  <Text style={[styles.reminderCardSubtitle, { color: theme.textSecondary }]}>
                    {reminderEnabled ? `Scheduled daily at ${reminderTime}` : 'Disabled'}
                  </Text>
                </View>
              </View>

              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* When Enabled: Time Presets & Custom Time Picker */}
            {reminderEnabled && (
              <View style={styles.timeSettingsContainer}>
                <View style={[styles.reminderDivider, { backgroundColor: theme.borderLight }]} />

                {/* Android Permission Warning Banner if disabled */}
                {!permissionGranted && (
                  <TouchableOpacity
                    onPress={handleRequestPermissionDirectly}
                    style={[
                      styles.permissionBanner,
                      { backgroundColor: theme.warningSoft, borderColor: theme.warning },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color="#D97706"
                      style={{ marginRight: 6 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.permissionBannerTitle, { color: '#B45309' }]}>
                        Notifications are Disabled
                      </Text>
                      <Text style={[styles.permissionBannerSub, { color: '#D97706' }]}>
                        Tap here to allow HabitFlow notification permissions in Android.
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={[styles.timePickerLabel, { color: theme.textSecondary }]}>
                  SELECT DAILY REMINDER TIME
                </Text>

                {/* Preset Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timeChipsScroll}
                >
                  {REMINDER_PRESETS.map((preset) => {
                    const isSelected = reminderTime === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        onPress={() => setReminderTime(preset)}
                        style={[
                          styles.timePresetChip,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surfaceVariant,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timePresetText,
                            { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                          ]}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Custom Time Picker Button */}
                <TouchableOpacity
                  onPress={handleOpenCustomTimePicker}
                  style={[
                    styles.customTimeButton,
                    {
                      backgroundColor: theme.surfaceVariant,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.customTimeButtonText, { color: theme.primary }]}>
                    Choose Custom Time ({reminderTime})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 6. Action Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 },
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Habit & Reminders'
              : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Upgraded Custom Time Selector Modal */}
      <Modal
        visible={timePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Set Reminder Time
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Choose any hour and minute for daily alert
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setTimePickerVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Live Digital Display Bar with AM/PM Selector */}
            <View style={[styles.digitalDisplayCard, { backgroundColor: theme.primarySoft }]}>
              <View style={styles.digitalTimeWrap}>
                <Ionicons
                  name="alarm-outline"
                  size={24}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.digitalTimeText, { color: theme.primary }]}>
                  {String(pickerHour).padStart(2, '0')} : {String(pickerMinute).padStart(2, '0')}
                </Text>
              </View>

              {/* AM / PM Toggle Pill */}
              <View style={[styles.periodPillContainer, { backgroundColor: theme.surface }]}>
                {['AM', 'PM'].map((p) => {
                  const isSel = pickerPeriod === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPickerPeriod(p)}
                      style={[
                        styles.periodPill,
                        {
                          backgroundColor: isSel ? theme.primary : 'transparent',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.periodPillText,
                          { color: isSel ? '#FFFFFF' : theme.textSecondary },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Controls Container */}
            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {/* 1. Hour Section */}
              <View style={styles.pickerSection}>
                <View style={styles.pickerSectionHeader}>
                  <Text style={[styles.pickerColLabel, { color: theme.textSecondary }]}>
                    Hour (1 - 12)
                  </Text>
                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      onPress={() => adjustHour(-1)}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Ionicons name="remove" size={16} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustHour(1)}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Ionicons name="add" size={16} color={theme.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.pickerValuesRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                    const isSel = pickerHour === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        onPress={() => setPickerHour(h)}
                        style={[
                          styles.hourChip,
                          {
                            backgroundColor: isSel ? theme.primary : theme.surfaceVariant,
                            borderColor: isSel ? theme.primary : theme.border,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.hourChipText,
                            { color: isSel ? '#FFFFFF' : theme.textPrimary },
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Minute Section with 5-minute Presets & Exact Steppers */}
              <View style={styles.pickerSection}>
                <View style={styles.pickerSectionHeader}>
                  <Text style={[styles.pickerColLabel, { color: theme.textSecondary }]}>
                    Minute ({String(pickerMinute).padStart(2, '0')})
                  </Text>

                  {/* Steppers: -5, -1, +1, +5 for exact minute selection */}
                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      onPress={() => adjustMinute(-5)}
                      style={[
                        styles.stepperBtnSmall,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.textPrimary }]}>-5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustMinute(-1)}
                      style={[
                        styles.stepperBtnSmall,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.textPrimary }]}>-1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustMinute(1)}
                      style={[
                        styles.stepperBtnSmall,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.textPrimary }]}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => adjustMinute(5)}
                      style={[
                        styles.stepperBtnSmall,
                        { backgroundColor: theme.surfaceVariant, borderColor: theme.border },
                      ]}
                    >
                      <Text style={[styles.stepperText, { color: theme.textPrimary }]}>+5</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 5-minute interval quick chips */}
                <View style={styles.pickerValuesRow}>
                  {MINUTE_PRESETS.map((m) => {
                    const isSel = pickerMinute === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setPickerMinute(m)}
                        style={[
                          styles.minuteChip,
                          {
                            backgroundColor: isSel ? theme.primary : theme.surfaceVariant,
                            borderColor: isSel ? theme.primary : theme.border,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.minuteChipText,
                            { color: isSel ? '#FFFFFF' : theme.textPrimary },
                          ]}
                        >
                          {String(m).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setTimePickerVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyCustomTime}
                style={[styles.modalConfirmBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalConfirmBtnText}>Apply Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  previewIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  previewIcon: {
    fontSize: 26,
  },
  previewContent: {
    flex: 1,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  miniReminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniReminderText: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  reminderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  reminderCardSubtitle: {
    fontSize: 12,
  },
  timeSettingsContainer: {
    marginTop: 12,
  },
  reminderDivider: {
    height: 1,
    marginBottom: 12,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  permissionBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  permissionBannerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  timePickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  timeChipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  timePresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  timePresetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  customTimeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  digitalDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  digitalTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitalTimeText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  periodPillContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  periodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  periodPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pickerSection: {
    marginBottom: 14,
  },
  pickerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerColLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  stepperBtn: {
    width: 32,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnSmall: {
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pickerValuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hourChip: {
    width: 45,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  minuteChip: {
    width: 45,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
