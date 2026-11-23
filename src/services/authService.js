import Parse from "./parse.js";

// the components get a plain object, never the Parse user itself
function toUser(user) {
  return { id: user.id, username: user.get("username") };
}

// the other services point a row at a person with this
export function userPointer(userId) {
  return userId ? Parse.User.createWithoutData(userId) : null;
}

// the user who is logged in, or null
export function currentUser() {
  const user = Parse.User.current();
  return user ? toUser(user) : null;
}

export async function signUp(username, password) {
  const user = new Parse.User();
  user.set("username", username);
  user.set("password", password);
  await user.signUp();

  // others must be able to find me by username, to share with me
  const acl = new Parse.ACL(user);
  acl.setPublicReadAccess(true);
  user.setACL(acl);
  await user.save();

  return toUser(user);
}

export async function logIn(username, password) {
  return toUser(await Parse.User.logIn(username, password));
}

export async function logOut() {
  await Parse.User.logOut();
}
