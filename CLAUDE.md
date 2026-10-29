# CLAUDE.md · Group 10 couples to-do (ITU Technical Interaction Design, Autumn 2026)

Read this file and everything in `docs/` before writing code.

## What we are building

A shared household app for **couples with children**: one shared to-do list and one shared grocery list per couple. It makes the invisible planning work visible, helps the two partners agree on *when* something gets done, and lets them thank each other.

Three user stories drive everything:

- **US1 Keep track:** get what I am keeping track of out of my head, so my partner can see it without me telling them.
- **US2 Agree on when:** get a task done at a time that suits both of us, so we do not remind each other again and again.
- **US3 Thank:** show my partner I noticed what they did, so they feel their work is noticed too.

Full requirements: `docs/requirements.md`. Data model: `docs/data-model.md`. Screens: `docs/screens.md`.

## Stack and starting point

- This repo **started as a copy of the course kickstarter `itu-tid/todo-26`** (week 8: lists, items, login, sharing by username, routing, service layer, GitHub Pages deploy). We keep its patterns and turn it into our app: `List` becomes the household, `TodoItem` becomes `Task`, and we add `Grocery`, `Request`, `Thanks`. Do not add frameworks the course does not use.
- Vite + React 19 + React Router 7 (`BrowserRouter`) + Parse SDK on **Back4App** + `gh-pages`, as in `package.json`.
- Icons: `lucide-react` (same icons as the Figma UI). No UI component library, no Tailwind.
- Fonts: Playfair Display (titles only) and DM Sans (everything else).

## Commands

```bash
npm install
npm run dev        # http://localhost:5173/<repo>/
npm run build      # vite build + copy index.html to 404.html (routing on GitHub Pages)
npm run deploy     # build + publish dist/ to the gh-pages branch
npm run lint
```

Secrets: `.env.local` (git-ignored) with `VITE_PARSE_SERVER_URL`, `VITE_PARSE_APP_ID`, `VITE_PARSE_JS_KEY`. Never commit it, never print the keys.

## Deploy rules (GitHub Pages with routing)

- `vite.config.js`: `base: "/<repo>/"`.
- `main.jsx`: `<BrowserRouter basename={import.meta.env.BASE_URL}>`.
- `build` script copies `dist/index.html` to `dist/404.html` so a refresh on `/tasks` works.

## Architecture (follow it, the course grades it)

```text
src/
├── main.jsx, App.jsx        App: user state, auth, routes
├── styles/                  tokens.css (all colours/fonts/radii/shadows), base.css
├── pages/                   one file per route: AuthPage, HomePage, TasksPage, GroceriesPage, UsPage
├── components/              pieces the pages use; a folder when files belong together
│   ├── Layout/              Layout.jsx (tab bar + <Outlet/>), TabBar.jsx
│   ├── TaskCard/  TaskForm/  Request/  Groceries/
│   └── Avatar.jsx  Button.jsx  Sheet.jsx  SectionHeader.jsx
├── services/                the ONLY code that imports Parse
│   ├── parse.js             Parse.initialize
│   ├── authService.js  householdService.js  taskService.js
│   └── requestService.js  groceryService.js  thanksService.js
└── utilities/dates.js
```

- **Routes** (inside one `Layout` route): `/` Home, `/tasks` (list; `?view=week` for the week), `/tasks/:taskId` (task sheet), `/groceries`, `/us`, `*` not found. Logged out: the "two sets of routes" pattern, login page at any address.
- **Sheets** (add task/grocery, reschedule, decline, take it) are component state, not routes. The **+** in the tab bar opens the task form, or the grocery form when on `/groceries`.
- **Services** return plain objects (like `toTodo` in the todo-26 reference). Components never import Parse and never call `.get()`.
- **Sharing:** one `List` per couple (the household). The partner is a `ListMember`. Unlike todo-26's `shareList`, the partner gets **read and write** access; every Task/Grocery copies the list's ACL.
- **Queries:** one query per class for the whole household, with `include()`; never one query per row (N+1).
- **Remote data:** every page renders loading, failed and ready.
- **Request expiry:** computed on load in `requestService` (a pending request past `replyBy` becomes expired and returns to the asker). No Cloud Code unless asked.

## Course coding rules (from itu-tid.github.io/Coding-Guidelines.md)

- One component per file, file named like the component, capitalised.
- Small components; extract repeated patterns.
- **No inline styles.** Each component has its own CSS file next to it; class names start with the component name (`.task-card__title`).
- **No hard-coded colours.** Only `var(--token)` from `styles/tokens.css`.
- Prefer named functions over arrow functions for handlers and components.
- No class components, no redundant comments, no unnecessary values (e.g. random `z-index: 1000`). Comments explain *why*, briefly.
- Write code a student can explain line by line at the oral exam: plain, idiomatic, no clever abstractions.

## Design rules (Figma "Test UI", pages 10 and 11)

- Mobile first: design for 360–430 px. Above that, a centred column of max ~480 px on the ivory background. `min-height: 100dvh`; tab bar padded with `env(safe-area-inset-bottom)`.
- **Colour = person:** list owner = brick (`--person-a`), partner = petrol (`--person-b`); a person keeps the same colour on both phones.
- **Icon + label = status** (open, planned, waiting, new time, done, clash, every week). Never colour alone.
- Primary buttons are warm black (`--action-primary`), not a person colour. Touch targets ≥ 44 px.
- Playfair only for titles; small numbers (days, times) in DM Sans.
- Reference implementation of tokens and base components: `docs/ui-kit-reference/` (copy and split per component; it is a reference, not a drop-in).

## How to work with us

- Git Flow: never commit to `main` or `development`. One feature branch per task, branched from `development`, small commits, open a pull request into `development`. Anyone in the group can review and merge it, the author included.
- **Small steps.** Do one step at a time, then stop, summarise what changed and which files, and wait.
- Before saying a step is done: `npm run lint` and `npm run build` pass, and the app runs with `npm run dev`.
- When you make a design decision not covered here, ask instead of guessing.
- Work is split by functionality (one person = one slice: screen + state + service). Do not reorganise code outside the slice you were asked to work on.
