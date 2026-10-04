import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function AppHeader() {
  const navigate = useNavigate();
  const {
    globalSearch,
    setGlobalSearchModalOpen,
    openModal,
    language,
    setLanguage,
    sidebarOpen,
    toggleSidebar,
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    userMenuOpen,
    setUserMenuOpen,
    user,
    currentUserName,
    t
  } = useWorkspace();

  const searchInputRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setGlobalSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setGlobalSearchModalOpen]);

  // Click outside listener for notifications and user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setNotificationsOpen, setUserMenuOpen]);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-2.5 sm:px-space-xl transition-all">
      {/* Left: Mobile Menu Toggle & Global Search Bar */}
      <div className="flex items-center gap-1.5 sm:gap-space-sm flex-1 min-w-0 max-w-xl">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors shadow-sm flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
            {sidebarOpen ? "close" : "menu"}
          </span>
        </button>

        <div className="relative w-full min-w-0 cursor-pointer" onClick={() => setGlobalSearchModalOpen(true)}>
          <span className="material-symbols-outlined absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] sm:text-[18px]">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            readOnly
            value={globalSearch}
            placeholder={t("header.searchPlaceholder")}
            className="w-full pl-8 sm:pl-10 pr-2 sm:pr-12 py-space-xs h-9 sm:h-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm sm:font-body-md text-body-sm sm:text-body-md placeholder:text-on-surface-variant focus:outline-none cursor-pointer shadow-xs border border-transparent hover:border-surface-container transition-all truncate"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low rounded border border-surface-container">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-space-md flex-shrink-0 ml-1.5 sm:ml-space-sm">
        {/* Quick Language Toggle Pill */}
        <button
          type="button"
          onClick={() => setLanguage(language === "id" ? "en" : "id")}
          title={t("header.switchLanguageTitle")}
          className="h-8 px-1.5 sm:px-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center gap-1 text-on-surface font-label-sm text-label-sm font-semibold shadow-xs transition-colors cursor-pointer border border-surface-container flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-primary">translate</span>
          <span className="hidden sm:inline">{language === "id" ? "Bahasa (ID)" : "English (EN)"}</span>
          <span className="sm:hidden uppercase text-[11px] font-bold">{language}</span>
        </button>

        {/* Quick Create Button */}
        <button
          onClick={() => openModal("task")}
          type="button"
          title={t("header.quickAdd")}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors shadow-sm flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">add</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative flex-shrink-0" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            title={t("header.notifications")}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors shadow-sm relative"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-error"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 top-11 sm:top-12 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl p-space-md z-50 border border-surface-container flex flex-col gap-space-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {language === "id" ? "Notifikasi" : "Notifications"}
                  </span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-error/10 text-error font-label-sm text-label-sm font-bold">
                      {unreadNotificationsCount} {language === "id" ? "baru" : "new"}
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-primary hover:underline font-label-sm text-label-sm font-medium"
                  >
                    {language === "id" ? "Tandai dibaca" : "Mark as read"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate(notif.route);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-2.5 ${!notif.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-container-low"
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === "urgent"
                          ? "bg-error"
                          : notif.type === "success"
                            ? "bg-tertiary"
                            : "bg-primary"
                        }`}
                    ></span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-sm text-[13px] font-semibold text-on-surface truncate">
                        {notif.title}
                      </span>
                      <span className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2">
                        {notif.desc}
                      </span>
                      <span className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Online Pill & Menu Popover */}
        <div className="relative pl-0 sm:pl-space-xs flex-shrink-0" ref={userMenuRef}>
          <div
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="cursor-pointer relative"
            title="User Profile"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shadow-xs text-on-primary font-bold text-[11px] sm:text-xs select-none">
              {user?.initials || "LB"}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-tertiary ring-2 ring-surface"></span>
          </div>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-10 sm:top-11 w-56 max-w-[calc(100vw-1.5rem)] bg-surface-container-lowest rounded-2xl shadow-2xl p-space-md z-50 border border-surface-container flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 border-b border-surface-container mb-1">
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface block truncate">{user?.name || currentUserName}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant block truncate">{user?.email || "laba@ignos.workspace"}</span>
                <span className="mt-1 inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                  {t("sidebar.adminUser")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                <span>{t("sidebar.settings")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage(language === "id" ? "en" : "id");
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-container-low flex items-center gap-2 text-on-surface font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">translate</span>
                <span>{language === "id" ? "Switch to English" : "Ganti ke Indonesia"}</span>
              </button>
              <div className="border-t border-surface-container my-0.5"></div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/logout");
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-error/10 text-error flex items-center gap-2 font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>{t("sidebar.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

  );
}
