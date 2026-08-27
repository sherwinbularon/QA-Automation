import { defineConfig } from "@playwright/test";

// Minimal root config so the Watchtower CI patrol has a runnable Playwright
// project. The dispatched workflow runs this suite with --reporter=json and
// POSTs the report to the dashboard's ingest endpoint.
export default defineConfig({
  testDir: "./e2e",
  reporter: [["list"]],
});
