// src/theme/colors.js
// Modern Indigo / Royal Purple Palette with full Light & Dark mode support

export const HABIT_COLORS = [
  '#6366F1', // Indigo (Default)
  '#8B5CF6', // Purple
  '#A855F7', // Deep Violet
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber / Gold
  '#10B981', // Emerald Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
];

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'health', label: 'Health', icon: 'water' },
  { id: 'fitness', label: 'Fitness', icon: 'barbell' },
  { id: 'productivity', label: 'Productivity', icon: 'laptop' },
  { id: 'learning', label: 'Learning', icon: 'book' },
  { id: 'mindset', label: 'Mindset', icon: 'heart' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'leaf' },
];

export const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '💻', '🍎',
  '💤', '🏋️', '🚶', '🌿', '⭐', '🎯',
  '🎨', '🎸', '💊', '✍️', '🚲', '🥑'
];

export const lightColors = {
  isDark: false,
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  primarySoft: '#EEF2FF',
  secondary: '#EC4899',
  accent: '#8B5CF6',
  
  // Backgrounds & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  surfaceMuted: '#E2E8F0',
  
  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderHighlight: '#C7D2FE',
  
  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Status & Feedback
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  info: '#3B82F6',
  infoSoft: '#DBEAFE',

  // Navigation & Tab Bar
  tabBackground: '#FFFFFF',
  tabBorder: '#E2E8F0',
  tabActive: '#6366F1',
  tabInactive: '#94A3B8',

  // Card & FAB
  cardShadow: 'rgba(99, 102, 241, 0.08)',
  fabBackground: '#6366F1',
  fabText: '#FFFFFF',
};

export const darkColors = {
  isDark: true,
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',
  primarySoft: '#1E1B4B',
  secondary: '#F472B6',
  accent: '#A78BFA',

  // Backgrounds & Surfaces
  background: '#0B0F19',
  surface: '#151D2F',
  surfaceElevated: '#1E293B',
  surfaceVariant: '#1F293D',
  surfaceMuted: '#334155',

  // Borders & Dividers
  border: '#2A364F',
  borderLight: '#1E293B',
  borderHighlight: '#4338CA',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F19',

  // Status & Feedback
  success: '#34D399',
  successSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  info: '#60A5FA',
  infoSoft: '#1E3A8A',

  // Navigation & Tab Bar
  tabBackground: '#151D2F',
  tabBorder: '#2A364F',
  tabActive: '#818CF8',
  tabInactive: '#64748B',

  // Card & FAB
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  fabBackground: '#6366F1',
  fabText: '#FFFFFF',
};
