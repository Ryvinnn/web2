import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function ProjectDetailModal() {
  const navigate = useNavigate();
  const {
    projectModalState,
    closeProjectModal,
    projects,
    tasks,
    notes,
    toggleTask,
    openModal,
    deleteProject,
    showToast,
    t,
    language
  } = useWorkspace();
  const { isOpen, projectKey } = projectModalState;
  const [activeTab, setActiveTab] = useState("overview");

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeProjectModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeProjectModal]);

  if (!isOpen) return null;

  const project =
    projects.find((p) => p.key === projectKey) ||
    projects.find((p) => p.id === projectKey) ||
    projects[0];

  if (!project) return null;

  const projectTasks = tasks.filter(
    (t) =>
      t.project === project.title ||
      t.projectId === project.id ||
      t.project?.toLowerCase().includes(project.title?.toLowerCase())
  );

  const getStatusText = () => {
    if (project.status === "completed") return t("common.completed");
    if (project.status === "planning") return t("common.planning");
    return t("common.inProgress");
  };

  const handleEditProject = () => {
    closeProjectModal();
    openModal("project", project);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-space-md transition-all animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProjectModal();
      }}
    >
      <div className="bg-surface-container-lowest w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border border-surface-container">
        {/* Modal Header */}
        <div className="p-space-md sm:p-space-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-start justify-between gap-space-md flex-shrink-0">
          <div className="flex items-start gap-space-md min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px] sm:text-[26px]">
                {project.icon || "hub"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-space-sm mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-primary font-label-sm text-label-sm font-semibold">
                  {project.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm font-semibold">
                  {getStatusText()}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface break-words">
                {project.title}
              </h2>
              <p className="font-body-sm sm:font-body-md text-body-sm sm:text-body-md text-on-surface-variant mt-1">
                {t("projectDetailModal.goalPrefix")} {project.linkedGoal} • {t("projectDetailModal.deadlinePrefix")} {project.deadline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-end sm:self-start flex-shrink-0">
            <button
              onClick={handleEditProject}
              className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              type="button"
              title={t("projectDetailModal.editSpecTooltip")}
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(language === "id" ? `Hapus proyek "${project.title}"?` : `Delete project "${project.title}"?`)) {
                  deleteProject(project.id);
                  closeProjectModal();
                }
              }}
              className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-error hover:bg-error-container/30 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              type="button"
              title={t("common.delete")}
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
            <button
              className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              onClick={closeProjectModal}
              type="button"
              title={t("common.close")}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-space-md sm:px-space-xl bg-surface-container-low flex items-center gap-space-md sm:gap-space-lg overflow-x-auto scrollbar-hide-x min-w-0 max-w-full flex-shrink-0 border-t border-surface-container">
          <button
            className={`pb-3 font-headline-sm text-headline-sm transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setActiveTab("overview")}
            type="button"
          >
            {t("projectDetailModal.tabs.overview")}
          </button>
          <button
            className={`pb-3 font-headline-sm text-headline-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "tasks"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setActiveTab("tasks")}
            type="button"
          >
            {t("projectDetailModal.tabs.tasks")}{" "}
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {projectTasks.length || project.totalTasks || 0}
            </span>
          </button>
          <button
            className={`pb-3 font-headline-sm text-headline-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "milestones"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setActiveTab("milestones")}
            type="button"
          >
            {t("projectDetailModal.tabs.milestones")}{" "}
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {project.milestones || 3}
            </span>
          </button>
          <button
            className={`pb-3 font-headline-sm text-headline-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "notes"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => setActiveTab("notes")}
            type="button"
          >
            {t("projectDetailModal.tabs.notes")}{" "}
            <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {notes.length}
            </span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-space-md sm:p-space-xl overflow-y-auto flex-1 bg-surface-container-lowest space-y-space-lg sm:space-y-space-xl custom-scrollbar">
          {activeTab === "overview" && (
            <>
              {/* Progress Summary Banner */}
              <div className="p-space-md sm:p-space-lg rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md sm:gap-space-lg min-w-0">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                    <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      ></path>
                      <path
                        className="text-primary-container"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${project.progress || 84}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                    <span className="absolute font-headline-sm text-headline-sm text-on-surface font-bold">
                      {project.progress}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      {t("projectDetailModal.sprintPhaseTitle")}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t("projectDetailModal.sprintPhaseDesc", {
                        done: project.completedTasks,
                        total: project.totalTasks
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm flex-shrink-0">
                  <button
                    onClick={() => {
                      showToast(language === "id" ? "✓ Review deployment berhasil dipicu!" : "✓ Deployment review triggered!");
                    }}
                    className="h-9 px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
                    type="button"
                  >
                    {t("projectDetailModal.deployReviewBtn")}
                  </button>
                </div>
              </div>

              {/* Two Column Deep Dive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
                {/* Left: Priority Tasks Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      {t("projectDetailModal.highPriorityTasksTitle")}
                    </h4>
                    <span
                      onClick={() => setActiveTab("tasks")}
                      className="font-label-sm text-label-sm text-primary font-semibold cursor-pointer hover:underline"
                    >
                      {t("projectDetailModal.viewAllTasks", { total: projectTasks.length || project.totalTasks })}
                    </span>
                  </div>
                  <div className="space-y-space-xs">
                    {(projectTasks.length > 0 ? projectTasks.slice(0, 4) : tasks.slice(0, 4)).map((tItem) => (
                      <div
                        key={tItem.id}
                        onClick={() => toggleTask(tItem.id)}
                        className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors"
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            tItem.completed ? "text-tertiary" : "text-outline"
                          }`}
                        >
                          {tItem.completed ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span
                          className={`font-body-sm text-body-sm flex-1 truncate ${
                            tItem.completed ? "line-through opacity-70 text-on-surface-variant" : "text-on-surface font-medium"
                          }`}
                        >
                          {tItem.title}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {tItem.completed ? t("common.completed") : tItem.timeTag || t("common.today")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Specification & Stack */}
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      {t("projectDetailModal.specAndStackTitle")}
                    </h4>
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      tune
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-space-lg rounded-xl space-y-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                        {t("projectDetailModal.architectureLabel")}
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        {project.description ||
                          "Modern architecture pairing high client performance and clean service-layer boundaries with security compliance."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-space-sm pt-2">
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          {t("projectDetailModal.repositoryLabel")}
                        </span>
                        <span className="font-body-sm text-body-sm font-semibold text-primary">
                          ignos/{project.key || "core"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest">
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">
                          {t("projectDetailModal.targetServerLabel")}
                        </span>
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                          Docker • Cloud Server
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">
                        {t("projectDetailModal.technologiesLabel")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-space-md">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  {language === "id" ? `Daftar Tugas (${projectTasks.length})` : `Project Tasks (${projectTasks.length})`}
                </h4>
                <button
                  type="button"
                  onClick={() => openModal("task", { category: project.title })}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{t("tasks.newTaskBtn")}</span>
                </button>
              </div>

              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant">
                    <p className="font-body-md text-body-md">
                      {language === "id" ? "Belum ada tugas khusus untuk proyek ini." : "No specific tasks for this project yet."}
                    </p>
                    <button
                      type="button"
                      onClick={() => openModal("task", { category: project.title })}
                      className="mt-3 text-primary font-semibold hover:underline"
                    >
                      {t("tasks.newTaskBtn")}
                    </button>
                  </div>
                ) : (
                  projectTasks.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTask(item.id)}
                      className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            item.completed ? "text-tertiary" : "text-outline"
                          }`}
                        >
                          {item.completed ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span
                          className={`font-body-md text-body-md truncate ${
                            item.completed ? "line-through text-on-surface-variant" : "text-on-surface font-medium"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant">
                        {item.ticket || item.timeTag}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="space-y-space-md">
              <h4 className="font-headline-sm text-headline-sm text-on-surface">
                {t("projectDetailModal.tabs.milestones")}
              </h4>
              <div className="space-y-3">
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary text-[22px]">verified</span>
                    <div>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface">M1: Wireframing &amp; Architecture Design</h5>
                      <span className="font-label-sm text-label-sm text-tertiary font-semibold">{t("common.completed")}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-tertiary/10 text-tertiary font-bold text-xs">100%</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">hourglass_top</span>
                    <div>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface">M2: Core API &amp; Component Construction</h5>
                      <span className="font-label-sm text-label-sm text-primary font-semibold">{t("common.inProgress")}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-xs">75%</span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline text-[22px]">pending</span>
                    <div>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface">M3: Production Hardening &amp; Rollout</h5>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{t("common.planning")}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-bold text-xs">0%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-space-md">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  {language === "id" ? "Catatan Proyek" : "Project Notes"}
                </h4>
                <button
                  type="button"
                  onClick={() => openModal("note", { category: project.category })}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{t("secondary.notes.newNoteBtn")}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {notes.map((n) => (
                  <div key={n.id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 mb-2 inline-block">
                        {n.category}
                      </span>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">{n.title}</h5>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">{n.snippet}</p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant mt-2 pt-2 border-t border-surface-container block">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-space-lg bg-surface-container-low flex items-center justify-between flex-shrink-0 border-t border-surface-container">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {t("projectDetailModal.lastModifiedText")}
          </span>
          <div className="flex items-center gap-space-md">
            <button
              className="px-space-lg py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container transition-colors shadow-xs cursor-pointer"
              onClick={closeProjectModal}
              type="button"
            >
              {t("projectDetailModal.closeBtn")}
            </button>
            <button
              onClick={() => {
                closeProjectModal();
                navigate("/projects");
              }}
              className="px-space-lg py-1.5 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
              type="button"
            >
              {t("projectDetailModal.openFullWorkspaceBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
