import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/**
 * Validates if a string is a standard UUID.
 */
export function isUuid(id) {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

/**
 * Retrieves the authenticated user's ID directly from the active Supabase session.
 * Guarantees that RLS policies (auth.uid() = user_id) match the current session.
 */
export async function getActiveSessionUserId() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const activeId = data?.session?.user?.id;
    if (activeId && isUuid(activeId)) {
      return activeId;
    }
    return null;
  } catch (err) {
    console.warn("[dataSync] Failed to obtain active session user ID:", err);
    return null;
  }
}

/**
 * Converts a client entity into a database row matching the exact schema in supabase/schema.sql.
 * IMPORTANT:
 * - Table 'tasks' DOES NOT have a 'category' column in schema.sql.
 * - Table 'activity_feed' uses 'itemTitle' or 'type' if 'title' is absent.
 * - 'title' is NOT NULL in projects, goals, tasks, notes.
 */
export function toDbRow(table, item, userId) {
  const row = {
    id: String(item.id),
    user_id: userId,
    title: (item.title || item.itemTitle || item.type || "Untitled").trim() || "Untitled",
    description: item.description || item.snippet || "",
    status: item.status || "",
    progress: item.progress !== undefined && item.progress !== null ? Number(item.progress) : 0,
    deadline: item.deadline || item.dueDate || item.date || "",
    priority: item.priority || "",
    raw_data: item
  };

  // 'tasks' table in schema.sql has NO category column. Omit to prevent Postgres rejection.
  if (table !== "tasks") {
    row.category = item.category || item.typeKey || "";
  }

  return row;
}

/**
 * Fetches all workspace data for an authenticated user from Supabase.
 * Returns null if Supabase is unconfigured or user is not logged in.
 */
export async function fetchUserRemoteData(userId) {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const validUserId = isUuid(userId) ? userId : await getActiveSessionUserId();
  if (!validUserId) {
    return null;
  }

  try {
    const [goalsRes, projectsRes, tasksRes, notesRes, activityRes] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", validUserId).order("created_at", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", validUserId).order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("user_id", validUserId).order("created_at", { ascending: false }),
      supabase.from("notes").select("*").eq("user_id", validUserId).order("created_at", { ascending: false }),
      supabase.from("activity_feed").select("*").eq("user_id", validUserId).order("created_at", { ascending: false })
    ]);

    const logTableSelect = (tableName, res) => {
      const count = Array.isArray(res.data) ? res.data.length : 0;
      if (res.error) {
        console.warn(`[dataSync:SELECT] Table: ${tableName}, Rows: 0, Status: FAILED, Error: ${res.error.message}`);
      } else {
        console.log(`[dataSync:SELECT] Table: ${tableName}, Rows: ${count}, Status: OK`);
      }
    };

    logTableSelect("goals", goalsRes);
    logTableSelect("projects", projectsRes);
    logTableSelect("tasks", tasksRes);
    logTableSelect("notes", notesRes);
    logTableSelect("activity_feed", activityRes);

    const tableErrors = {
      goals: goalsRes.error?.message || null,
      projects: projectsRes.error?.message || null,
      tasks: tasksRes.error?.message || null,
      notes: notesRes.error?.message || null,
      activityFeed: activityRes.error?.message || null
    };

    const hasAnyError = Object.values(tableErrors).some(Boolean);

    const normalize = (items) => {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (item.raw_data && typeof item.raw_data === "object" && Object.keys(item.raw_data).length > 0) {
          return {
            ...item.raw_data,
            id: String(item.id),
            userId: item.user_id,
            title: item.title || item.raw_data.title || "",
            description: item.description || item.raw_data.description || item.raw_data.snippet || "",
            status: item.status || item.raw_data.status || "",
            deadline: item.deadline || item.raw_data.deadline || item.raw_data.dueDate || "",
            priority: item.priority || item.raw_data.priority || "",
            progress: item.progress !== null && item.progress !== undefined ? Number(item.progress) : (item.raw_data.progress ?? 0),
            _synced: true
          };
        }
        return { ...item, id: String(item.id), _synced: true };
      });
    };

    return {
      goals: normalize(goalsRes.data),
      projects: normalize(projectsRes.data),
      tasks: normalize(tasksRes.data),
      notes: normalize(notesRes.data),
      activityFeed: normalize(activityRes.data),
      tableErrors,
      error: hasAnyError ? Object.entries(tableErrors).filter(([, e]) => e).map(([t, e]) => `${t}: ${e}`).join("; ") : null
    };
  } catch (err) {
    console.error("[dataSync:SELECT] Unexpected failure while querying Supabase:", err.message);
    return {
      goals: [],
      projects: [],
      tasks: [],
      notes: [],
      activityFeed: [],
      tableErrors: { goals: err.message, projects: err.message, tasks: err.message, notes: err.message, activityFeed: err.message },
      error: err.message
    };
  }
}

