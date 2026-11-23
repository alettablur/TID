# Kutie

A shared household app for couples with children, built by Group 10 for
Technical Interaction Design (ITU, Autumn 2026). Each couple shares one to-do
list and one grocery list.

It is built around three user stories:

- **Keep track:** get what I am keeping track of out of my head, so my partner
  can see it without me telling them.
- **Agree on when:** get a task done at a time that suits both of us, so we do
  not remind each other again and again.
- **Thank:** show my partner I noticed what they did, so they feel their work
  is noticed too.

Live version: <https://alettablur.github.io/TID/>

## Stack

Vite, React 19, React Router 7 and the Parse SDK on Back4App, published with
`gh-pages`. Icons come from `lucide-react`. The project started from the
course kickstarter [`itu-tid/todo-26`](https://github.com/itu-tid/todo-26).

## Running it

Create a `.env.local` file in the project folder with the Back4App keys (ask
the group; never commit this file):

```bash
VITE_PARSE_SERVER_URL=...
VITE_PARSE_APP_ID=...
VITE_PARSE_JS_KEY=...
```

Then:

```bash
npm install
npm run dev        # http://localhost:5173/TID/
npm run lint
npm run build      # also copies index.html to 404.html, so routes work on GitHub Pages
npm run deploy     # build and publish to the gh-pages branch
```

## Where things are

```text
src/
├── pages/        one file per route: Home, Tasks, Groceries, Us, Auth, Not found
├── components/   shared/, layout/, tasks/, groceries/, us/
├── services/     the only code that talks to Back4App
├── utilities/    dates.js
└── styles/       tokens.css (colours, fonts, sizes) and base.css
```

The requirements, the data model and the screens are in [`docs/`](docs/).
