import Parse from "./parse.js";

// the household is a List: one per couple, the partner is its ListMember
const List = Parse.Object.extend("List");
const ListMember = Parse.Object.extend("ListMember");
const Task = Parse.Object.extend("Task");
const Grocery = Parse.Object.extend("Grocery");

function toPerson(user) {
  return { id: user.id, username: user.get("username") };
}

function toHousehold(list, partner) {
  return {
    id: list.id,
    name: list.get("name"),
    owner: toPerson(list.get("owner")),
    partner: partner ? toPerson(partner) : null,
  };
}

// the other services point their rows at the household with this
export function householdPointer(household) {
  return List.createWithoutData(household.id);
}

// both partners may read and change every row of the household
export function householdAcl(household) {
  const acl = new Parse.ACL();
  acl.setReadAccess(household.owner.id, true);
  acl.setWriteAccess(household.owner.id, true);

  if (household.partner) {
    acl.setReadAccess(household.partner.id, true);
    acl.setWriteAccess(household.partner.id, true);
  }

  return acl;
}

async function createHousehold() {
  const me = Parse.User.current();

  const list = new List();
  list.set("name", me.get("username"));
  list.set("owner", me);
  list.setACL(new Parse.ACL(me)); // only me, until my partner joins

  return toHousehold(await list.save(), null);
}

async function findOrCreateHousehold() {
  const me = Parse.User.current();

  const membership = await new Parse.Query(ListMember)
    .equalTo("user", me)
    .include("list")
    .include("list.owner")
    .first();

  // a household its owner has deleted leaves a membership pointing at nothing
  if (membership?.get("list")) {
    return toHousehold(membership.get("list"), me);
  }

  const owned = await new Parse.Query(List)
    .equalTo("owner", me)
    .include("owner")
    .ascending("createdAt")
    .first();

  if (!owned) {
    return createHousehold();
  }

  const partnerRow = await new Parse.Query(ListMember)
    .equalTo("list", owned)
    .include("user")
    .first();

  return toHousehold(owned, partnerRow?.get("user"));
}

// StrictMode runs effects twice in development: both calls share one request,
// otherwise a first login would create two households
let pending = null;

export function loadHousehold() {
  if (!pending) {
    pending = findOrCreateHousehold().finally(function clearPending() {
      pending = null;
    });
  }
  return pending;
}

// FR2: shares the household at once, but the
// partner may also write. Returns the new household.
export async function invitePartner(household, username) {
  if (household.partner) {
    throw new Error(
      `You already share the list with ${household.partner.username}`,
    );
  }
  if (username === household.owner.username) {
    throw new Error("That is your own username");
  }

  const partner = await new Parse.Query(Parse.User)
    .equalTo("username", username)
    .first(); // undefined if nobody has that username

  if (!partner) {
    throw new Error("No user with that name");
  }

  const updated = {
    ...household,
    name: `${household.owner.username} & ${partner.get("username")}`,
    partner: toPerson(partner),
  };
  const acl = householdAcl(updated);

  // 1. the security: the partner may read and change the list and every row in it
  const list = householdPointer(household);
  list.set("name", updated.name);
  list.setACL(acl);

  const tasks = await new Parse.Query(Task)
    .equalTo("list", list)
    .limit(1000)
    .find();
  const groceries = await new Parse.Query(Grocery)
    .equalTo("list", list)
    .limit(1000)
    .find();
  const rows = [...tasks, ...groceries];
  rows.forEach((row) => row.setACL(acl));

  // 2. the data: a row that says the partner is in the household
  const member = new ListMember();
  member.set("list", list);
  member.set("user", partner);
  member.setACL(acl);

  // one request, if it fails halfway, they disagree
  await Parse.Object.saveAll([list, ...rows, member]);

  return updated;
}
