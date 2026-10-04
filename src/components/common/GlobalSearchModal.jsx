import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function GlobalSearchModal() {
  const navigate = useNavigate();
  const {
    globalSearchModalOpen,
    setGlobalSearchModalOpen,
    globalSearch,
    setGlobalSearch,
    tasks,
    projects,
    goals,
    notes,
    setSelectedTaskId,
    openProjectModal,
    openModal,
    t,
    language
  } = useWorkspace();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (globalSearchModalOpen) {
      setQuery(globalSearch || "");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [globalSearchModalOpen, globalSearch]);

  const navigationPages = useMemo(() => [
    { type: "page", id: "nav-dash", title: t("sidebar.dashboard"), route: "/dashboard", icon: "grid_view", category: t("sidebar.main") },
    { type: "page", id: "nav-goals", title: t("sidebar.goals"), route: "/goals", icon: "flag", category: t("sidebar.main") },
    { type: "page", id: "nav-proj", title: t("sidebar.projects"), route: "/projects", icon: "folder_open", category: t("sidebar.main") },
    { type: "page", id: "nav-tasks", title: t("sidebar.tasks"), route: "/tasks", icon: "check_circle", category: t("sidebar.main") },
    { type: "page", id: "nav-prog", title: t("sidebar.progress"), route: "/progress", icon: "trending_up", category: t("sidebar.management") },
    { type: "page", id: "nav-notes", title: t("sidebar.notes"), route: "/notes", icon: "description", category: t("sidebar.management") },
    { type: "page", id: "nav-cal", title: t("sidebar.calendar"), route: "/calendar", icon: "calendar_today", category: t("sidebar.management") },
    { type: "page", id: "nav-stat", title: t("sidebar.statistics"), route: "/statistics", icon: "bar_chart", category: t("sidebar.management") },
    { type: "page", id: "nav-set", title: t("sidebar.settings"), route: "/settings", icon: "settings", category: t("sidebar.settings") }
  ], [t]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Suggest recent pages and priority tasks
      return [
        ...navigationPages.slice(0, 4),
        ...tasks.slice(0, 3).map((task) => ({
          type: "task",
          id: task.id,
          title: task.title,
          subtitle: `${task.ticket} • ${task.project}`,
          icon: "task_alt",
          data: task
        }))
      ];
    }

    const res = [];

    // Search tasks
    tasks.forEach((task) => {
      if (
        task.title?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.ticket?.toLowerCase().includes(q) ||
        task.tag?.toLowerCase().includes(q) ||
        task.project?.toLowerCase().includes(q)
      ) {
        res.push({
          type: "task",
          id: task.id,
          title: task.title,
          subtitle: `${task.ticket} • ${task.project} (${task.completed ? t("common.completed") : task.timeTag || t("common.today")})`,
          icon: "task_alt",
          data: task
        });
      }
    });

    // Search projects
    projects.forEach((proj) => {
      if (
        proj.title?.toLowerCase().includes(q) ||
        proj.description?.toLowerCase().includes(q) ||
        proj.category?.toLowerCase().includes(q) ||
        proj.techStack?.some((tech) => tech.toLowerCase().includes(q))
      ) {
        res.push({
          type: "project",
          id: proj.id,
          title: proj.title,
          subtitle: `${proj.category} • ${proj.progress}% ${t("projects.progressLabel")}`,
          icon: proj.icon || "folder",
          data: proj
        });
      }
    });

    // Search goals
    goals.forEach((goal) => {
      if (
        goal.title?.toLowerCase().includes(q) ||
        goal.description?.toLowerCase().includes(q) ||
        goal.categoryLabel?.toLowerCase().includes(q)
      ) {
        res.push({
          type: "goal",
          id: goal.id,
          title: goal.title,
          subtitle: `${goal.categoryLabel} • ${goal.progress}% ${t("goals.donePercent")}`,
          icon: "flag",
          data: goal
        });
      }
    });

    // Search notes
    (notes || []).forEach((note) => {
      if (
        note.title?.toLowerCase().includes(q) ||
        note.snippet?.toLowerCase().includes(q) ||
        note.category?.toLowerCase().includes(q)
      ) {
        res.push({
          type: "note",
          id: note.id,
          title: note.title,
          subtitle: `${note.category} • ${note.date}`,
          icon: "description",
          data: note
        });
      }
    });

    // Search navigation pages
    navigationPages.forEach((page) => {
      if (
        page.title?.toLowerCase().includes(q) ||
        page.category?.toLowerCase().includes(q)
      ) {
        res.push(page);
      }
    });

    return res;
  }, [query, tasks, projects, goals, notes, navigationPages, t]);

  const handleSelect = (item) => {
    if (!item) return;
    setGlobalSearchModalOpen(false);

    if (item.type === "page") {
      navigate(item.route);
    } else if (item.type === "task") {
      setSelectedTaskId(item.data.id);
      navigate("/tasks");
    } else if (item.type === "project") {
      openProjectModal(item.data.key || item.data.id);
    } else if (item.type === "goal") {
      navigate("/goals");
    } else if (item.type === "note") {
      openModal("note", item.data);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setGlobalSearchModalOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    }
  };

  if (!globalSearchModalOpen) return null;

  const getTypeBadge = (type) => {
    switch (type) {
      case "task":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase">Task</span>;
      case "project":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary-container text-on-secondary-container uppercase">Project</span>;
      case "goal":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-tertiary/10 text-tertiary uppercase">Goal</span>;
      case "note":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant uppercase">Note</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-on-surface-variant uppercase">Page</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-20 p-2.5 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setGlobalSearchModalOpen(false);
      }}
    >
      <div
        className="bg-surface-container-lowest w-full max-w-2xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-container animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-container bg-surface-container-lowest">
          <span className="material-symbols-outlined text-[22px] text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setGlobalSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t("header.searchPlaceholder")}
            className="flex-1 bg-transparent text-on-surface font-body-lg text-body-lg focus:outline-none placeholder:text-on-surface-variant"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGlobalSearch("");
              }}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant bg-surface-container-low rounded border border-surface-container">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] text-outline mb-2">find_in_page</span>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {language === "id" ? `Tidak ada hasil untuk "${query}"` : `No results found for "${query}"`}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {language === "id" ? "Coba gunakan kata kunci lain seperti tugas, proyek, atau target." : "Try searching for tasks, projects, goals, or navigation pages."}
              </p>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-sm text-headline-sm font-semibold truncate">
                        {item.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {item.subtitle || item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getTypeBadge(item.type)}
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-surface-container bg-surface-container-low/50 text-[11px] text-on-surface-variant">
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ {language === "id" ? "Navigasi" : "Navigate"}</span>
            <span>↵ {language === "id" ? "Pilih" : "Select"}</span>
            <span>ESC {language === "id" ? "Tutup" : "Close"}</span>
          </div>
          <span className="truncate">Ignos Spotlight Search</span>
        </div>
      </div>
    </div>
  );
}
