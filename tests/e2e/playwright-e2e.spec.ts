import { expect, test } from "@playwright/test";

// This test assumes the backend is running locally on port 3001
// and that the API endpoints for auth and application exist as per the routes in src/routes/

test("User registers and logs in", async ({ request }) => {
  // 1. Register a new user
  const uniqueEmail = `e2euser+${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`;
  const registerResponse = await request.post("http://localhost:3001/api/auth/register", {
    data: {
      email: uniqueEmail,
      password: "TestPassword123!",
      firstName: "E2E",
      lastName: "User",
    },
  });
  if (!registerResponse.ok()) {
    console.error("Register failed:", await registerResponse.text());
  }
  expect(registerResponse.ok()).toBeTruthy();

  // 2. Log in with the new user
  const loginResponse = await request.post("http://localhost:3001/api/auth/login", {
    data: {
      email: uniqueEmail,
      password: "TestPassword123!",
    },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const { token, user } = await loginResponse.json();
  expect(token).toBeTruthy();
  expect(user).toBeTruthy();
});

test("User login fails with wrong password", async ({ request }) => {
  const uniqueEmail = `e2euserfail+${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`;
  // Register user first
  const registerResponse = await request.post("http://localhost:3001/api/auth/register", {
    data: {
      email: uniqueEmail,
      password: "TestPassword123!",
      firstName: "E2E",
      lastName: "UserFail",
    },
  });
  expect(registerResponse.ok()).toBeTruthy();

  // Attempt login with wrong password
  const loginResponse = await request.post("http://localhost:3001/api/auth/login", {
    data: {
      email: uniqueEmail,
      password: "WrongPassword!",
    },
  });
  expect(loginResponse.ok()).toBeFalsy();
  expect(loginResponse.status()).toBe(401);
  const errorBody = await loginResponse.json();
  expect(errorBody).toHaveProperty("error");
});
