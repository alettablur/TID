/* eslint-disable no-unused-vars -- signatures only: the Us slice writes the bodies */
import Parse from "./parse.js";
import { householdPointer } from "./householdService.js";

const Thanks = Parse.Object.extend("Thanks");

// maybe we should collect all pointers into a generic function?
function taskPointer(task) {
  return Parse.Object.extend("Task").createWithoutData(task.id);
}
function userPointer(userId) {
  return userId ? Parse.User.createWithoutData(userId) : null;
}

// a row from the database, as the components want to see it (docs/data-model.md)
function toThanks(row) {
  return {
    id: row.id,
    taskId: row.get("task")?.id,
    taskTitle: row.get("task")?.get("title"), // needs include("task")
    from: row.get("from")?.id,
    to: row.get("to")?.id,
    createdAt: row.createdAt,
  };
}

// FR13: the thank-yous of the household, in one query with include("task")
export async function loadThanks(household) {
  const tasksInHousehold = new Parse.Query("Task").equalTo(
    "list",
    householdPointer(household),
  );

  const results = await new Parse.Query(Thanks)
    .matchesQuery("task", tasksInHousehold)
    .include("task")
    .ascending("createdAt")
    .limit(1000) // Parse returns only 100 rows unless asked for more
    .find();

  return results.map(toThanks);
}

// FR12: one tap; from me, to whoever did the task
export async function sendThanks(task, partner) {
  const row = new Thanks();
  row.set("task", taskPointer(task));
  row.set("from", Parse.User.current());
  row.set("to", userPointer(partner.id));
  const saved = await row.save();
  return { ...toThanks(saved), taskTitle: task.title }; // overwriting the task title as this is otherwise undefined
}

// FR14: thank-yous a person received from Monday to Sunday, with count()
export async function countThanksReceived(household, userId, weekStart) {
  throw new Error("Not built yet");
}
