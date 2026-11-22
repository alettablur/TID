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
