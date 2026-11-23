import Parse from "./parse.js";
import { householdAcl, householdPointer } from "./householdService.js";
import { userPointer } from "./authService.js";

const Thanks = Parse.Object.extend("Thanks");
const Task = Parse.Object.extend("Task");

function toThanks(row) {
  return {
    id: row.id,
    taskId: row.get("task")?.id,
    taskTitle: row.get("task")?.get("title"), // needs include("task")
    from: row.get("from")?.id,
    to: row.get("to")?.id,
    createdAt: row.createdAt,
    seen: row.get("seen"),
  };
}

// FR13: the thank-yous of the household, in one query with include("task")
export async function loadThanks(household) {
  const tasksInHousehold = new Parse.Query(Task).equalTo(
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
export async function sendThanks(household, task, partner) {
  const row = new Thanks();
  row.set("task", Task.createWithoutData(task.id));
  row.set("from", Parse.User.current());
  row.set("to", userPointer(partner.id));
  // only the two partners may read it, like every row of the household
  row.setACL(householdAcl(household));

  const saved = await row.save();
  // a saved row has no included task, so the title comes from the task we have
  return { ...toThanks(saved), taskTitle: task.title };
}

export async function markThanksSeen(ids) {
  if (ids.length === 0) return;

  const rows = ids.map((id) => Thanks.createWithoutData(id));
  rows.forEach((row) => row.set("seen", true));
  await Parse.Object.saveAll(rows);
}
