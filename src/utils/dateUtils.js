// src/utils/dateUtils.js

/**
 * Returns the current or provided date formatted as YYYY-MM-DD
 * using local calendar time (never UTC) to prevent timezone shifts.
 */
export const getLocalDateString = (d = new Date()) => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string into a local Date object set to midnight
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

/**
 * Calculates the difference in days between two YYYY-MM-DD strings
 */
export const getDaysDifference = (d1Str, d2Str) => {
  const d1 = parseLocalDate(d1Str);
  const d2 = parseLocalDate(d2Str);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

/**
 * Formats a date for the main screen greeting header
 * e.g. "Friday, Nov 20"
 */
export const formatDateHeader = (d = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateObj = typeof d === 'string' ? parseLocalDate(d) : d;
  return `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${dateObj.getDate()}`;
};

/**
 * Formats a date as "Nov 20, 2026"
 */
export const formatFullDate = (d = new Date()) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateObj = typeof d === 'string' ? parseLocalDate(d) : d;
  return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
};

/**
 * Returns dynamic greeting based on current local hour
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: 'sunny-outline', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: 'partly-sunny-outline', emoji: '🌤️' };
  if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: 'moon-outline', emoji: '🌙' };
  return { text: 'Good night', icon: 'sparkles-outline', emoji: '✨' };
};

/**
 * Returns array of the last N days with metadata for charts/weekly views
 */
export const getLastNDays = (n = 7) => {
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  const todayStr = getLocalDateString();
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateString = getLocalDateString(target);
    result.push({
      dateString,
      dayLabel: daysShort[target.getDay()],
      dayNumber: target.getDate(),
      isToday: dateString === todayStr,
    });
  }
  return result;
};

/**
 * Generates month grid for the calendar screen
 */
export const getMonthGrid = (year, month) => {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = getLocalDateString();

  const cells = [];
  // Empty slots before 1st of month
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ empty: true, key: `empty-${i}` });
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateString = getLocalDateString(d);
    cells.push({
      empty: false,
      day,
      dateString,
      isToday: dateString === todayStr,
      key: dateString,
    });
  }

  return cells;
};
