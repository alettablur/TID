/* eslint-disable no-unused-vars -- reschedule is still a signature only */
import Parse from "./parse.js";
import { householdAcl, householdPointer } from "./householdService.js";
import { addDays } from "../utilities/dates.js";

const Request = Parse.Object.extend("Request");
const Task = Parse.Object.extend("Task");

function toRequest(row) {
  return {
    id: row.id,
    taskId: row.get("task")?.id,
    askedBy: row.get("askedBy")?.id,
    askedTo: row.get("askedTo")?.id,
    waitingFor: row.get("waitingFor")?.id, // who has to answer now
    day: row.get("day"),
    time: row.get("time") ?? "",
    replyBy: row.get("replyBy"),
    status: row.get("status"), // pending, accepted, declined or expired
    reason: row.get("reason") ?? "",
  };
}

// the open (pending) requests of the household, in one query: a Request has
// no list of its own, so it is found through its task's list. Expiry (FR11)
// comes later; for now a request stays pending until it is answered.
export async function loadRequests(household) {
  const householdTasks = new Parse.Query(Task).equalTo(
    "list",
    householdPointer(household),
  );

  const rows = await new Parse.Query(Request)
    .matchesQuery("task", householdTasks)
    .equalTo("status", "pending")
    .limit(1000)
    .find();

  return rows.map(toRequest);
}

// FR9: status pending, waitingFor = askedTo, replyBy = the day before day.
// The task itself stays with the one who asks until the partner accepts.
export async function askPartner(household, task, partnerId, day, time) {
  const partner = Parse.User.createWithoutData(partnerId);

  const request = new Request();
  request.set("task", Task.createWithoutData(task.id));
  request.set("askedBy", Parse.User.current());
  request.set("askedTo", partner);
  request.set("waitingFor", partner);
  request.set("day", day);
  request.set("time", time);
  request.set("replyBy", addDays(day, -1));
  request.set("status", "pending");
  // both partners may read and answer it (data-model.md, ACLs)
  request.setACL(householdAcl(household));

  return toRequest(await request.save());
}

// FR10: status accepted; the task gets the asked person, day and time.
// Both rows in one request, so they cannot end up disagreeing.
export async function acceptRequest(request) {
  const row = Request.createWithoutData(request.id);
  row.set("status", "accepted");

  const task = Task.createWithoutData(request.taskId);
  task.set("assignedTo", Parse.User.createWithoutData(request.askedTo));
  task.set("day", request.day);
  task.set("time", request.time);

  await Parse.Object.saveAll([row, task]);
}

// FR10: new day and time, waitingFor flips to the other person, new replyBy
export async function rescheduleRequest(request, day, time) {
  throw new Error("Not built yet");
}

// FR10: status declined. Our change to FR11: the task does not silently go back
// to the one who asked (their mental load would return unnoticed); it goes to
// Up for grabs, so it stays shared work. Its day stays, now as a deadline.
// The reason chips are left out of our small version.
export async function declineRequest(request, reason) {
  const row = Request.createWithoutData(request.id);
  row.set("status", "declined");
  if (reason) {
    row.set("reason", reason);
  }

  // no assignedTo = up for grabs (data-model.md); both rows in one request
  const task = Task.createWithoutData(request.taskId);
  task.unset("assignedTo");

  await Parse.Object.saveAll([row, task]);
}
