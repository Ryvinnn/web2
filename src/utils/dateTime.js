/**
 * Time and Date utilities for Ignos Workspace
 * Uses device's local time and timezone (never hardcoding UTC or specific timezones)
 */

/**
 * Determine time period for greetings according to the application rules:
 * - 05:00–11:59 -> "morning"
 * - 12:00–17:59 -> "afternoon"
 * - 18:00–04:59 -> "evening"
 *
 * @param {Date} [date=new Date()]
 * @returns {"morning" | "afternoon" | "evening"}
 */
export function getTimePeriod(date = new Date()) {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "morning";
  }
  if (hours >= 12 && hours < 18) {
    return "afternoon";
  }
  return "evening";
}

/**
 * Format local date in full format: "Hari, Tanggal Bulan Tahun" / "Weekday, Month Day, Year"
 * e.g. "Minggu, 4 Oktober 2026" / "Sunday, October 4, 2026"
 *
 * @param {Date|string|number} [date=new Date()]
 * @param {"id"|"en"} [language="id"]
 * @returns {string}
 */
export function formatLocalDateLong(date = new Date(), language = "id") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const locale = language === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(d);
}

/**
 * Format month and year: e.g. "Oktober 2026" / "October 2026"
 *
 * @param {Date|string|number} [date=new Date()]
 * @param {"id"|"en"} [language="id"]
 * @returns {string}
 */
export function formatLocalMonthYear(date = new Date(), language = "id") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const locale = language === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric"
  }).format(d);
}

/**
 * Format local date as YYYY-MM-DD using device's local timezone (NOT UTC)
 * Avoids UTC boundary shifts.
 *
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function formatLocalDateToISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safely parse date string or Date object to YYYY-MM-DD input format in local time
 *
 * @param {Date|string|null|undefined} dateInput
 * @returns {string}
 */
export function formatLocalDateToInput(dateInput) {
  if (!dateInput) {
    return formatLocalDateToISO(new Date());
  }
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (d instanceof Date && !isNaN(d.getTime())) {
    return formatLocalDateToISO(d);
  }
  return formatLocalDateToISO(new Date());
}

/**
 * Format local time: e.g. "14:30" or "02:30 PM"
 *
 * @param {Date|string|number} [date=new Date()]
 * @param {"id"|"en"} [language="id"]
 * @returns {string}
 */
export function formatLocalTime(date = new Date(), language = "id") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";

  const locale = language === "id" ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: language !== "id"
  }).format(d);
}

/**
 * Format relative time (e.g. "2 jam yang lalu", "Just now", etc.)
 *
 * @param {Date|string|number} dateOrTimestamp
 * @param {"id"|"en"} [language="id"]
 * @returns {string}
 */
export function formatRelativeTime(dateOrTimestamp, language = "id") {
  const d = dateOrTimestamp instanceof Date ? dateOrTimestamp : new Date(dateOrTimestamp);
  if (isNaN(d.getTime())) return String(dateOrTimestamp || "");

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isId = language === "id";

  if (diffMin < 1) {
    return isId ? "Baru saja" : "Just now";
  }
  if (diffMin < 60) {
    return isId ? `${diffMin} menit yang lalu` : `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  }
  if (diffHour < 24) {
    return isId ? `${diffHour} jam yang lalu` : `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  }
  if (diffDay === 1) {
    return isId ? "Kemarin" : "Yesterday";
  }
  if (diffDay < 7) {
    return isId ? `${diffDay} hari yang lalu` : `${diffDay} days ago`;
  }

  const locale = isId ? "id-ID" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(d);
}

/**
 * Check if two dates are on the same calendar day in local time
 *
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
export function isSameLocalDay(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date is today in local time
 *
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export function isTodayLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  return isSameLocalDay(d, new Date());
}

/**
 * Returns the 7 days of the current week (Monday through Sunday)
 * relative to the user's local reference date.
 *
 * @param {Date|string|number} [referenceDate=new Date()]
 * @param {"id"|"en"} [language="id"]
 * @returns {Array<{ date: Date, isoDate: string, dayKey: string, dayName: string, shortDay: string, dayNumber: number, isToday: boolean }>}
 */
