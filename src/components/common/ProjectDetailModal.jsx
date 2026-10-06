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
    toggleProjectMilestone,
    addProjectMilestone,
    deleteProjectMilestone,
    addNote,
    deleteNote,
    showToast,
    t,
    language
  } = useWorkspace();
  const { isOpen, projectKey } = projectModalState;
  const [activeTab, setActiveTab] = useState("overview");

  // Inline milestone addition state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  // Functional note creation state
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Architecture");
  const [noteError, setNoteError] = useState("");

  // Reset local states when active project or modal state changes
  useEffect(() => {
    setIsAddingMilestone(false);
    setNewMilestoneTitle("");
    setIsCreatingNote(false);
    setNoteTitle("");
    setNoteContent("");
    setNoteError("");
  }, [projectKey, isOpen]);

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
    projects.find((p) => p.id === projectKey || p.key === projectKey) ||
    projects.find((p) => p.title?.toLowerCase() === String(projectKey).toLowerCase()) ||
    (projects.length > 0 ? projects[0] : null);

  if (!project) return null;

  const projectTasks = tasks.filter(
    (t) =>
      t.projectId === project.id ||
      (project.key && t.projectId === project.key) ||
      t.project === project.title ||
      (project.title && t.project?.toLowerCase() === project.title?.toLowerCase())
  );

  const projectMilestones = Array.isArray(project.milestones) ? project.milestones : [];
  const completedMilestonesCount = projectMilestones.filter((m) => m.completed).length;
  const milestonePercent = projectMilestones.length > 0
    ? Math.round((completedMilestonesCount / projectMilestones.length) * 100)
    : 0;

  const projectNotes = notes.filter(
    (n) =>
      n.projectId === project.id ||
      (project.key && n.projectId === project.key) ||
      (n.project && n.project === project.title)
  );

  const totalTasksCount = projectTasks.length > 0 ? projectTasks.length : (Number(project.totalTasks) || 0);
  const completedTasksCount = projectTasks.length > 0
    ? projectTasks.filter((t) => t.completed).length
    : (Number(project.completedTasks) || 0);

  const displayProgress = project.progress !== undefined ? project.progress : (
    projectMilestones.length > 0 && totalTasksCount > 0
      ? Math.round(((completedTasksCount + completedMilestonesCount) / (totalTasksCount + projectMilestones.length)) * 100)
      : projectMilestones.length > 0
      ? Math.round((completedMilestonesCount / projectMilestones.length) * 100)
      : totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0
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
                {t("projectDetailModal.goalPrefix")} {project.linkedGoal || (language === "id" ? "Umum" : "General")} • {t("projectDetailModal.deadlinePrefix")} {project.deadline}
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
              {totalTasksCount}
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
              {projectMilestones.length}
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
              {projectNotes.length}
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
                        strokeDasharray={`${displayProgress}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      ></path>
                    </svg>
                    <span className="absolute font-headline-sm text-headline-sm text-on-surface font-bold">
                      {displayProgress}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      {t("projectDetailModal.sprintPhaseTitle")}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {t("projectDetailModal.sprintPhaseDesc", {
                        done: completedTasksCount,
                        total: totalTasksCount
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
                      {t("projectDetailModal.viewAllTasks", { total: totalTasksCount })}
                    </span>
                  </div>
                  <div className="space-y-space-xs">
                    {projectTasks.slice(0, 4).map((tItem) => (
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
                    {projectTasks.length === 0 && (
                      <div className="p-4 text-center text-on-surface-variant text-body-sm bg-surface-container-low rounded-lg">
                        {language === "id" ? "Belum ada tugas untuk proyek ini." : "No tasks for this project yet."}
                      </div>
                    )}
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
                        <span className="font-body-sm text-body-sm font-semibold text-primary truncate block">
                          suru/{project.key || "core"}
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
                        {(project.techStack || ["React", "Tailwind CSS"]).map((tech) => (
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
                  onClick={() => openModal("task", { category: project.title, projectId: project.id })}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>{t("tasks.newTaskBtn")}</span>
                </button>
              </div>

              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant flex flex-col items-center">
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant/70 mb-2">check_circle</span>
                    <p className="font-body-md text-body-md">
                      {language === "id" ? "Belum ada tugas khusus untuk proyek ini." : "No specific tasks for this project yet."}
                    </p>
                    <button
                      type="button"
                      onClick={() => openModal("task", { category: project.title, projectId: project.id })}
                      className="mt-3 text-primary font-semibold hover:underline cursor-pointer"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    {t("projectDetailModal.tabs.milestones")}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">
                    {language === "id"
                      ? `${completedMilestonesCount} dari ${projectMilestones.length} milestone diselesaikan (${milestonePercent}%)`
                      : `${completedMilestonesCount} of ${projectMilestones.length} milestones completed (${milestonePercent}%)`}
                  </p>
                </div>
                {!isAddingMilestone && (
                  <button
                    type="button"
                    onClick={() => setIsAddingMilestone(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm self-start sm:self-auto cursor-pointer hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>{language === "id" ? "Tambah Milestone" : "Add Milestone"}</span>
                  </button>
                )}
              </div>

              {/* Inline Add Milestone Form */}
              {isAddingMilestone && (
                <div className="p-space-md rounded-xl bg-surface-container-low border border-primary/20 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-headline-sm font-semibold text-on-surface text-[14px]">
                      {language === "id" ? "Tambah Milestone Baru" : "Add New Milestone"}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsAddingMilestone(false); setNewMilestoneTitle(""); }}
                      className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newMilestoneTitle.trim()) {
                            addProjectMilestone(project.id, newMilestoneTitle.trim());
                            setNewMilestoneTitle("");
                            setIsAddingMilestone(false);
                          }
                        }
                      }}
                      placeholder={language === "id" ? "Judul milestone baru (e.g. Desain Arsitektur)..." : "New milestone title (e.g. Architecture Design)..."}
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMilestoneTitle.trim()) {
                          addProjectMilestone(project.id, newMilestoneTitle.trim());
                          setNewMilestoneTitle("");
                          setIsAddingMilestone(false);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      {t("common.save") || "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              {/* Milestones List */}
              <div className="space-y-3">
                {projectMilestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`p-space-md rounded-xl transition-all flex items-center justify-between group ${
                      m.completed ? "bg-tertiary-container/10 border border-tertiary/20" : "bg-surface-container-low hover:bg-surface-container border border-transparent"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleProjectMilestone(project.id, m.id)}
                    >
                      <button
                        type="button"
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                          m.completed ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-outline hover:text-primary"
                        }`}
                        title={m.completed ? t("common.completed") : t("common.inProgress")}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {m.completed ? "check" : "radio_button_unchecked"}
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm font-mono text-on-surface-variant font-bold">
                            M{idx + 1}
                          </span>
                          <h5 className={`font-headline-sm text-headline-sm truncate ${
                            m.completed ? "line-through text-on-surface-variant" : "text-on-surface font-semibold"
                          }`}>
                            {m.title}
                          </h5>
                        </div>
                        <span className={`font-label-sm text-label-sm font-medium ${
                          m.completed ? "text-tertiary" : "text-on-surface-variant"
                        }`}>
                          {m.completed ? (t("common.completed") || "Selesai") : (t("common.inProgress") || "Dalam Proses")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                        m.completed ? "bg-tertiary/10 text-tertiary" : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {m.completed ? "100%" : "0%"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProjectMilestone(project.id, m.id);
                        }}
                        className="w-7 h-7 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 flex items-center justify-center transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                        title={t("common.delete")}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {projectMilestones.length === 0 && (
                  <div className="p-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant flex flex-col items-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant/70 mb-2">flag</span>
                    <h5 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {language === "id" ? "Belum Ada Milestone" : "No Milestones Yet"}
                    </h5>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">
                      {language === "id"
                        ? "Proyek ini belum memiliki milestone. Tambahkan milestone untuk memecah deliverable proyek secara bertahap."
                        : "This project has no milestones yet. Add milestones to track major deliverable phases."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(true)}
                      className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>{language === "id" ? "Tambah Milestone Pertama" : "Add First Milestone"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    {language === "id" ? "Catatan Proyek" : "Project Notes"}
                  </h4>
                  <p className="text-body-sm text-on-surface-variant">
                    {language === "id"
                      ? `${projectNotes.length} catatan tersimpan untuk proyek ini`
                      : `${projectNotes.length} notes saved for this project`}
                  </p>
                </div>
                {!isCreatingNote && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNote(true);
                      setNoteTitle("");
                      setNoteContent("");
                      setNoteCategory(project.category || "General");
                      setNoteError("");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-sm cursor-pointer hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>{t("secondary.notes.newNoteBtn") || "+ New Note"}</span>
                  </button>
                )}
              </div>

              {/* Note Creation Form */}
              {isCreatingNote && (
                <div className="p-space-md sm:p-space-lg rounded-xl bg-surface-container-low border border-primary/30 space-y-space-md animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {language === "id" ? "Buat Catatan Baru" : "Create New Note"}
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsCreatingNote(false); setNoteError(""); }}
                      className="w-7 h-7 rounded-lg text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {noteError && (
                    <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{noteError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                        {t("createModal.titleLabel") || "Judul Catatan"} <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => { setNoteTitle(e.target.value); if (noteError) setNoteError(""); }}
                        placeholder={language === "id" ? "Contoh: Keputusan Arsitektur Database..." : "e.g. Database Architecture Decisions..."}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                        {t("createModal.categoryLabel") || "Kategori"}
                      </label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Architecture">Architecture</option>
                        <option value="Technical">Technical</option>
                        <option value="Sprint">Sprint</option>
                        <option value="Design">Design</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Personal">Personal</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                        {language === "id" ? "Isi Catatan" : "Note Content"} <span className="text-error">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={noteContent}
                        onChange={(e) => { setNoteContent(e.target.value); if (noteError) setNoteError(""); }}
                        placeholder={language === "id" ? "Tulis isi catatan, dokumentasi, atau rangkuman riset..." : "Write note content, documentation, or research findings..."}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                      <button
                        type="button"
                        onClick={() => { setIsCreatingNote(false); setNoteError(""); }}
                        className="px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
                      >
                        {t("common.cancel") || "Batal"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!noteTitle.trim()) {
                            setNoteError(language === "id" ? "Judul catatan wajib diisi" : "Note title is required");
                            return;
                          }
                          if (!noteContent.trim()) {
                            setNoteError(language === "id" ? "Isi catatan wajib diisi" : "Note content is required");
                            return;
                          }
                          addNote({
                            title: noteTitle.trim(),
                            snippet: noteContent.trim(),
                            category: noteCategory,
                            projectId: project.id,
                            project: project.title
                          });
                          setNoteTitle("");
                          setNoteContent("");
                          setIsCreatingNote(false);
                          setNoteError("");
                        }}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
                      >
                        {language === "id" ? "Simpan Catatan" : "Save Note"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {projectNotes.map((n) => (
                  <div key={n.id} className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between group border border-transparent hover:border-primary/20 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                          {n.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(language === "id" ? `Hapus catatan "${n.title}"?` : `Delete note "${n.title}"?`)) {
                              deleteNote(n.id);
                            }
                          }}
                          className="w-6 h-6 rounded text-on-surface-variant hover:text-error hover:bg-error-container/30 flex items-center justify-center transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                          title={t("common.delete")}
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                      <h5 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1 group-hover:text-primary transition-colors">
                        {n.title}
                      </h5>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 whitespace-pre-wrap">
                        {n.snippet}
                      </p>
                    </div>
                    <span className="text-[11px] text-on-surface-variant mt-3 pt-2 border-t border-surface-container block">
                      {n.date}
                    </span>
                  </div>
                ))}
              </div>

              {projectNotes.length === 0 && !isCreatingNote && (
                <div className="p-8 text-center bg-surface-container-low rounded-xl text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/70 mb-2">description</span>
                  <h5 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {language === "id" ? "Belum Ada Catatan Proyek" : "No Project Notes Yet"}
                  </h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">
                    {language === "id"
                      ? "Belum ada catatan khusus untuk proyek ini. Simpan riset, arsitektur, atau poin penting di sini."
                      : "No notes specifically for this project yet. Store research, architecture specs, or key decisions here."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNote(true);
                      setNoteTitle("");
                      setNoteContent("");
                      setNoteCategory(project.category || "General");
                      setNoteError("");
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>{language === "id" ? "Buat Catatan Pertama" : "Create First Note"}</span>
                  </button>
                </div>
              )}
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
