import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootPath = resolve(__dirname, "../../../../..");
const rootRoute = readFileSync(resolve(rootPath, "packages/ui/src/routes/Root.tsx"), "utf-8");
const historyPage = readFileSync(resolve(rootPath, "packages/ui/src/routes/admin/HistoryPage.tsx"), "utf-8");

if (rootRoute.includes("href: \"/__admin/login\"")) {
  throw new Error("public nav should not contain /__admin/login link");
}

if (!historyPage.includes("err.forbidden")) {
  throw new Error("history page must render forbidden copy for non-admin users");
}
