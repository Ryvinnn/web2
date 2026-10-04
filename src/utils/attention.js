/**
 * Dynamic "Needs Attention" / "Perlu Perhatian" Detection & Prioritization Engine
 * Synchronized with live Projects, Goals/Targets, Daily Tasks, and Subtasks.
 *
 * Uses local device time/timezone (never hardcoded UTC or specific timezone).
 * Fully localized for Bahasa Indonesia ('id') and English ('en').
 */

import { getTaskPlannedDate } from "./dateTime.js";

const MONTH_MAP = {
  jan: 0, januari: 0, january: 0,
  feb: 1, februari: 1, february: 1,
  mar: 2, maret: 2, march: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5, june: 5,
  jul: 6, juli: 6, july: 6,
  agu: 7, agt: 7, agustus: 7, aug: 7, august: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9, october: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11, december: 11
};

/**
 * Safely parse any date string or Date object into a local Date at midnight (00:00:00.000).
 * Prevents UTC boundary shift bugs.
 * Handles ISO strings (YYYY-MM-DD), English dates, Indonesian dates, and Month-Year formats.
 *
 * @param {Date|string|null|undefined} dateInput
 * @returns {Date|null}
 */
export function parseAnyDate(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  if (typeof dateInput !== "string") return null;

  const s = dateInput.trim().toLowerCase();
  if (!s || s.includes("completed") || s.includes("selesai")) {
    return null;
  }

  // 1. ISO format: YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return new Date(year, month, day);
  }

  // 2. Day Month Year: e.g. "05 Okt 2026", "28 Sep 2026", "15 Desember 2026"
  const dmyMatch = s.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (dmyMatch && MONTH_MAP[dmyMatch[2]] !== undefined) {
    const day = Number(dmyMatch[1]);
    const month = MONTH_MAP[dmyMatch[2]];
    const year = Number(dmyMatch[3]);
    return new Date(year, month, day);
  }

  // 3. Month Day, Year: e.g. "Sep 28, 2026", "October 05, 2026"
  const mdyMatch = s.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdyMatch && MONTH_MAP[mdyMatch[1]] !== undefined) {
    const month = MONTH_MAP[mdyMatch[1]];
    const day = Number(mdyMatch[2]);
    const year = Number(mdyMatch[3]);
    return new Date(year, month, day);
  }

  // 4. Month Year: e.g. "Nov 2026", "November 2026"
  const myMatch = s.match(/^([a-z]+)\s+(\d{4})/);
  if (myMatch && MONTH_MAP[myMatch[1]] !== undefined) {
    const month = MONTH_MAP[myMatch[1]];
    const year = Number(myMatch[2]);
    return new Date(year, month, 1);
  }

  // 5. Standard fallback
  const fallback = new Date(dateInput);
  if (!isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }

  return null;
}

/**
 * Calculates calendar day difference in user's local timezone.
 *
 * @param {Date|string} targetDate
 * @param {Date} [referenceDate=new Date()]
 * @returns {number|null}
 */
