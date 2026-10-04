import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  getCurrentWeekDays,
  getCurrentMonthIntervals,
  getTaskPlannedDate,
  getTaskCompletedDate
} from "../utils/dateTime";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    goals,
    projects,
    needsAttention,
    activityFeed,
    tasks,
    toggleTask,
    toggleAllTasks,
    openModal,
    openProjectModal,
    activeGoalsCount,
    activeProjectsCount,
    todayTasks,
    todayCompletedTasks,
    completionPercentage,
    streakCount,
    language,
    currentDate,
    t
  } = useWorkspace();

  const [period, setPeriod] = useState("weekly");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Calculate dynamic weekly and monthly activity data from actual tasks
  const weeklyDays = useMemo(() => {
    return getCurrentWeekDays(currentDate, language);
  }, [currentDate, language]);

  const weeklyChartData = useMemo(() => {
    return weeklyDays.map((day) => {
      const plannedForDay = tasks.filter(
        (task) => getTaskPlannedDate(task, currentDate) === day.isoDate
      );
      const completedForDay = tasks.filter(
        (task) => getTaskCompletedDate(task, currentDate) === day.isoDate
      );

      let plannedCount = plannedForDay.length;
      let completedCount = completedForDay.length;

      if (day.isToday) {
        plannedCount = Math.max(todayTasks.length, plannedCount, todayCompletedTasks.length);
        completedCount = todayCompletedTasks.length;
      } else {
        plannedCount = Math.max(plannedCount, completedCount);
      }

      return {
        key: day.dayKey,
        label: day.shortDay,
        fullLabel: day.dayName,
        isCurrent: day.isToday,
        isoDate: day.isoDate,
        plannedCount,
        completedCount
      };
    });
  }, [weeklyDays, tasks, currentDate, todayTasks.length, todayCompletedTasks.length]);

  const monthlyIntervals = useMemo(() => {
    return getCurrentMonthIntervals(currentDate, language);
  }, [currentDate, language]);

  const monthlyChartData = useMemo(() => {
    return monthlyIntervals.map((interval) => {
      const dateSet = new Set(interval.isoDates);

      const plannedForInterval = tasks.filter((task) => {
        const pDate = getTaskPlannedDate(task, currentDate);
        return dateSet.has(pDate);
      });

      const completedForInterval = tasks.filter((task) => {
        const cDate = getTaskCompletedDate(task, currentDate);
        return dateSet.has(cDate);
      });

      let plannedCount = plannedForInterval.length;
      let completedCount = completedForInterval.length;

      plannedCount = Math.max(plannedCount, completedCount);

      return {
        key: `interval-${interval.index}`,
        label: interval.label,
        fullLabel: interval.fullLabel,
        isCurrent: interval.isCurrentInterval,
        plannedCount,
        completedCount
      };
    });
  }, [monthlyIntervals, tasks, currentDate]);

  const activeChartData = period === "weekly" ? weeklyChartData : monthlyChartData;

  const maxVal = useMemo(() => {
    const max = Math.max(
      ...activeChartData.map((d) => Math.max(d.plannedCount, d.completedCount)),
      0
    );
    return max > 0 ? max : 1;
  }, [activeChartData]);

  const periodStats = useMemo(() => {
    const totalPlanned = activeChartData.reduce((sum, d) => sum + d.plannedCount, 0);
    const totalCompleted = activeChartData.reduce((sum, d) => sum + d.completedCount, 0);
    const percentage = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
    return { totalPlanned, totalCompleted, percentage };
  }, [activeChartData]);

  // Quick add task
  const handleQuickAdd = () => {
    openModal("task");
  };

  // Helper for translating needs attention items
  const getAttentionTitle = (item) => {
    if (item.id === "na-1") return t("dashboard.attentionLabels.authTitle", item.title);
    if (item.id === "na-2") return t("dashboard.attentionLabels.qaTitle", item.title);
    if (item.id === "na-3") return t("dashboard.attentionLabels.eloquentTitle", item.title);
    if (item.id === "na-4") return t("dashboard.attentionLabels.migrationTitle", item.title);
    return item.title;
  };

  const getAttentionSubtitle = (item) => {
    if (item.id === "na-1") return t("dashboard.attentionLabels.authSub", item.subtitle);
    if (item.id === "na-2") return t("dashboard.attentionLabels.qaSub", item.subtitle);
    if (item.id === "na-3") return t("dashboard.attentionLabels.eloquentSub", item.subtitle);
    if (item.id === "na-4") return t("dashboard.attentionLabels.migrationSub", item.subtitle);
    return item.subtitle;
  };

  const getAttentionAction = (item) => {
    if (item.actionLabel.includes("Lihat") || item.actionLabel.includes("View")) {
      return t("dashboard.attentionLabels.viewAction");
    }
    if (item.actionLabel.includes("Review")) {
      return t("dashboard.attentionLabels.reviewAction");
    }
    if (item.actionLabel.includes("Siapkan") || item.actionLabel.includes("Prepare")) {
      return t("dashboard.attentionLabels.prepareAction");
    }
    return item.actionLabel;
  };

  // Helper for translating activity feed items
  const getActivityType = (act) => {
    if (act.id === "act-1") return t("dashboard.activityItems.taskCompleted", act.type);
    if (act.id === "act-2") return t("dashboard.activityItems.goalUpdated", act.type);
    if (act.id === "act-3") return t("dashboard.activityItems.attendanceLogged", act.type);
    return act.type;
  };

  const getActivityDesc = (act) => {
    if (act.id === "act-1") return t("dashboard.activityItems.taskCompletedDesc", act.description);
    if (act.id === "act-2") return t("dashboard.activityItems.goalUpdatedDesc", act.description);
    if (act.id === "act-3") return t("dashboard.activityItems.attendanceLoggedDesc", act.description);
    return act.description;
  };

  const getActivityTime = (act) => {
    if (act.id === "act-1") return language === "id" ? `2 ${t("common.hoursAgo")}` : "2 hours ago";
    if (act.id === "act-2") return language === "id" ? `4 ${t("common.hoursAgo")}` : "4 hours ago";
    if (act.id === "act-3") return language === "id" ? "08:55" : "08:55 AM";
    if (act.time === "Baru saja" || act.time === "Just now") {
      return t("common.justNow");
    }
    return act.time;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg mb-space-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {t("dashboard.greeting")}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t("dashboard.liveSync")}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-sm flex-wrap">
            <span>{t("dashboard.subtitle")}</span>
            <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface px-2 py-0.5 rounded bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
              {t("dashboard.todayDate")}
            </span>
          </p>
        </div>

        {/* Quick Action / Global Create Dropdown */}
        <div className="flex items-center gap-space-sm relative flex-wrap">
          <button
            onClick={() => navigate("/tasks")}
            type="button"
            className="px-space-md h-10 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-space-xs font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
            <span>{t("dashboard.filterStatusBtn")}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              type="button"
              className="px-space-lg h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-all flex items-center gap-space-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t("dashboard.quickAddBtn")}</span>
              <span className="material-symbols-outlined text-[16px] ml-1">expand_more</span>
            </button>

            {/* Floating Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 w-52 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-xl shadow-xl p-1.5 z-30 transition-all flex flex-col gap-0.5 border border-surface-container"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("goal");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                  <span>{t("dashboard.dropdown.newGoal")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("project");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">folder_open</span>
                  <span>{t("dashboard.dropdown.newProject")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("task");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary-container">check_circle</span>
                  <span>{t("dashboard.dropdown.newTask")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    openModal("note");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
                  <span>{t("dashboard.dropdown.newNote")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Micro Metric Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-sm sm:gap-space-md mb-space-2xl">
        {/* Metric 1: Active Goals */}
        <div
          onClick={() => navigate("/goals")}
          className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant truncate">
              {t("dashboard.stats.goals")}
            </span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">flag</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-space-xs">
            <span className="font-display text-display text-on-surface leading-none">{activeGoalsCount}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {t("dashboard.stats.goalsLabel")}
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap gap-1 text-[10px] sm:text-label-sm">
            <span className="inline-flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[14px]">event</span> {t("dashboard.stats.dueThisMonth")}
            </span>
            <span className="text-tertiary font-medium">{t("dashboard.stats.avgProgress")}</span>
          </div>
        </div>

        {/* Metric 2: Active Projects */}
        <div
          onClick={() => navigate("/projects")}
          className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant truncate">
              {t("dashboard.stats.projects")}
            </span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">folder_copy</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-space-xs">
            <span className="font-display text-display text-on-surface leading-none">{activeProjectsCount}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {t("dashboard.stats.projectsLabel")}
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap gap-1 text-[10px] sm:text-label-sm">
            <span className="inline-flex items-center gap-1 text-error">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span> {t("dashboard.stats.criticalDue")}
            </span>
            <span>{t("dashboard.stats.totalTasks")}</span>
          </div>
        </div>

        {/* Metric 3: Today's Tasks */}
        <div
          onClick={() => navigate("/tasks")}
          className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant truncate">
              {t("dashboard.stats.tasks")}
            </span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-space-xs">
            <span className="font-display text-display text-on-surface leading-none">{todayCompletedTasks.length}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              / {todayTasks.length} {t("dashboard.stats.doneOf")}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1 mb-1">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
            {todayTasks.length - todayCompletedTasks.length} {t("dashboard.stats.pendingToday")}
          </span>
        </div>

        {/* Metric 4: Completion Rate */}
        <div
          onClick={() => navigate("/progress")}
          className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant truncate">
              {t("dashboard.stats.completionRate")}
            </span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-space-xs">
            <span className="font-display text-display text-on-surface leading-none">{completionPercentage}%</span>
            <span className="inline-flex items-center text-tertiary font-label-sm text-label-sm font-semibold">
              +8%
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap gap-1 text-[10px] sm:text-label-sm">
            <span>{t("dashboard.stats.vsLastWeek")}</span>
            <span className="px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold">
              {t("dashboard.stats.goodStatus")}
            </span>
          </div>
        </div>

        {/* Metric 5: Streak & Momentum */}
        <div
          onClick={() => navigate("/progress")}
          className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary/40 flex flex-col justify-between col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant truncate">
              {t("dashboard.stats.activeStreak")}
            </span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-space-xs">
            <span className="font-display text-display text-on-surface leading-none">{streakCount ?? 0}</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {t("dashboard.stats.daysInRow")}
            </span>
          </div>
          <div className="flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sm text-label-sm flex-wrap gap-1 text-[10px] sm:text-label-sm">
            <span className="text-on-surface font-medium">{t("dashboard.stats.keepGoing")}</span>
            <span className="text-on-surface-variant">{t("dashboard.stats.bestStreak")}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* LEFT COLUMN: Charts, Goals & Active Projects */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl min-w-0">
          {/* Section A: Monitoring Kehadiran / Progress Overview */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg mb-space-lg gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    {t("dashboard.monitoring.title")}
                  </h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {period === "monthly" ? t("dashboard.monitoring.subtitleMonthly") : t("dashboard.monitoring.subtitle")}
                  </span>
                </div>
              </div>
              {/* Segmented Tab Capsule */}
              <div className="inline-flex p-1 rounded-lg bg-surface-container self-start sm:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPeriod("weekly")}
                  className={`px-space-md py-1 rounded-md font-label-md text-label-md transition-all ${
                    period === "weekly"
                      ? "text-on-surface bg-surface-container-lowest shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t("dashboard.monitoring.weekly")}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  className={`px-space-md py-1 rounded-md font-label-md text-label-md transition-all ${
                    period === "monthly"
                      ? "text-on-surface bg-surface-container-lowest shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t("dashboard.monitoring.monthly")}
                </button>
              </div>
            </div>

            {/* Weekly Daily Breakdown Chart Visual */}
            <div className="w-full flex flex-col min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-on-surface-variant font-label-sm text-label-sm mb-4 px-1 sm:px-2 gap-2">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-primary flex-shrink-0"></span> {t("dashboard.monitoring.tasksCompleted")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-secondary-fixed flex-shrink-0"></span> {t("dashboard.monitoring.plannedTargets")}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded self-start sm:self-auto flex-shrink-0">
                  {t("dashboard.monitoring.onTimeAvg", { percentage: periodStats.percentage })}
                </span>
              </div>

              {/* Pure Inline Bar Chart matching Stitch screen */}
              <div className="h-56 w-full flex items-end justify-between gap-1 sm:gap-4 md:gap-6 pt-6 pb-2 px-2 sm:px-4 bg-surface-container-low rounded-xl">
                {activeChartData.map((item) => {
                  const plannedHeight = item.plannedCount > 0
                    ? Math.max(12, Math.round((item.plannedCount / maxVal) * 100))
                    : 0;
                  const completedHeight = item.completedCount > 0
                    ? Math.max(12, Math.round((item.completedCount / maxVal) * 100))
                    : 0;

                  return (
                    <div
                      key={item.key}
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-0"
                    >
                      {/* Top Indicator: Today / Current Badge or Hover Tooltip */}
                      <div className="h-5 flex items-center justify-center">
                        {item.isCurrent ? (
                          <span
                            title={`${item.completedCount}/${item.plannedCount}`}
                            className="px-1 sm:px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] sm:text-[10px] font-bold flex-shrink-0 cursor-default"
                          >
                            {period === "weekly" ? t("common.today") : t("dashboard.monitoring.thisWeek")}
                          </span>
                        ) : (
                          <div className="font-label-sm text-label-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {item.completedCount}/{item.plannedCount}
                          </div>
                        )}
                      </div>

                      {/* 2-bar container matching Stitch styling */}
                      <div
                        title={`${item.fullLabel || item.label}: ${item.completedCount}/${item.plannedCount}`}
                        className="w-full max-w-[36px] flex gap-0.5 sm:gap-1 items-end h-40"
                      >
                        {/* Planned Targets bar (bg-secondary-fixed) */}
                        <div
                          className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                            item.plannedCount > 0 ? "bg-secondary-fixed" : "bg-transparent"
                          }`}
                          style={{ height: `${plannedHeight}%` }}
                        ></div>

                        {/* Completed Tasks bar (bg-primary) */}
                        <div
                          className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                            item.completedCount > 0
                              ? "bg-primary group-hover:bg-primary-container"
                              : (item.plannedCount > 0 ? "bg-surface-container rounded-t-sm" : "bg-transparent")
                          }`}
                          style={{
                            height: `${
                              item.completedCount > 0
                                ? completedHeight
                                : (item.plannedCount > 0 ? 5 : 0)
                            }%`
                          }}
                        ></div>
                      </div>

                      {/* Day / Period Label */}
                      <span
                        className={`font-label-md text-label-md transition-colors truncate ${
                          item.isCurrent
                            ? "font-bold text-primary"
                            : "text-on-surface-variant group-hover:text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section B: Current Goals (Target Strategis) */}
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">target</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {t("dashboard.currentGoalsTitle")}
                </h2>
              </div>
              <Link to="/goals" className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1">
                {t("dashboard.viewAllGoals")} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {goals.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  onClick={() => navigate("/goals")}
                  className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-space-xs">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                        {g.categoryLabel}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {t("common.due")} {g.deadlineFormatted}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {g.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md line-clamp-2">
                      {g.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm mb-1.5">
                      <span className="text-on-surface-variant">
                        {g.doneCount ? `${g.doneCount}/${g.totalCount}` : `${g.milestones?.filter((m) => m.completed).length || 0}/${g.milestones?.length || 0}`} {t("projects.milestonesCount")}
                      </span>
                      <span className="font-bold text-primary">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${g.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Active Projects Tracking */}
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">source</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {t("dashboard.inProgressProjectsTitle")}
                </h2>
              </div>
              <Link to="/projects" className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1">
                {t("projects.viewAllProjects") || (language === "id" ? "Lihat Semua Proyek" : "View All Projects")} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            <div className="flex flex-col gap-space-md">
              {projects.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  onClick={() => openProjectModal(p.key)}
                  className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md cursor-pointer"
                >
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-[24px]">{p.icon || "web"}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">
                          {p.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm">
                          {p.status === "completed"
                            ? t("common.completed")
                            : p.status === "planning"
                            ? t("common.planning")
                            : t("common.inProgress")}
                        </span>
                      </div>
                      <div className="flex items-center gap-x-space-md gap-y-1 text-on-surface-variant font-label-sm text-label-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">event</span> {t("dashboard.deadlinePrefix")} {p.deadline}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span> {p.completedTasks}/{p.totalTasks} {t("dashboard.tasksCompletedSuffix")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Progress Section */}
                  <div className="flex flex-col md:w-56 flex-shrink-0">
                    <div className="flex items-center justify-between font-label-md text-label-md mb-1">
                      <span className="text-on-surface-variant">{t("projects.progressLabel")}</span>
                      <span className="font-bold text-on-surface">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Needs Attention, Task Checklist & Activity Feed */}
        <div className="lg:col-span-4 flex flex-col gap-space-xl min-w-0">
          {/* Panel 1: Perlu Perhatian (Needs Attention) */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-md pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[20px]">notification_important</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {t("dashboard.needsAttentionTitle")}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                {needsAttention.length} {t("dashboard.needsAttentionItems")}
              </span>
            </div>

            <div className="flex flex-col gap-space-sm">
              {needsAttention.map((item) => (
                <div
                  key={item.id}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between"
                >
                  <div className="flex items-start gap-space-sm min-w-0">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor} mt-2 flex-shrink-0`}></span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate">
                        {getAttentionTitle(item)}
                      </span>
                      <span className={`font-label-sm text-label-sm ${item.dotColor === "bg-error" ? "text-error" : "text-on-surface-variant"}`}>
                        {getAttentionSubtitle(item)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(item.targetRoute)}
                    type="button"
                    className={`px-2.5 py-1 rounded bg-surface-container-lowest text-label-sm font-label-sm transition-colors shadow-sm ${item.actionColor} flex-shrink-0 ml-2`}
                  >
                    {getAttentionAction(item)}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Today's Task Interactive Checklist */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {t("dashboard.todayChecklistTitle")}
                </h3>
              </div>
              <span
                onClick={toggleAllTasks}
                className="font-label-sm text-label-sm text-primary font-medium cursor-pointer hover:underline"
              >
                {t("dashboard.markAll")}
              </span>
            </div>

            <div className="flex flex-col gap-space-xs" id="taskListContainer">
              {todayTasks.slice(0, 7).map((taskItem) => (
                <label
                  key={taskItem.id}
                  className="flex items-start gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={taskItem.completed}
                    onChange={() => toggleTask(taskItem.id)}
                    className="task-checkbox mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`task-title font-body-sm text-body-sm truncate ${
                        taskItem.completed ? "line-through text-on-surface-variant" : "font-medium text-on-surface"
                      }`}
                    >
                      {taskItem.title}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {taskItem.tag && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            taskItem.tag === "Meeting"
                              ? "bg-surface-container-high text-secondary"
                              : taskItem.tag === "Attendance"
                              ? "bg-primary/10 text-primary"
                              : taskItem.tag === "Review"
                              ? "bg-tertiary/10 text-tertiary"
                              : taskItem.tag === "Backend"
                              ? "bg-primary/10 text-primary"
                              : taskItem.tag === "UI"
                              ? "bg-surface-container text-on-surface-variant"
                              : "bg-secondary-container text-on-secondary-container"
                          }`}
                        >
                          {taskItem.tag}
                        </span>
                      )}
                      <span className="text-[11px] text-on-surface-variant">
                        {taskItem.completed
                          ? (taskItem.timeTag || t("common.completed"))
                          : taskItem.priority === "high"
                          ? t("common.highPriority")
                          : t("common.today")}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-space-md mt-space-sm">
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t("dashboard.quickAddChecklist")}</span>
              </button>
            </div>
          </div>

          {/* Panel 3: Recent Activity Stream */}
          <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {t("dashboard.recentActivityTitle")}
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t("dashboard.activityToday")}
              </span>
            </div>

            <div className="relative pl-6 flex flex-col gap-space-md before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container">
              {activityFeed.map((act) => (
                <div key={act.id} className="relative flex flex-col">
                  <span
                    className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full ${act.color} ring-4 ring-surface-container-lowest`}
                  ></span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {getActivityType(act)}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {getActivityDesc(act)}
                  </p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                    {getActivityTime(act)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
