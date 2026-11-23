import Parse from "./parse.js";
import { householdAcl, householdPointer } from "./householdService.js";

const Grocery = Parse.Object.extend("Grocery");


function toGrocery(item) {
  return {
    id: item.id,
    name: item.get("groceryName"),
    amount: item.get("amount") ?? 1,
    addedBy: item.get("addedBy")?.id,
    bought: item.get("bought") ?? false, // two states only: to buy or bought
    boughtBy: item.get("boughtBy")?.id ?? null,
    boughtAt: item.get("boughtAt") ?? null,
  };
}

// every grocery of the household in one query
export async function loadGroceries(household) {
  const results = await new Parse.Query(Grocery)
    .equalTo("list", householdPointer(household))
    .ascending("createdAt")
    .limit(1000) // Parse returns only 100 rows unless asked for more
    .find();
  
  return results.map(toGrocery);
}

export async function addGrocery(household,{ name, amount = 1 }) {
  if (!name.trim()) {
    throw new Error("Grocery name cannot be empty");
  }

  const item = new Grocery();
  item.set("groceryName", name.trim());
  item.set("amount", amount);
  item.set("list", householdPointer(household));
  item.set("addedBy", Parse.User.current());
  item.set("bought", false);
  item.setACL(householdAcl(household));

  return toGrocery(await item.save());
}

export async function updateGrocery(id, { name, amount = 1}) {
  if (!name.trim()) {
    throw new Error("Grocery name cannot be empty");
  }

  const item = Grocery.createWithoutData(id);
  item.set("groceryName", name.trim());
  item.set("amount", amount);
  await item.save();
}

export async function setBought(id, bought) {
  const item = Grocery.createWithoutData(id);
  item.set("bought", bought);
  if(bought){
    item.set("boughtBy", Parse.User.current());
    item.set("boughtAt", new Date());
  } else{
    item.unset("boughtBy");
    item.unset("boughtAt"); 
  }
  await item.save();
}

export async function deleteGrocery(id) {
  await Grocery.createWithoutData(id).destroy();
}


