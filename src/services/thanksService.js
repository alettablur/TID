/* eslint-disable no-unused-vars -- signatures only: the Us slice writes the bodies */
import Parse from "./parse.js";

const Thanks = Parse.Object.extend("Thanks");

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
  throw new Error("Not built yet");
}

// FR12: one tap; from me, to whoever did the task
export async function thank(household, task) {
  throw new Error("Not built yet");
}

// FR14: thank-yous a person received from Monday to Sunday, with count()
export async function countThanksReceived(household, userId, weekStart) {
  throw new Error("Not built yet");
}
