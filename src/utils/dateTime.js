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
