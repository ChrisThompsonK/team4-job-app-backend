// @ts-nocheck
const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("node:assert");
const fetch = require("node-fetch");
const fs = require("node:fs");
const FormData = require("form-data");

let uniqueEmail, token, userId, applicationResponse;

Given("a unique user registration payload", () => {
  uniqueEmail = `e2euser+${Date.now()}@example.com`;
});

When("the user registers via the API", async () => {
  const res = await fetch("http://localhost:3001/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: "TestPassword123!",
      firstName: "E2E",
      lastName: "User",
    }),
  });
  assert.strictEqual(res.status, 201);
});

When("the user logs in via the API", async () => {
  const res = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: "TestPassword123!",
    }),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  token = data.token;
  userId = data.user.id;
});

When("the user submits a job application with a CV file", async () => {
  const form = new FormData();
  form.append("userId", userId);
  form.append("jobRoleId", 1);
  form.append("cvFile", fs.createReadStream(`${__dirname}/../e2e/test-cv.pdf`));

  const res = await fetch("http://localhost:3001/api/applications", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  applicationResponse = res;
});

Then("the application is successfully created", async () => {
  assert.strictEqual(applicationResponse.status, 201);
  const data = await applicationResponse.json();
  assert.ok(data.data);
});
