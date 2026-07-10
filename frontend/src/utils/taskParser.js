/**
 * Natural Language Task Parser
 * Parses input strings to automatically extract tasks parameters like due dates and priority.
 * 
 * Future Improvement Note:
 * "Later this can be replaced with an LLM API (like Gemini API) to perform complex semantic parsing."
 */

const WEEKDAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

/**
 * Format a Date object to YYYY-MM-DD in the local timezone.
 * Avoids UTC shifting issues common with toISOString().
 */
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses user text to extract a clean title, priority, and due date.
 * 
 * Examples:
 * - "Call dentist friday" -> { title: "Call dentist", dueDate: "YYYY-MM-DD" (next Friday) }
 * - "Buy groceries tomorrow !high" -> { title: "Buy groceries", dueDate: "YYYY-MM-DD" (tomorrow), priority: "high" }
 * - "Finish report next monday" -> { title: "Finish report", dueDate: "YYYY-MM-DD" (next Monday) }
 * 
 * @param {string} input - The raw input typed by the user.
 * @param {Date} [baseDate] - The current date reference (defaults to now).
 * @returns {object} The parsed task components { title, dueDate, priority }
 */
export function parseTaskInput(input, baseDate = new Date()) {
  if (!input || typeof input !== 'string') {
    return { title: '', dueDate: '', priority: '' };
  }

  let text = input.trim();
  let dueDate = '';
  let priority = '';

  // 1. Parse Priority Indicators
  // Matches: !high, !medium, !low, !med, p1, p2, p3, "high priority", "medium priority", "low priority"
  const priorityRegexes = [
    { regex: /\bhigh\s+priority\b|!high\b|\bp1\b/i, value: 'high' },
    { regex: /\bmedium\s+priority\b|!medium\b|!med\b|\bp2\b/i, value: 'medium' },
    { regex: /\blow\s+priority\b|!low\b|\bp3\b/i, value: 'low' }
  ];

  for (const { regex, value } of priorityRegexes) {
    if (regex.test(text)) {
      priority = value;
      text = text.replace(regex, ''); // Remove priority from text
      break;
    }
  }

  // 2. Parse Date Indicators
  const textLower = text.toLowerCase();
  
  // A. Today
  if (/\btoday\b/i.test(text)) {
    dueDate = formatDateLocal(baseDate);
    text = text.replace(/\btoday\b/i, '');
  }
  // B. Tomorrow
  else if (/\btomorrow\b/i.test(text)) {
    const tomorrow = new Date(baseDate);
    tomorrow.setDate(baseDate.getDate() + 1);
    dueDate = formatDateLocal(tomorrow);
    text = text.replace(/\btomorrow\b/i, '');
  }
  // C. Next Weekdays (e.g., "next friday")
  else if (/\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.test(text)) {
    const match = text.match(/\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
    const dayName = match[1].toLowerCase();
    const targetDayIndex = WEEKDAYS[dayName];
    const currentDayIndex = baseDate.getDay();

    const targetDate = new Date(baseDate);
    // Find days until that weekday
    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // It's passed or is today in the current week, so find the next one
    }
    // Add another 7 days for "next"
    daysToAdd += 7;
    
    targetDate.setDate(baseDate.getDate() + daysToAdd);
    dueDate = formatDateLocal(targetDate);
    
    // Remove the match from the text
    text = text.replace(match[0], '');
  }
  // D. Upcoming Weekdays (e.g., "friday", "on friday")
  else if (/\b(?:on\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.test(text)) {
    const match = text.match(/\b(?:on\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i);
    const dayName = match[1].toLowerCase();
    const targetDayIndex = WEEKDAYS[dayName];
    const currentDayIndex = baseDate.getDay();

    const targetDate = new Date(baseDate);
    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Day has passed, wrap to next week
    } else if (daysToAdd === 0) {
      // If they specify "friday" on a Friday, we assume they mean next Friday
      // to avoid setting a due date that is already ending. 
      // (Optionally could be today, but next Friday is more common for forward planning).
      daysToAdd = 7;
    }

    targetDate.setDate(baseDate.getDate() + daysToAdd);
    dueDate = formatDateLocal(targetDate);

    text = text.replace(match[0], '');
  }

  // 3. Clean up the title (remove trailing spaces, double spaces, and punctuation leftovers)
  let cleanTitle = text
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .replace(/^\s*[-–—,;:]+\s*/, '') // Remove leading symbols or punctuation
    .replace(/\s*[-–—,;:]+\s*$/, '') // Remove trailing symbols or punctuation
    .trim();

  // If we cleaned the entire string and left nothing, revert to original input or default
  if (!cleanTitle) {
    cleanTitle = input.trim();
  }

  return {
    title: cleanTitle,
    dueDate,
    priority
  };
}
