/* eslint-disable no-unused-vars -- signatures only: the US2 slice writes the bodies */
import Parse from "./parse.js";

const Request = Parse.Object.extend("Request");

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

// every request of the household, in one query with include("task").
// A pending request past replyBy is saved as expired here, so the task
// goes back to the one who asked (FR11).
export async function loadRequests(household) {
  throw new Error("Not built yet");
}

// FR9: status pending, waitingFor = askedTo, replyBy = the day before day
export async function askPartner(household, task, partnerId, day, time) {
  throw new Error("Not built yet");
}

// FR10: status accepted; the task gets the asked person, day and time
export async function acceptRequest(request) {
  throw new Error("Not built yet");
}

// FR10: new day and time, waitingFor flips to the other person, new replyBy
export async function rescheduleRequest(request, day, time) {
  throw new Error("Not built yet");
}

// FR10: status declined, optional reason; the task stays with the one who asked
export async function declineRequest(request, reason) {
  throw new Error("Not built yet");
}