/**
 * Saves a single entity (project, goal, task, note, activity item) to Supabase.
 * Returns an object with { success: boolean, error?: string }.
 */
export async function syncEntityToRemote(table, item, userId) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn(`[dataSync:INSERT] Table: ${table}, Status: SKIPPED, Reason: Supabase is not configured`);
    return { success: false, error: "Supabase is not configured." };
  }
  if (!item?.id) {
    console.warn(`[dataSync:INSERT] Table: ${table}, Status: FAILED, Reason: Item ID is missing`);
    return { success: false, error: "Item ID is missing." };
  }

  cancelPendingDebouncedSync(table, item.id);

  const validUserId = isUuid(userId) ? userId : await getActiveSessionUserId();
  if (!validUserId) {
    console.warn(`[dataSync:INSERT] Table: ${table}, ID: ${item.id}, Status: FAILED, Reason: No active authenticated Supabase user session`);
    return { success: false, error: "No active authenticated Supabase user session." };
  }

  try {
    const row = toDbRow(table, item, validUserId);
    const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`[dataSync:INSERT] Table: ${table}, ID: ${row.id}, Status: FAILED, Error: ${error.message}`);
      return { success: false, error: error.message };
    }
    console.log(`[dataSync:INSERT] Table: ${table}, ID: ${row.id}, Status: OK`);
    return { success: true };
  } catch (err) {
    console.error(`[dataSync:INSERT] Table: ${table}, ID: ${item.id}, Status: FAILED, Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a single entity from Supabase.
 * Returns an object with { success: boolean, error?: string }.
 */
export async function deleteEntityFromRemote(table, itemId, userId) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn(`[dataSync:DELETE] Table: ${table}, Status: SKIPPED, Reason: Supabase is not configured`);
    return { success: false, error: "Supabase is not configured." };
  }
  if (!itemId) {
    console.warn(`[dataSync:DELETE] Table: ${table}, Status: FAILED, Reason: Item ID is missing`);
    return { success: false, error: "Item ID is missing." };
  }

  cancelPendingDebouncedSync(table, itemId);

  const validUserId = isUuid(userId) ? userId : await getActiveSessionUserId();
  if (!validUserId) {
    console.warn(`[dataSync:DELETE] Table: ${table}, ID: ${itemId}, Status: FAILED, Reason: No active authenticated Supabase user session`);
    return { success: false, error: "No active authenticated Supabase user session." };
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", String(itemId))
      .eq("user_id", validUserId);

    if (error) {
      console.error(`[dataSync:DELETE] Table: ${table}, ID: ${itemId}, Status: FAILED, Error: ${error.message}`);
      return { success: false, error: error.message };
    }
    console.log(`[dataSync:DELETE] Table: ${table}, ID: ${itemId}, Status: OK`);
    return { success: true };
  } catch (err) {
    console.error(`[dataSync:DELETE] Table: ${table}, ID: ${itemId}, Status: FAILED, Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// In-memory timer registry for debounced updates (e.g. typing task description/title)
const debounceTimers = new Map();

export function cancelPendingDebouncedSync(table, itemId) {
  const key = `${table}:${itemId}`;
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key));
    debounceTimers.delete(key);
  }
}

/**
 * Debounces remote upserts for rapid changes (e.g., text inputs).
 */
