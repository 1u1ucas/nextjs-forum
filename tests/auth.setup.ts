import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/auth/login");

  // Fill in credentials (adjust based on your test user)
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@example.com");
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword123");

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to home page
  await page.waitForURL("/");

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
