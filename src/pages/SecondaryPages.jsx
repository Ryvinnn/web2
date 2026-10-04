import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

export function ProgressPage() {
  const { projects, t } = useWorkspace();

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.progress.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.progress.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.progress.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.progress.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-lg">
        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.overallTitle")}
          </span>
          <div className="text-display font-display text-primary mt-2">72%</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("secondary.progress.overallDesc")}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "72%" }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.projectsTitle")}
          </span>
          <div className="text-display font-display text-tertiary mt-2">64.5%</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("secondary.progress.projectsDesc")}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: "64.5%" }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm sm:col-span-2 md:col-span-1">
          <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            {t("secondary.progress.milestonesTitle")}
          </span>
          <div className="text-display font-display text-on-surface mt-2">31 / 42</div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("secondary.progress.milestonesDesc")}
          </p>
          <div className="w-full bg-surface-container h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: "74%" }}></div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm">
        <h3 className="text-headline-md font-headline-md text-on-surface mb-space-md">
          {t("secondary.progress.activePipelines")}
        </h3>
        <div className="space-y-space-md">
          {projects.map((p) => (
            <div key={p.id} className="p-space-md bg-surface-container-low rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{p.title}</h4>
                  <span className="text-label-sm text-on-surface-variant">
                    {p.category} • {p.completedTasks}/{p.totalTasks} {t("secondary.progress.tasksLabel")}
                  </span>
                </div>
              </div>
              <div className="w-full md:w-64">
                <div className="flex justify-between text-label-sm mb-1">
                  <span className="text-on-surface-variant">{t("secondary.progress.completionLabel")}</span>
                  <span className="font-bold text-on-surface">{p.progress}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotesPage() {
  const { notes, deleteNote, openModal, showToast, language, t } = useWorkspace();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: t("common.all") || "Semua" },
    { id: "Architecture", label: "Architecture" },
    { id: "Personal", label: "Personal" },
    { id: "Language", label: "Language" }
  ];

  const filteredNotes = useMemo(() => {
    return (notes || []).filter((note) => {
      const matchCat = category === "all" || note.category === category;
      const matchSearch =
        !search.trim() ||
        note.title?.toLowerCase().includes(search.toLowerCase()) ||
        note.snippet?.toLowerCase().includes(search.toLowerCase()) ||
        note.category?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [notes, category, search]);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
              {t("secondary.notes.tag")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-on-surface-variant font-label-md text-label-md">
              {t("secondary.notes.subtag")}
            </span>
          </div>
          <h1 className="text-display font-display text-on-surface tracking-tight">
            {t("secondary.notes.title")}
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant">
            {t("secondary.notes.desc")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal("note")}
          className="h-10 px-space-lg rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-all flex items-center gap-space-xs self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span>{t("secondary.notes.newNoteBtn")}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "id" ? "Cari judul atau isi catatan..." : "Search note title or content..."}
            className="w-full pl-9 pr-3 py-1.5 h-9 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide-x min-w-0 max-w-full pb-1 sm:pb-0 flex-shrink-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-lg text-label-md font-label-md transition-colors whitespace-nowrap flex-shrink-0 ${category === c.id
                ? "bg-primary text-on-primary font-semibold"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-transparent hover:border-primary/20"
          >
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {note.category}
                </span>
                <span className="text-label-sm text-on-surface-variant">{note.date}</span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                {note.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant line-clamp-4 whitespace-pre-wrap">
                {note.snippet}
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-surface-container flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">{t("secondary.notes.syncActive")}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openModal("note", note)}
                  className="px-2 py-1 text-primary hover:bg-surface-container text-label-md font-medium rounded transition-colors"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === "id" ? `Hapus catatan "${note.title}"?` : `Delete note "${note.title}"?`)) {
                      deleteNote(note.id);
                      showToast(language === "id" ? "Catatan berhasil dihapus" : "Note deleted successfully");
                    }
                  }}
                  className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors"
                  title={t("common.delete")}
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full bg-surface-container-lowest p-space-2xl rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">description</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">{t("common.noData")}</h4>
            <p className="text-body-sm text-on-surface-variant mt-1 mb-space-md">
              {language === "id" ? "Tidak ada catatan yang cocok dengan pencarian Anda." : "No notes match your search criteria."}
            </p>
            <button
              type="button"
              onClick={() => openModal("note")}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-sm hover:bg-primary-container transition-colors"
            >
              {t("secondary.notes.newNoteBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { t, language, openModal, currentDate } = useWorkspace();
  const [monthOffset, setMonthOffset] = useState(0);

  // Local device date calculations
  const now = currentDate || new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDateNum = now.getDate();

  const [selectedDay, setSelectedDay] = useState(todayDateNum);

  // Target viewing month based on monthOffset
  const viewingDate = useMemo(() => {
    return new Date(todayYear, todayMonth + monthOffset, 1);
  }, [todayYear, todayMonth, monthOffset]);

  const viewingYear = viewingDate.getFullYear();
  const viewingMonth = viewingDate.getMonth();
  const isViewingCurrentMonth = viewingYear === todayYear && viewingMonth === todayMonth;

  const currentMonthLabel = useMemo(() => {
    const locale = language === "id" ? "id-ID" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric"
    }).format(viewingDate);
  }, [language, viewingDate]);

  const daysInMonth = useMemo(() => {
    return new Date(viewingYear, viewingMonth + 1, 0).getDate();
  }, [viewingYear, viewingMonth]);

  // First day of month (Mon=0, Tue=1, ..., Sun=6)
  const firstDayOfWeek = useMemo(() => {
    return (new Date(viewingYear, viewingMonth, 1).getDay() + 6) % 7;
  }, [viewingYear, viewingMonth]);

  // Total calendar slots (ceil to multiple of 7: 35 or 42)
  const totalSlots = useMemo(() => {
    const total = firstDayOfWeek + daysInMonth;
    return total > 35 ? 42 : 35;
  }, [firstDayOfWeek, daysInMonth]);

  const days = [
    t("common.days.mon"),
    t("common.days.tue"),
    t("common.days.wed"),
    t("common.days.thu"),
    t("common.days.fri"),
    t("common.days.sat"),
    t("common.days.sun")
  ];

  const eventsMap = useMemo(() => {
    const map = {};
    // Add today's event dynamically
    map[todayDateNum] = {
      title: "Team Attendance Sync",
      tag: language === "id" ? "Hari Ini" : "Today",
      color: "bg-primary text-on-primary"
    };

    const sprintReviewDay = Math.min(15, daysInMonth);
    const authMigrationDay = Math.min(todayDateNum + 1, daysInMonth);
    const releaseDay = Math.min(Math.max(28, daysInMonth - 2), daysInMonth);
    const portfolioReviewDay = daysInMonth;

    if (!map[sprintReviewDay]) {
      map[sprintReviewDay] = { title: "Sprint Backlog Review", tag: "Review", color: "bg-surface-container text-on-surface" };
    }
    if (!map[authMigrationDay]) {
      map[authMigrationDay] = { title: "M4 Auth Migration Deadline", tag: "Milestone", color: "bg-secondary-container text-primary" };
    }
    if (!map[releaseDay]) {
      map[releaseDay] = { title: "Ignos Core Engine Due", tag: "Release", color: "bg-primary-container text-on-primary" };
    }
    if (!map[portfolioReviewDay]) {
      map[portfolioReviewDay] = { title: "Portfolio V2 Review", tag: "Review", color: "bg-tertiary-container text-tertiary" };
    }
    return map;
  }, [todayDateNum, daysInMonth, language]);

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.calendar.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.calendar.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.calendar.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.calendar.desc")}
        </p>
      </div>

      <div className="bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {currentMonthLabel}
            </h2>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title={language === "id" ? "Bulan sebelumnya" : "Previous month"}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                title={language === "id" ? "Bulan berikutnya" : "Next month"}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMonthOffset(0);
                setSelectedDay(todayDateNum);
              }}
              className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
            >
              {t("secondary.calendar.todayBadge")} ({todayDateNum})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide-x min-w-0 max-w-full">
          <div className="min-w-[560px] sm:min-w-0">
            <div className="grid grid-cols-7 gap-2 text-center font-label-md font-semibold text-on-surface-variant mb-2">
              {days.map((d, idx) => (
                <div key={idx} className="py-2 bg-surface-container-low rounded-lg">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: totalSlots }).map((_, i) => {
                const dayNum = i - firstDayOfWeek + 1;
                const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
                const isToday = isViewingCurrentMonth && dayNum === todayDateNum;
                const isSelected = dayNum === selectedDay;
                const event = isValidDay ? eventsMap[dayNum] : null;
                return (
                  <div
                    key={i}
                    onClick={() => isValidDay && setSelectedDay(dayNum)}
                    className={`min-h-[90px] p-2 rounded-xl flex flex-col justify-between transition-all select-none ${!isValidDay
                      ? "bg-surface-container-low/40 opacity-40 pointer-events-none"
                      : isSelected
                        ? "bg-primary/10 border-2 border-primary cursor-pointer shadow-xs"
                        : isToday
                          ? "bg-surface-container-lowest border-2 border-primary/50 cursor-pointer"
                          : "bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low cursor-pointer"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-label-md font-semibold ${isToday || isSelected ? "text-primary" : "text-on-surface"}`}>
                        {isValidDay ? dayNum : ""}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </div>
                    {event && (
                      <div className={`text-[10px] p-1 rounded font-medium truncate mt-1 ${event.color}`}>
                        {event.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Agenda Inspection */}
        <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {language === "id" ? `Agenda ${selectedDay} ${currentMonthLabel}` : `Schedule for ${selectedDay} ${currentMonthLabel}`}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {eventsMap[selectedDay] ? (language === "id" ? "1 Agenda Terjadwal" : "1 Scheduled Event") : (language === "id" ? "Tidak ada agenda" : "No scheduled events")}
            </span>
          </div>
          {eventsMap[selectedDay] ? (
            <div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{eventsMap[selectedDay].title}</h4>
                  <span className="text-label-sm text-on-surface-variant">10:00 AM - 11:30 AM • In Progress</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${eventsMap[selectedDay].color}`}>
                {eventsMap[selectedDay].tag}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-space-md rounded-xl bg-surface-container-low">
              <p className="text-body-sm text-on-surface-variant italic">
                {language === "id" ? "Hari ini kosong. Anda dapat menambahkan tugas atau agenda baru." : "No events scheduled for this day. You can add a new task or agenda."}
              </p>
              <button
                type="button"
                onClick={() => {
                  const dayStr = String(selectedDay).padStart(2, "0");
                  const monthNum = String(viewingMonth + 1).padStart(2, "0");
                  openModal("task", { deadline: `${viewingYear}-${monthNum}-${dayStr}` });
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-xs hover:bg-primary-container transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{language === "id" ? "Tambah Tugas" : "Add Task"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatisticsPage() {
  const { t } = useWorkspace();

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">
            {t("secondary.statistics.tag")}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {t("secondary.statistics.subtag")}
          </span>
        </div>
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("secondary.statistics.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("secondary.statistics.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.weeklyVelocity")}
          </span>
          <div className="text-display font-display text-primary mt-1">
            24 {t("secondary.statistics.tasksUnit")}
          </div>
          <span className="text-tertiary text-label-sm font-semibold">
            {t("secondary.statistics.vsLastMonth")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.focusHours")}
          </span>
          <div className="text-display font-display text-on-surface mt-1">
            38.5 {t("secondary.statistics.hoursUnit")}
          </div>
          <span className="text-on-surface-variant text-label-sm">
            {t("secondary.statistics.avgPerDay")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.onTimeDelivery")}
          </span>
          <div className="text-display font-display text-tertiary mt-1">88.5%</div>
          <span className="text-tertiary text-label-sm font-semibold">
            {t("secondary.statistics.exceedsTarget")}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            {t("secondary.statistics.activeStreak")}
          </span>
          <div className="text-display font-display text-primary mt-1">
            6 {t("secondary.statistics.daysUnit")}
          </div>
          <span className="text-on-surface-variant text-label-sm">
            {t("secondary.statistics.bestStreak")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { language, setLanguage, t, user, updateUser, clearAllTasks, resetDefaultTasks } = useWorkspace();
  const [displayName, setDisplayName] = useState(user?.name || "Laba");
  const [toastMessage, setToastMessage] = useState("");

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const msg =
      newLang === "id"
        ? "✓ Bahasa berhasil diubah ke Bahasa Indonesia!"
        : "✓ Language successfully switched to English!";
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const handleSave = () => {
    updateUser({ name: displayName });
    setToastMessage(t("common.savedSuccess"));
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl max-w-3xl">
      <div className="flex flex-col gap-space-xs">
        <h1 className="text-display font-display text-on-surface tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant">
          {t("settings.subtitle")}
        </p>
      </div>

      {toastMessage && (
        <div className="p-space-md rounded-xl bg-primary/10 border border-primary/20 text-primary font-label-md text-label-md flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm space-y-space-xl">
        {/* Language Selection Section */}
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="material-symbols-outlined text-primary text-[22px]">translate</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("settings.languageSection")}
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-space-lg">
            {t("settings.languageDesc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {/* English Card */}
            <div
              onClick={() => handleLanguageChange("en")}
              className={`p-space-lg rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative select-none ${language === "en"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-surface-container bg-surface-container-low/40 hover:border-primary/40 hover:bg-surface-container-low"
                }`}
            >
              <div className="flex items-start justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    EN
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {t("settings.englishTitle")}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {t("settings.englishSubtitle")}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${language === "en" ? "border-primary bg-primary" : "border-outline-variant bg-transparent"
                    }`}
                >
                  {language === "en" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-space-md">
                {t("settings.englishDesc")}
              </p>

              {language === "en" && (
                <div className="flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>{t("settings.activeBadge")}</span>
                </div>
              )}
            </div>

            {/* Bahasa Indonesia Card */}
            <div
              onClick={() => handleLanguageChange("id")}
              className={`p-space-lg rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative select-none ${language === "id"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-surface-container bg-surface-container-low/40 hover:border-primary/40 hover:bg-surface-container-low"
                }`}
            >
              <div className="flex items-start justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                    ID
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {t("settings.indonesianTitle")}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {t("settings.indonesianSubtitle")}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${language === "id" ? "border-primary bg-primary" : "border-outline-variant bg-transparent"
                    }`}
                >
                  {language === "id" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
              </div>

              <p className="text-body-sm text-on-surface-variant mb-space-md">
                {t("settings.indonesianDesc")}
              </p>

              {language === "id" && (
                <div className="flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>{t("settings.activeBadge")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="pt-space-md border-t border-surface-container">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
            {t("settings.profileSection")}
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {t("settings.profileDesc")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                {t("settings.displayName")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                {t("settings.role")}
              </label>
              <input
                type="text"
                value={t("sidebar.adminUser")}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-body-md"
              />
            </div>
          </div>
        </div>

        {/* Workspace Theme & Tokens */}
        <div className="pt-space-md border-t border-surface-container">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
            {t("settings.themeSection")}
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {t("settings.themeDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-space-sm">
            <span className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-medium shadow-xs">
              {t("settings.themeTokens.primary")}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-secondary-container text-primary text-label-md font-medium shadow-xs">
              {t("settings.themeTokens.secondary")}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-surface-container text-tertiary text-label-md font-medium shadow-xs">
              {t("settings.themeTokens.tertiary")}
            </span>
          </div>
        </div>

        {/* Data & Sample Management */}
        <div className="pt-space-md border-t border-surface-container">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="material-symbols-outlined text-primary text-[22px]">database</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("settings.dataSection")}
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {t("settings.dataDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-space-md">
            <button
              type="button"
              onClick={clearAllTasks}
              className="px-space-lg py-2 rounded-lg bg-surface-container text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors flex items-center gap-1.5 border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>{t("settings.clearTasksBtn")}</span>
            </button>
            <button
              type="button"
              onClick={resetDefaultTasks}
              className="px-space-lg py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1.5 border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">restore</span>
              <span>{t("settings.resetTasksBtn")}</span>
            </button>
          </div>
        </div>

        <div className="pt-space-md border-t border-surface-container flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-space-xl py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors"
          >
            {t("settings.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LogoutPage() {
  const navigate = useNavigate();
  const { showToast, t } = useWorkspace();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-space-xl">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-space-lg shadow-sm">
        <span className="material-symbols-outlined text-[32px]">logout</span>
      </div>
      <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">
        {t("logout.title")}
      </h2>
      <p className="text-body-md font-body-md text-on-surface-variant max-w-md mb-space-xl">
        {t("logout.desc")}
      </p>
      <div className="flex items-center gap-space-md">
        <Link
          to="/dashboard"
          className="px-space-xl py-2.5 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm shadow-sm hover:bg-primary-container transition-colors"
        >
          {t("logout.backBtn")}
        </Link>
        <button
          type="button"
          onClick={() => {
            showToast(t("logout.toast"));
            navigate("/dashboard");
          }}
          className="px-space-lg py-2.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-headline-sm text-headline-sm transition-colors cursor-pointer"
        >
          {t("logout.confirmBtn")}
        </button>
      </div>
    </div>
  );
}
