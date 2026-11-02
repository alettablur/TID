# Data model (Parse on Back4App)

From the ER diagram in Assignment 2. Every class also has `objectId` and `createdAt`, created by Parse. `ListMember` is the join table for the many-to-many between User and List.

## Classes

| Class | Field | Type | Notes |
| --- | --- | --- | --- |
| **User** | username | string | partners find each other by username, so users are publicly readable (as in todo-26 `signUp`) |
| | password | string | |
| | email | string | optional |
| **List** | name | string | the household, e.g. "Alex & Sam" |
| | owner | pointer → User | creator |
| **ListMember** | list | pointer → List | one row = the partner is in the household |
| | user | pointer → User | |
| **Task** | title | string | required (NFR5) |
| | list | pointer → List | |
| | addedBy | pointer → User | "added by Sam" |
| | assignedTo | pointer → User | **null = up for grabs** |
| | day | date, optional | for an open task this is the deadline ("by Thu 8") |
| | time | string "HH:mm", optional | "Any time" = empty |
| | done | boolean | |
| | doneAt | date, optional | "Done at 8:15" |
| | repeatsWeekly | boolean | FR15 |
| **Grocery** | name | string | |
| | amount | number | FR4: raised instead of adding twice |
| | list | pointer → List | |
| | addedBy | pointer → User | |
| | bought | boolean | two states only: to buy / bought |
| | boughtBy | pointer → User | |
| | boughtAt | date, optional | "bought by Sam, just now" |
| **Request** | task | pointer → Task | |
| | askedBy | pointer → User | who asked first |
| | askedTo | pointer → User | |
| | waitingFor | pointer → User | who has to answer **now**; flips on every reschedule |
| | day | date | current proposal |
| | time | string, optional | current proposal |
| | replyBy | date | the day before `day` (FR9) |
| | status | string | `pending`, `accepted`, `declined`, `expired` |
| | reason | string, optional | decline reason ("Busy that day") |
| | originalDay, originalTime, changes | date, string, number | optional extra fields for "Originally Sun 11 · 10:00 · 1 change" |
| **Thanks** | task | pointer → Task | |
| | from | pointer → User | |
| | to | pointer → User | |

`originalDay`, `originalTime` and `changes` are not in the report's ER diagram. Add them only if the group agrees, and update the diagram.

## Lifecycle of a request (US2)

1. Alex asks Sam: create `Request` (`status: pending`, `waitingFor: Sam`, `replyBy` = day before). The task stays Alex's (`assignedTo: Alex`) and shows "Waiting for Sam".
2. Sam **accepts**: `status: accepted`; task gets `assignedTo: Sam`, `day`, `time` from the request.
3. Sam **reschedules**: new `day`/`time`, `waitingFor: Alex`, `changes + 1`, new `replyBy`. Alex can accept, reschedule or decline the same way.
4. Sam **declines**: `status: declined`, optional `reason`; task stays with Alex ("Back to you": do it myself / ask again).
5. **No answer by `replyBy`**: on load, `requestService` sets `status: expired`; same outcome as a decline.

## ACLs

- `List`: owner and partner read **and write** (todo-26 gives the friend read only; change that in `invitePartner`).
- `Task`, `Grocery`: copy the list's ACL when created; when the partner joins, update existing rows (as `shareList` does in todo-26).
- `ListMember`, `Request`, `Thanks`: both partners read and write.

## Weekly overview (FR14), counted, not stored

For each partner, Monday to Sunday:

- **Done:** tasks with `assignedTo` = person, `done` = true, `doneAt` in the week.
- **Organised:** tasks with `addedBy` = person created in the week, plus requests with `askedBy` = person.
- **Thanks:** `Thanks` with `to` = person created in the week.

Use `count()` queries, not `find()` and `.length`.

## Repeat weekly (FR15)

When `setDone` marks a task with `repeatsWeekly` done, the same save creates a copy for `day + 7` with `done: false` (`Parse.Object.saveAll`).
