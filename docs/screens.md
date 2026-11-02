# Screens

Figma file **"Test UI"**: https://www.figma.com/design/Qlqayvb8JYDHuCLuxLes9Y
- Page `10 · UI Components`: tokens, Avatar, Status chip, Button, Task card, Section header, Tab bar.
- Page `11 · UI Screens`: the screens below, grouped in sections. Frame names are given in brackets.
- Pages `01–04`: revised low-fi wireframes (structure reference).

If the Figma MCP server is connected in Claude Code, read the frames directly instead of guessing layouts.

## Example data (use it for seed data and the demo)

Thursday 8 October 2026, couple **Alex** (owner, brick, initial A) and **Sam** (partner, petrol, initial S), children Elias and Storm.

- Today: *Took Storm to daycare* (Alex, done 8:15), *Empty the dishwasher* (Alex, 18:00), *Pick up Storm from daycare* (Sam, 16:30).
- Upcoming: *Clean the bathroom* (Sam, Sat 10, 10:00, every week), *Elias football* (Alex, Sun 11, 09:00).
- Up for grabs: *Descale the kettle* (no date, added by Alex), *Hallway light bulb* (by Thu 8, added by Sam).
- Request: *Fix the socket*, Alex asks Sam for Sun 11 10:00, reply by Sat. Sam reschedules to Sat 10 15:00 (Alex must reply by Fri). Decline reason example: "Busy that day".
- Groceries to buy: Bread (added by Alex), Eggs ×12, Coffee (added by Sam). Bought: Diapers, Bananas (by Sam, just now), Milk (by Sam, yesterday).
- To thank: Sam did the laundry (2 hours ago).

## Home `/` [Home · Alex]

Header: overline "Thursday 8 October", title "Good evening, Alex" (Playfair), couple avatars A and S.

1. **To answer** (only when a request waits for me): request card with avatar, "Sam proposed a new time", "Reply by Fri", title, date pill, "Originally Sun 11 · 10:00 · 1 change", **Accept** (primary, full width), then **Reschedule** | **Decline**.
2. **Today** · "1 of 2 done": one card with a progress bar, my tasks as rows (done ones struck through with "Done at 8:15"), last row "2 up for grabs · Kettle · Light bulb, by Thu" with **Take one**.
3. **You and Sam** · "This week · 5–11 Oct": four numbers (open, planned, done, to buy), then "Fix the socket · Waiting" row (Sam's avatar), then "Sam did the laundry" with **Thank**.

First use [H8 · First use]: "Welcome, Alex", empty state "No tasks yet" + "Add your first task".

## Tasks `/tasks` [Tasks · List], `?view=week` [Tasks · Week]

- Title "Tasks", segmented **List | Week**, filters **Everyone | Mine | Sam's**.
- List sections: Today, Upcoming, Up for grabs (cards with **Take it**), Waiting for Sam. Task card = person strip + check circle + title + status chip + meta + avatar.
- Week: day strip Mon 5 – Sun 11 with one dot per task, then the selected day as time slots, then up for grabs and waiting.
- Tap a task → [Edit task] sheet: title, who, day, time, "Your other tasks · Thu 8" (Free / Clash), repeat every week, **Delete task** | **Save**.
- Request detail [Task detail · Request]: status chip, "Asked to Sam", current proposal, Accept / Reschedule / Decline.

## Add (the + button) [Add a task or a grocery]

Sheet "New task" with segmented **Task | Grocery**, title field, **Who does it**: Me / Sam / Either of us.

- **Me** [New task · Me, with a time]: day strip (No date, Today 8, Fri 9…), Any time | Set time, time field. If my task at that time exists: clash notice "Clash with one of your tasks · Empty the dishwasher · today 18:00". Repeat every week switch. **Mark as done** | **Add task**.
- **Either of us** [New task · Either of us]: notice "Goes to Up for grabs", label "By when · optional", hint "Pick a day to choose a time.".
- **Sam** [New task · Ask Sam]: label "When · needed for a request", day + time, "Sam's tasks · Sun 11" → "Sam is free", text "Sam can accept, suggest a new time or decline, and must reply by Sat.", **Send request to Sam**.
- **Grocery** [New item · Grocery (from Groceries)]: name + quantity stepper, notice "Already on the list · Added by Sam" with **Set to 2**, "Just added" list, **Done** | **Add**.

Conflict rule: only the tasks of the person who will do it count (Me → mine, Sam → Sam's, Either → both). "Clash" = same time or within 1 hour; the dots on the day strip and the list below show the same set of tasks.

## Take an open task [Take an open task]

1. **Take one** → sheet "Up for grabs" with the open tasks, each with **Take it**.
2. **Take it** → "When will you do it?": day strip starting at the deadline (days after it disabled), optional time, "Your tasks · Thu 8 → Free at 20:00", **Take it**.
3. The task appears in Today; toast "You took the light bulb · Sam can see it".

## Agree on when [Agree on when]

- [H2] Sam's Home with the request card: "Alex asks you", "Reply by Sat", **Accept**, **Reschedule** | **Decline**.
- [H3] Reschedule sheet: context line, new day + time, "Your tasks · Sat 10", "Free at 15:00", **Send new time to Alex**.
- [H4] Alex's Home: "Sam proposed a new time" card (chip "New time").
- [H5] After accept: toast "Confirmed · Sam fixes the socket Sat 15:00".
- [H6] Decline sheet: reason chips "Busy that day" / "Not this week" / "Can't do this one", note "The task goes back to Alex", **Back** | **Decline**.
- [H7] Alex's Home: "Back to you · Sam declined · “Busy that day”", **Do it myself** / **Ask again**.

## Groceries `/groceries` [G1 · Sam at the shop, G2 · Alex at home]

Title "Groceries", overline "Shared with Sam". Sections **To buy** and **Bought** (struck through, "bought by Sam, just now"). Tap the circle = bought; toast "Bananas bought · Undo" (5 s, NFR5). No thanks on groceries.

## Us `/us` [U1, U2, U3]

- Week switch "This week · 5–11 Oct", two columns (You / Sam): Done, Organised, Thanks. Caption "Organised = tasks you added, planned or proposed."
- Sam's view shows the received thanks: "Alex thanked you for the laundry".
- To thank list with **Thank**.
- No partner yet [U3 · Invite by username]: "Invite your partner", field "@sam.k", **Send invite**, "You share the list once Sam accepts."
  Open decision: todo-26's `shareList` shares immediately, with no accept step, and FR2 does not require one. Ask the group before building an accept step; if not, change the copy to "Sam can see the list as soon as you send it."
