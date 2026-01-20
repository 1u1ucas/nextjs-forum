import { test, expect } from "@playwright/test";

test.describe("Reservation System", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/reservations");

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test.describe("Authenticated user", () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto("/auth/login");
      await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || "test@example.com");
      await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || "testpassword123");
      await page.click('button[type="submit"]');
      await page.waitForURL("/");
    });

    test("can view reservations page", async ({ page }) => {
      await page.goto("/reservations");

      // Check page title is visible
      await expect(page.locator("h1")).toContainText("Mes réservations");
    });

    test("can create a new reservation", async ({ page }) => {
      await page.goto("/reservations");

      // Click on "Nouvelle réservation" button
      await page.click('button:has-text("Nouvelle réservation")');

      // Fill in the form
      await page.fill('input[placeholder="Titre de la réservation"]', "Test Réservation E2E");
      await page.fill('textarea[placeholder="Description (optionnel)"]', "Description de test");

      // Set date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16);
      await page.fill('input[type="datetime-local"]', dateStr);

      // Set amount
      await page.fill('input[type="number"]', "99.99");

      // Submit
      await page.click('button:has-text("Créer la réservation")');

      // Wait for modal to close and check reservation appears
      await expect(page.locator("text=Test Réservation E2E")).toBeVisible({ timeout: 10000 });
    });

    test("can pay a reservation", async ({ page }) => {
      // First create a reservation
      await page.goto("/reservations");
      await page.click('button:has-text("Nouvelle réservation")');
      await page.fill('input[placeholder="Titre de la réservation"]', "Réservation à payer");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
      await page.fill('input[type="number"]', "50.00");
      await page.click('button:has-text("Créer la réservation")');

      // Wait for reservation to appear
      await expect(page.locator("text=Réservation à payer")).toBeVisible({ timeout: 10000 });

      // Click pay button
      await page.click('button:has-text("Payer")');

      // Confirm payment in dialog
      await expect(page.locator("text=Confirmer le paiement")).toBeVisible();
      await page.click('button:has-text("Confirmer le paiement")');

      // Wait for status to change to PAID
      await expect(page.locator("text=Payée")).toBeVisible({ timeout: 10000 });
    });

    test("can cancel a reservation", async ({ page }) => {
      // First create a reservation
      await page.goto("/reservations");
      await page.click('button:has-text("Nouvelle réservation")');
      await page.fill('input[placeholder="Titre de la réservation"]', "Réservation à annuler");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
      await page.fill('input[type="number"]', "25.00");
      await page.click('button:has-text("Créer la réservation")');

      // Wait for reservation to appear
      await expect(page.locator("text=Réservation à annuler")).toBeVisible({ timeout: 10000 });

      // Click cancel button
      await page.click('button:has-text("Annuler"):not(:has-text("la réservation"))');

      // Confirm cancellation in dialog
      await expect(page.locator("text=Annuler la réservation")).toBeVisible();
      await page.click('button:has-text("Oui, annuler")');

      // Wait for status to change to CANCELLED
      await expect(page.locator("text=Annulée")).toBeVisible({ timeout: 10000 });
    });

    test("cannot cancel a paid reservation", async ({ page }) => {
      // First create and pay a reservation
      await page.goto("/reservations");
      await page.click('button:has-text("Nouvelle réservation")');
      await page.fill('input[placeholder="Titre de la réservation"]', "Réservation payée test");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
      await page.fill('input[type="number"]', "75.00");
      await page.click('button:has-text("Créer la réservation")');

      // Wait for reservation to appear
      await expect(page.locator("text=Réservation payée test")).toBeVisible({ timeout: 10000 });

      // Pay the reservation
      await page.click('button:has-text("Payer")');
      await page.click('button:has-text("Confirmer le paiement")');

      // Wait for PAID status
      await expect(page.locator("text=Payée")).toBeVisible({ timeout: 10000 });

      // Verify cancel button is not visible for paid reservation
      const reservationCard = page.locator('text=Réservation payée test').locator('..');
      await expect(reservationCard.locator('button:has-text("Annuler")')).not.toBeVisible();
    });
  });
});