export function getCalendarDayDiff(targetDate, referenceDate = new Date()) {
  const t = parseAnyDate(targetDate);
  const r = parseAnyDate(referenceDate);
  if (!t || !r) return null;
  return Math.round((t.getTime() - r.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format subtitle for attention items according to user language.
 */
function getAttentionSubtitleText({ diffDays, incompleteSubCount, language, t }) {
  const isId = language === "id";

  if (diffDays !== null && diffDays < 0) {
    const days = Math.abs(diffDays);
    if (t) {
      return t("dashboard.needsAttentionDaysOverdue", {
        days,
        plural: days > 1 ? "s" : ""
      });
    }
    return isId ? `Terlewat ${days} hari` : `${days} day${days > 1 ? "s" : ""} overdue`;
  }

  if (diffDays === 0) {
    if (t) return t("dashboard.needsAttentionDueToday");
    return isId ? "Tenggat hari ini" : "Due today";
  }

  if (diffDays === 1) {
    if (t) return t("dashboard.needsAttentionDueTomorrow");
    return isId ? "Tenggat besok" : "Due tomorrow";
  }

  if (diffDays !== null && diffDays > 1 && diffDays <= 3) {
    if (t) return t("dashboard.needsAttentionDueInDays", { days: diffDays });
    return isId ? `Tenggat dalam ${diffDays} hari` : `Due in ${diffDays} days`;
  }

  if (incompleteSubCount !== undefined && incompleteSubCount > 0) {
    if (t) {
      return t("dashboard.needsAttentionSubtasksRemaining", {
        count: incompleteSubCount,
        plural: incompleteSubCount > 1 ? "s" : ""
      });
    }
    return isId
      ? `${incompleteSubCount} sub-tugas belum selesai`
      : `${incompleteSubCount} subtask${incompleteSubCount > 1 ? "s" : ""} remaining`;
  }

  return "";
}

/**
 * Priority mapping helper for secondary sorting
 */
function getPriorityWeight(priority) {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

/**
 * Compute the live list of items that require attention from user's actual data:
 * - Projects
 * - Goals / Targets
 * - Daily Tasks
 * - Subtasks
 *
 * Prioritization:
 * 1. Overdue items (diffDays < 0)
 * 2. Deadlines today (diffDays === 0)
 * 3. Deadlines tomorrow / next few days (1 <= diffDays <= 3)
 * 4. Tasks with incomplete subtasks
 *
 * Within each category: closest deadline first.
 * No duplicate entries for the same underlying item.
 *
 * @param {object} params
 * @param {Array<object>} params.projects
 * @param {Array<object>} params.goals
 * @param {Array<object>} params.tasks
 * @param {Date} [params.currentDate=new Date()]
 * @param {"id"|"en"} [params.language="id"]
 * @param {Function} [params.t]
 * @returns {Array<object>}
 */
export function computeNeedsAttention({
  projects = [],
  goals = [],
  tasks = [],
  currentDate = new Date(),
  language = "id",
  t = null
}) {
  const refMidnight = parseAnyDate(currentDate) || new Date();
  const isId = language === "id";

  const rawItems = [];
  const processedEntityIds = new Set(); // Prevent duplicate items for same underlying entity

  // Helper action strings
  const viewActionText = t ? t("dashboard.attentionLabels.viewAction") : (isId ? "Lihat →" : "View →");
  const reviewActionText = t ? t("dashboard.attentionLabels.reviewAction") : "Review";
  const prepareActionText = t ? t("dashboard.attentionLabels.prepareAction") : (isId ? "Siapkan" : "Prepare");

  // =========================================================================
  // 1. EVALUATE PROJECTS
  // =========================================================================
  for (const p of projects) {
    if (!p || p.status === "completed" || p.progress === 100) continue;
    if (!p.deadline) continue;

    const pDate = parseAnyDate(p.deadline);
    if (!pDate) continue;

    const diffDays = Math.round((pDate.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));
    const entityKey = `project:${p.id || p.key}`;

    if (diffDays < 0) {
      // Overdue Project
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-p-${p.id || p.key}`,
        type: "project",
        entityId: p.id || p.key,
        projectId: p.id,
        projectKey: p.key || p.id,
        categoryPriority: 1, // 1: Overdue
        diffDays,
        priorityWeight: getPriorityWeight(p.priority || "high"),
        title: p.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-error",
        actionLabel: viewActionText,
        actionColor: "text-error hover:bg-error hover:text-on-error",
        targetRoute: "/projects"
      });
    } else if (diffDays === 0) {
      // Project deadline is today
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-p-${p.id || p.key}`,
        type: "project",
        entityId: p.id || p.key,
        projectId: p.id,
        projectKey: p.key || p.id,
        categoryPriority: 2, // 2: Today
        diffDays,
        priorityWeight: getPriorityWeight(p.priority || "high"),
        title: p.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-[#B45309]",
        actionLabel: viewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: "/projects"
      });
    } else if (diffDays > 0 && diffDays <= 3) {
      // Upcoming project deadline (1 to 3 days)
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-p-${p.id || p.key}`,
        type: "project",
        entityId: p.id || p.key,
        projectId: p.id,
        projectKey: p.key || p.id,
        categoryPriority: 3, // 3: Upcoming
        diffDays,
        priorityWeight: getPriorityWeight(p.priority || "medium"),
        title: p.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-[#B45309]",
        actionLabel: viewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: "/projects"
      });
    }
  }

  // =========================================================================
  // 2. EVALUATE GOALS / TARGETS
  // =========================================================================
  for (const g of goals) {
    if (!g || g.status === "completed" || g.progress === 100) continue;
    if (!g.deadline) continue;

    const gDate = parseAnyDate(g.deadline);
    if (!gDate) continue;

    const diffDays = Math.round((gDate.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));
    const entityKey = `goal:${g.id}`;

    if (diffDays < 0) {
      // Overdue Goal
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-g-${g.id}`,
        type: "goal",
        entityId: g.id,
        goalId: g.id,
        categoryPriority: 1, // 1: Overdue
        diffDays,
        priorityWeight: getPriorityWeight(g.priority || "high"),
        title: g.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-error",
        actionLabel: reviewActionText,
        actionColor: "text-error hover:bg-error hover:text-on-error",
        targetRoute: `/goals?goalId=${g.id}`
      });
    } else if (diffDays === 0) {
      // Goal deadline is today
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-g-${g.id}`,
        type: "goal",
        entityId: g.id,
        goalId: g.id,
        categoryPriority: 2, // 2: Today
        diffDays,
        priorityWeight: getPriorityWeight(g.priority || "high"),
        title: g.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-[#B45309]",
        actionLabel: reviewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: `/goals?goalId=${g.id}`
      });
    } else if (diffDays > 0 && diffDays <= 3) {
      // Upcoming goal deadline (1 to 3 days)
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-g-${g.id}`,
        type: "goal",
        entityId: g.id,
        goalId: g.id,
        categoryPriority: 3, // 3: Upcoming
        diffDays,
        priorityWeight: getPriorityWeight(g.priority || "medium"),
        title: g.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-primary",
        actionLabel: reviewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: `/goals?goalId=${g.id}`
      });
    }
  }

  // =========================================================================
  // 3. EVALUATE DAILY TASKS & SUBTASKS
  // =========================================================================
  for (const tsk of tasks) {
    if (!tsk || tsk.completed) continue;

    const entityKey = `task:${tsk.id}`;
    const plannedDateStr = getTaskPlannedDate(tsk, currentDate);
    const tDate = parseAnyDate(plannedDateStr);

    let diffDays = null;
    if (tDate) {
      diffDays = Math.round((tDate.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));
    } else if (tsk.status === "overdue") {
      diffDays = -1;
    } else if (tsk.status === "today") {
      diffDays = 0;
    }

    const subtasks = Array.isArray(tsk.subtasks) ? tsk.subtasks : [];
    const incompleteSubtasks = subtasks.filter((st) => !st.completed);
    const incompleteSubCount = incompleteSubtasks.length;

    if (diffDays !== null && diffDays < 0) {
      // Overdue Task
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-t-${tsk.id}`,
        type: "task",
        entityId: tsk.id,
        taskId: tsk.id,
        categoryPriority: 1, // 1: Overdue
        diffDays,
        priorityWeight: getPriorityWeight(tsk.priority || "high"),
        title: tsk.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-error",
        actionLabel: viewActionText,
        actionColor: "text-error hover:bg-error hover:text-on-error",
        targetRoute: `/tasks?taskId=${tsk.id}`
      });
    } else if (diffDays === 0) {
      // Task due today
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-t-${tsk.id}`,
        type: "task",
        entityId: tsk.id,
        taskId: tsk.id,
        categoryPriority: 2, // 2: Today
        diffDays,
        priorityWeight: getPriorityWeight(tsk.priority || "medium"),
        title: tsk.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-[#B45309]",
        actionLabel: viewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: `/tasks?taskId=${tsk.id}`
      });
    } else if (diffDays !== null && diffDays > 0 && diffDays <= 3) {
      // Upcoming task deadline (1 to 3 days)
      processedEntityIds.add(entityKey);
      rawItems.push({
        id: `na-t-${tsk.id}`,
        type: "task",
        entityId: tsk.id,
        taskId: tsk.id,
        categoryPriority: 3, // 3: Upcoming
        diffDays,
        priorityWeight: getPriorityWeight(tsk.priority || "medium"),
        title: tsk.title,
        subtitle: getAttentionSubtitleText({ diffDays, language, t }),
        dotColor: "bg-secondary",
        actionLabel: diffDays === 1 ? prepareActionText : viewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: `/tasks?taskId=${tsk.id}`
      });
    } else if (incompleteSubCount > 0 && !processedEntityIds.has(entityKey)) {
      // Active Task with incomplete subtasks (not already captured by urgent deadline)
      processedEntityIds.add(entityKey);
      const prefix = isId ? "Tugas: " : "Task: ";
      rawItems.push({
        id: `na-sub-${tsk.id}`,
        type: "subtask",
        entityId: tsk.id,
        taskId: tsk.id,
        categoryPriority: 4, // 4: Incomplete subtasks
        diffDays: diffDays !== null ? diffDays : 999,
        priorityWeight: getPriorityWeight(tsk.priority || "low"),
        title: `${prefix}${tsk.title}`,
        subtitle: getAttentionSubtitleText({ incompleteSubCount, language, t }),
        dotColor: "bg-primary",
        actionLabel: reviewActionText,
        actionColor: "text-on-surface hover:bg-surface-container-highest",
        targetRoute: `/tasks?taskId=${tsk.id}`
      });
    }
  }

  // =========================================================================
  // 4. SORTING INTELLIGENTLY
  // =========================================================================
  rawItems.sort((a, b) => {
    // 1. Category Priority (1: Overdue, 2: Today, 3: Upcoming 1-3d, 4: Incomplete subtasks)
    if (a.categoryPriority !== b.categoryPriority) {
      return a.categoryPriority - b.categoryPriority;
    }

    // 2. Within Category 1 (Overdue): Closest deadline first (e.g. -1 before -2 before -6)
    if (a.categoryPriority === 1) {
      if (a.diffDays !== b.diffDays) {
        return b.diffDays - a.diffDays;
      }
      return b.priorityWeight - a.priorityWeight;
    }

    // 3. Within Category 2 (Today): Highest priority task first
    if (a.categoryPriority === 2) {
      if (a.priorityWeight !== b.priorityWeight) {
        return b.priorityWeight - a.priorityWeight;
      }
      return a.title.localeCompare(b.title);
    }

    // 4. Within Category 3 (Upcoming): Closest deadline first (1 day before 2 days before 3 days)
    if (a.categoryPriority === 3) {
      if (a.diffDays !== b.diffDays) {
        return a.diffDays - b.diffDays;
      }
      return b.priorityWeight - a.priorityWeight;
    }

    // 5. Within Category 4 (Subtasks): Higher priority first
    if (a.priorityWeight !== b.priorityWeight) {
      return b.priorityWeight - a.priorityWeight;
    }

    return a.title.localeCompare(b.title);
  });

  return rawItems;
}
