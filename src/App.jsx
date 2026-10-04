import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import AppSidebar from "./components/common/AppSidebar";
import AppHeader from "./components/common/AppHeader";
import CreateModal from "./components/common/CreateModal";
import ProjectDetailModal from "./components/common/ProjectDetailModal";
import GlobalSearchModal from "./components/common/GlobalSearchModal";

// Primary Pages
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";
import TasksPage from "./pages/TasksPage";
import ProjectsPage from "./pages/ProjectsPage";

// Secondary Pages
import {
  ProgressPage,
  NotesPage,
  CalendarPage,
  StatisticsPage,
  SettingsPage,
  LogoutPage
} from "./pages/SecondaryPages";

function GlobalToast() {
  const { toast } = useWorkspace();
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none">
      <div
        className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 font-label-md text-label-md text-white pointer-events-auto ${toast.type === "error"
            ? "bg-error"
            : toast.type === "info"
              ? "bg-secondary text-white"
              : "bg-primary text-white"
          }`}
      >
        <span className="material-symbols-outlined text-[18px] flex-shrink-0">
          {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
        </span>
        <span className="font-semibold truncate">{toast.message}</span>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex overflow-x-hidden">
      {/* Persistent Left Sidebar (Responsive Drawer) */}
      <AppSidebar />

      {/* Main Content Area offset by sidebar on desktop */}
      <div className="lg:pl-64 pl-0 flex-1 flex flex-col min-w-0 transition-all max-w-full">
        {/* Persistent Top Header */}
        <AppHeader />

        {/* Dynamic Route View */}
        <main className="w-full mt-16 bg-surface px-space-md sm:px-space-xl py-space-md sm:py-space-xl flex-1 max-w-full">
          {children}
        </main>
      </div>

      {/* Global Modals & System Components */}
      <CreateModal />
      <ProjectDetailModal />
      <GlobalSearchModal />
      <GlobalToast />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}
