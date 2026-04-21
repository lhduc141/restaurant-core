import fs from "fs";
import path from "path";

const root = process.cwd();
const collectionPath = path.join(root, "postman", "exports", "Restaurant-Core-API.full.postman_collection.json");
const envPath = path.join(root, "postman", "exports", "Restaurant-Core-API.local.postman_environment.json");

const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
const environment = JSON.parse(fs.readFileSync(envPath, "utf8"));

collection.variable = (collection.variable || []).map((v) =>
  v.key === "customer_id" ? { ...v, key: "session_id" } : v
);

environment.values = (environment.values || []).map((v) =>
  v.key === "customer_id" ? { ...v, key: "session_id" } : v
);

environment._postman_exported_at = new Date().toISOString();

const replaceCustomerToSession = (node) => {
  if (Array.isArray(node)) {
    node.forEach(replaceCustomerToSession);
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  for (const key of Object.keys(node)) {
    const value = node[key];

    if (typeof value === "string") {
      node[key] = value.replace(/\{\{customer_id\}\}/g, "{{session_id}}");
    } else {
      replaceCustomerToSession(value);
    }
  }
};

replaceCustomerToSession(collection);

const patchRegisterCustomerTestScript = (items) => {
  for (const item of items || []) {
    if (item.name === "Register Customer" && Array.isArray(item.event)) {
      for (const ev of item.event) {
        if (ev.listen === "test" && ev.script && Array.isArray(ev.script.exec)) {
          ev.script.exec = [
            "const json = pm.response.json();",
            "const sessionId = json?.data?.sessionID || json?.data?.customerID;",
            "if (sessionId) { pm.collectionVariables.set('session_id', String(sessionId)); }",
          ];
        }
      }
    }

    if (Array.isArray(item.item)) {
      patchRegisterCustomerTestScript(item.item);
    }
  }
};

patchRegisterCustomerTestScript(collection.item);

fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`);
fs.writeFileSync(envPath, `${JSON.stringify(environment, null, 2)}\n`);

console.log("postman exports regenerated");