export function getCurrentWeekDays(referenceDate = new Date(), language = "id") {
  const d = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const safeDate = isNaN(d.getTime()) ? new Date() : d;

  const day = safeDate.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate() - diffToMonday);

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayNamesId = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const dayNamesEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayShortId = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const dayShortEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const iso = formatLocalDateToISO(dayDate);
    const isToday = isSameLocalDay(dayDate, safeDate);
    return {
      date: dayDate,
      isoDate: iso,
      dayKey: dayKeys[i],
      dayName: language === "id" ? dayNamesId[i] : dayNamesEn[i],
      shortDay: language === "id" ? dayShortId[i] : dayShortEn[i],
      dayNumber: dayDate.getDate(),
      isToday
    };
  });
}

/**
 * Returns grouped weekly intervals for the current month (e.g. 1-7, 8-14, 15-21, 22-28, 29-end)
 * relative to the user's local reference date.
 *
 * @param {Date|string|number} [referenceDate=new Date()]
 * @param {"id"|"en"} [language="id"]
 * @returns {Array<{ index: number, startDay: number, endDay: number, isoDates: string[], isCurrentInterval: boolean, label: string, fullLabel: string, dateRangeText: string }>}
 */
export function getCurrentMonthIntervals(referenceDate = new Date(), language = "id") {
  const d = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const safeDate = isNaN(d.getTime()) ? new Date() : d;

  const year = safeDate.getFullYear();
  const month = safeDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentDayNumber = safeDate.getDate();

  const intervalRanges = [
    { start: 1, end: 7 },
    { start: 8, end: 14 },
    { start: 15, end: 21 },
    { start: 22, end: 28 }
  ];
  if (totalDays > 28) {
    intervalRanges.push({ start: 29, end: totalDays });
  }

  return intervalRanges.map((range, idx) => {
    const isoDates = [];
    for (let dayNum = range.start; dayNum <= range.end; dayNum++) {
      const curD = new Date(year, month, dayNum);
      isoDates.push(formatLocalDateToISO(curD));
    }
    const isCurrentInterval = currentDayNumber >= range.start && currentDayNumber <= range.end;
    const labelId = `M${idx + 1}`;
    const labelEn = `W${idx + 1}`;
    const fullLabelId = `M${idx + 1} (${range.start}-${range.end})`;
    const fullLabelEn = `W${idx + 1} (${range.start}-${range.end})`;

    return {
      index: idx,
      startDay: range.start,
      endDay: range.end,
      isoDates,
      isCurrentInterval,
      label: language === "id" ? labelId : labelEn,
      fullLabel: language === "id" ? fullLabelId : fullLabelEn,
      dateRangeText: `${range.start}-${range.end}`
    };
  });
}

/**
 * Resolve a task's planned/due date as a local YYYY-MM-DD ISO string.
 *
 * @param {object} task
 * @param {Date} [referenceDate=new Date()]
 * @returns {string}
 */
