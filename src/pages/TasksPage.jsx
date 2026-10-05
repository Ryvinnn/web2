import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

export default function TasksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tasks,
    projects,
    goals,
    selectedTaskId,
    setSelectedTaskId,
    toggleTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    openModal,
    todayTasks,
    todayCompletedTasks,
    overdueTasksCount,
    upcomingTasksCount,
    completedTasksCount,
    rescheduleOverdueTasks,
    showToast,
    language,
    t,
    streakCount
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'upcoming' | 'overdue' | 'completed' | 'all'
  const [filterSearch, setFilterSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterGoal, setFilterGoal] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tId = params.get("taskId") || params.get("id");
    const targetId = tId || selectedTaskId;
    if (targetId) {
      if (tId && tId !== selectedTaskId) {
        setSelectedTaskId(tId);
      }
      const target = tasks.find((t) => t.id === targetId);
      if (target) {
        if (target.status === "overdue") setActiveTab("overdue");
        else if (target.status === "today") setActiveTab("today");
        else if (target.status === "upcoming") setActiveTab("upcoming");
        else if (target.completed) setActiveTab("completed");
        else setActiveTab("all");
      }
    }
  }, [location.search, selectedTaskId, tasks, setSelectedTaskId]);

  // Find active task for inspector
  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || tasks[0] || null;
  }, [tasks, selectedTaskId]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === "today" && t.status !== "today") return false;
      if (activeTab === "upcoming" && t.status !== "upcoming") return false;
      if (activeTab === "overdue" && t.status !== "overdue") return false;
      if (activeTab === "completed" && !t.completed) return false;

      // Project filter
      if (filterProject !== "all" && t.projectId !== filterProject && !t.project?.toLowerCase().includes(filterProject.toLowerCase())) return false;

      // Goal filter
      if (filterGoal !== "all" && t.goalId !== filterGoal && !t.goal?.toLowerCase().includes(filterGoal.toLowerCase())) return false;

      // Priority filter
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;

      // Search filter
      if (
        filterSearch.trim() &&
        !t.title.toLowerCase().includes(filterSearch.toLowerCase()) &&
        !t.description?.toLowerCase().includes(filterSearch.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, activeTab, filterProject, filterGoal, filterPriority, filterSearch]);

  const overdueList = filteredTasks.filter((t) => t.status === "overdue");
  const todayList = filteredTasks.filter((t) => t.status === "today");
  const upcomingList = filteredTasks.filter((t) => t.status === "upcoming");

  const insertMarkdown = (prefix, suffix = "") => {
    if (!activeTask) return;
    const current = activeTask.description || "";
    updateTask(activeTask.id, { description: current ? `${current} ${prefix}text${suffix}` : `${prefix}text${suffix}` });
  };

  const handleAddSubtaskSubmit = (e) => {
    e.preventDefault();
    if (activeTask && newSubtaskTitle.trim()) {
      addSubtask(activeTask.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (activeTask && commentText.trim()) {
      const newLog = [
        ...(activeTask.activityLog || []),
        {
          author: "LB",
          authorName: "Laba",
          action: t("tasks.commentAction", { text: commentText.trim() }),
          time: t("common.justNow"),
          isUser: true
        }
      ];
      updateTask(activeTask.id, { activityLog: newLog });
      setCommentText("");
    }
  };

  const renderInspectorContent = (isMobile = false) => {
    if (!activeTask) return null;
    return (
      <>
        {/* Drawer Header & Controls */}
        <div className="flex items-center justify-between border-b border-surface-container pb-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
              {activeTask.ticket || "IGN-204"}
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">{t("tasks.detailInspector")}</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={() => toggleTask(activeTask.id)}
              className={`p-1.5 rounded-lg transition-colors ${activeTask.completed
                  ? "text-primary bg-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              title={activeTask.completed ? t("tasks.markIncomplete") : t("tasks.markDone")}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(`${window.location.origin}/tasks?id=${activeTask.id}`);
                }
                showToast(language === "id" ? `Tautan ${activeTask.ticket || "tugas"} berhasil disalin!` : `Link to ${activeTask.ticket || "task"} copied to clipboard!`);
              }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              title={t("tasks.shareTask")}
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === "id" ? `Hapus tugas "${activeTask.title}"?` : `Delete task "${activeTask.title}"?`)) {
                  deleteTask(activeTask.id);
                  if (isMobile) setMobileInspectorOpen(false);
                  showToast(language === "id" ? "Tugas berhasil dihapus" : "Task deleted successfully");
                }
              }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              title={t("tasks.deleteTask")}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileInspectorOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors ml-1"
                title={t("common.close")}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Title (Editable) */}
        <div>
          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
            {t("tasks.taskTitleLabel")}
          </label>
          <textarea
            rows={2}
            value={activeTask.title}
            onChange={(e) => updateTask(activeTask.id, { title: e.target.value })}
            className="w-full text-on-surface font-headline-md text-headline-md font-semibold bg-transparent border-none p-0 focus:outline-none focus:ring-0 resize-none"
          />
        </div>

        {/* Quick Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-xl">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              {t("tasks.dueDateTimeLabel")}
            </span>
            <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              <span>{activeTask.timeTag || "Sep 23, 03:00 PM"}</span>
            </div>
          </div>

          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              {t("tasks.priorityLabel")}
            </span>
            <div
              className={`flex items-center gap-1.5 font-label-md text-label-md bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-sm ${activeTask.priority === "high" ? "text-error" : "text-primary"
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>{activeTask.priority === "high" ? t("common.highPriority") : t("common.mediumPriority")}</span>
            </div>
          </div>

          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              {t("tasks.assignedProjectLabel")}
            </span>
            <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
              <span className="truncate">{activeTask.project}</span>
            </div>
          </div>

          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              {t("tasks.parentGoalLabel")}
            </span>
            <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md bg-surface-container-lowest px-2.5 py-1.5 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">flag</span>
              <span className="truncate">{activeTask.goal}</span>
            </div>
          </div>
        </div>

        {/* Markdown Description Editor */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              {t("tasks.descriptionMarkdownLabel")}
            </label>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button onClick={() => insertMarkdown("**", "**")} className="p-1 hover:text-on-surface" type="button" title="Bold"><span className="material-symbols-outlined text-[14px]">format_bold</span></button>
              <button onClick={() => insertMarkdown("*", "*")} className="p-1 hover:text-on-surface" type="button" title="Italic"><span className="material-symbols-outlined text-[14px]">format_italic</span></button>
              <button onClick={() => insertMarkdown("[", "](https://)")} className="p-1 hover:text-on-surface" type="button" title="Link"><span className="material-symbols-outlined text-[14px]">link</span></button>
              <button onClick={() => insertMarkdown("`", "`")} className="p-1 hover:text-on-surface" type="button" title="Code"><span className="material-symbols-outlined text-[14px]">code</span></button>
            </div>
          </div>
          <textarea
            rows={4}
            value={activeTask.description || ""}
            onChange={(e) => updateTask(activeTask.id, { description: e.target.value })}
            className="w-full p-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all resize-y"
          />
        </div>

        {/* Subtasks Checklist */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              {t("tasks.subtasksDoneLabel", {
                done: activeTask.subtasks?.filter((s) => s.completed).length || 0,
                total: activeTask.subtasks?.length || 0
              })}
            </span>
            <span
              onClick={() => document.getElementById("subtask-input")?.focus()}
              className="text-primary hover:text-primary-container font-label-sm text-label-sm flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> {t("tasks.addSubtaskAction")}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-container-low p-space-sm rounded-lg">
            {activeTask.subtasks?.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-space-sm p-1 rounded hover:bg-surface-container transition-colors group"
              >
                <label
                  className={`flex items-center gap-space-sm text-body-sm text-on-surface cursor-pointer select-none flex-1 min-w-0 ${st.completed ? "line-through opacity-70" : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(activeTask.id, st.id)}
                    className="rounded text-primary focus:ring-primary/20 accent-primary"
                  />
                  <span className="truncate">{st.title}</span>
                </label>
                <button
                  type="button"
                  onClick={() => deleteSubtask(activeTask.id, st.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-on-surface-variant hover:text-error transition-all"
                  title={t("common.delete")}
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            ))}

            {/* Subtask Input */}
            <form onSubmit={handleAddSubtaskSubmit} className="pt-1 mt-1 border-t border-surface-container flex items-center gap-1">
              <input
                id="subtask-input"
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder={t("tasks.subtaskInputPlaceholder")}
                className="flex-1 px-2 py-1 text-[12px] bg-surface-container-lowest rounded text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-2 py-1 text-[11px] bg-primary text-on-primary rounded font-medium"
              >
                {t("tasks.subtaskAddBtn")}
              </button>
            </form>
          </div>
        </div>

        {/* Task Activity Log */}
        <div className="flex flex-col gap-space-sm border-t border-surface-container pt-space-md">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            {t("tasks.activityLogLabel")}
          </span>
          <div className="flex flex-col gap-space-sm">
            {(activeTask.activityLog || [
              { author: "LB", authorName: "Laba", action: "updated priority from Medium to High", time: "25 minutes ago", isUser: true },
              { author: "SYS", authorName: "System", action: "Linked to parent goal Shift Launch", time: "Today at 10:14 AM", isUser: false }
            ]).map((log, idx) => (
              <div key={idx} className="flex items-start gap-space-sm">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold mt-0.5 flex-shrink-0 ${log.isUser
                      ? "bg-primary text-on-primary"
                      : "bg-secondary-container text-on-secondary-container"
                    }`}
                >
                  {log.author}
                </div>
                <div className="flex flex-col">
                  <p className="font-body-sm text-body-sm text-on-surface">
                    <strong className="font-semibold">{log.authorName}</strong> {log.action}.
                  </p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {log.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Comment Box */}
          <form onSubmit={handleAddComment} className="relative mt-space-xs">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("tasks.addCommentPlaceholder")}
              className="w-full pl-3 pr-9 py-1.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Greeting & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg mb-space-xl">
        <div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md mb-space-xs">
            <span>{t("tasks.breadcrumbWorkspace")}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">{t("tasks.breadcrumbManagement")}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {t("tasks.title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            {t("tasks.desc")}
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            type="button"
            onClick={() => showToast(language === "id" ? "Tugas berhasil disinkronkan dari repositori" : "Tasks synchronized from repository successfully")}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">file_upload</span>
            <span>{t("tasks.importBtn")}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/calendar")}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-label-md text-label-md shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">view_timeline</span>
            <span>{t("tasks.ganttBtn")}</span>
          </button>
          <button
            type="button"
            onClick={() => openModal("task")}
            className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            <span>{t("tasks.newTaskBtn")}</span>
          </button>
        </div>
      </div>

      {/* Productivity Focus Metric Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm mb-space-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
          <div className="flex items-start sm:items-center gap-space-lg">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[26px]">target</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {t("tasks.focusBannerTitle", {
                    done: todayCompletedTasks.length,
                    total: todayTasks.length
                  })}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  {t("tasks.completePercent", {
                    percent: Math.round((todayCompletedTasks.length / (todayTasks.length || 1)) * 100)
                  })}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {todayTasks.length === 0
                  ? (language === "id"
                      ? "Belum ada agenda tugas untuk hari ini. Tambahkan tugas baru untuk mulai mengelola alur kerja harian."
                      : "No tasks scheduled for today. Add a new task to start organizing your daily workflow.")
                  : t("tasks.focusBannerDesc")}
              </p>
            </div>
          </div>
          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-space-xl sm:gap-space-2xl border-t lg:border-t-0 pt-space-md lg:pt-0">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {t("tasks.remainingLabel")}
              </span>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                {todayTasks.length - todayCompletedTasks.length} {t("tasks.tasksLabel")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {t("tasks.estTimeLabel")}
              </span>
              <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                {(() => {
                  const rem = todayTasks.length - todayCompletedTasks.length;
                  const estMins = rem * 45;
                  const h = Math.floor(estMins / 60);
                  const m = estMins % 60;
                  if (estMins === 0) return "0m";
                  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
                })()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {t("tasks.streakLabel")}
              </span>
              <span className="font-headline-md text-headline-md text-primary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]">local_fire_department</span> {streakCount || 0} {t("tasks.daysLabel")}
              </span>
            </div>
          </div>
        </div>
        {/* Micro Progress Bar Track */}
        <div className="w-full bg-surface-container rounded-full h-2 mt-space-lg overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(todayCompletedTasks.length / (todayTasks.length || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Filter & Tab Navigation Strip */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg flex flex-col gap-space-md">
        {/* View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm min-w-0 max-w-full">
          <div className="overflow-x-auto scrollbar-hide-x min-w-0 max-w-full">
            <div className="flex items-center p-1 rounded-lg bg-surface-container-low gap-1 flex-shrink-0 w-max">
              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${activeTab === "today"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                {t("tasks.todayTab")} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px]">{todayTasks.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${activeTab === "upcoming"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                {t("tasks.upcomingTab")} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">{upcomingTasksCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("overdue")}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 ${activeTab === "overdue"
                    ? "bg-error-container text-on-error-container shadow-sm"
                    : "text-error hover:bg-error-container/20"
                  }`}
              >
                {t("tasks.overdueTab")} <span className="px-1.5 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold">{overdueTasksCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("completed")}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${activeTab === "completed"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                {t("tasks.completedTab")} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">{completedTasksCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${activeTab === "all"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                {t("tasks.allTab")} <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">{tasks.length}</span>
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant text-label-sm font-label-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[16px]">sort</span>
            <span>{t("tasks.sortedByLabel")}</span>
          </div>
        </div>

        {/* Granular Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-space-sm pt-space-xs">
          <div className="lg:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder={t("tasks.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 h-9 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="lg:col-span-3">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full h-9 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">{t("tasks.allProjectsOption")}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
              className="w-full h-9 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">{t("tasks.allGoalsOption")}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-9 px-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">{t("tasks.priorityAllOption")}</option>
              <option value="high">🔴 {t("common.highPriority")}</option>
              <option value="medium">🟡 {t("common.mediumPriority")}</option>
              <option value="low">🟢 {t("common.lowPriority")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Tasks Column + Slide-over Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Left Main Tasks Column (7-8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-xl">
          {/* SECTION 1: Overdue Section */}
          {(activeTab === "today" || activeTab === "overdue" || activeTab === "all") && overdueList.length > 0 && (
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                    {t("tasks.overdueSectionTitle")}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                    {overdueList.length} {t("tasks.overdueCountSuffix")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={rescheduleOverdueTasks}
                  className="text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors"
                >
                  {t("tasks.rescheduleAllBtn")}
                </button>
              </div>

              {overdueList.map((taskItem) => (
                <div
                  key={taskItem.id}
                  onClick={() => {
                    setSelectedTaskId(taskItem.id);
                    setMobileInspectorOpen(true);
                  }}
                  className={`task-card group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-space-md ${selectedTaskId === taskItem.id ? "ring-2 ring-primary/40" : ""
                    }`}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={taskItem.completed}
                      onChange={() => toggleTask(taskItem.id)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">alarm</span> {taskItem.dueDateText}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-semibold">
                        {taskItem.priority === "high" ? t("common.highPriority") : t("common.mediumPriority")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                        Project: {taskItem.project}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                      {taskItem.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                      {taskItem.description}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-space-md gap-y-1 mt-space-sm text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">flag</span> Goal: {taskItem.goal}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">checklist</span> {taskItem.subtasksCount || "3/5"} {t("tasks.subtasksLabel")}
                      </span>
                      {taskItem.behindText && (
                        <span className="flex items-center gap-1 text-error">
                          <span className="material-symbols-outlined text-[15px]">schedule</span> {taskItem.behindText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs text-on-surface-variant opacity-80 group-hover:opacity-100 flex-shrink-0">
                    <button
                      className="p-1 rounded hover:bg-surface-container-low"
                      title={t("common.quickEdit")}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("task", taskItem);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      className="p-1 rounded hover:bg-surface-container-low"
                      title={t("common.delete")}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(language === "id" ? `Hapus tugas "${taskItem.title}"?` : `Delete task "${taskItem.title}"?`)) {
                          deleteTask(taskItem.id);
                          showToast(language === "id" ? "Tugas berhasil dihapus" : "Task deleted successfully");
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* SECTION 2: Today's Tasks */}
          {(activeTab === "today" || activeTab === "all") && (
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                    {t("tasks.todayExecutionPlan")}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                    {t("tasks.remainingCompletedText", {
                      remaining: todayTasks.length - todayCompletedTasks.length,
                      completed: todayCompletedTasks.length
                    })}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {t("tasks.wednesdayDate")}
                </span>
              </div>

              {todayList.map((taskItem) => (
                <div
                  key={taskItem.id}
                  onClick={() => {
                    setSelectedTaskId(taskItem.id);
                    setMobileInspectorOpen(true);
                  }}
                  className={`task-card group rounded-xl p-space-md shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-space-md ${selectedTaskId === taskItem.id
                      ? "ring-2 ring-primary/40 bg-surface-container-lowest"
                      : taskItem.completed
                        ? "bg-surface-container-lowest/80 opacity-70 hover:opacity-100"
                        : "bg-surface-container-lowest"
                    }`}
                >
                  <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={taskItem.completed}
                      onChange={() => toggleTask(taskItem.id)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-space-xs flex-wrap mb-1">
                      {taskItem.completed ? (
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span> {taskItem.timeTag || t("tasks.doneBadge")}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span> {taskItem.timeTag || t("tasks.todayBadge")}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${taskItem.priority === "high"
                            ? "bg-error/10 text-error"
                            : taskItem.priority === "low"
                              ? "bg-surface-container-low text-on-surface-variant"
                              : "bg-secondary-container text-on-secondary-container"
                          }`}
                      >
                        {taskItem.priority === "high" ? t("common.highPriority") : taskItem.priority === "low" ? t("common.lowPriority") : t("common.mediumPriority")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                        Project: {taskItem.project}
                      </span>
                    </div>

                    <h3
                      className={`font-headline-sm text-headline-sm ${taskItem.completed
                          ? "line-through text-on-surface font-medium"
                          : selectedTaskId === taskItem.id
                            ? "text-primary font-semibold"
                            : "text-on-surface font-semibold group-hover:text-primary transition-colors"
                        }`}
                    >
                      {taskItem.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">
                      {taskItem.description}
                    </p>

                    <div className="flex items-center flex-wrap gap-x-space-md gap-y-1 mt-space-sm text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">flag</span> Goal: {taskItem.goal}
                      </span>
                      {taskItem.subtasks && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">checklist</span>{" "}
                          {taskItem.subtasks.filter((s) => s.completed).length}/{taskItem.subtasks.length} {t("tasks.subtasksLabel")}
                        </span>
                      )}
                      {taskItem.commentsCount && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">chat_bubble</span> {taskItem.commentsCount} {t("tasks.commentsLabel")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-space-xs text-on-surface-variant">
                    {taskItem.badge && (
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm">
                        {taskItem.badge}
                      </span>
                    )}
                    {taskItem.completed && (
                      <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                        task_alt
                      </span>
                    )}
                    <button
                      className="p-1 rounded hover:bg-surface-container-low"
                      title={t("common.edit")}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("task", taskItem);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* SECTION 3: Upcoming Later This Week */}
          {(activeTab === "upcoming" || activeTab === "all") && (
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between px-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                    {t("tasks.upcomingSectionTitle")}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                    {upcomingList.length} {t("tasks.itemsLabel")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/calendar")}
                  className="text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors"
                >
                  {t("tasks.viewCalendarBtn")}
                </button>
              </div>

              {upcomingList.map((taskItem) => (
                <div
                  key={taskItem.id}
                  onClick={() => {
                    setSelectedTaskId(taskItem.id);
                    setMobileInspectorOpen(true);
                  }}
                  className={`task-card group bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-space-md cursor-pointer ${selectedTaskId === taskItem.id ? "ring-2 ring-primary/40" : ""
                    }`}
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <span className="material-symbols-outlined text-outline cursor-grab text-[18px]">drag_indicator</span>
                    <input
                      type="checkbox"
                      checked={taskItem.completed}
                      onChange={() => toggleTask(taskItem.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                    />
                    <div className="min-w-0">
                      <p className="font-headline-sm text-headline-sm text-on-surface font-medium truncate">
                        {taskItem.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-space-sm gap-y-0.5 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                        <span>{taskItem.timeTag}</span>
                        <span>•</span>
                        <span className="text-primary">{taskItem.project}</span>
                        <span>•</span>
                        <span>{taskItem.priority === "high" ? t("common.highPriority") : t("common.mediumPriority")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-semibold">
                      {taskItem.avatar || "LA"}
                    </div>
                    <button
                      className="p-1 text-on-surface-variant hover:text-on-surface"
                      title={t("common.edit")}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("task", taskItem);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {overdueList.length === 0 && todayList.length === 0 && upcomingList.length === 0 && (
            <div className="bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">task_alt</span>
              <h4 className="font-headline-sm text-headline-sm text-on-surface">{t("common.noData")}</h4>
              <p className="text-body-sm text-on-surface-variant mt-1 mb-space-md">
                {language === "id" ? "Tidak ada tugas yang sesuai filter saat ini." : "No tasks match the current filters."}
              </p>
              <button
                type="button"
                onClick={() => openModal("task")}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
              >
                {t("tasks.newTaskBtn")}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Desktop Sticky Inspector */}
        {activeTask && (
          <div
            className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-surface-container-lowest rounded-xl p-space-xl shadow-md sticky top-20 flex-col gap-space-lg transition-all"
            id="task-inspector"
          >
            {renderInspectorContent(false)}
          </div>
        )}
      </div>

      {/* Mobile Drawer Slide-up Inspector */}
      {mobileInspectorOpen && activeTask && (
        <div className="lg:hidden">
          <div
            className="task-inspector-mobile-overlay"
            onClick={() => setMobileInspectorOpen(false)}
          />
          <div className="task-inspector-mobile-drawer bg-surface-container-lowest p-space-lg shadow-2xl flex flex-col gap-space-lg">
            {renderInspectorContent(true)}
          </div>
        </div>
      )}
    </div>
  );
}
