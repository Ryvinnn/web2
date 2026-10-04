import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { computeMilestoneVelocityData } from "../utils/dateTime";

export default function GoalsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    goals,
    activityFeed,
    openModal,
    toggleMilestone,
    addGoalMilestone,
    deleteGoalMilestone,
    deleteGoal,
    showToast,
    language,
    t,
    currentDate
  } = useWorkspace();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress");
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || "g1");
  const [newStepTitle, setNewStepTitle] = useState("");
  const [addingStep, setAddingStep] = useState(false);

  // Helper for flexible date parsing
  const parseAnyDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
    const str = String(dateVal).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const [y, m, d] = str.slice(0, 10).split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Synchronized dynamic metrics derived directly from user's live goals and milestones
  const stats = useMemo(() => {
    const totalGoalsCount = goals.length;
    const now = currentDate instanceof Date ? currentDate : new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // 1. Total Goals Card: goals added or due in current month
    const goalsThisMonth = goals.filter((g) => {
      const d = parseAnyDate(g.createdAt) || parseAnyDate(g.deadline);
      return d && d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).length;

    // 2. Active / In-Progress Goals Card
    const inProgressGoals = goals.filter(
      (g) => g.status === "in_progress" || (g.status !== "completed" && (Number(g.progress) || 0) < 100)
    );
    const inProgressCount = inProgressGoals.length;
    const inProgressPercent = totalGoalsCount > 0 ? Math.round((inProgressCount / totalGoalsCount) * 100) : 0;

    // 3. Completed Goals Card
    const completedGoals = goals.filter(
      (g) => g.status === "completed" || (Number(g.progress) || 0) === 100
    );
    const completedCount = completedGoals.length;

    const completedThisYear = completedGoals.filter((g) => {
      const d = parseAnyDate(g.completedAt) || parseAnyDate(g.deadline);
      return d && d.getFullYear() === curYear;
    }).length;

    // On-schedule rate among completed goals (or overall on-schedule if completed)
    const onScheduleCompletedCount = completedGoals.filter((g) => {
      const d = parseAnyDate(g.deadline);
      if (!d) return true;
      const compDate = parseAnyDate(g.completedAt) || now;
      return compDate.getTime() <= d.getTime() + 86400000;
    }).length;

    const onSchedulePercent = completedCount > 0
      ? Math.round((onScheduleCompletedCount / completedCount) * 100)
      : (totalGoalsCount > 0 ? 100 : 0);

    // 4. Milestones Aggregate Card
    let totalMilestones = 0;
    let completedMilestones = 0;

    goals.forEach((g) => {
      if (Array.isArray(g.milestones) && g.milestones.length > 0) {
        totalMilestones += g.milestones.length;
        completedMilestones += g.milestones.filter((m) => m.completed).length;
      } else if (g.totalCount !== undefined && g.totalCount > 0) {
        totalMilestones += Number(g.totalCount) || 0;
        completedMilestones += Number(g.doneCount) || 0;
      } else if ((Number(g.progress) || 0) > 0) {
        totalMilestones += 1;
        if ((Number(g.progress) || 0) === 100) {
          completedMilestones += 1;
        }
      }
    });

    const milestoneDonePercent = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    return {
      totalGoalsCount,
      goalsThisMonth,
      inProgressCount,
      inProgressPercent,
      completedCount,
      completedThisYear,
      onSchedulePercent,
      totalMilestones,
      completedMilestones,
      milestoneDonePercent
    };
  }, [goals, currentDate]);

  // Dynamic 6-week milestone velocity trend data synchronized with user's goals & milestones
  const velocityData = useMemo(() => {
    return computeMilestoneVelocityData({
      goals,
      activityFeed,
      referenceDate: currentDate,
      language
    });
  }, [goals, activityFeed, currentDate, language]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gId = params.get("goalId");
    if (gId && goals.some((g) => g.id === gId)) {
      setSelectedGoalId(gId);
    }
  }, [location.search, goals]);

  const categories = [
    { id: "all", label: t("goals.allTab") },
    { id: "career", label: t("goals.careerTab") },
    { id: "learning", label: t("goals.learningTab") },
    { id: "personal", label: t("goals.personalTab") },
    { id: "health", label: t("goals.healthTab") }
  ];

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = categoryFilter === "all" || g.category === categoryFilter;
      const matchStatus = statusFilter === "all" || g.status === statusFilter;
      const matchSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "priority") {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return 0;
    });
  }, [goals, categoryFilter, statusFilter, searchQuery, sortBy]);

  const heroGoal = useMemo(() => {
    return goals.find((g) => g.id === selectedGoalId) || goals[0] || null;
  }, [goals, selectedGoalId]);

  const sideGoals = useMemo(() => {
    return filteredGoals.filter((g) => g.id !== heroGoal?.id);
  }, [filteredGoals, heroGoal]);

  const handleAddStep = (e) => {
    e.preventDefault();
    if (newStepTitle.trim() && heroGoal) {
      addGoalMilestone(heroGoal.id, newStepTitle.trim());
      setNewStepTitle("");
      setAddingStep(false);
      showToast(language === "id" ? "Langkah sasaran berhasil ditambahkan" : "Goal milestone step added successfully");
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Header Banner & Stats Section */}
      <div className="flex flex-col gap-space-lg">
        {/* Header Title & Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
                {t("goals.tag")}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span className="text-on-surface-variant font-label-md text-label-md">{t("goals.subtag")}</span>
            </div>
            <h1 className="text-display font-display text-on-surface tracking-tight">{t("goals.title")}</h1>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-2xl">
              {t("goals.desc")}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => navigate("/statistics")}
              className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
              <span>{t("goals.analyticsBtn")}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(goals, null, 2))}`;
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", jsonString);
                downloadAnchor.setAttribute("download", "suru-goals.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                showToast(language === "id" ? "Sasaran berhasil diekspor sebagai JSON" : "Goals exported successfully as JSON");
              }}
              className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">file_download</span>
              <span>{t("goals.exportBtn")}</span>
            </button>
            <button
              type="button"
              onClick={() => openModal("goal")}
              className="inline-flex items-center gap-space-xs px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm font-label-md text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>{t("goals.newGoalBtn")}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Cards (4 Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Total Goals */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant">{t("goals.totalGoals")}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline gap-space-sm">
              <span className="text-display font-display text-on-surface">{stats.totalGoalsCount}</span>
              {stats.goalsThisMonth > 0 ? (
                <span className="text-label-sm font-label-sm text-tertiary font-semibold flex items-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {t("goals.monthInc", { count: stats.goalsThisMonth })}
                </span>
              ) : (
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                  {t("goals.monthIncZero")}
                </span>
              )}
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant">
              <span className={`w-2 h-2 rounded-full ${stats.inProgressCount > 0 ? "bg-primary" : "bg-outline-variant"}`}></span>
              <span>
                {stats.inProgressCount === 0
                  ? t("goals.noActiveRoadmap")
                  : stats.inProgressCount === 1
                  ? t("goals.activeRoadmapSingle")
                  : t("goals.activeRoadmap", { count: stats.inProgressCount })}
              </span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant">{t("goals.inProgress")}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline gap-space-sm">
              <span className="text-display font-display text-on-surface">{stats.inProgressCount}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                {t("goals.fleetPercent", { percent: stats.inProgressPercent })}
              </span>
            </div>
            <div className="mt-space-sm w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.inProgressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Completed Goals */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant">{t("goals.completedGoals")}</span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline gap-space-sm">
              <span className="text-display font-display text-on-surface">{stats.completedCount}</span>
              {stats.completedCount > 0 ? (
                <span className="text-label-sm font-label-sm text-tertiary font-semibold flex items-center">
                  <span className="material-symbols-outlined text-[14px]">check</span> {t("goals.onSchedulePercent", { percent: stats.onSchedulePercent })}
                </span>
              ) : (
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                  {t("goals.achievedPercentZero")}
                </span>
              )}
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant">
              <span className={`w-2 h-2 rounded-full ${stats.completedCount > 0 ? "bg-tertiary" : "bg-outline-variant"}`}></span>
              <span>
                {stats.completedCount > 0
                  ? t("goals.achievedYear", { count: stats.completedThisYear })
                  : t("goals.noAchievedYear")}
              </span>
            </div>
          </div>

          {/* Milestones Aggregate */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-label-md text-on-surface-variant">{t("goals.totalMilestones")}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">done_all</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <div className="flex items-baseline gap-space-xs">
                <span className="text-display font-display text-on-surface">{stats.completedMilestones}</span>
                <span className="text-body-md font-body-md text-on-surface-variant">/ {stats.totalMilestones}</span>
              </div>
              <span className="text-label-md font-label-md px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                {stats.milestoneDonePercent}% {t("goals.donePercent")}
              </span>
            </div>
            <div className="mt-space-sm w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-tertiary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.milestoneDonePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-space-xs overflow-x-auto scrollbar-hide-x min-w-0 max-w-full pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-label-md transition-all whitespace-nowrap flex-shrink-0 ${
                categoryFilter === cat.id
                  ? "bg-primary text-on-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-space-sm min-w-0">
          <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 md:flex-initial">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("goals.searchPlaceholder")}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="all">{t("goals.statusFilter.all")}</option>
              <option value="in_progress">{t("goals.statusFilter.inProgress")}</option>
              <option value="completed">{t("goals.statusFilter.completed")}</option>
              <option value="on_hold">{t("goals.statusFilter.onHold")}</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Sort Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none hover:bg-surface-container transition-colors cursor-pointer"
            >
              <option value="progress">{t("goals.sortBy.progress")}</option>
              <option value="deadline">{t("goals.sortBy.deadline")}</option>
              <option value="priority">{t("goals.sortBy.priority")}</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
              sort
            </span>
          </div>
        </div>
      </div>

      {/* Main Goals Grid Layout: Asymmetric 12-col Bento arrangement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* CARD 1 (HERO/EXPANDED): Learn Fullstack Development (8 cols) */}
        {heroGoal && (
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-lg min-w-0">
            {/* Card Top: Tags, Priority, Menu */}
            <div className="flex items-start justify-between gap-space-md">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  {heroGoal.categoryLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> {t("common.highPriority")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span> {heroGoal.deadlineFormatted}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openModal("goal", heroGoal)}
                className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
                title={t("goals.optionsTooltip")}
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>

            {/* Title & High-level progress */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-sm">
                <h2 className="text-headline-lg font-headline-lg text-on-surface">{heroGoal.title}</h2>
                <span className="text-headline-md font-headline-md text-primary font-bold">{heroGoal.progress}%</span>
              </div>
              <p className="text-body-md font-body-md text-on-surface-variant">{heroGoal.description}</p>
            </div>

            {/* Main Visual Progress Bar with markers */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex justify-between items-center text-label-md font-label-md">
                <span className="text-on-surface-variant font-medium">{t("goals.progressOverview")}</span>
                <span className="text-on-surface font-semibold">
                  {heroGoal.milestones?.filter((m) => m.completed).length || 0} / {heroGoal.milestones?.length || 0} {t("goals.milestonesDoneOf")}
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${heroGoal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Linked Projects Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm p-space-md rounded-lg bg-surface-container-low">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">link</span> {t("goals.linkedProjects")}
              </span>
              <div className="flex flex-wrap items-center gap-space-xs">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface hover:text-primary transition-colors text-label-md font-label-md shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span> Personal Portfolio
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-on-surface hover:text-primary transition-colors text-label-md font-label-md shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Suru Attendance SaaS
                </Link>
              </div>
            </div>

            {/* Deep Interactive Milestone Breakdown List */}
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="text-headline-sm font-headline-sm text-on-surface">{t("goals.actionableMilestones")}</span>
                  <span className="px-2 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    {heroGoal.milestones?.length || 0} {t("goals.tasksLabel")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingStep((prev) => !prev)}
                  className="text-primary hover:text-primary-container text-label-md font-label-md font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> {t("goals.addStep")}
                </button>
              </div>

              {/* Inline Step Form */}
              {addingStep && (
                <form onSubmit={handleAddStep} className="flex items-center gap-2 p-space-sm bg-surface-container-low rounded-lg">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder={language === "id" ? "Nama langkah sasaran baru..." : "New goal milestone title..."}
                    className="flex-1 px-3 py-1.5 text-body-sm rounded-md bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-md bg-primary text-on-primary text-label-md font-label-md font-medium cursor-pointer">
                    {language === "id" ? "Simpan" : "Save"}
                  </button>
                  <button type="button" onClick={() => setAddingStep(false)} className="px-3 py-1.5 rounded-md bg-surface-container text-on-surface text-label-md font-label-md cursor-pointer">
                    {language === "id" ? "Batal" : "Cancel"}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                {heroGoal.milestones?.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    onClick={() => toggleMilestone(heroGoal.id, m.id)}
                    className={`p-space-sm rounded-lg flex items-start gap-space-sm group transition-all cursor-pointer select-none border border-transparent hover:border-primary/40 ${
                      m.completed
                        ? "bg-surface-container-low hover:bg-surface-container"
                        : "bg-surface-container-lowest shadow-xs hover:bg-surface-container-low"
                    } ${idx === 8 ? "md:col-span-2" : ""}`}
                  >
                    {m.completed ? (
                      <div className="w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5 text-on-surface-variant group-hover:text-primary">
                        <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-body-sm font-body-sm ${
                          m.completed
                            ? "text-on-surface line-through text-on-surface-variant"
                            : "text-on-surface font-semibold"
                        }`}
                      >
                        {m.title}
                      </span>
                      <span
                        className={`text-label-sm font-label-sm ${
                          m.completed ? "text-tertiary" : "text-on-surface-variant"
                        }`}
                      >
                        {m.completed ? `${t("goals.completedOn")} ${m.date || "Sep 20"}` : (m.statusText || t("common.inProgress"))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGoalMilestone(heroGoal.id, m.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-error-container/30 text-on-surface-variant hover:text-error transition-all"
                      title={t("common.delete")}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="pt-space-md flex flex-wrap items-center justify-between gap-space-sm border-t border-surface-container">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">update</span>
                <span>{t("goals.lastModified")}</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => openModal("goal", heroGoal)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container text-label-md font-label-md transition-colors cursor-pointer"
                >
                  {t("goals.editGoal")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === "id" ? `Hapus target "${heroGoal.title}"?` : `Delete goal "${heroGoal.title}"?`)) {
                      deleteGoal(heroGoal.id);
                      const remaining = goals.filter((g) => g.id !== heroGoal.id);
                      setSelectedGoalId(remaining[0]?.id || null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-error hover:bg-error-container/30 text-label-md font-label-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>{t("common.delete")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-label-md font-label-md transition-colors shadow-xs cursor-pointer"
                >
                  {t("goals.viewDetail")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN (4 cols): Goal Cards */}
        {heroGoal && sideGoals.length > 0 && (
          <div className="lg:col-span-4 relative min-h-0 lg:h-full">
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto custom-scrollbar flex flex-col gap-space-lg pr-2 pl-0.5 py-1">
              {sideGoals.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md cursor-pointer border border-transparent hover:border-primary/40 group"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      g.category === "career"
                        ? "bg-secondary-container text-on-secondary-container"
                        : g.category === "learning"
                        ? "bg-secondary-fixed text-on-secondary-fixed"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {g.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">event</span> {g.deadlineFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("goal", g);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                      title={t("common.edit")}
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(language === "id" ? `Hapus target "${g.title}"?` : `Delete goal "${g.title}"?`)) {
                          deleteGoal(g.id);
                        }
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                      title={t("common.delete")}
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-headline-sm font-headline-sm text-on-surface">{g.title}</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 line-clamp-2">
                    {g.description}
                  </p>
                </div>

                {/* Inline Progress Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-label-md font-label-md">
                    <span className="text-on-surface-variant">{t("projects.progressLabel")}</span>
                    <span
                      className={`font-semibold ${
                        g.category === "health"
                          ? "text-tertiary"
                          : "text-primary"
                      }`}
                    >
                      {g.progress}% {g.doneCount ? `(${g.doneCount}/${g.totalCount} ${t("goals.donePercent")})` : ""}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        g.category === "health" ? "bg-tertiary" : "bg-primary"
                      }`}
                      style={{ width: `${g.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer item */}
                {g.linkedProjectText && (
                  <div className="flex items-center justify-between text-body-sm font-body-sm pt-space-xs">
                    <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                      {g.linkedProjectText}
                    </span>
                    <Link to="/projects" className="text-primary hover:text-primary-container text-label-md font-label-md font-medium">
                      {t("goals.manageLink")}
                    </Link>
                  </div>
                )}

                {g.nextSnippet && (
                  <div className="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between text-label-sm font-label-sm">
                    <span className="text-on-surface-variant truncate">{g.nextSnippet}</span>
                    <span className="text-primary font-semibold flex-shrink-0 ml-2">{t("goals.activeStatus")}</span>
                  </div>
                )}

                {g.subtext && (
                  <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">flag</span> {g.subtext}
                    </span>
                    <span className="text-tertiary font-semibold">{g.badgeText}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
        {filteredGoals.length === 0 && (
          <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl p-space-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">flag</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">
              {goals.length === 0
                ? (language === "id" ? "Belum Ada Target" : "No Goals Yet")
                : t("common.noData")}
            </h4>
            <p className="text-body-sm text-on-surface-variant mt-1 mb-space-md">
              {goals.length === 0
                ? (language === "id"
                    ? "Buat target strategis pertama Anda untuk mulai melacak pencapaian dan milestone."
                    : "Create your first strategic goal to start tracking achievements and milestones.")
                : (language === "id"
                    ? "Tidak ada target yang sesuai dengan filter."
                    : "No goals match the selected filter.")}
            </p>
            <button
              type="button"
              onClick={() => openModal("goal")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              {t("goals.newGoalBtn")}
            </button>
          </div>
        )}
      </div>

      {/* SECONDARY ROW: Recent Milestones Velocity & Linked Project Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Milestone Velocity Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                {t("goals.velocityTitle")}
              </h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                {t("goals.velocityDesc")}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {velocityData.badgeText}
            </span>
          </div>

          {/* SVG Velocity Trend Chart matching Stitch reference */}
          <div className="relative w-full h-48 mt-space-sm flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="40" y2="40"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="80" y2="80"></line>
              <line className="text-outline-variant/30" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="120" y2="120"></line>
              <defs>
                <linearGradient id="velocityGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25"></stop>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <polygon
                fill="url(#velocityGrad)"
                points={velocityData.polygonPoints}
                className="transition-all duration-300"
              ></polygon>
              <polyline
                fill="none"
                points={velocityData.polylinePoints}
                stroke="#2563eb"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                className="transition-all duration-300"
              ></polyline>
              {velocityData.weeks.map((p, idx) => (
                <circle
                  key={p.offset ?? idx}
                  className={
                    p.isCurrent
                      ? "fill-primary stroke-surface-container-lowest transition-all duration-300 cursor-pointer"
                      : "fill-surface-container-lowest stroke-primary transition-all duration-300 cursor-pointer"
                  }
                  cx={p.x}
                  cy={p.y}
                  r={p.isCurrent ? 5 : 4}
                  strokeWidth={p.isCurrent ? 2 : 2.5}
                >
                  <title>{p.tooltip}</title>
                </circle>
              ))}
            </svg>
          </div>
          <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant pt-2">
            {velocityData.weeks.map((w, idx) => (
              <span
                key={w.offset ?? idx}
                className={w.isCurrent ? "font-semibold text-primary" : ""}
                title={w.tooltip}
              >
                {w.label}
              </span>
            ))}
          </div>
        </div>

        {/* Strategic Alignment & Focus Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold">
              {t("goals.workspaceFocus")}
            </span>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              {t("goals.quarterlyStatus")}
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              {t("goals.quarterlyDesc")}
            </p>
          </div>

          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-md font-label-md text-on-surface font-semibold">
                    {t("goals.archTitle")}
                  </span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    {t("goals.archProjectsLinked")}
                  </span>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-primary font-semibold">
                {t("goals.archStatus")}
              </span>
            </div>

            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-md font-label-md text-on-surface font-semibold">
                    {t("goals.fitnessTitle")}
                  </span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    {t("goals.fitnessLog")}
                  </span>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-tertiary font-semibold">
                {t("goals.fitnessStatus")}
              </span>
            </div>
          </div>

          <div className="p-space-md rounded-lg bg-surface-container flex items-center justify-between">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
              <span className="text-label-sm font-label-sm">{t("goals.nextMilestoneNote")}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/calendar")}
              className="text-primary hover:text-primary-container text-label-md font-label-md font-semibold"
            >
              {t("goals.reviewBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
