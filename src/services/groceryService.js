/* eslint-disable no-unused-vars -- signatures only: the Groceries slice writes the bodies */
import Parse from "./parse.js";

const Grocery = Parse.Object.extend("Grocery");

function toGrocery(row) {
  return {
    id: row.id,
    name: row.get("name"),
    amount: row.get("amount"),
    addedBy: row.get("addedBy")?.id,
    bought: row.get("bought"), // two states only: to buy or bought
    boughtBy: row.get("boughtBy")?.id ?? null,
    boughtAt: row.get("boughtAt") ?? null,
  };
}

// every grocery of the household in one query
export async function loadGroceries(household) {
  throw new Error("Not built yet");
}

// FR3, FR4, NFR5: a name already on the to-buy list is not added twice;
// its amount is raised instead
export async function addGrocery(household, name, amount) {
  throw new Error("Not built yet");
}

// FR4: "Set to 2"
export async function setAmount(id, amount) {
  throw new Error("Not built yet");
}

// FR8: bought by me, now. false puts it back on the list (the 5 s undo, NFR5)
export async function setBought(id, bought) {
  throw new Error("Not built yet");
}

export async function deleteGrocery(id) {
  throw new Error("Not built yet");
}
