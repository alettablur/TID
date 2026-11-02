// Reads the todos straight from Back4App, without React in the way.
// Run it from anywhere:  node src/playground/test.js

import path from "node:path";
import Parse from "parse/node";

// Vite loads .env.local by itself; a plain Node script has to ask for it.
// The path is resolved from this file, so the cwd does not matter.
process.loadEnvFile(path.join(import.meta.dirname, "../../.env.local"));

Parse.serverURL = process.env.VITE_PARSE_SERVER_URL;
Parse.initialize(
  process.env.VITE_PARSE_APP_ID,
  process.env.VITE_PARSE_JS_KEY,
);

const Task = Parse.Object.extend("Task");

const query = new Parse.Query(Task);
query.ascending("createdAt");

// top-level await: this file is an ES module, so no wrapper function needed
const results = await query.find();

console.log(`${results.length} task(s) in the database:\n`);

for (const item of results) {
  const box = item.get("done") ? "[x]" : "[ ]";
  console.log(`${box} ${item.get("title")}   (id: ${item.id})`);
}
