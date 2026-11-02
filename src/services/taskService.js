import Parse from "./parse.js";
import { householdAcl, householdPointer } from "./householdService.js";
import { addDays } from "../utilities/dates.js";

const Task = Parse.Object.extend("Task");

function userPointer(userId) {
  return userId ? Parse.User.createWithoutData(userId) : null;
}

// an empty optional field is removed, not saved as null or "";
// a new row has nothing to remove yet
function setOrUnset(item, key, value) {
  if (value) {
    item.set(key, value);
  } else if (!item.isNew()) {
    item.unset(key);
  }
}

// a row from the database, as the components want to see it. People are ids:
// the household says which id is the owner and which the partner.
function toTask(item) {
  return {
    id: item.id,
    title: item.get("title"),
    addedBy: item.get("addedBy")?.id,
    assignedTo: item.get("assignedTo")?.id ?? null, // null = up for grabs
    day: item.get("day") ?? null, // for an up-for-grabs task: the deadline
    time: item.get("time") ?? "", // "HH:mm", "" = any time
    done: item.get("done"),
    doneAt: item.get("doneAt") ?? null,
    repeatsWeekly: item.get("repeatsWeekly"),
  };
}

// one query for the whole household, never one per row
export async function loadTasks(household) {
  const results = await new Parse.Query(Task)
    .equalTo("list", householdPointer(household))
    .ascending("createdAt")
    .limit(1000) // Parse returns only 100 rows unless asked for more
    .find();

  return results.map(toTask);
}

// assignedTo: a user id, or null for up for grabs (FR6). done: FR5, logged as done now.
export async function addTask(
  household,
  {
    title,
    assignedTo = null,
    day = null,
    time = "",
    done = false,
    repeatsWeekly = false,
  },
) {
  if (!title.trim()) {
    throw new Error("A task needs a title"); // NFR5
  }

  const item = new Task();
  item.set("title", title.trim());
  item.set("list", householdPointer(household));
  item.set("addedBy", Parse.User.current());
  setOrUnset(item, "assignedTo", userPointer(assignedTo));
  setOrUnset(item, "day", day);
  setOrUnset(item, "time", time);
  item.set("done", done);
  setOrUnset(item, "doneAt", done ? new Date() : null);
  item.set("repeatsWeekly", repeatsWeekly);

  // the task follows its household: both partners may read and change it
  item.setACL(householdAcl(household));

  return toTask(await item.save());
}

// the edit sheet: what the task is, who does it and when
export async function updateTask(
  id,
  { title, assignedTo, day, time, repeatsWeekly },
) {
  if (!title.trim()) {
    throw new Error("A task needs a title"); // NFR5
  }

  const item = Task.createWithoutData(id);
  item.set("title", title.trim());
  setOrUnset(item, "assignedTo", userPointer(assignedTo));
  setOrUnset(item, "day", day);
  setOrUnset(item, "time", time);
  item.set("repeatsWeekly", repeatsWeekly);
  await item.save();
}

// FR7: I take an up-for-grabs task; the day starts as its deadline, the time is optional
export async function takeTask(id, day, time) {
  const item = Task.createWithoutData(id);
  item.set("assignedTo", Parse.User.current());
  setOrUnset(item, "day", day);
  setOrUnset(item, "time", time);
  await item.save();
}

export async function deleteTask(id) {
  // stand-in object pointing at that row
  await Task.createWithoutData(id).destroy();
}

// FR8, FR15: ticking off a weekly task also creates next week's copy, in the
// same request. Returns the copy (undoDone needs its id) or null.
export async function setDone(household, task, done) {
  const item = Task.createWithoutData(task.id);
  item.set("done", done);
  setOrUnset(item, "doneAt", done ? new Date() : null);

  // a weekly task with no day has no "next week" to copy it to
  if (!done || !task.repeatsWeekly || !task.day) {
    await item.save();
    return null;
  }

  const copy = new Task();
  copy.set("title", task.title);
  copy.set("list", householdPointer(household));
  copy.set("addedBy", userPointer(task.addedBy));
  setOrUnset(copy, "assignedTo", userPointer(task.assignedTo));
  copy.set("day", addDays(task.day, 7));
  setOrUnset(copy, "time", task.time);
  copy.set("done", false);
  copy.set("repeatsWeekly", true);
  copy.setACL(householdAcl(household));

  await Parse.Object.saveAll([item, copy]);
  return toTask(copy);
}

// NFR5: the undo after setDone; also deletes next week's copy, if setDone made one
export async function undoDone(taskId, copyId) {
  const item = Task.createWithoutData(taskId);
  item.set("done", false);
  item.unset("doneAt");
  await item.save();

  if (copyId) {
    await Task.createWithoutData(copyId).destroy();
  }
}
