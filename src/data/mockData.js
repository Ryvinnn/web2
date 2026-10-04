export const initialGoals = [
  {
    id: "g1",
    key: "fullstack",
    title: "Learn Fullstack Development (Laravel + Inertia + React)",
    description: "Complete end-to-end modern monolithic SaaS architecture mastery. Integrating deep state handling with rich client responsiveness and multi-tenant security layers.",
    category: "career",
    categoryLabel: "Career & Tech",
    priority: "high",
    deadline: "2026-12-20",
    deadlineFormatted: "Dec 20, 2026",
    status: "in_progress",
    progress: 78,
    linkedProjects: [
      { id: "p1", name: "Personal Portfolio", color: "tertiary" },
      { id: "p2", name: "Suru Attendance SaaS", color: "primary" }
    ],
    milestones: [
      { id: "m1", title: "HTML & Semantic Structure", completed: true, date: "Aug 12" },
      { id: "m2", title: "CSS & Tailwind Architecture", completed: true, date: "Aug 24" },
      { id: "m3", title: "JavaScript Deep Dive & Async", completed: true, date: "Sep 02" },
      { id: "m4", title: "React Component Composition", completed: true, date: "Sep 18" },
      { id: "m5", title: "Laravel 11 Backend & Eloquent ORM", completed: true, date: "Sep 30" },
      { id: "m6", title: "Inertia.js Bridge & State Sync", completed: true, date: "Oct 06" },
      { id: "m7", title: "Database Migrations & Multi-tenant", completed: true, date: "Oct 14" },
      { id: "m8", title: "Production Deployment & CI/CD", completed: false, statusText: "Due Nov 15 • In Progress" },
      { id: "m9", title: "Real-time WebSockets & Push Notifications", completed: false, statusText: "Due Dec 20 • Planned" }
    ]
  },
  {
    id: "g2",
    key: "portfolio",
    title: "Build Personal Portfolio & Showcase",
    description: "Curate top engineering case studies, interactive UI experiments, and personal design manifestos.",
    category: "career",
    categoryLabel: "Career & Tech",
    priority: "medium",
    deadline: "2026-10-15",
    deadlineFormatted: "Oct 15, 2026",
    status: "in_progress",
    progress: 60,
    doneCount: 3,
    totalCount: 5,
    linkedProjectText: "Linked: Portfolio v2",
    milestones: []
  },
  {
    id: "g3",
    key: "japanese",
    title: "Japanese Language Proficiency (JLPT N3)",
    description: "Master 650 Kanji, 3,750 vocabulary terms, and conversational grammar patterns for professional dual-fluency.",
    category: "learning",
    categoryLabel: "Learning",
    priority: "medium",
    deadline: "2026-11-30",
    deadlineFormatted: "Nov 30, 2026",
    status: "in_progress",
    progress: 45,
    doneCount: 9,
    totalCount: 20,
    unit: "Bab",
    nextSnippet: "Next: Kanji Batch 14 (Shin Kanzen)",
    milestones: []
  },
  {
    id: "g4",
    key: "fitness",
    title: "Marathon 10K Running Prep",
    description: "Endurance foundation, pace control under 5:15/km, and weekly interval training blocks.",
    category: "health",
    categoryLabel: "Health & Fitness",
    priority: "low",
    deadline: "2026-10-28",
    deadlineFormatted: "Oct 28, 2026",
    status: "in_progress",
    progress: 85,
    doneCount: 17,
    totalCount: 20,
    icon: "directions_run",
    subtext: "3 runs to final taper",
    badgeText: "Final Stretch",
    milestones: []
  },
  {
    id: "g5",
    key: "ai-integration",
    title: "AI Integration Mastery",
    description: "RAG pipeline converting local markdown notes into vectorized embeddings with instant hybrid semantic retrieval.",
    category: "career",
    categoryLabel: "AI Research",
    priority: "high",
    deadline: "2026-12-10",
    deadlineFormatted: "Dec 10, 2026",
    status: "in_progress",
    progress: 44,
    doneCount: 7,
    totalCount: 16,
    milestones: []
  }
];

