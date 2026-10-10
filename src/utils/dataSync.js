import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/**
 * Fetches all workspace data for an authenticated user from Supabase.
 */
export async function fetchUserRemoteData(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) {
    return null;
  }

  try {
    const [goalsRes, projectsRes, tasksRes, notesRes, activityRes] = await Promise.all([
      supabase.from("goals").select("*").eq("user_id", userId),
      supabase.from("projects").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("notes").select("*").eq("user_id", userId),
      supabase.from("activity_feed").select("*").eq("user_id", userId)
    ]);

    const normalize = (items) => {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (item.raw_data && typeof item.raw_data === "object") {
          return { ...item.raw_data, ...item, id: item.id };
        }
        return item;
      });
    };

    return {
      goals: normalize(goalsRes.data),
      projects: normalize(projectsRes.data),
      tasks: normalize(tasksRes.data),
      notes: normalize(notesRes.data),
      activityFeed: normalize(activityRes.data)
    };
  } catch (err) {
    console.error("Error fetching remote data from Supabase:", err);
    return null;
  }
}

/**
 * Saves a single entity (project, goal, task, note, activity item) to Supabase.
 */
export async function syncEntityToRemote(table, item, userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || !item?.id) {
    return false;
  }

  try {
    const row = {
      id: String(item.id),
      user_id: userId,
      title: item.title || "",
      description: item.description || item.snippet || "",
      status: item.status || "",
      progress: item.progress ?? null,
      deadline: item.deadline || "",
      category: item.category || "",
      priority: item.priority || "",
      raw_data: item
    };

    const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
    if (error) {
      console.warn(`Failed to sync to remote table ${table}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Error during remote sync to ${table}:`, err);
    return false;
  }
}

/**
 * Deletes a single entity from Supabase.
 */
export async function deleteEntityFromRemote(table, itemId, userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || !itemId) {
    return false;
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", String(itemId))
      .eq("user_id", userId);
    if (error) {
      console.warn(`Failed to delete from remote table ${table}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Error deleting from ${table}:`, err);
    return false;
  }
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
            combined.push(guestItem);
            existingMap.set(idKey, guestItem);
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
    if (isSupabaseConfigured() && supabase && userId) {
      const syncRows = async (tableName, items) => {
        if (!items || items.length === 0) return;
        const rows = items.map((item) => ({
          id: String(item.id),
          user_id: userId,
          title: item.title || "",
          description: item.description || item.snippet || "",
          status: item.status || "",
          progress: item.progress ?? null,
          deadline: item.deadline || "",
          category: item.category || "",
          priority: item.priority || "",
          raw_data: item
        }));
        await supabase.from(tableName).upsert(rows, { onConflict: "id" });
      };

      await Promise.allSettled([
        syncRows("projects", result.mergedData.projects),
        syncRows("goals", result.mergedData.goals),
        syncRows("tasks", result.mergedData.tasks),
        syncRows("notes", result.mergedData.notes),
        syncRows("activity_feed", result.mergedData.activityFeed)
      ]);
    }

    return result;
  } catch (err) {
    console.error("Failed during guest data migration:", err);
    return { ...result, success: false, error: err.message };
  }
}
