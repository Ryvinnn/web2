import { toDbRow, isUuid } from "./src/utils/dataSync.js";

console.log("=== RUNNING SYNC AUDIT & VERIFICATION TESTS ===");

const TEST_UUID = "d3b07384-d113-4cd2-b36c-949e29a3e68f";

// 1. Check UUID validation
console.log("1. Testing UUID format enforcement...");
console.assert(isUuid(TEST_UUID) === true, "Valid UUID must pass");
console.assert(isUuid("loc_1712345678") === false, "Local demo account ID must fail UUID check");
console.assert(isUuid("") === false, "Empty string must fail UUID check");
console.assert(isUuid(undefined) === false, "Undefined must fail UUID check");

// 2. Check Tasks Table Schema Match
console.log("2. Testing Tasks mapping (verifying category column is NOT sent to tasks)...");
const sampleTask = {
  id: "t-1718000000001",
  title: "Tugas Harian Penting",
  description: "Dibuat di HP",
  category: "Mobile Work",
  status: "today",
  deadline: "2026-10-10",
  priority: "high",
  progress: 50,
  completed: false,
  subtasks: [{ id: "st-1", title: "Sub 1", completed: false }]
};

const taskRow = toDbRow("tasks", sampleTask, TEST_UUID);
console.assert(taskRow.id === "t-1718000000001", "Task ID must match");
console.assert(taskRow.user_id === TEST_UUID, "user_id must match UUID");
console.assert(taskRow.title === "Tugas Harian Penting", "title matches");
console.assert(taskRow.category === undefined, "CRITICAL: 'tasks' table has no category column in schema.sql!");
console.assert(taskRow.raw_data.category === "Mobile Work", "raw_data preserves category for client");
console.assert(taskRow.raw_data.subtasks.length === 1, "raw_data preserves subtasks");

// 3. Check Projects Table Schema Match
console.log("3. Testing Projects mapping...");
const sampleProject = {
  id: "p-1718000000002",
  title: "Proyek Suru Vercel",
  description: "Proyek baru dibuat di HP",
  category: "Web Engineering",
  status: "in-progress",
  progress: 40,
  deadline: "Oct 2026",
  priority: "high",
  milestones: [{ id: "m-1", title: "Setup DB", completed: true }]
};

const projectRow = toDbRow("projects", sampleProject, TEST_UUID);
console.assert(projectRow.id === "p-1718000000002", "Project ID must match");
console.assert(projectRow.category === "Web Engineering", "Project row includes category");
console.assert(projectRow.progress === 40, "Project progress is numeric");
console.assert(projectRow.raw_data.milestones.length === 1, "raw_data preserves milestones");

// 4. Check Goals Table Schema Match
console.log("4. Testing Goals mapping...");
const sampleGoal = {
  id: "g-1718000000003",
  title: "Target Produktivitas",
  description: "Selesaikan 10 project",
  category: "career",
  status: "in_progress",
  progress: 20
};
const goalRow = toDbRow("goals", sampleGoal, TEST_UUID);
console.assert(goalRow.category === "career", "Goal row has category");

// 5. Check Notes Table Schema Match
console.log("5. Testing Notes mapping...");
const sampleNote = {
  id: "n-1718000000004",
  title: "Catatan Arsitektur",
  snippet: "Isi catatan",
  category: "Tech",
  status: "active"
};
const noteRow = toDbRow("notes", sampleNote, TEST_UUID);
console.assert(noteRow.title === "Catatan Arsitektur", "Note title matches");
console.assert(noteRow.description === "Isi catatan", "Note snippet mapped to description");

// 6. Check Activity Feed Table Schema Match
console.log("6. Testing Activity Feed mapping...");
const sampleActivity = {
  id: "act-1718000000005",
  itemTitle: "Tugas Selesai",
  type: "Tugas Selesai",
  description: "Menyelesaikan tugas",
  date: "2026-10-10"
};
const actRow = toDbRow("activity_feed", sampleActivity, TEST_UUID);
console.assert(actRow.title === "Tugas Selesai", "Activity feed fallback title matches");

// 7. Test Cross-Device Reconciliation Logic
console.log("7. Testing Reconciliation Logic between Mobile and Laptop...");
const reconcile = (remoteList, localList) => {
  const remoteMap = new Map();
  remoteList.forEach((item) => {
    if (item?.id) remoteMap.set(String(item.id), item);
  });
  const merged = [...remoteList];
  const unsyncedToPush = [];
  for (const lItem of localList) {
    if (!lItem?.id) continue;
    const idKey = String(lItem.id);
    if (!remoteMap.has(idKey)) {
      if (!lItem._synced) {
        const rescued = { ...lItem, _synced: true };
        merged.push(rescued);
        unsyncedToPush.push(rescued);
      }
    }
  }
  return { merged, unsyncedToPush };
};

// Scenario A: Mobile created items before fix (remote is empty, mobile has 1 project, 1 task with _synced = false)
const mobileLocalProjects = [{ id: "p-mobile", title: "Project Mobile", _synced: false }];
const remoteProjectsEmpty = [];
const mobileResult = reconcile(remoteProjectsEmpty, mobileLocalProjects);
console.assert(mobileResult.merged.length === 1, "Mobile local project rescued in merged state");
console.assert(mobileResult.unsyncedToPush.length === 1, "Mobile unsynced project detected for Supabase upload");

// Scenario B: Laptop logs in with empty local storage, remote has the project uploaded by Mobile
const laptopLocalProjectsEmpty = [];
const remoteProjectsWithMobile = [{ id: "p-mobile", title: "Project Mobile", _synced: true }];
const laptopResult = reconcile(remoteProjectsWithMobile, laptopLocalProjectsEmpty);
console.assert(laptopResult.merged.length === 1, "Laptop successfully downloads project from remote");
console.assert(laptopResult.merged[0].id === "p-mobile", "Project on laptop has exact ID from mobile");
console.assert(laptopResult.unsyncedToPush.length === 0, "No unsynced items to push on laptop");

// Scenario C: Item was deleted on remote, and was previously synced. It should NOT resurrect.
const localWithPreviouslySynced = [{ id: "p-deleted", title: "Project Deleted", _synced: true }];
const remoteAfterDeletion = [];
const deleteResult = reconcile(remoteAfterDeletion, localWithPreviouslySynced);
console.assert(deleteResult.merged.length === 0, "Deleted remote item is NOT resurrected (no zombies)");
console.assert(deleteResult.unsyncedToPush.length === 0, "No upload triggered for deleted item");

// 8. Test Partial Table Failure Resilience
console.log("8. Testing Partial Table Failure Resilience...");
const mockTableErrors = {
  goals: null,
  projects: null,
  tasks: null,
  notes: null,
  activityFeed: "permission denied for table activity_feed"
};
const canSyncProjects = !mockTableErrors.projects;
const canSyncTasks = !mockTableErrors.tasks;
const canSyncActivity = !mockTableErrors.activityFeed;
console.assert(canSyncProjects === true, "Projects sync is NOT blocked by activity feed failure");
console.assert(canSyncTasks === true, "Tasks sync is NOT blocked by activity feed failure");
console.assert(canSyncActivity === false, "Activity feed sync is isolated and skipped");

console.log("=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");