export const initialProjects = [
  {
    id: "p1",
    key: "ignos",
    title: "Suru Personal Management SaaS",
    description: "Full-stack multi-user productivity platform with Laravel, Inertia, React, and Tailwind CSS.",
    category: "Web Engineering",
    linkedGoal: "Learn Fullstack Development",
    techStack: ["Laravel", "Inertia.js", "React", "Tailwind"],
    progress: 84,
    completedTasks: 26,
    totalTasks: 31,
    deadline: "Sep 28, 2026",
    daysLeft: 5,
    status: "in-progress",
    statusLabel: "In Progress",
    owner: "Alex",
    milestones: 5,
    icon: "dns",
    gradient: "from-surface-container via-surface-container-high to-secondary-container"
  },
  {
    id: "p2",
    key: "attendance",
    title: "Smart Attendance Mobile Companion",
    description: "Geolocation-based shift check-in mobile client with live perimeter radar, schedule shifts, and leave submission.",
    category: "Mobile App",
    linkedGoal: "Learn Fullstack Development",
    techStack: ["React Native", "Google Maps API", "REST"],
    progress: 75,
    completedTasks: 18,
    totalTasks: 24,
    deadline: "Oct 05, 2026",
    status: "in-progress",
    statusLabel: "In Progress",
    owner: "Alex",
    milestones: 4,
    icon: "smartphone",
    gradient: "from-surface-container-low via-surface-container to-surface-dim"
  },
  {
    id: "p3",
    key: "portfolio",
    title: "Personal Portfolio Website",
    description: "Minimalist editorial showcase website featuring interactive case studies, 3D project cards, and writing archive.",
    category: "Design & Frontend",
    linkedGoal: "Build Personal Portfolio",
    techStack: ["Astro", "Tailwind", "Framer Motion"],
    progress: 62,
    completedTasks: 12,
    totalTasks: 19,
    deadline: "Oct 15, 2026",
    status: "in-progress",
    statusLabel: "In Progress",
    owner: "Alex",
    milestones: 3,
    icon: "palette",
    gradient: "from-surface-container-highest via-surface-container to-surface-container-low"
  },
  {
    id: "p4",
    key: "japanese",
    title: "Japanese JLPT Study Dashboard",
    description: "Spaced repetition flashcard engine with Kanji frequency metrics, grammar drills, and listening test tracker.",
    category: "Education",
    linkedGoal: "Japanese Fluency N3",
    techStack: ["Anki Connect", "Vue 3", "Pinia"],
    progress: 22,
    completedTasks: 4,
    totalTasks: 18,
    deadline: "Nov 30, 2026",
    status: "planning",
    statusLabel: "Planning",
    owner: "Alex",
    milestones: 2,
    icon: "translate",
    gradient: "from-surface-container-high via-surface-container to-surface-container-low"
  },
  {
    id: "p5",
    key: "fitness",
    title: "Fitness & Running Routine Tracker",
    description: "Pacing telemetry analysis, heart-rate zones calibration, and Garmin sync automation for endurance building.",
    category: "Health & Lifestyle",
    linkedGoal: "Half-Marathon Readiness",
    techStack: ["Garmin API", "Python", "SQLite"],
    progress: 100,
    completedTasks: 15,
    totalTasks: 15,
    deadline: "Completed Aug 2026",
    status: "completed",
    statusLabel: "Completed",
    owner: "Alex",
    milestones: 3,
    icon: "directions_run",
    gradient: "from-surface-container-low via-surface-container to-secondary-container/40"
  },
  {
    id: "p6",
    key: "ai-knowledge",
    title: "AI Knowledge Vault & Search",
    description: "RAG pipeline converting local markdown notes into vectorized embeddings with instant hybrid semantic retrieval.",
    category: "AI Research",
    linkedGoal: "AI Integration Mastery",
    techStack: ["LangChain", "pgvector", "FastAPI"],
    progress: 44,
    completedTasks: 7,
    totalTasks: 16,
    deadline: "Dec 10, 2026",
    status: "in-progress",
    statusLabel: "In Progress",
    owner: "Alex",
    milestones: 3,
    icon: "psychology",
    gradient: "from-secondary-container via-surface-container to-surface-container-low"
  }
];

