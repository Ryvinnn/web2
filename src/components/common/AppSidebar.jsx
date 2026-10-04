import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function AppSidebar() {
  const navigate = useNavigate();
  const { t, sidebarOpen, closeSidebar, user, currentUserName } = useWorkspace();

  const mainNav = [
    { name: t("sidebar.dashboard"), path: "/dashboard", icon: "grid_view" },
    { name: t("sidebar.goals"), path: "/goals", icon: "flag" },
    { name: t("sidebar.projects"), path: "/projects", icon: "folder_open" },
    { name: t("sidebar.tasks"), path: "/tasks", icon: "check_circle" }
  ];

  const managementNav = [
    { name: t("sidebar.progress"), path: "/progress", icon: "trending_up" },
    { name: t("sidebar.notes"), path: "/notes", icon: "description" },
    { name: t("sidebar.calendar"), path: "/calendar", icon: "calendar_today" },
    { name: t("sidebar.statistics"), path: "/statistics", icon: "bar_chart" }
  ];

  const bottomNav = [
    { name: t("sidebar.settings"), path: "/settings", icon: "settings" },
    { name: t("sidebar.logout"), path: "/logout", icon: "logout" }
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors font-body-md text-body-md ${
      isActive
        ? "bg-surface-container text-primary font-medium"
        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand / Logo */}
          <div className="h-16 px-space-xl flex items-center justify-between flex-shrink-0">
            <div
              className="flex items-center gap-space-md cursor-pointer"
              onClick={() => {
                navigate("/dashboard");
                closeSidebar();
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">{t("common.appName") || "Suru"}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">{t("common.workspace") || "Workspace"}</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeSidebar}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Main Section */}
          <div className="px-space-md py-space-sm">
            <span className="px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-space-xs">
              {t("sidebar.main")}
            </span>
            <nav className="flex flex-col gap-space-xs">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={linkClass}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Management Section */}
          <div className="px-space-md py-space-sm">
            <span className="px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-space-xs">
              {t("sidebar.management")}
            </span>
            <nav className="flex flex-col gap-space-xs">
              {managementNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={linkClass}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-space-md bg-surface-container-lowest flex-shrink-0 border-t border-surface-container/50">
          <nav className="flex flex-col gap-space-xs mb-space-sm">
            {bottomNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={linkClass}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Card */}
          <div
            onClick={() => {
              navigate("/settings");
              closeSidebar();
            }}
            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary font-bold text-xs select-none">
                {user?.initials || "LB"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface truncate">{user?.name || currentUserName}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                  {t("sidebar.adminUser")}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">settings</span>
          </div>
        </div>
      </aside>
    </>
  );
}
