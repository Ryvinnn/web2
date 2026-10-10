import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { parseAnyDate } from "../utils/attention";

export function ProgressPage() {
  const { projects, goals, tasks, language, t, openModal, openProjectModal } = useWorkspace();
  const [pipelineFilter, setPipelineFilter] = useState("active"); // 'active' | 'all'

  // Card A: Overall Goal Progress (derived strictly from current user's actual goals)
  const totalGoals = goals.length;
  const overallGoalProgress = totalGoals > 0
    ? Math.round(goals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / totalGoals)
    : 0;

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "in_progress" || (g.status !== "completed" && (Number(g.progress) || 0) < 100)),
    [goals]
  );
  const activeGoalsCount = activeGoals.length;

  let overallGoalDesc = "";
  if (totalGoals === 0) {
    overallGoalDesc = t("secondary.progress.noGoals", language === "id" ? "Belum ada target" : "No goals yet");
  } else if (activeGoalsCount === 0) {
    overallGoalDesc = t(
      "secondary.progress.overallDescAllDone",
      { total: totalGoals },
      language === "id" ? `Semua ${totalGoals} target selesai` : `All ${totalGoals} goals completed`
    );
  } else {
    overallGoalDesc = t(
      "secondary.progress.overallDesc",
      { total: totalGoals, active: activeGoalsCount },
      language === "id"
        ? `Rata-rata di seluruh ${totalGoals} target (${activeGoalsCount} aktif)`
        : `Average across ${totalGoals} ${totalGoals === 1 ? "goal" : "goals"} (${activeGoalsCount} active)`
    );
  }

  // Card B: Project Completion (derived strictly from current user's actual projects)
  const totalProjects = projects.length;
  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === "completed" || (Number(p.progress) || 0) >= 100),
    [projects]
  );
  const completedProjectsCount = completedProjects.length;

  const planningProjects = useMemo(
    () => projects.filter((p) => p.status === "planning" && (Number(p.progress) || 0) < 100),
    [projects]
  );
  const planningProjectsCount = planningProjects.length;

  const inProgressProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          (p.status === "in-progress" ||
            p.status === "in_progress" ||
            (!p.status && (Number(p.progress) || 0) < 100) ||
            (p.status !== "planning" && p.status !== "completed")) &&
          (Number(p.progress) || 0) < 100
      ),
    [projects]
  );
  const inProgressProjectsCount = inProgressProjects.length;

  const projectCompletionPercent = totalProjects > 0
    ? Math.round((completedProjectsCount / totalProjects) * 100)
    : 0;

  let projectCompletionDesc = "";
  if (totalProjects === 0) {
    projectCompletionDesc = language === "id"
      ? "0 selesai / 0 total • Belum ada proyek"
      : "0 completed / 0 total • No projects yet";
  } else {
    const breakdownText = t(
      "secondary.progress.projectsDesc",
      {
        inProgress: inProgressProjectsCount,
        planning: planningProjectsCount,
        completed: completedProjectsCount
      },
      language === "id"
        ? `${inProgressProjectsCount} Berjalan, ${planningProjectsCount} Perencanaan, ${completedProjectsCount} Selesai`
        : `${inProgressProjectsCount} In Progress, ${planningProjectsCount} Planned, ${completedProjectsCount} Completed`
    );
    projectCompletionDesc = `${breakdownText} (${completedProjectsCount}/${totalProjects} ${language === "id" ? "selesai" : "completed"})`;
  }

  // Card C: Milestone Execution (derived strictly from current user's actual project milestones)
  const { totalMilestones, completedMilestones, milestonePercent } = useMemo(() => {
    let total = 0;
    let completed = 0;
    projects.forEach((p) => {
      if (Array.isArray(p.milestones)) {
        total += p.milestones.length;
        completed += p.milestones.filter((m) => !!m.completed).length;
      }
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalMilestones: total, completedMilestones: completed, milestonePercent: percent };
  }, [projects]);

  let milestoneDesc = "";
  if (totalMilestones === 0) {
    milestoneDesc = t("secondary.progress.noMilestones", language === "id" ? "Belum ada milestone" : "No milestones yet");
  } else {
    milestoneDesc = t(
      "secondary.progress.milestonesDesc",
      { percent: milestonePercent, completed: completedMilestones, total: totalMilestones },
      language === "id"
        ? `${milestonePercent}% deliverable terencana terpenuhi (${completedMilestones}/${totalMilestones})`
        : `${milestonePercent}% of planned deliverables completed (${completedMilestones}/${totalMilestones})`
    );
  }

  // Active Project Pipeline (derived from real projects filtered by actual status)
  const activeProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        (p.status === "in-progress" ||
          p.status === "in_progress" ||
          (!p.status && (Number(p.progress) || 0) < 100) ||
          (p.status !== "planning" && p.status !== "completed")) &&
        (Number(p.progress) || 0) < 100
    );
  }, [projects]);

  const displayedProjects = pipelineFilter === "all" ? projects : activeProjects;

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Header */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.progress.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.progress.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.progress.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.progress.desc")}
        </p>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-lg">
        {/* Card A: Overall Goal Progress */}
        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.overallTitle")}
          </span>
          <div className="text-display font-display text-primary mt-2">{overallGoalProgress}%</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {overallGoalDesc}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${overallGoalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Card B: Project Completion */}
        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.projectsTitle")}
          </span>
          <div className="text-display font-display text-tertiary mt-2">
            {projectCompletionPercent}%
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {projectCompletionDesc}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-tertiary h-full rounded-full transition-all duration-300"
              style={{ width: `${projectCompletionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Card C: Milestone Execution */}
        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm sm:col-span-2 md:col-span-1">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.milestonesTitle")}
          </span>
          <div className="text-display font-display text-on-surface mt-2">
            {completedMilestones} / {totalMilestones}
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {milestoneDesc}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-secondary h-full rounded-full transition-all duration-300"
              style={{ width: `${milestonePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Active Project Pipeline Section */}
      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[22px]">rocket_launch</span>
            <h3 className="text-headline-md font-headline-md text-on-surface">
              {t("secondary.progress.activePipelines")}
            </h3>
          </div>
          {projects.length > 0 && (
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPipelineFilter("active")}
                className={`px-3 py-1 rounded-md text-label-sm font-label-sm transition-all cursor-pointer ${
                  pipelineFilter === "active"
                    ? "bg-primary text-on-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("secondary.progress.tabActive", "Aktif")} ({activeProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setPipelineFilter("all")}
                className={`px-3 py-1 rounded-md text-label-sm font-label-sm transition-all cursor-pointer ${
                  pipelineFilter === "all"
                    ? "bg-primary text-on-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("secondary.progress.tabAll", "Semua")} ({projects.length})
              </button>
            </div>
          )}
        </div>

        {/* Pipeline Content State Handling */}
        {projects.length === 0 ? (
          /* State 1: General empty state when projects collection is truly empty */
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center rounded-xl bg-surface-container-low/50 border border-dashed border-outline-variant/40">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-[24px]">folder_open</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
              {language === "id" ? "Belum Ada Proyek" : "No Projects Yet"}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-4">
              {language === "id"
                ? "Belum ada inisiatif proyek yang dibuat di workspace Anda. Buat proyek pertama untuk memulai pipeline."
                : "No project initiatives have been created in your workspace yet. Create your first project to start the pipeline."}
            </p>
            <button
              type="button"
              onClick={() => openModal("project")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t("secondary.progress.createProject", "Buat Proyek Baru")}</span>
            </button>
          </div>
        ) : displayedProjects.length === 0 ? (
          /* State 2: Projects exist, but none qualify as active */
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">
              {t("secondary.progress.noActiveProjects", "Tidak ada proyek aktif saat ini")}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mb-4">
              {t(
                "secondary.progress.noActiveProjectsDesc",
                { total: projects.length },
                language === "id"
                  ? `Semua ${projects.length} proyek Anda saat ini berstatus Selesai atau Perencanaan.`
                  : `All ${projects.length} of your projects are currently Completed or in Planning.`
              )}
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setPipelineFilter("all")}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
              >
                {t("secondary.progress.viewAllProjects", "Lihat Semua Proyek")} ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => openModal("project")}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t("secondary.progress.createProject", "Buat Proyek Baru")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Active / selected projects list */
          <div className="space-y-space-md">
            {displayedProjects.map((p) => {
              const pTasks = (tasks || []).filter(
                (t) => t.projectId === p.id || (p.key && t.projectId === p.key) || t.project === p.title
              );
              const totalTasksCount = pTasks.length > 0 ? pTasks.length : (Number(p.totalTasks) || 0);
              const completedTasksCount = pTasks.length > 0
                ? pTasks.filter((t) => t.completed).length
                : (Number(p.completedTasks) || 0);

              const pMilestones = Array.isArray(p.milestones) ? p.milestones : [];
              const completedPMilestones = pMilestones.filter((m) => !!m.completed).length;

              const isCompleted = p.status === "completed" || (Number(p.progress) || 0) === 100;
              const isPlanning = p.status === "planning";
              const statusText = isCompleted
                ? (language === "id" ? "Selesai" : "Completed")
                : isPlanning
                ? (language === "id" ? "Perencanaan" : "Planning")
                : (language === "id" ? "Sedang Berjalan" : "In Progress");

              const statusBadgeClass = isCompleted
                ? "bg-tertiary/10 text-tertiary"
                : isPlanning
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary/10 text-primary";

              return (
                <div
                  key={p.id}
                  onClick={() => openProjectModal(p.key || p.id)}
                  className="p-space-md bg-surface-container-low hover:bg-surface-container rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">{p.icon || "source"}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
                          {p.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                      </div>
                      <span className="text-label-sm text-on-surface-variant truncate block mt-0.5">
                        {p.category || "Inisiatif"} • {completedTasksCount}/{totalTasksCount} {t("secondary.progress.tasksLabel", "Tugas")}
                        {pMilestones.length > 0 && (
                          <> • {completedPMilestones}/{pMilestones.length} {t("projects.milestonesCount", "Milestone")}</>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="w-full md:w-64 flex-shrink-0">
                    <div className="flex justify-between text-label-sm mb-1">
                      <span className="text-on-surface-variant">{t("secondary.progress.completionLabel", "Penyelesaian")}</span>
                      <span className="font-bold text-on-surface">{p.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-tertiary" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, Number(p.progress) || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function NotesPage() {
  const { notes, deleteNote, openModal, showToast, language, t } = useWorkspace();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: t("common.all") || "Semua" },
    { id: "Architecture", label: "Architecture" },
    { id: "Personal", label: "Personal" },
    { id: "Language", label: "Language" }
  ];

  const filteredNotes = useMemo(() => {
    return (notes || []).filter((note) => {
      const matchCat = category === "all" || note.category === category;
      const matchSearch =
        !search.trim() ||
        note.title?.toLowerCase().includes(search.toLowerCase()) ||
        note.snippet?.toLowerCase().includes(search.toLowerCase()) ||
        note.category?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [notes, category, search]);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
              {t("secondary.notes.tag")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-on-surface-variant font-label-md text-label-md">
              {t("secondary.notes.subtag")}
            </span>
          </div>
          <h1 className="text-display font-display text-on-surface tracking-tight">
            {t("secondary.notes.title")}
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant">
            {t("secondary.notes.desc")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal("note")}
          className="h-10 px-space-lg rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-all flex items-center gap-space-xs self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span>{t("secondary.notes.newNoteBtn")}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "id" ? "Cari judul atau isi catatan..." : "Search note title or content..."}
            className="w-full pl-9 pr-3 py-1.5 h-9 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide-x min-w-0 max-w-full pb-1 sm:pb-0 flex-shrink-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-label-md font-label-md transition-colors whitespace-nowrap flex-shrink-0 ${category === c.id
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-transparent hover:border-primary/20"
          >
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {note.category}
                </span>
                <span className="text-label-sm text-on-surface-variant">{note.date}</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                {note.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant line-clamp-4 whitespace-pre-wrap">
                {note.snippet}
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-surface-container flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">{t("secondary.notes.syncActive")}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openModal("note", note)}
                  className="px-2 py-1 text-primary hover:bg-surface-container text-label-md font-medium rounded transition-colors"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === "id" ? `Hapus catatan "${note.title}"?` : `Delete note "${note.title}"?`)) {
                      deleteNote(note.id);
                      showToast(language === "id" ? "Catatan berhasil dihapus" : "Note deleted successfully");
                    }
                  }}
                  className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors"
                  title={t("common.delete")}
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">description</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{t("common.noData")}</h4>
            <p className="text-body-sm text-on-surface-variant mt-1 mb-space-md">
              {language === "id" ? "Tidak ada catatan yang cocok dengan pencarian Anda." : "No notes match your search criteria."}
            </p>
            <button
              type="button"
              onClick={() => openModal("note")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-sm hover:bg-primary-container transition-colors"
            >
              {t("secondary.notes.newNoteBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { t, language, openModal, currentDate, tasks, goals, projects } = useWorkspace();
  const [monthOffset, setMonthOffset] = useState(0);

  // Local device date calculations
  const now = currentDate || new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDateNum = now.getDate();

  const [selectedDay, setSelectedDay] = useState(todayDateNum);

  // Target viewing month based on monthOffset
  const viewingDate = useMemo(() => {
    return new Date(todayYear, todayMonth + monthOffset, 1);
  }, [todayYear, todayMonth, monthOffset]);

  const viewingYear = viewingDate.getFullYear();
  const viewingMonth = viewingDate.getMonth();
  const isViewingCurrentMonth = viewingYear === todayYear && viewingMonth === todayMonth;

  const currentMonthLabel = useMemo(() => {
    const locale = language === "id" ? "id-ID" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric"
    }).format(viewingDate);
  }, [language, viewingDate]);

  const daysInMonth = useMemo(() => {
    return new Date(viewingYear, viewingMonth + 1, 0).getDate();
  }, [viewingYear, viewingMonth]);

  // First day of month (Mon=0, Tue=1, ..., Sun=6)
  const firstDayOfWeek = useMemo(() => {
    return (new Date(viewingYear, viewingMonth, 1).getDay() + 6) % 7;
  }, [viewingYear, viewingMonth]);

  // Total calendar slots (ceil to multiple of 7: 35 or 42)
  const totalSlots = useMemo(() => {
    const total = firstDayOfWeek + daysInMonth;
    return total > 35 ? 42 : 35;
  }, [firstDayOfWeek, daysInMonth]);

  const days = [
    t("common.days.mon"),
    t("common.days.tue"),
    t("common.days.wed"),
    t("common.days.thu"),
    t("common.days.fri"),
    t("common.days.sat"),
    t("common.days.sun")
  ];

  const eventsMap = useMemo(() => {
    const map = {};

    // 1. Map user tasks by deadline or dueDate
    (tasks || []).forEach((task) => {
      const d = parseAnyDate(task.deadline || task.dueDate);
      if (d && d.getFullYear() === viewingYear && d.getMonth() === viewingMonth) {
        const day = d.getDate();
        if (!map[day]) {
          map[day] = {
            title: task.title,
            tag: task.completed ? (language === "id" ? "Selesai" : "Completed") : (task.timeTag || (language === "id" ? "Tugas" : "Task")),
            color: task.completed ? "bg-tertiary-container text-tertiary" : "bg-primary text-on-primary",
            type: "task",
            item: task
          };
        }
      }
    });

    // 2. Map user goals by deadline
    (goals || []).forEach((goal) => {
      const d = parseAnyDate(goal.deadline);
      if (d && d.getFullYear() === viewingYear && d.getMonth() === viewingMonth) {
        const day = d.getDate();
        if (!map[day]) {
          map[day] = {
            title: goal.title,
            tag: language === "id" ? "Target" : "Goal",
            color: "bg-secondary-container text-primary",
            type: "goal",
            item: goal
          };
        }
      }
    });

    // 3. Map user projects by deadline
    (projects || []).forEach((proj) => {
      const d = parseAnyDate(proj.deadline);
      if (d && d.getFullYear() === viewingYear && d.getMonth() === viewingMonth) {
        const day = d.getDate();
        if (!map[day]) {
          map[day] = {
            title: proj.title,
            tag: language === "id" ? "Proyek" : "Project",
            color: "bg-surface-container text-on-surface",
            type: "project",
            item: proj
          };
        }
      }
    });

    return map;
  }, [tasks, goals, projects, viewingYear, viewingMonth, language]);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.calendar.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.calendar.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.calendar.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.calendar.desc")}
        </p>
      </div>

      <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {currentMonthLabel}
            </h2>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title={language === "id" ? "Bulan sebelumnya" : "Previous month"}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title={language === "id" ? "Bulan berikutnya" : "Next month"}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMonthOffset(0);
                setSelectedDay(todayDateNum);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
            >
              {t("secondary.calendar.todayBadge")} ({todayDateNum})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide-x min-w-0 max-w-full">
          <div className="min-w-[560px] sm:min-w-0">
            <div className="grid grid-cols-7 gap-2 text-center font-label-md font-semibold text-on-surface-variant mb-2">
              {days.map((d, idx) => (
                <div key={idx} className="py-2 bg-surface-container-low rounded-lg">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: totalSlots }).map((_, i) => {
                const dayNum = i - firstDayOfWeek + 1;
                const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isViewingCurrentMonth && dayNum === todayDateNum;
                const isSelected = dayNum === selectedDay;
                const event = isValidDay ? eventsMap[dayNum] : null;
                return (
                  <div
                    key={i}
                    onClick={() => isValidDay && setSelectedDay(dayNum)}
                    className={`min-h-[90px] p-2 rounded-xl flex flex-col justify-between transition-all select-none ${!isValidDay
                      ? "bg-surface-container-low/40 opacity-40 pointer-events-none"
                      : isSelected
                        ? "bg-primary/10 border-2 border-primary cursor-pointer shadow-xs"
                        : isToday
                          ? "bg-surface-container-lowest border-2 border-primary/50 cursor-pointer"
                          : "bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low cursor-pointer"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-label-md font-semibold ${isToday || isSelected ? "text-primary" : "text-on-surface"}`}>
                        {isValidDay ? dayNum : ""}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </div>
                    {event && (
                      <div className={`text-[10px] p-1 rounded font-medium truncate mt-1 ${event.color}`}>
                        {event.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Agenda Inspection */}
        <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {language === "id" ? `Agenda ${selectedDay} ${currentMonthLabel}` : `Schedule for ${selectedDay} ${currentMonthLabel}`}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {eventsMap[selectedDay] ? (language === "id" ? "1 Agenda Terjadwal" : "1 Scheduled Event") : (language === "id" ? "Tidak ada agenda" : "No scheduled events")}
            </span>
          </div>
          {eventsMap[selectedDay] ? (
            <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{eventsMap[selectedDay].title}</h4>
                  <span className="text-label-sm text-on-surface-variant">10:00 AM - 11:30 AM • In Progress</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${eventsMap[selectedDay].color}`}>
                {eventsMap[selectedDay].tag}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-space-md rounded-xl bg-surface-container-low">
              <p className="text-body-sm text-on-surface-variant italic">
                {language === "id" ? "Hari ini kosong. Anda dapat menambahkan tugas atau agenda baru." : "No events scheduled for this day. You can add a new task or agenda."}
              </p>
              <button
                type="button"
                onClick={() => {
                  const dayStr = String(selectedDay).padStart(2, "0");
                  const monthNum = String(viewingMonth + 1).padStart(2, "0");
                  openModal("task", { deadline: `${viewingYear}-${monthNum}-${dayStr}` });
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-xs hover:bg-primary-container transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{language === "id" ? "Tambah Tugas" : "Add Task"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatisticsPage() {
  const { tasks, streakCount, bestStreakCount, currentDate, language, t } = useWorkspace();

  const { currentMonday, currentSunday } = useMemo(() => {
    const now = currentDate instanceof Date ? currentDate : new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6, 23, 59, 59, 999);
    return { currentMonday: mon, currentSunday: sun };
  }, [currentDate]);

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

  const completedTasks = useMemo(() => (tasks || []).filter((t) => t.completed), [tasks]);
  const totalTasksCount = (tasks || []).length;
  const completedTasksCount = completedTasks.length;

  const weeklyCompletedTasks = useMemo(() => {
    return completedTasks.filter((t) => {
      const d = parseAnyDate(t.completedAt) || parseAnyDate(t.deadline);
      return d && d >= currentMonday && d <= currentSunday;
    });
  }, [completedTasks, currentMonday, currentSunday]);

  const weeklyVelocity = weeklyCompletedTasks.length;
  const focusHours = (completedTasksCount * 1.5).toFixed(1);
  const completionRate = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  const activeStreak = streakCount || 0;
  const bestStreak = bestStreakCount || 0;

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.statistics.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.statistics.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.statistics.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.statistics.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.weeklyVelocity")}
          </span>
          <div className="text-display font-display text-primary mt-1">
            {weeklyVelocity} {t("secondary.statistics.tasksUnit")}
          </div>
          <span className="text-tertiary text-label-sm font-semibold">
            {weeklyVelocity > 0
              ? (language === "id" ? `+${weeklyVelocity} tugas minggu ini` : `+${weeklyVelocity} tasks this week`)
              : (language === "id" ? "0 tugas minggu ini" : "0 tasks this week")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.focusHours")}
          </span>
          <div className="text-display font-display text-on-surface mt-1">
            {focusHours} {t("secondary.statistics.hoursUnit")}
          </div>
          <span className="text-on-surface-variant text-label-sm">
            {completedTasksCount > 0
              ? (language === "id" ? `Total ${completedTasksCount} tugas selesai` : `Total ${completedTasksCount} tasks completed`)
              : (language === "id" ? "Belum ada waktu fokus" : "No focus hours yet")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.onTimeDelivery")}
          </span>
          <div className="text-display font-display text-tertiary mt-1">{completionRate}%</div>
          <span className="text-tertiary text-label-sm font-semibold">
            {completionRate > 0
              ? (language === "id" ? `${completedTasksCount} dari ${totalTasksCount} selesai` : `${completedTasksCount} of ${totalTasksCount} completed`)
              : (language === "id" ? "0 tugas selesai" : "0 tasks completed")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.activeStreak")}
          </span>
          <div className="text-display font-display text-primary mt-1">
            {activeStreak} {t("secondary.statistics.daysUnit")}
          </div>
          <span className="text-on-surface-variant text-label-sm">
            {language === "id" ? `Terbaik: ${bestStreak} hari` : `Best: ${bestStreak} day${bestStreak === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const {
    language,
    setLanguage,
    t,
    user,
    isAuthenticated,
    updateUser,
    clearAllTasks,
    resetDefaultTasks
  } = useWorkspace();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const msg =
      newLang === "id"
        ? "✓ Bahasa berhasil diubah ke Bahasa Indonesia!"
        : "✓ Language successfully switched to English!";
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const handleSave = () => {
    if (isAuthenticated) {
      updateUser({ name: displayName });
      setToastMessage(t("common.savedSuccess"));
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-xl max-w-3xl">
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("settings.subtitle")}
        </p>
      </div>

      {toastMessage && (
        <div className="p-space-md rounded-xl bg-primary/10 border border-primary/20 text-primary font-label-md text-label-md flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm space-y-space-xl">
        {/* Language Selection Section */}
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="material-symbols-outlined text-primary text-[22px]">translate</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("settings.languageSection")}
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-space-lg">
            {t("settings.languageDesc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {/* English Card */}
            <div
              onClick={() => handleLanguageChange("en")}
              className={`p-space-lg rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative select-none ${language === "en"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-surface-container bg-surface-container-low/40 hover:border-primary/40 hover:bg-surface-container-low"
                }`}
            >
              <div className="flex items-start justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    EN
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {t("settings.englishTitle")}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {t("settings.englishSubtitle")}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${language === "en" ? "border-primary bg-primary" : "border-outline-variant bg-transparent"
                    }`}
                >
                  {language === "en" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-space-md">
                {t("settings.englishDesc")}
              </p>

              {language === "en" && (
                <div className="flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>{t("settings.activeBadge")}</span>
                </div>
              )}
            </div>

            {/* Bahasa Indonesia Card */}
            <div
              onClick={() => handleLanguageChange("id")}
              className={`p-space-lg rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative select-none ${language === "id"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-surface-container bg-surface-container-low/40 hover:border-primary/40 hover:bg-surface-container-low"
                }`}
            >
              <div className="flex items-start justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    ID
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {t("settings.indonesianTitle")}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {t("settings.indonesianSubtitle")}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${language === "id" ? "border-primary bg-primary" : "border-outline-variant bg-transparent"
                    }`}
                >
                  {language === "id" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-space-md">
                {t("settings.indonesianDesc")}
              </p>

              {language === "id" && (
                <div className="flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>{t("settings.activeBadge")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile / Guest Session Section */}
        <div className="pt-space-md border-t border-surface-container">
          {isAuthenticated && user ? (
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {t("settings.profileSection")}
                </h3>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-4">
                {t("settings.profileDesc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md max-w-2xl">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">
                    {t("settings.displayName")}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">
                    {t("auth.emailLabel")}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-body-md opacity-80 cursor-not-allowed border border-surface-container"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">devices</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      {t("auth.guestBannerTitle")}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-semibold">
                      {language === "id" ? "Browser Ini" : "This Browser"}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-space-md">
                    {t("auth.guestBannerDesc")}
                  </p>
                  <div className="flex flex-wrap items-center gap-space-sm">
                    <Link
                      to="/login"
                      className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors inline-flex items-center gap-1.5 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>{t("sidebar.login")}</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-headline-sm transition-colors border border-surface-container inline-flex items-center gap-1.5 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>{t("sidebar.signUp")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data & Local Task Management */}
        <div className="pt-space-md border-t border-surface-container">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="material-symbols-outlined text-primary text-[22px]">database</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("settings.dataSection")}
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {t("settings.dataDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-space-md">
            <button
              type="button"
              onClick={clearAllTasks}
              className="px-space-lg py-2 rounded-lg bg-surface-container text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors flex items-center gap-1.5 border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>{t("settings.clearTasksBtn")}</span>
            </button>
            <button
              type="button"
              onClick={resetDefaultTasks}
              className="px-space-lg py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">restore</span>
              <span>{t("settings.resetTasksBtn")}</span>
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="pt-space-md border-t border-surface-container flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-space-xl py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors"
            >
              {t("settings.saveChanges")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LogoutPage() {
  const navigate = useNavigate();
  const { isGuest, logout, showToast, t } = useWorkspace();

  const handleConfirmLogout = async () => {
    await logout();
    showToast(t("auth.logoutSuccess"));
    navigate("/dashboard");
  };

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-space-xl">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-space-lg shadow-sm">
          <span className="material-symbols-outlined text-[32px]">person_outline</span>
        </div>
        <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">
          {t("auth.guestModeLabel")}
        </h2>
        <p className="text-body-md font-body-md text-on-surface-variant max-w-md mb-space-xl">
          {t("auth.guestModeDesc")}
        </p>
        <div className="flex items-center gap-space-md">
          <Link
            to="/dashboard"
            className="px-space-xl py-2.5 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors"
          >
            {t("logout.backBtn")}
          </Link>
          <Link
            to="/login"
            className="px-space-lg py-2.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm transition-colors cursor-pointer"
          >
            {t("sidebar.login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-space-xl">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-error mb-space-lg shadow-sm">
        <span className="material-symbols-outlined text-[32px]">logout</span>
      </div>
      <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">
        {t("auth.logoutConfirmTitle")}
      </h2>
      <p className="text-body-md font-body-md text-on-surface-variant max-w-md mb-space-xl">
        {t("auth.logoutConfirmDesc")}
      </p>
      <div className="flex items-center gap-space-md">
        <Link
          to="/dashboard"
          className="px-space-xl py-2.5 rounded-lg bg-surface-container text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-high transition-colors"
        >
          {t("logout.backBtn")}
        </Link>
        <button
          type="button"
          onClick={handleConfirmLogout}
          className="px-space-lg py-2.5 rounded-lg bg-error text-white hover:bg-error/90 font-headline-sm text-headline-sm transition-colors cursor-pointer shadow-sm"
        >
          {t("logout.confirmBtn")}
        </button>
      </div>
    </div>
  );
}