export const initialTasks = [
  // Overdue
  {
    id: "t-od-1",
    ticket: "IGN-188",
    title: "Selesaikan Autentikasi / Finish Auth flow with Laravel Breeze",
    description: "Integrate Sanctum tokens, session cookies, and handle multi-tenant subdomains fallback.",
    project: "Suru SaaS",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "high",
    dueDateText: "Due Yesterday",
    behindText: "18h behind",
    status: "overdue",
    completed: false,
    subtasksCount: "3/5 subtasks",
    subtasks: [
      { id: "s1", title: "Sanctum token generation", completed: true },
      { id: "s2", title: "Session cookies cookie domain setup", completed: true },
      { id: "s3", title: "Multi-tenant subdomain router wildcard", completed: true },
      { id: "s4", title: "OAuth Google provider callback verification", completed: false },
      { id: "s5", title: "End-to-end integration test suite", completed: false }
    ]
  },
  {
    id: "t-od-2",
    ticket: "IGN-175",
    title: "Revise Database Seeder for tenant isolation",
    description: "Prevent sample fake tenant accounts from bleeding into global user search queries.",
    project: "Suru Database",
    projectId: "p1",
    goal: "Infrastructure",
    priority: "medium",
    dueDateText: "Due 2 days ago",
    status: "overdue",
    completed: false,
    subtasksCount: "1/2 subtasks",
    subtasks: [
      { id: "s6", title: "Separate dummy company seeder from tenant scope", completed: true },
      { id: "s7", title: "Add isolated schema reset CLI command", completed: false }
    ]
  },
  // Today's execution plan
  {
    id: "t-td-1",
    ticket: "IGN-201",
    title: "Review PR #14 for Inertia Page transition",
    description: "Validated router scroll preservation and flash messages.",
    project: "Frontend",
    projectId: "p3",
    goal: "Fullstack Dev",
    priority: "medium",
    timeTag: "Done 09:15 AM",
    status: "today",
    completed: true,
    tag: "Meeting"
  },
  {
    id: "t-td-2",
    ticket: "IGN-202",
    title: "Implement summary metric cards in React",
    description: "Rendered KPI counter, weekly delta charts, and active shift indicators.",
    project: "Suru SaaS",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "medium",
    timeTag: "Done 11:30 AM",
    status: "today",
    completed: true,
    tag: "Attendance"
  },
  {
    id: "t-td-3",
    ticket: "IGN-204",
    title: "Design calendar scheduling grid view",
    description: "Construct the daily/weekly matrix view showing assigned shifts. Ensure mobile breakpoint cards fold cleanly without horizontal scroll blowout.\n\nRef Figma tokens: `surface-container-highest` for current day highlight.",
    project: "Smart Attendance",
    projectId: "p2",
    goal: "Shift Module Launch",
    priority: "high",
    timeTag: "03:00 PM Today",
    badge: "In Review",
    status: "today",
    completed: false,
    commentsCount: 4,
    subtasksCount: "2/4 subtasks",
    subtasks: [
      { id: "st-1", title: "Figma layout wireframe and token sync", completed: true },
      { id: "st-2", title: "Shift status badges (Active, Standby, Off)", completed: true },
      { id: "st-3", title: "Multi-date range selector popover", completed: false },
      { id: "st-4", title: "Mobile collapse responsive test on iOS viewport", completed: false }
    ],
    activityLog: [
      { author: "LB", authorName: "Laba", action: "updated priority from Medium to High", time: "25 minutes ago", isUser: true },
      { author: "SYS", authorName: "System", action: "Linked to parent goal Shift Launch", time: "Today at 10:14 AM", isUser: false }
    ]
  },
  {
    id: "t-td-4",
    ticket: "IGN-205",
    title: "Sync user progress calculation endpoint",
    description: "Expose automated aggregation pipeline to calculate weighted milestone percentages.",
    project: "Backend API",
    projectId: "p1",
    goal: "Performance Metrics",
    priority: "medium",
    timeTag: "04:30 PM Today",
    status: "today",
    completed: false,
    subtasksCount: "0/3 subtasks",
    subtasks: [
      { id: "st-5", title: "Add aggregation query scope in Goal model", completed: false },
      { id: "st-6", title: "Cache calculated percentage with Redis key", completed: false },
      { id: "st-7", title: "Expose JSON API resource endpoint", completed: false }
    ]
  },
  {
    id: "t-td-5",
    ticket: "IGN-206",
    title: "Write unit tests for goal milestone cascading delete",
    description: "Ensure soft deletes cascade safely without leaving orphaned subtasks or time tracking logs.",
    project: "Core Testing",
    projectId: "p1",
    goal: "SOC2 Compliance",
    priority: "low",
    timeTag: "06:00 PM Today",
    status: "today",
    completed: false,
    subtasksCount: "0/2 subtasks",
    subtasks: [
      { id: "st-8", title: "Write model cascade test case", completed: false },
      { id: "st-9", title: "Verify audit log retention", completed: false }
    ]
  },
  {
    id: "t-td-6",
    ticket: "IGN-207",
    title: "Setup API route controller Laravel 11",
    description: "Generate resource controllers and register v1 API routes with auth:sanctum middleware.",
    project: "Suru SaaS",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "high",
    timeTag: "Today",
    status: "today",
    completed: false,
    tag: "Backend"
  },
  {
    id: "t-td-7",
    ticket: "IGN-208",
    title: "Update tailwind theme tokens & contrast",
    description: "Refactor CSS variables and ensure WCAG AA color accessibility compliance.",
    project: "Suru SaaS",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "medium",
    timeTag: "Today",
    status: "today",
    completed: false,
    tag: "UI"
  },
  {
    id: "t-td-8",
    ticket: "IGN-209",
    title: "Latihan 10 Kanji JLPT N3 Unit 4",
    description: "Harian review flashcard Anki dan latihan menulis stroke order.",
    project: "Personal",
    projectId: "p4",
    goal: "Japanese Fluency N3",
    priority: "medium",
    timeTag: "Today",
    status: "today",
    completed: false,
    tag: "Personal"
  },
  // Upcoming
  {
    id: "t-up-1",
    ticket: "IGN-210",
    title: "Config GPS Geofencing radius logic in React Native",
    description: "Integrate native background location services and perimeter boundary triggers.",
    project: "Smart Attendance",
    projectId: "p2",
    goal: "Fullstack Dev",
    priority: "high",
    timeTag: "Tomorrow, 10:00 AM",
    status: "upcoming",
    completed: false,
    avatar: "LA"
  },
  {
    id: "t-up-2",
    ticket: "IGN-211",
    title: "Setup Docker container for local multi-tenant testing",
    description: "Compose file with MariaDB, Redis, and multi-tenant domain aliases.",
    project: "DevOps",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "medium",
    timeTag: "Friday, 02:00 PM",
    status: "upcoming",
    completed: false,
    avatar: "SK"
  },
  {
    id: "t-up-3",
    ticket: "IGN-212",
    title: "Client verification walkthrough with Suru Studio Team",
    description: "Sprint demonstration of time tracking and milestone progress visualization.",
    project: "Sprint Review",
    projectId: "p1",
    goal: "Fullstack Dev",
    priority: "medium",
    timeTag: "Monday next week",
    status: "upcoming",
    completed: false,
    avatar: "AD"
  }
];

