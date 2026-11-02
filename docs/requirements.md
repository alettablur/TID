# Requirements (from Assignment 2, 23 Oct 2026)

## Functional

| ID | The app lets the user… | Story |
| --- | --- | --- |
| FR1 | sign up and log in | Core |
| FR2 | share the household list with their partner by typing the partner's username | Core, US1 |
| FR3 | add a task or a grocery, and see who added each item | US1 |
| FR4 | raise the amount of a grocery already on the list instead of adding it twice | US1 |
| FR5 | log a task and set it directly to done, so work done on the spot is visible to the partner | US1, US3 |
| FR6 | choose who does a new task: me (optional day and time), either of us (up for grabs), or ask my partner | US1, US2 |
| FR7 | take an up-for-grabs task | US1 |
| FR8 | tick off a task as done or a grocery as bought, and see who did it and when | US1, US3 |
| FR9 | ask the partner to do a task at a day and time; the partner must reply by the day before | US2 |
| FR10 | answer a request: accept, suggest a new time, or decline with an optional reason | US2 |
| FR11 | get the task back when a request is declined or not answered in time, then do it themselves or ask again | US2 |
| FR12 | thank the partner with one tap for a task they completed | US3 |
| FR13 | see the thank-yous they received | US3 |
| FR14 | see a weekly overview of how many tasks each partner has done, organised and been thanked for | US1, US3 |
| FR15 | mark a task as repeating weekly, so a new copy appears for the next week when it is done | US1 |

## Non-functional

| ID | Attribute | Requirement |
| --- | --- | --- |
| NFR1 | Efficiency | Adding a task or grocery takes at most 4 taps plus typing the title, in under 10 seconds |
| NFR2 | Efficiency | Accepting a request and thanking each take 1 tap from Home |
| NFR3 | Learnability | A first-time user can add a task, ask their partner to do it, and thank them, without help |
| NFR4 | Visibility | On Home, a user can tell within 5 seconds who is doing each task and whether it is open, planned, waiting or done |
| NFR5 | Error prevention | Ticking something off can be undone for 5 seconds; an item cannot be saved without a title; a grocery already on the list is not added twice |
| NFR6 | Accessibility | Works on a phone screen with WCAG AA contrast (4.5:1), buttons at least 44 × 44 px, a text label on every button, status never shown by colour alone |

## Decisions after the wireframe tests (keep them)

- Home shows only **my** tasks for today (plus up-for-grabs, requests and the "You and Sam" block).
- Tasks opens on the **List** view; Week is the second tab (`?view=week`).
- The **+** in the tab bar opens the form for the current page (grocery form on Groceries). No extra "Add" buttons on pages.
- A hint "Pick a day to choose a time" under the day picker (time appears after a day is chosen).
- Tapping a task opens it for **editing**.
- Groceries have **two states only**: to buy and bought. No shopping mode, no thanks for groceries.
- Partners join by **username** (FR2).
- No activity feed.
- Taking an up-for-grabs task asks "When will you do it?" (day prefilled with the deadline, time optional).
- Request history view was removed; the request card shows "Originally Sun 11 · 10:00 · 1 change".
