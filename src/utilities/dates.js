// Every date helper of the app lives here, so all screens show days the same way.
const LOCALE = "en-GB";

// a new date, the given number of days later (negative: earlier)
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// today at 00:00, so a task planned for any time today counts as today
export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// the Monday at 00:00 of the week the date is in (weeks run Monday to Sunday)
export function startOfWeek(date) {
  // getDay() is 0 for Sunday, 1 for Monday … 6 for Saturday
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = addDays(date, -daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// 0 = this week, -1 = last week. The end is the next Monday and is not part of
// the week, so a filter uses date >= start && date < end
export function weekRange(offset) {
  const start = addDays(startOfWeek(new Date()), offset * 7);
  const end = addDays(start, 7);
  return [start, end];
}

// "Sat"
export function formatWeekday(date) {
  return date.toLocaleDateString(LOCALE, { weekday: "short" });
}

// "Sat 10"
export function formatDay(date) {
  return date.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric" });
}

// "Saturday 10"
export function formatLongDay(date) {
  return date.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric" });
}

// "23 Nov"
export function formatShortDate(date) {
  return date.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

// "08:15"
export function formatTime(date) {
  return date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "19:00" when it is 18:20: where a new time starts
export function nextFullHour() {
  const hour = (new Date().getHours() + 1) % 24;
  return `${String(hour).padStart(2, "0")}:00`;
}

// "today", "yesterday" or "Sat 10"
export function formatAgo(date) {
  const today = startOfToday();
  if (date >= today) return "today";
  if (date >= addDays(today, -1)) return "yesterday";
  return formatDay(date);
}