export function getTaskPlannedDate(task, referenceDate = new Date()) {
  if (!task) return formatLocalDateToISO(referenceDate);

  if (task.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
    return task.dueDate;
  }
  if (task.deadline && /^\d{4}-\d{2}-\d{2}$/.test(task.deadline)) {
    return task.deadline;
  }
  if (task.createdAt && /^\d{4}-\d{2}-\d{2}$/.test(task.createdAt)) {
    return task.createdAt;
  }

  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const refISO = formatLocalDateToISO(ref);

  if (task.status === "today") {
    return refISO;
  }

  // Parse relative overdue text
  if (task.dueDateText) {
    const text = task.dueDateText.toLowerCase();
    if (text.includes("yesterday") || text.includes("kemarin")) {
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1);
      return formatLocalDateToISO(d);
    }
    if (text.includes("2 days ago") || text.includes("2 hari yang lalu")) {
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 2);
      return formatLocalDateToISO(d);
    }
    const daysAgoMatch = text.match(/(\d+)\s*(day|hari)/);
    if (daysAgoMatch) {
      const num = parseInt(daysAgoMatch[1], 10);
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - num);
      return formatLocalDateToISO(d);
    }
  }

  // Parse timeTag relative indicators
  if (task.timeTag) {
    const tag = task.timeTag.toLowerCase();
    if (tag.includes("today") || tag.includes("hari ini") || tag.includes("done") || tag.includes("selesai")) {
      return refISO;
    }
    if (tag.includes("tomorrow") || tag.includes("besok")) {
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 1);
      return formatLocalDateToISO(d);
    }

    const currentDayOfWeek = ref.getDay();
    if (tag.includes("monday") || tag.includes("senin")) {
      const diff = (1 - currentDayOfWeek + 7) % 7 || 7;
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + (tag.includes("next") ? diff + 7 : diff));
      return formatLocalDateToISO(d);
    }
    if (tag.includes("friday") || tag.includes("jumat")) {
      const diff = (5 - currentDayOfWeek + 7) % 7;
      const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + diff);
      return formatLocalDateToISO(d);
    }
  }

  if (task.status === "overdue") {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1);
    return formatLocalDateToISO(d);
  }

  if (task.status === "upcoming") {
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 1);
    return formatLocalDateToISO(d);
  }

  return refISO;
}

/**
 * Resolve a task's completed date as a local YYYY-MM-DD ISO string.
 *
 * @param {object} task
 * @param {Date} [referenceDate=new Date()]
 * @returns {string|null}
 */
export function getTaskCompletedDate(task, referenceDate = new Date()) {
  if (!task || !task.completed) return null;

  if (task.completedAt && /^\d{4}-\d{2}-\d{2}$/.test(task.completedAt)) {
    return task.completedAt;
  }

  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const refISO = formatLocalDateToISO(ref);

  if (
    task.status === "today" ||
    (task.timeTag && (task.timeTag.toLowerCase().includes("done") || task.timeTag.toLowerCase().includes("selesai")))
  ) {
    return refISO;
  }

  return getTaskPlannedDate(task, referenceDate);
}

/**
 * Calculate user's consecutive day activity streak from tasks and activity feed.
 *
 * @param {Array<object>} tasks
 * @param {Array<object>} activityFeed
 * @param {Date} [referenceDate=new Date()]
 * @returns {number}
 */
export function calculateStreak(tasks = [], activityFeed = [], referenceDate = new Date()) {
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const todayISO = formatLocalDateToISO(ref);

  // Set of dates with active completion
  const activeDates = new Set();

  // Completed tasks
  for (const t of tasks) {
    const cDate = getTaskCompletedDate(t, ref);
    if (cDate) {
      activeDates.add(cDate);
    }
  }

  // Activity feed items
  for (const act of activityFeed) {
    if (act.date && /^\d{4}-\d{2}-\d{2}$/.test(act.date)) {
      activeDates.add(act.date);
    } else if (act.time && (act.time.toLowerCase().includes("hari ini") || act.time.toLowerCase().includes("today") || act.time.toLowerCase().includes("just now") || act.time.toLowerCase().includes("baru saja"))) {
      activeDates.add(todayISO);
    }
  }

  if (activeDates.size === 0) return 0;

  // Check if today has activity
  let streak = 0;
  let checkDate = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

  if (activeDates.has(todayISO)) {
    // Current streak includes today
    while (activeDates.has(formatLocalDateToISO(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // Check if streak was active as of yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    while (activeDates.has(formatLocalDateToISO(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return streak;
}
