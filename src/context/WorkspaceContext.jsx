import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  initialGoals,
  initialProjects,
  initialTasks,
  initialActivityFeed,
  initialNotes
} from "../data/mockData";
import { computeNeedsAttention } from "../utils/attention";
import { translations } from "../utils/translations";
import {
  getTimePeriod,
  formatLocalDateLong,
  formatLocalDateToISO,
  calculateStreakMetrics
} from "../utils/dateTime";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  // Language state ('id' or 'en')
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("ignos_language") || "id";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("ignos_language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Device local time tracking (using browser's actual local time)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setCurrentDate(new Date());
    // Update every 30 seconds to catch minute/hour boundaries promptly
    const timer = setInterval(updateTime, 30000);
    window.addEventListener("focus", updateTime);
    document.addEventListener("visibilitychange", updateTime);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", updateTime);
      document.removeEventListener("visibilitychange", updateTime);
    };
  }, []);

  const timePeriod = getTimePeriod(currentDate);

  // User authentication / profile state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load user from localStorage:", e);
    }
    return {
      name: "Laba",
      email: "laba@suru.workspace",
      role: "Admin User",
      initials: "LB"
    };
  });

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      if (updates.name !== undefined) {
        const trimmed = (updates.name || "").trim();
        const parts = trimmed.split(/\s+/);
        next.initials = trimmed.length > 0
          ? (parts.length > 1
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : trimmed.slice(0, 2).toUpperCase())
          : "AU";
      }
      try {
        localStorage.setItem("ignos_user", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to persist user to localStorage:", e);
      }
      return next;
    });
  };

  const fallbackUserName = language === "id" ? "Pengguna Admin" : "Admin User";
  const currentUserName = (user && user.name && user.name.trim()) ? user.name.trim() : fallbackUserName;

  const t = useCallback((path, fallbackOrVars = "", vars = null) => {
    if (!path) return "";
    const fallback = typeof fallbackOrVars === "string" ? fallbackOrVars : "";
    const variables = typeof fallbackOrVars === "object" && fallbackOrVars !== null ? fallbackOrVars : vars;

    // Dynamic time-aware greeting
    if (path === "dashboard.greeting") {
      const period = getTimePeriod(currentDate);
      const name = (variables && variables.user !== undefined) ? variables.user : currentUserName;
      const dict = translations[language] || translations["id"];
      const greetingTemplate = dict?.dashboard?.greetings?.[period] || translations["id"]?.dashboard?.greetings?.[period] || "";
      return greetingTemplate.replace(/\{user\}/g, String(name));
    }

    // Dynamic local today date
    if (path === "dashboard.todayDate") {
      const targetDate = (variables && variables.date) ? variables.date : currentDate;
      return formatLocalDateLong(targetDate, language);
    }

    const keys = path.split(".");
    let current = translations[language] || translations["id"];
    let found = true;
    for (const k of keys) {
      if (!current || current[k] === undefined) {
        found = false;
        break;
      }
      current = current[k];
    }

    let result = found && current !== undefined ? current : null;
    if (result === null) {
      // Fallback to id dictionary
      let fb = translations["id"] || {};
      let fbFound = true;
      for (const sub of keys) {
        if (!fb || fb[sub] === undefined) {
          fbFound = false;
          break;
        }
        fb = fb[sub];
      }
      result = fbFound && fb !== undefined ? fb : (fallback || path);
    }

    if (variables && typeof result === "string") {
      for (const [vKey, vVal] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${vKey}\\}`, "g"), String(vVal));
      }
    }
    return result;
  }, [language, currentDate, currentUserName]);

  const getGreeting = (overrideDate = null, overrideName = null) => {
    const targetDate = overrideDate || currentDate;
    const period = getTimePeriod(targetDate);
    const targetUser = overrideName !== null ? overrideName : currentUserName;
    return t(`dashboard.greetings.${period}`, { user: targetUser });
  };

  // Load state from localStorage or initial defaults
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_goals");
      return saved ? JSON.parse(saved) : initialGoals;
    } catch {
      return initialGoals;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_projects");
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_tasks");
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_notes");
      return saved ? JSON.parse(saved) : initialNotes;
    } catch {
      return initialNotes;
    }
  });

  // Dynamic "Perlu Perhatian" / "Needs Attention" synchronized with live Projects, Goals, Tasks, and Subtasks
  const needsAttention = useMemo(() => {
    return computeNeedsAttention({
      projects,
      goals,
      tasks,
      currentDate,
      language,
      t
    });
  }, [projects, goals, tasks, currentDate, language, t]);

  const setNeedsAttention = useCallback(() => {}, []);

  // Clean up any stale static mock data from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem("ignos_needs_attention");
    } catch {
      // ignore
    }
  }, []);

  const [activityFeed, setActivityFeed] = useState(() => {
    try {
      const saved = localStorage.getItem("ignos_activity_feed");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (act) => act.id !== "act-1" && act.id !== "act-2" && act.id !== "act-3"
          );
        }
      }
      return initialActivityFeed;
    } catch {
      return initialActivityFeed;
    }
  });

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalSearchModalOpen, setGlobalSearchModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Notifications list with unread state
  const [notifications, setNotifications] = useState(() => {
    return [];
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast(t("common.savedSuccess") || "Notifikasi telah ditandai dibaca");
  };

  // Selected task in Tasks inspector drawer
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Global search input
  const [globalSearch, setGlobalSearch] = useState("");

  // Global Create Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "task", // 'task' | 'goal' | 'project' | 'note'
    initialData: null
  });

  // Project detail modal state
  const [projectModalState, setProjectModalState] = useState({
    isOpen: false,
    projectKey: "ignos"
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("ignos_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("ignos_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("ignos_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("ignos_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("ignos_activity_feed", JSON.stringify(activityFeed));
  }, [activityFeed]);

  // Task actions
  const toggleTask = (taskId) => {
    let affectedProjectId = null;
    let willBeCompleted = false;
    const todayISO = formatLocalDateToISO(currentDate);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          willBeCompleted = nextCompleted;
          affectedProjectId = t.projectId || t.project;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? (t.completedAt || todayISO) : null,
            timeTag: nextCompleted ? (language === "id" ? "Baru Selesai" : "Completed Just Now") : t.timeTag
          };
        }
        return t;
      })
    );

    if (affectedProjectId) {
      setProjects((prev) =>
        prev.map((p) => {
          if (
            p.id === affectedProjectId ||
            p.key === affectedProjectId ||
            p.title === affectedProjectId ||
            (p.title && affectedProjectId && p.title.toLowerCase().includes(String(affectedProjectId).toLowerCase()))
          ) {
            const nextCompletedTasks = willBeCompleted
              ? Math.min(p.totalTasks, (p.completedTasks || 0) + 1)
              : Math.max(0, (p.completedTasks || 0) - 1);
            const nextProgress = p.totalTasks > 0 ? Math.round((nextCompletedTasks / p.totalTasks) * 100) : p.progress;
            return {
              ...p,
              completedTasks: nextCompletedTasks,
              progress: nextProgress,
              status: nextProgress === 100 ? "completed" : (nextProgress > 0 ? "in-progress" : p.status)
            };
          }
          return p;
        })
      );
    }

    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask && !targetTask.completed) {
      setActivityFeed((prev) => [
        {
          id: "act-" + Date.now(),
          typeKey: "taskCompleted",
          itemTitle: targetTask.title,
          type: language === "id" ? "Tugas Selesai" : "Task Completed",
          description: language === "id" ? `Menyelesaikan tugas: "${targetTask.title}"` : `Completed task: "${targetTask.title}"`,
          time: language === "id" ? "Baru saja" : "Just now",
          date: todayISO,
          color: "bg-primary"
        },
        ...prev
      ]);
    } else if (targetTask && targetTask.completed) {
      setActivityFeed((prev) =>
        prev.filter((a) => !(a.typeKey === "taskCompleted" && a.itemTitle === targetTask.title))
      );
    }
  };

  const toggleAllTasks = () => {
    const todayISO = formatLocalDateToISO(currentDate);
    let nextCompletedState = false;
    setTasks((prev) => {
      const allTodayChecked = prev.filter((t) => t.status === "today").every((t) => t.completed);
      const nextCompleted = !allTodayChecked;
      nextCompletedState = nextCompleted;
      return prev.map((t) => {
        if (t.status === "today") {
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? todayISO : null
          };
        }
        return t;
      });
    });

    if (nextCompletedState) {
      setActivityFeed((prev) => [
        {
          id: "act-" + Date.now(),
          typeKey: "allTasksCompleted",
          itemTitle: language === "id" ? "Semua Tugas Hari Ini" : "All Today Tasks",
          type: language === "id" ? "Checklist Hari Ini Selesai" : "Today's Checklist Completed",
          description: language === "id" ? "Menandai seluruh tugas hari ini selesai." : "Marked all today's tasks as completed.",
          time: language === "id" ? "Baru saja" : "Just now",
          date: todayISO,
          color: "bg-primary"
        },
        ...prev
      ]);
    } else {
      setActivityFeed((prev) => prev.filter((a) => a.typeKey !== "allTasksCompleted"));
    }
    showToast(t("dashboard.todayChecklistTitle"));
  };

  const addTask = (newTask) => {
    const todayISO = formatLocalDateToISO(currentDate);
    const item = {
      id: "t-" + Date.now(),
      ticket: `IGN-${Math.floor(215 + Math.random() * 50)}`,
      title: newTask.title,
      description: newTask.description || "",
      project: newTask.project || "Suru SaaS",
      projectId: newTask.projectId || "p1",
      goal: newTask.goal || "Fullstack Dev",
      priority: newTask.priority || "medium",
      timeTag: newTask.timeTag || "Today",
      status: newTask.status || "today",
      deadline: newTask.deadline || todayISO,
      dueDate: newTask.dueDate || newTask.deadline || todayISO,
      createdAt: todayISO,
      completed: false,
      completedAt: null,
      tag: newTask.tag || "Baru",
      subtasks: newTask.subtasks || [],
      activityLog: [
        {
          author: user.initials || "LB",
          authorName: currentUserName,
          action: language === "id" ? "membuat tugas" : "created task",
          time: language === "id" ? "Baru saja" : "Just now",
          isUser: true
        }
      ]
    };
    setTasks((prev) => [item, ...prev]);

    // Add activity
    setActivityFeed((prev) => [
      {
        id: "act-" + Date.now(),
        typeKey: "taskCreated",
        itemTitle: newTask.title,
        type: language === "id" ? "Tugas Baru" : "New Task",
        description: language === "id" ? `Menambahkan tugas: "${newTask.title}"` : `Added task: "${newTask.title}"`,
        time: language === "id" ? "Baru saja" : "Just now",
        date: todayISO,
        color: "bg-primary"
      },
      ...prev
    ]);

    showToast(language === "id" ? `✓ Tugas "${newTask.title}" berhasil dibuat!` : `✓ Task "${newTask.title}" created successfully!`);
    return item;
  };

  const updateTask = (taskId, updates) => {
    const todayISO = formatLocalDateToISO(currentDate);
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask && updates.completed === true && !targetTask.completed) {
      setActivityFeed((prev) => [
        {
          id: "act-" + Date.now(),
          typeKey: "taskCompleted",
          itemTitle: updates.title || targetTask.title,
          type: language === "id" ? "Tugas Selesai" : "Task Completed",
          description: language === "id" ? `Menyelesaikan tugas: "${updates.title || targetTask.title}"` : `Completed task: "${updates.title || targetTask.title}"`,
          time: language === "id" ? "Baru saja" : "Just now",
          date: todayISO,
          color: "bg-primary"
        },
        ...prev
      ]);
    } else if (targetTask && updates.completed === false && targetTask.completed) {
      setActivityFeed((prev) =>
        prev.filter((a) => !(a.typeKey === "taskCompleted" && a.itemTitle === targetTask.title))
      );
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const merged = { ...t, ...updates };
          if (updates.completed !== undefined) {
            merged.completedAt = updates.completed ? (updates.completedAt || t.completedAt || todayISO) : null;
          }
          return merged;
        }
        return t;
      })
    );
    showToast(language === "id" ? "✓ Tugas berhasil diperbarui!" : "✓ Task updated successfully!");
  };

  const deleteTask = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (target?.title) {
      setActivityFeed((prev) => prev.filter((a) => a.itemTitle !== target.title));
    }
    showToast(language === "id" ? `✓ Tugas "${target?.title || ''}" telah dihapus` : `✓ Task "${target?.title || ''}" deleted`, "info");
  };

  const clearAllTasks = () => {
    setTasks([]);
    setActivityFeed([]);
    localStorage.setItem("ignos_tasks", "[]");
    localStorage.setItem("ignos_activity_feed", "[]");
    showToast(language === "id" ? "Semua tugas dan aktivitas telah dikosongkan" : "All tasks and activities cleared", "info");
  };

  const resetDefaultTasks = () => {
    setTasks(initialTasks);
    setActivityFeed(initialActivityFeed);
    localStorage.setItem("ignos_tasks", JSON.stringify(initialTasks));
    localStorage.setItem("ignos_activity_feed", JSON.stringify(initialActivityFeed));
    showToast(language === "id" ? "Data sampel berhasil dimuat ulang" : "Sample data reloaded successfully");
  };

  const rescheduleOverdueTasks = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.status === "overdue"
          ? { ...t, status: "today", timeTag: "Dijadwalkan Ulang (Hari ini)" }
          : t
      )
    );
    showToast(language === "id" ? "✓ Semua tugas terlewat berhasil dijadwalkan ulang ke Hari Ini!" : "✓ All overdue tasks rescheduled to Today!");
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId, title) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const subtasks = t.subtasks || [];
          return {
            ...t,
            subtasks: [
              ...subtasks,
              { id: "st-" + Date.now(), title, completed: false }
            ]
          };
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && Array.isArray(t.subtasks)) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId)
          };
        }
        return t;
      })
    );
  };

  // Goal actions
  const addGoal = (newGoal) => {
    const item = {
      id: "g-" + Date.now(),
      key: newGoal.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title: newGoal.title,
      description: newGoal.description || "",
      category: newGoal.category || "career",
      categoryLabel:
        newGoal.category === "career"
          ? "Career & Tech"
          : newGoal.category === "learning"
          ? "Learning"
          : newGoal.category === "health"
          ? "Health & Fitness"
          : "Personal",
      priority: newGoal.priority || "medium",
      deadline: newGoal.deadline || "2026-12-31",
      deadlineFormatted: newGoal.deadlineFormatted || "Dec 31, 2026",
      status: newGoal.status || "in_progress",
      progress: newGoal.progress || 0,
      milestones: newGoal.milestones || []
    };
    setGoals((prev) => [item, ...prev]);

    setActivityFeed((prev) => [
      {
        id: "act-" + Date.now(),
        typeKey: "goalCreated",
        itemTitle: newGoal.title,
        type: language === "id" ? "Target Baru" : "New Goal",
        description: language === "id" ? `Target dibuat: "${newGoal.title}"` : `Goal created: "${newGoal.title}"`,
        time: language === "id" ? "Baru saja" : "Just now",
        date: formatLocalDateToISO(currentDate),
        color: "bg-tertiary"
      },
      ...prev
    ]);

    showToast(language === "id" ? `✓ Target "${newGoal.title}" berhasil dibuat!` : `✓ Goal "${newGoal.title}" created successfully!`);
  };

  const updateGoal = (goalId, updates) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );
    showToast(language === "id" ? "✓ Target berhasil diperbarui!" : "✓ Goal updated successfully!");
  };

  const deleteGoal = (goalId) => {
    const target = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    if (target?.title) {
      setActivityFeed((prev) => prev.filter((a) => a.itemTitle !== target.title));
    }
    showToast(language === "id" ? `✓ Target "${target?.title || ''}" telah dihapus` : `✓ Goal "${target?.title || ''}" deleted`, "info");
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId && g.milestones) {
          let newlyCompletedMilestone = null;
          let uncheckedMilestone = null;
          const updatedMilestones = g.milestones.map((m) => {
            if (m.id === milestoneId) {
              const nextVal = !m.completed;
              if (nextVal) {
                newlyCompletedMilestone = m;
              } else {
                uncheckedMilestone = m;
              }
              return { ...m, completed: nextVal };
            }
            return m;
          });
          if (newlyCompletedMilestone) {
            setActivityFeed((prevFeed) => [
              {
                id: "act-" + Date.now(),
                typeKey: "milestoneCompleted",
                itemTitle: newlyCompletedMilestone.title,
                type: language === "id" ? "Milestone Tercapai" : "Milestone Achieved",
                description: language === "id" ? `Langkah milestone tercapai: "${newlyCompletedMilestone.title}"` : `Milestone step achieved: "${newlyCompletedMilestone.title}"`,
                time: language === "id" ? "Baru saja" : "Just now",
                date: formatLocalDateToISO(currentDate),
                color: "bg-tertiary"
              },
              ...prevFeed
            ]);
          } else if (uncheckedMilestone) {
            setActivityFeed((prevFeed) =>
              prevFeed.filter((a) => !(a.typeKey === "milestoneCompleted" && a.itemTitle === uncheckedMilestone.title))
            );
          }
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
          return {
            ...g,
            milestones: updatedMilestones,
            progress: newProgress,
            status: newProgress === 100 ? "completed" : "in_progress"
          };
        }
        return g;
      })
    );
  };

  const addGoalMilestone = (goalId, title) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const milestones = g.milestones || [];
          const updated = [
            ...milestones,
            { id: "m-" + Date.now(), title, completed: false, statusText: "Planned" }
          ];
          const completedCount = updated.filter((m) => m.completed).length;
          const newProgress = Math.round((completedCount / updated.length) * 100);
          return {
            ...g,
            milestones: updated,
            progress: newProgress,
            status: newProgress === 100 ? "completed" : "in_progress"
          };
        }
        return g;
      })
    );
    showToast(language === "id" ? "✓ Langkah milestone berhasil ditambahkan!" : "✓ Milestone step added!");
  };

  const deleteGoalMilestone = (goalId, milestoneId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId && Array.isArray(g.milestones)) {
          const updated = g.milestones.filter((m) => m.id !== milestoneId);
          const completedCount = updated.filter((m) => m.completed).length;
          const newProgress = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
          return {
            ...g,
            milestones: updated,
            progress: newProgress,
            status: newProgress === 100 ? "completed" : "in_progress"
          };
        }
        return g;
      })
    );
    showToast(language === "id" ? "✓ Milestone berhasil dihapus" : "✓ Milestone deleted", "info");
  };

  // Project actions
  const addProject = (newProject) => {
    const item = {
      id: "p-" + Date.now(),
      key: newProject.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title: newProject.title,
      description: newProject.description || "",
      category: newProject.category || "Web Engineering",
      linkedGoal: newProject.linkedGoal || "Learn Fullstack Development",
      techStack: newProject.techStack || ["React", "Tailwind"],
      progress: 0,
      completedTasks: 0,
      totalTasks: 1,
      deadline: newProject.deadline || "Nov 2026",
      status: newProject.status || "in-progress",
      statusLabel: "In Progress",
      owner: "Alex",
      milestones: 1,
      icon: newProject.icon || "hub",
      gradient: "from-surface-container via-surface-container-high to-secondary-container",
      coverImage: newProject.coverImage || null,
      coverImagePosition: newProject.coverImagePosition ?? 50
    };
    setProjects((prev) => [item, ...prev]);

    setActivityFeed((prev) => [
      {
        id: "act-" + Date.now(),
        typeKey: "projectCreated",
        itemTitle: newProject.title,
        type: language === "id" ? "Proyek Baru" : "New Project",
        description: language === "id" ? `Proyek dibuat: "${newProject.title}"` : `Project created: "${newProject.title}"`,
        time: language === "id" ? "Baru saja" : "Just now",
        date: formatLocalDateToISO(currentDate),
        color: "bg-secondary"
      },
      ...prev
    ]);

    showToast(language === "id" ? `✓ Proyek "${newProject.title}" berhasil dibuat!` : `✓ Project "${newProject.title}" created successfully!`);
  };

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId || p.key === projectId ? { ...p, ...updates } : p))
    );
    showToast(language === "id" ? "✓ Proyek berhasil diperbarui!" : "✓ Project updated successfully!");
  };

  const deleteProject = (projectId) => {
    const target = projects.find((p) => p.id === projectId || p.key === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId && p.key !== projectId));
    if (target?.title) {
      setActivityFeed((prev) => prev.filter((a) => a.itemTitle !== target.title));
    }
    showToast(language === "id" ? `✓ Proyek "${target?.title || ''}" telah dihapus` : `✓ Project "${target?.title || ''}" deleted`, "info");
  };

  // Note actions
  const addNote = (newNote) => {
    const item = {
      id: "n-" + Date.now(),
      title: newNote.title,
      category: newNote.category || "General",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      snippet: newNote.snippet || newNote.description || ""
    };
    setNotes((prev) => [item, ...prev]);
    showToast(language === "id" ? `✓ Catatan "${newNote.title}" berhasil disimpan!` : `✓ Note "${newNote.title}" saved successfully!`);
    return item;
  };

  const updateNote = (noteId, updates) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updates } : n))
    );
    showToast(language === "id" ? "✓ Catatan berhasil diperbarui!" : "✓ Note updated successfully!");
  };

  const deleteNote = (noteId) => {
    const target = notes.find((n) => n.id === noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast(language === "id" ? `✓ Catatan "${target?.title || ''}" telah dihapus` : `✓ Note "${target?.title || ''}" deleted`, "info");
  };

  // Open modals helper
  const openModal = (type = "task", initialData = null) => {
    setModalState({ isOpen: true, type, initialData });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: "task", initialData: null });
  };

  const openProjectModal = (projectKey = "ignos") => {
    setProjectModalState({ isOpen: true, projectKey });
  };

  const closeProjectModal = () => {
    setProjectModalState({ isOpen: false, projectKey: "ignos" });
  };

  // Compute live aggregates
  const todayTasks = tasks.filter((t) => t.status === "today");
  const todayCompletedTasks = todayTasks.filter((t) => t.completed);
  const completionPercentage =
    todayTasks.length > 0
      ? Math.round((todayCompletedTasks.length / todayTasks.length) * 100)
      : 0;

  const activeProjectsCount = projects.filter(
    (p) => p.status === "in-progress"
  ).length;

  const activeGoalsCount = goals.filter((g) => g.status === "in_progress").length;

  const overdueTasksCount = tasks.filter((t) => t.status === "overdue").length;
  const upcomingTasksCount = tasks.filter((t) => t.status === "upcoming").length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const streakMetrics = calculateStreakMetrics(tasks, activityFeed, currentDate);
  const streakCount = streakMetrics.currentStreak;
  const bestStreakCount = streakMetrics.bestStreak;

  const value = {
    language,
    setLanguage,
    t,
    goals,
    projects,
    tasks,
    notes,
    needsAttention,
    setNeedsAttention,
    activityFeed,
    selectedTaskId,
    setSelectedTaskId,
    globalSearch,
    setGlobalSearch,
    globalSearchModalOpen,
    setGlobalSearchModalOpen,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    userMenuOpen,
    setUserMenuOpen,
    toast,
    showToast,
    modalState,
    openModal,
    closeModal,
    projectModalState,
    openProjectModal,
    closeProjectModal,
    toggleTask,
    toggleAllTasks,
    addTask,
    updateTask,
    deleteTask,
    clearAllTasks,
    resetDefaultTasks,
    rescheduleOverdueTasks,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    addGoalMilestone,
    deleteGoalMilestone,
    addProject,
    updateProject,
    deleteProject,
    addNote,
    updateNote,
    deleteNote,
    todayTasks,
    todayCompletedTasks,
    completionPercentage,
    activeProjectsCount,
    activeGoalsCount,
    overdueTasksCount,
    upcomingTasksCount,
    completedTasksCount,
    streakCount,
    bestStreakCount,
    currentTime: currentDate,
    currentDate,
    timePeriod,
    user,
    updateUser,
    currentUserName,
    getGreeting
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