export const initialNeedsAttention = [
  {
    id: "na-1",
    title: "Selesaikan Autentikasi OAuth",
    subtitle: "Terlambat 1 hari",
    dotColor: "bg-error",
    actionLabel: "Lihat →",
    actionColor: "text-error hover:bg-error hover:text-on-error",
    targetRoute: "/tasks"
  },
  {
    id: "na-2",
    title: "Portfolio Website Launch QA",
    subtitle: "Deadline dalam 3 hari",
    dotColor: "bg-[#B45309]",
    actionLabel: "Lihat →",
    actionColor: "text-on-surface hover:bg-surface-container-highest",
    targetRoute: "/projects"
  },
  {
    id: "na-3",
    title: "Milestone: Laravel Eloquent API",
    subtitle: "2 sub-task tersisa",
    dotColor: "bg-primary",
    actionLabel: "Review",
    actionColor: "text-on-surface hover:bg-surface-container-highest",
    targetRoute: "/goals"
  },
  {
    id: "na-4",
    title: "Database Schema Migration v2",
    subtitle: "Jadwal eksekusi besok",
    dotColor: "bg-secondary",
    actionLabel: "Siapkan",
    actionColor: "text-on-surface hover:bg-surface-container-highest",
    targetRoute: "/tasks"
  }
];

export const initialActivityFeed = [];

export const initialNotes = [
  {
    id: "n-1",
    title: "Riset Arsitektur Multi-tenant Laravel",
    category: "Architecture",
    date: "Sep 22, 2026",
    snippet: "Evaluasi skema database per-tenant vs shared schema dengan tenant_id column. Keputusan: gunakan shared database dengan tenancy scope global middleware untuk efisiensi resource."
  },
  {
    id: "n-2",
    title: "Checklist Launching Portfolio v2",
    category: "Personal",
    date: "Sep 20, 2026",
    snippet: "1. Optimize WebP images, 2. Add OpenGraph tags, 3. Setup analytics privacy-friendly, 4. Audit lighthouse score min 95 di semua kategori."
  },
  {
    id: "n-3",
    title: "Catatan Kosakata JLPT N3 - Batch 14",
    category: "Language",
    date: "Sep 18, 2026",
    snippet: "Shin Kanzen Master chapter 4: Kanji terkait bisnis & perkantoran (書類, 提出, 担当, 契約). Latihan listening shadowing 15 menit setiap pagi."
  }
];

