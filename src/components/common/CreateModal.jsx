import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { formatLocalDateToISO, formatLocalDateToInput } from "../../utils/dateTime";

export default function CreateModal() {
  const {
    modalState,
    closeModal,
    addTask,
    updateTask,
    addGoal,
    updateGoal,
    addProject,
    updateProject,
    addNote,
    updateNote,
    projects,
    t,
    language
  } = useWorkspace();
  const { isOpen, type, initialData } = modalState;

  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState(() => formatLocalDateToISO(new Date()));
  const [coverImage, setCoverImage] = useState("");
  const [coverImagePosition, setCoverImagePosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestonesList, setMilestonesList] = useState([]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  const formatDateForInput = (dateStr) => {
    return formatLocalDateToInput(dateStr);
  };

  useEffect(() => {
    setErrorMessage("");
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || initialData.desc || initialData.snippet || "");
      setPriority(initialData.priority || "medium");
      const categoryVal = initialData.category || initialData.project || "";
      if (categoryVal) setCategory(categoryVal);
      if (initialData.deadline) {
        setDeadline(formatDateForInput(initialData.deadline));
      } else {
        setDeadline(formatLocalDateToISO(new Date()));
      }
      setCoverImage(initialData.coverImage || "");
      setCoverImagePosition(initialData.coverImagePosition ?? 50);
      if (Array.isArray(initialData.milestones) && initialData.milestones.length > 0) {
        setMilestonesList(
          initialData.milestones.map((m, idx) => ({
            id: m.id || idx + 1,
            title: m.title || "",
            completed: !!m.completed
          }))
        );
      } else {
        setMilestonesList([]);
      }
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDeadline(formatLocalDateToISO(new Date()));
      setCoverImage("");
      setCoverImagePosition(50);
      setShowUrlInput(false);
      setCustomUrl("");
      setCategory(
        type === "project"
          ? "Web Engineering"
          : type === "note"
          ? "Architecture"
          : type === "goal"
          ? "career"
          : projects[0]?.title || "Daily Routine"
      );
      setMilestonesList([]);
    }
  }, [isOpen, initialData, type, projects]);

  if (!isOpen) return null;

  const isEditing = !!initialData?.id;

  const getModalConfig = () => {
    switch (type) {
      case "goal":
        return {
          title: isEditing ? (language === "id" ? "Ubah Target" : "Edit Goal") : t("createModal.goalHeader"),
          icon: "flag",
          placeholder: t("createModal.titleLabel")
        };
      case "project":
        return {
          title: isEditing ? (language === "id" ? "Ubah Proyek" : "Edit Project") : t("createModal.projectHeader"),
          icon: "folder_open",
          placeholder: t("createModal.titleLabel")
        };
      case "note":
        return {
          title: isEditing ? (language === "id" ? "Ubah Catatan" : "Edit Note") : t("createModal.noteHeader"),
          icon: "description",
          placeholder: t("createModal.titleLabel")
        };
      default:
        return {
          title: isEditing ? (language === "id" ? "Ubah Tugas" : "Edit Task") : t("createModal.taskHeader"),
          icon: "check_circle",
          placeholder: t("createModal.titleLabel")
        };
    }
  };

  const config = getModalConfig();

  const handleFileChange = (e) => {
    setErrorMessage("");
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(t("createModal.fileTypeErrorAlert"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage("");
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(t("createModal.fileTypeErrorAlert"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMilestoneRow = () => {
    setMilestonesList((prev) => [
      ...prev,
      { id: Date.now(), title: "", completed: false }
    ]);
  };

  const handleMilestoneTextChange = (id, text) => {
    setMilestonesList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title: text } : m))
    );
  };

  const handleRemoveMilestoneRow = (id) => {
    setMilestonesList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage(language === "id" ? "Judul wajib diisi" : "Title is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (type === "goal") {
        const validMilestones = milestonesList.filter((m) => m.title.trim()).map((m) => ({
          id: typeof m.id === "string" ? m.id : "m-" + m.id,
          title: m.title.trim(),
          completed: !!m.completed,
          statusText: m.completed ? (language === "id" ? "Selesai" : "Completed") : `Due ${deadline} • Planned`
        }));
        const completedCount = validMilestones.filter((m) => m.completed).length;
        const progress = validMilestones.length > 0 ? Math.round((completedCount / validMilestones.length) * 100) : (isEditing ? (initialData.progress || 0) : 0);

        const catLabel =
          category === "career"
            ? (language === "id" ? "Karier & Teknologi" : "Career & Tech")
            : category === "learning"
            ? (language === "id" ? "Pembelajaran" : "Learning")
            : category === "health"
            ? (language === "id" ? "Kesehatan & Kebugaran" : "Health & Fitness")
            : (language === "id" ? "Pribadi" : "Personal");

        const deadlineDate = new Date(deadline);
        const deadlineFormatted = !isNaN(deadlineDate.getTime())
          ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : deadline;

        const goalPayload = {
          title: title.trim(),
          description: description.trim(),
          category,
          categoryLabel: catLabel,
          priority,
          deadline,
          deadlineFormatted,
          status: progress === 100 ? "completed" : "in_progress",
          progress,
          milestones: validMilestones
        };

        if (isEditing) {
          await updateGoal(initialData.id, goalPayload);
        } else {
          await addGoal(goalPayload);
        }
      } else if (type === "project") {
        const deadlineDate = new Date(deadline);
        const deadlineFormatted = !isNaN(deadlineDate.getTime())
          ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : (deadline || "Nov 2026");

        const validMilestones = milestonesList
          .filter((m) => m.title && m.title.trim())
          .map((m, idx) => ({
            id: m.id ? String(m.id) : "pm-" + Date.now() + "-" + idx,
            title: m.title.trim(),
            completed: !!m.completed,
            completedAt: m.completed ? formatLocalDateToISO(new Date()) : null
          }));

        const projectPayload = {
          title: title.trim(),
          description: description.trim(),
          category,
          deadline: deadlineFormatted,
          priority,
          coverImage: coverImage.trim() ? coverImage : null,
          coverImagePosition: coverImage.trim() ? coverImagePosition : 50,
          milestones: validMilestones
        };

        if (isEditing) {
          await updateProject(initialData.id, projectPayload);
        } else {
          await addProject(projectPayload);
        }
      } else if (type === "note") {
        const notePayload = {
          title: title.trim(),
          category,
          snippet: description.trim(),
          projectId: initialData?.projectId || "",
          project: initialData?.project || initialData?.projectTitle || ""
        };

        if (isEditing) {
          await updateNote(initialData.id, notePayload);
        } else {
          await addNote(notePayload);
        }
      } else {
        // Task
        const taskPayload = {
          title: title.trim(),
          description: description.trim(),
          project: category,
          priority,
          deadline,
          timeTag: "Today",
          status: "today"
        };

        if (isEditing) {
          await updateTask(initialData.id, taskPayload);
        } else {
          await addTask(taskPayload);
        }
      }

      closeModal();
    } catch (err) {
      console.error("[CreateModal] Failed to submit:", err);
      setErrorMessage(err?.message || (language === "id" ? "Terjadi kesalahan saat menyimpan data." : "Failed to save data."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-2.5 sm:p-4 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-space-md sm:p-space-xl flex flex-col relative transform transition-transform scale-100 max-h-[92vh] overflow-y-auto custom-scrollbar border border-surface-container">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">
              {config.icon}
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {config.title}
            </h3>
          </div>
          <button
            onClick={closeModal}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {/* Title */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
              {t("createModal.titleLabel")} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder={config.placeholder}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary transition-all"
            />
          </div>

          {/* Description / Content */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
              {type === "note" ? (language === "id" ? "Isi Catatan" : "Note Content") : t("createModal.descLabel")}
            </label>
            <textarea
              rows={type === "note" ? 5 : 3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("createModal.descPlaceholder")}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent focus:border-primary transition-all resize-y"
            />
          </div>

          {/* Project Specific: Cover Photo Placeholder & Uploader */}
          {type === "project" && (
            <div className="flex flex-col gap-space-xs">
              <label className="block font-label-md text-label-md text-on-surface font-semibold">
                {t("createModal.coverImageLabel")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {coverImage ? (
                <div className="flex flex-col gap-space-xs">
                  <div className="relative rounded-xl overflow-hidden border border-surface-container h-32 group">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `center ${coverImagePosition}%` }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setCoverImage(""); setCoverImagePosition(50); }}
                        className="px-3 py-1 rounded-lg bg-error text-on-error font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>{t("common.delete")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">cached</span>
                        <span>{t("createModal.replaceImage")}</span>
                      </button>
                    </div>
                  </div>
                  {/* Vertical Position Slider */}
                  <div className="flex items-center gap-space-sm px-1">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">vertical_align_center</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap min-w-[70px]">
                      {t("createModal.imagePositionLabel")}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={coverImagePosition}
                      onChange={(e) => setCoverImagePosition(Number(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container"
                      style={{
                        background: `linear-gradient(to right, var(--md-sys-color-primary) ${coverImagePosition}%, var(--md-sys-color-surface-container) ${coverImagePosition}%)`
                      }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums min-w-[32px] text-right">
                      {coverImagePosition}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-space-xs">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-space-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-surface-container hover:border-primary/50 hover:bg-surface-container-low"
                    }`}
                  >

                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {t("createModal.uploadPrompt")}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {t("createModal.uploadSubtext")}
                    </span>
                  </div>

                  {/* Preset quick covers */}
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>{t("createModal.presetLabel")}:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCoverImage(
                            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                          )
                        }
                        className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCoverImage(
                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                          )
                        }
                        className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-medium transition-colors"
                      >
                        Analytics
                      </button>
                    </div>
                  </div>

                  {/* Optional URL Input Toggle */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-primary hover:underline text-[12px] font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      {showUrlInput ? t("createModal.hideUrl") : t("createModal.pasteUrl")}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUrl.trim()) {
                            setCoverImage(customUrl.trim());
                            setCustomUrl("");
                            setShowUrlInput(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-medium hover:bg-primary-container transition-colors"
                      >
                        {t("createModal.useUrl")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                {t("createModal.categoryLabel")}
              </label>
              {type === "project" ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Web Engineering">{t("createModal.categoryOptions.webEngineering")}</option>
                  <option value="Mobile App">{t("createModal.categoryOptions.mobileApp")}</option>
                  <option value="Design & Frontend">{t("createModal.categoryOptions.designFrontend")}</option>
                  <option value="AI & Research">{t("createModal.categoryOptions.aiResearch")}</option>
                  <option value="Cloud Infrastructure">{t("createModal.categoryOptions.cloudInfra")}</option>
                  <option value="Personal Initiative">{t("createModal.categoryOptions.personalInit")}</option>
                </select>
              ) : type === "note" ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Personal">Personal</option>
                  <option value="Language">Language</option>
                  <option value="Engineering">Engineering</option>
                  <option value="General">General</option>
                </select>
              ) : type === "goal" ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="career">{t("createModal.categoryOptions.careerTech")}</option>
                  <option value="learning">{t("createModal.categoryOptions.learnStudy")}</option>
                  <option value="health">{t("goals.healthTab") || "Health & Fitness"}</option>
                  <option value="personal">{t("goals.personalTab") || "Personal"}</option>
                </select>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                  <option value="Career & Tech">{t("createModal.categoryOptions.careerTech")}</option>
                  <option value="Learning">{t("createModal.categoryOptions.learnStudy")}</option>
                  <option value="Daily Routine">{t("createModal.categoryOptions.dailyRoutine")}</option>
                </select>
              )}
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                {t("createModal.priorityLabel")}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="high">{t("common.highPriority")}</option>
                <option value="medium">{t("common.mediumPriority")}</option>
                <option value="low">{t("common.lowPriority")}</option>
              </select>
            </div>
          </div>

          {/* Deadline field (for goal, project, task) */}
          {type !== "note" && (
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                {t("createModal.deadlineLabel")}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              />
            </div>
          )}

          {/* Milestone Checklist Builder for Goal and Project */}
          {(type === "goal" || type === "project") && (
            <div className="flex flex-col gap-space-sm pt-space-xs border-t border-surface-container">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-label-md font-label-md font-semibold text-on-surface block">
                    {type === "project" ? (language === "id" ? "Milestone Proyek" : "Project Milestones") : t("goals.milestoneChecklist")}
                  </label>
                  {type === "project" && (
                    <span className="text-body-sm text-on-surface-variant text-[12px]">
                      {language === "id" ? "Tambahkan sasaran bertahap atau deliverable (opsional)" : "Add staged milestones or deliverables (optional)"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestoneRow}
                  className="text-primary hover:text-primary-container text-label-sm font-label-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span> {type === "project" ? (language === "id" ? "Tambah Milestone" : "Add Milestone") : t("goals.addMilestoneRow")}
                </button>
              </div>
              <div className="flex flex-col gap-space-xs">
                {milestonesList.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-space-xs">
                    {type === "project" && (
                      <span className="text-on-surface-variant font-label-sm text-label-sm font-mono w-7 text-center font-bold">
                        M{idx + 1}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={(e) =>
                        setMilestonesList((prev) =>
                          prev.map((item) =>
                            item.id === m.id ? { ...item, completed: e.target.checked } : item
                          )
                        )
                      }
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleMilestoneTextChange(m.id, e.target.value)}
                      placeholder={type === "project" ? (language === "id" ? `Contoh: Fase ${idx + 1} - Arsitektur & Database...` : `e.g. Phase ${idx + 1} - Architecture & Database...`) : t("goals.milestonePlaceholder")}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestoneRow(m.id)}
                      className="w-7 h-7 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors cursor-pointer"
                      title={t("common.delete")}
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
                {milestonesList.length === 0 && type === "project" && (
                  <div className="text-center py-2.5 text-on-surface-variant text-body-sm border border-dashed border-surface-container rounded-lg">
                    {language === "id" ? "Belum ada milestone. Klik '+ Tambah Milestone' untuk menambahkan." : "No milestones added yet. Click '+ Add Milestone' to add."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-md mt-space-sm border-t border-surface-container">
            <button
              type="button"
              onClick={closeModal}
              className="px-space-md sm:px-space-lg py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              {t("createModal.cancelBtn")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-space-md sm:px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm font-medium flex items-center gap-2 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              )}
              {isEditing ? (language === "id" ? "Simpan Perubahan" : "Save Changes") : t("createModal.submitBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
