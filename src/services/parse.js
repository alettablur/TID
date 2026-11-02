import Parse from "parse";

// Credentials come from .env.local, which is gitignored
if (!import.meta.env.VITE_PARSE_APP_ID) {
  throw new Error(
    "No Parse credentials. Copy .env.example to .env.local, fill it in, and restart `npm run dev`.",
  );
}

Parse.serverURL = import.meta.env.VITE_PARSE_SERVER_URL;
Parse.initialize(
  import.meta.env.VITE_PARSE_APP_ID,
  import.meta.env.VITE_PARSE_JS_KEY,
);

// every service imports Parse from here, so it is always initialised first
export default Parse;