export function debouncedSyncEntityToRemote(table, item, userId, delay = 400, onError = null) {
  if (!item?.id) return;
  cancelPendingDebouncedSync(table, item.id);

  const key = `${table}:${item.id}`;
  const timer = setTimeout(async () => {
    debounceTimers.delete(key);
    const result = await syncEntityToRemote(table, item, userId);
    if (!result.success && typeof onError === "function") {
      onError(result.error);
    }
  }, delay);

  debounceTimers.set(key, timer);
}

/**
 * Migrates local guest data into an authenticated account.
 * Merges records cleanly to prevent duplicates or accidental data loss.
 */
export async function migrateGuestData(guestData, userId, existingAccountData = null) {
  const result = {
    success: true,
    migratedCount: {
      projects: 0,
      goals: 0,
      tasks: 0,
      notes: 0,
      activityFeed: 0
    },
    mergedData: {
      projects: [],
      goals: [],
      tasks: [],
      notes: [],
      activityFeed: []
    }
  };

  try {
    const validUserId = isUuid(userId) ? userId : await getActiveSessionUserId();

    const existing = existingAccountData || {
      projects: [],
      goals: [],
      tasks: [],
      notes: [],
      activityFeed: []
    };

    // Helper to merge lists and preserve all references/IDs
    const mergeCollection = (existingList = [], guestList = []) => {
      const existingMap = new Map();
      existingList.forEach((item) => {
        if (item?.id) existingMap.set(String(item.id), item);
      });

      let added = 0;
      const combined = [...existingList];

      guestList.forEach((guestItem) => {
        if (!guestItem) return;
        const idKey = String(guestItem.id);
        if (!existingMap.has(idKey)) {
          // If no collision by ID, check if duplicate title exists to avoid cloning
          const duplicateTitle = combined.some(
            (c) => c.title && guestItem.title && c.title.trim().toLowerCase() === guestItem.title.trim().toLowerCase()
          );
          if (!duplicateTitle) {
            const preparedItem = { ...guestItem, _synced: false };
            combined.push(preparedItem);
            existingMap.set(idKey, preparedItem);
            added++;
          }
        }
      });

      return { combined, added };
    };

    const mergedProjects = mergeCollection(existing.projects, guestData.projects);
    const mergedGoals = mergeCollection(existing.goals, guestData.goals);
    const mergedTasks = mergeCollection(existing.tasks, guestData.tasks);
    const mergedNotes = mergeCollection(existing.notes, guestData.notes);
    const mergedActivity = mergeCollection(existing.activityFeed, guestData.activityFeed);

    result.migratedCount = {
      projects: mergedProjects.added,
      goals: mergedGoals.added,
      tasks: mergedTasks.added,
      notes: mergedNotes.added,
      activityFeed: mergedActivity.added
    };

    result.mergedData = {
      projects: mergedProjects.combined,
      goals: mergedGoals.combined,
      tasks: mergedTasks.combined,
      notes: mergedNotes.combined,
      activityFeed: mergedActivity.combined
    };

    // If Supabase is active, sync the merged items
    if (isSupabaseConfigured() && supabase && validUserId) {
      const syncRows = async (tableName, items) => {
        if (!items || items.length === 0) return;
        const rows = items.map((item) => toDbRow(tableName, item, validUserId));
        const { error } = await supabase.from(tableName).upsert(rows, { onConflict: "id" });
        if (error) {
          console.error(`[dataSync] Failed to migrate ${tableName}:`, error);
          throw new Error(`Failed to save ${tableName}: ${error.message}`);
        }
      };

      const syncResults = await Promise.allSettled([
        syncRows("projects", result.mergedData.projects),
        syncRows("goals", result.mergedData.goals),
        syncRows("tasks", result.mergedData.tasks),
        syncRows("notes", result.mergedData.notes),
        syncRows("activity_feed", result.mergedData.activityFeed)
      ]);

      const failed = syncResults.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        result.success = false;
        result.error = failed.map((f) => f.reason?.message || "Sync failed").join("; ");
      }
    }

    return result;
  } catch (err) {
    console.error("[dataSync] Failed during guest data migration:", err);
    return { ...result, success: false, error: err.message };
  }
}
