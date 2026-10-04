import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, openModal, openProjectModal, deleteProject, t, language } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'in-progress' | 'planning' | 'completed'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'kanban' | 'list'

  const inProgressCount = useMemo(() => projects.filter((p) => p.status === "in-progress").length, [projects]);
  const planningCount = useMemo(() => projects.filter((p) => p.status === "planning").length, [projects]);
  const completedCount = useMemo(() => projects.filter((p) => p.status === "completed").length, [projects]);
  const totalTasks = useMemo(() => projects.reduce((acc, p) => acc + (p.totalTasks || 0), 0), [projects]);
  const completedTasks = useMemo(() => projects.reduce((acc, p) => acc + (p.completedTasks || 0), 0), [projects]);
  const taskPercent = useMemo(() => (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0), [totalTasks, completedTasks]);

  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const cycleFilter = () => {
    const filters = ["all", "in-progress", "planning", "completed"];
    const currentIndex = filters.indexOf(statusFilter);
    const nextIndex = (currentIndex + 1) % filters.length;
    setStatusFilter(filters[nextIndex]);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Page Top Bar: Context and Key Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-lg mb-space-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
              {t("projects.tag")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{t("projects.subtag")}</span>
          </div>
          <h1 className="font-display text-display text-on-surface tracking-tight">{t("projects.title")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-0.5">
            {t("projects.desc")}
          </p>
        </div>
        {/* Quick Actions & New Project Trigger */}
        <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md">
          <button
            type="button"
            onClick={cycleFilter}
            className="h-10 px-space-md sm:px-space-lg rounded-lg bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-space-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">filter_list</span>
            <span>{t("common.filter")}: {statusFilter === "all" ? t("projects.allTab") : statusFilter === "in-progress" ? t("projects.inProgressTab") : statusFilter === "planning" ? t("projects.planningTab") : t("projects.completedTab")}</span>
          </button>
          <button
            type="button"
            onClick={() => openModal("project")}
            className="h-10 px-space-lg sm:px-space-xl rounded-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-sm hover:opacity-95 transition-all flex items-center gap-space-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{t("projects.newProjectBtn")}</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Rollup Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-space-2xl">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">{t("projects.metricActive")}</span>
            <div className="w-7 h-7 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">deployed_code</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-display text-display text-on-surface">{inProgressCount}</span>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> {t("projects.monthInc")}
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${projects.length > 0 ? (inProgressCount / projects.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">{t("projects.metricVelocity")}</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-display text-display text-on-surface">
              {completedTasks}<span className="font-headline-md text-headline-md text-on-surface-variant font-normal">/{totalTasks}</span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{taskPercent}% {t("projects.totalTasks")}</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: `${taskPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">{t("projects.metricDeadlines")}</span>
            <div className="w-7 h-7 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-display text-display text-on-surface">2</span>
            <span className="font-label-sm text-label-sm text-error font-medium">{t("projects.withinDays")}</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: "40%" }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">{t("projects.metricMilestones")}</span>
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-sm">
            <span className="font-display text-display text-on-surface">
              11<span className="font-headline-md text-headline-md text-on-surface-variant font-normal">/14</span>
            </span>
            <span className="font-label-sm text-label-sm text-tertiary font-semibold">78% {t("projects.achieved")}</span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-tertiary-container h-full rounded-full" style={{ width: "78%" }}></div>
          </div>
        </div>
      </div>

      {/* Navigation Filters & View Toggle Bar */}
      <div className="bg-surface-container-lowest p-2 rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md mb-space-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide-x min-w-0 max-w-full pb-1 lg:pb-0" id="filterTabs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-space-xs whitespace-nowrap flex-shrink-0 ${
              statusFilter === "all"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span>{t("projects.allTab")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
              {projects.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in-progress")}
            className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-space-xs whitespace-nowrap flex-shrink-0 ${
              statusFilter === "in-progress"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span>{t("projects.inProgressTab")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {inProgressCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("planning")}
            className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-space-xs whitespace-nowrap flex-shrink-0 ${
              statusFilter === "planning"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span>{t("projects.planningTab")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {planningCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`px-space-md py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-space-xs whitespace-nowrap flex-shrink-0 ${
              statusFilter === "completed"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span>{t("projects.completedTab")}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Right Controls: View Switcher */}
        <div className="flex items-center gap-space-md self-end lg:self-center flex-shrink-0">
          <div className="bg-surface-container-low p-1 rounded-lg flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                viewMode === "grid"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title={t("projects.viewModes.grid")}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                viewMode === "kanban"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title={t("projects.viewModes.kanban")}
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                viewMode === "list"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title={t("projects.viewModes.list")}
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-xl mb-space-2xl">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            onClick={() => openProjectModal(p.key)}
            className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
          >
            {/* Card Banner / Preview */}
            <div className={`h-32 bg-gradient-to-br ${p.gradient || "from-surface-container to-secondary-container"} p-space-lg flex flex-col justify-between relative overflow-hidden`}>
              {/* Cover Photo / Background */}
              {p.coverImage ? (
                <>
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: `center ${p.coverImagePosition ?? 50}%` }}
                  />
                  {/* Subtle contrast gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-black/25 pointer-events-none" />
                </>
              ) : (
                /* Ambient visual overlay */
                <svg className="absolute -right-4 -bottom-6 w-44 h-32 text-primary/10 pointer-events-none" fill="none" viewBox="0 0 100 100">
                  <circle cx="80" cy="80" fill="currentColor" r="50"></circle>
                  <path d="M0 80 Q 25 30, 50 60 T 100 20 L 100 100 L 0 100 Z" fill="currentColor" fillOpacity="0.2"></path>
                </svg>
              )}

              {/* Top Badges */}
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm text-primary font-label-sm text-label-sm flex items-center gap-1 font-semibold shadow-xs">
                  {p.status === "completed" ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] text-tertiary">check</span>
                      <span className="text-tertiary">{t("common.completed")}</span>
                    </>
                  ) : p.status === "planning" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="text-on-secondary-fixed-variant">{t("common.planning")}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-primary font-semibold">{t("common.inProgress")}</span>
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm text-on-surface-variant font-label-sm text-label-sm font-medium shadow-xs">
                    {p.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("project", p);
                    }}
                    title={t("common.edit")}
                    className="w-7 h-7 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProjectModal(p.key);
                    }}
                    title={t("projectDetailModal.tabs.overview")}
                    className="w-7 h-7 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">info</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-space-lg flex-1 flex flex-col justify-between">
              <div>
                {/* Linked Target & Icon (Moved from banner to white body above project title) */}
                <div className="flex items-center gap-space-sm mb-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">{p.icon || "dns"}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium leading-tight">
                      {t("projects.linkedTarget")}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {p.linkedGoal}
                    </span>
                  </div>
                </div>

                <h3 className="font-headline-md text-headline-md text-primary font-bold group-hover:text-primary-container transition-colors mb-space-xs">
                  {p.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-lg">
                  {p.description}
                </p>
                {/* Stack Tags */}
                <div className="flex items-center flex-wrap gap-1.5 mb-space-lg">
                  {(p.techStack || []).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                {/* Metric Progress */}
                <div className="flex items-center justify-between text-on-surface mb-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {t("projects.progressLabel")} ({p.completedTasks}/{p.totalTasks} {t("projects.totalTasks")})
                  </span>
                  <span
                    className={`font-label-sm text-label-sm font-semibold ${
                      p.progress === 100 ? "text-tertiary" : "text-primary"
                    }`}
                  >
                    {p.progress}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden mb-space-md">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.progress === 100 ? "bg-tertiary-container" : "bg-primary-container"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between pt-space-sm border-t border-surface-container">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm" title="Alex (Owner)">
                      A
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {p.milestones} {t("projects.milestonesCount")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px]">event</span>
                    <span>{p.deadline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">folder_open</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{t("common.noData")}</h4>
            <p className="text-body-sm text-on-surface-variant mt-1 mb-space-md">
              {language === "id" ? "Tidak ada proyek yang sesuai dengan filter." : "No projects match the selected filter."}
            </p>
            <button
              type="button"
              onClick={() => openModal("project")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              {t("projects.newProjectBtn")}
            </button>
          </div>
        )}
      </div>
      )}

      {/* Projects Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-2xl">
          {[
            { id: "planning", label: t("projects.planningTab"), dot: "bg-outline" },
            { id: "in-progress", label: t("projects.inProgressTab"), dot: "bg-primary" },
            { id: "completed", label: t("projects.completedTab"), dot: "bg-tertiary" },
          ].map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-md">
                <div className="flex items-center justify-between px-space-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{col.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm font-bold shadow-sm">
                    {colProjects.length}
                  </span>
                </div>
                <div className="flex flex-col gap-space-sm min-h-[140px]">
                  {colProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openProjectModal(p.key)}
                      className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 group border border-transparent hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-mono text-on-surface-variant">{p.code || "IGN-01"}</span>
                        <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">event</span> {p.deadline}
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{p.description}</p>
                      <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                        <span className="text-[12px] text-on-surface-variant font-medium">{p.completedTasks}/{p.totalTasks} {t("dashboard.stats.tasks")}</span>
                        <span className="text-[12px] font-bold text-primary">{p.progress}%</span>
                      </div>
                    </div>
                  ))}
                  {colProjects.length === 0 && (
                    <div className="flex items-center justify-center p-space-xl border-2 border-dashed border-outline-variant/40 rounded-lg text-on-surface-variant font-label-sm text-label-sm">
                      {t("common.noData")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Projects List View */}
      {viewMode === "list" && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto scrollbar-hide-x min-w-0 max-w-full mb-space-2xl">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-space-md px-space-lg">{t("projects.title")}</th>
                <th className="py-space-md px-space-md">{t("common.status")}</th>
                <th className="py-space-md px-space-md">{t("projects.progressLabel")}</th>
                <th className="py-space-md px-space-md">{t("dashboard.stats.tasks")}</th>
                <th className="py-space-md px-space-md">{t("common.due")}</th>
                <th className="py-space-md px-space-lg text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => openProjectModal(p.key)}
                  className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <td className="py-space-md px-space-lg font-medium text-on-surface flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{p.icon || "web"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors block">{p.title}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{p.code || "IGN-01"}</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      p.status === "completed" ? "bg-tertiary-container/30 text-tertiary" : p.status === "planning" ? "bg-surface-container text-on-surface-variant" : "bg-primary/10 text-primary"
                    }`}>
                      {p.status === "completed" ? t("common.completed") : p.status === "planning" ? t("common.planning") : t("common.inProgress")}
                    </span>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="w-28 flex items-center gap-2">
                      <div className="flex-1 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="font-bold text-[12px]">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant font-medium">
                    {p.completedTasks}/{p.totalTasks}
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant">
                    {p.deadline}
                  </td>
                  <td className="py-space-md px-space-lg text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectModal(p.key);
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors"
                      >
                        {language === "id" ? "Detail" : "Details"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(language === "id" ? `Hapus proyek "${p.title}"?` : `Delete project "${p.title}"?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                        title={t("common.delete")}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-space-2xl text-center text-on-surface-variant font-label-md">
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Weekly Sprint Velocity Visualizer & Milestones Track */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl mb-space-2xl">
        {/* Sprint Activity Bar Graph */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("projects.weeklyTitle")}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{t("projects.weeklyDesc")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Ignos SaaS
              </span>
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Attendance App
              </span>
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span> {t("common.other")}
              </span>
            </div>
          </div>

          {/* Minimal Stacked Bar Chart matching Stitch screen 4 */}
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2">
            {[
              { key: "mon", label: t("common.days.mon"), hHigh: "15%", hSec: "20%", hPri: "45%" },
              { key: "tue", label: t("common.days.tue"), hHigh: "10%", hSec: "35%", hPri: "35%" },
              { key: "wed", label: t("common.days.wed"), hHigh: "20%", hSec: "25%", hPri: "50%" },
              { key: "thu", label: t("common.days.thu"), hHigh: "0%", hSec: "30%", hPri: "40%" },
              { key: "fri", label: t("common.days.fri"), hHigh: "0%", hSec: "20%", hPri: "60%" },
              { key: "sat", label: t("common.days.sat"), hHigh: "0%", hSec: "0%", hPri: "25%" },
              { key: "sun", label: t("common.days.sun"), hHigh: "20%", hSec: "0%", hPri: "0%" }
            ].map((d, idx) => {
              const todayDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
              const isToday = idx === todayDayIndex;
              return (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full max-w-[42px] flex flex-col-reverse h-32 rounded-lg bg-surface-container-low overflow-hidden">
                    {d.hHigh !== "0%" && <div className="w-full bg-surface-container-highest" style={{ height: d.hHigh }}></div>}
                    {d.hSec !== "0%" && <div className="w-full bg-secondary" style={{ height: d.hSec }}></div>}
                    {d.hPri !== "0%" && <div className="w-full bg-primary" style={{ height: d.hPri }}></div>}
                  </div>
                  <span className={`font-label-sm text-label-sm truncate max-w-full text-center ${
                    isToday ? "text-primary font-semibold" : "text-on-surface-variant group-hover:text-on-surface"
                  }`}>
                    {isToday ? `${d.label} (${language === "id" ? "Hari Ini" : "Today"})` : d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approaching Milestones */}
        <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{t("projects.approachingTitle")}</h2>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                {t("projects.sprintFocus")}
              </span>
            </div>
            <div className="flex flex-col gap-space-md">
              <div className="flex items-start gap-space-md p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                    Multi-tenancy Auth Migration
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Ignos SaaS • Due Sep 24
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-semibold whitespace-nowrap">
                  M4
                </span>
              </div>

              <div className="flex items-start gap-space-md p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                    Radar Geofence Precision Mode
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Smart Attendance • Due Sep 30
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold whitespace-nowrap">
                  M3
                </span>
              </div>

              <div className="flex items-start gap-space-md p-space-sm rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">article</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                    Interactive Case Studies Layout
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Portfolio • Due Oct 08
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold whitespace-nowrap">
                  M2
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/goals")}
            className="w-full py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm transition-colors text-center mt-space-md"
          >
            {t("projects.viewAllMilestones")}
          </button>
        </div>
      </div>
    </div>
  );
}
