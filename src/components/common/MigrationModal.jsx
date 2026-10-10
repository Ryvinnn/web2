import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function MigrationModal() {
  const {
    pendingMigrationData,
    executeGuestMigration,
    dismissPendingMigration,
    t
  } = useWorkspace();

  const [loading, setLoading] = useState(false);

  if (!pendingMigrationData) return null;

  const { projects = [], goals = [], tasks = [], notes = [] } = pendingMigrationData;
  const totalItems = projects.length + goals.length + tasks.length + notes.length;

  if (totalItems === 0) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await executeGuestMigration();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 relative animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[26px]">cloud_sync</span>
        </div>

        <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
          {t("auth.transferGuestDataTitle")}
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-4">
          {t("auth.transferGuestDataDesc")}
        </p>

        {/* Summary Breakdown */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-container-low mb-5 text-label-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">folder</span>
            <span>{projects.length} Proyek</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">flag</span>
            <span>{goals.length} Target</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
            <span>{tasks.length} Tugas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">description</span>
            <span>{notes.length} Catatan</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={dismissPendingMigration}
            className="px-4 py-2.5 rounded-xl text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {t("auth.skipTransferBtn")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-body-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
            <span>{loading ? "Menyinkronkan..." : t("auth.transferBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
