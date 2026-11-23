/**
 * Returns the start and end of the current week starting Monday.
 */
export function weekBounds(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start, end];
}

/**
 * Returns start and end for the week that is offset weeks from the current week.
 * @param {number} offset - 0 = this week, -1 = last week, 1 = next week.
 * @returns {[Date, Date]}
 */
export function weekBoundsFromOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);
  return weekBounds(date);
}

export function startOfDaysAgo(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

/** Formats date to a label (used for ThankCard)
 *  Gives the outputs:
 *  "today 18:30", "yesterday 09:05" or "18/11/2026 14:00" for older dates '
 */
export function formatDayLabel(date, locale = "en-GB") {
  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  let day;
  if (date >= startOfDaysAgo(0)) day = "today";
  else if (date >= startOfDaysAgo(1)) day = "yesterday";
  else day = date.toLocaleDateString(locale);

  return `${day} ${time}`;
}
