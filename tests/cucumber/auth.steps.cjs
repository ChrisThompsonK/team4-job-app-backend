// @ts-nocheck
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const fetch = require('node-fetch');

let uniqueEmailAuth, uniqueEmailAuthFail, tokenAuth, userAuth, loginResponseAuth, loginFailResponse;

Given('a unique user registration payload for auth', function () {
  uniqueEmailAuth = `e2euser+${Date.now()}@example.com`;
});

When('the user registers via the auth API', async function () {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmailAuth,
      password: 'TestPassword123!',
      firstName: 'E2E',
      lastName: 'User'
    })
  });
  assert.strictEqual(res.status, 201);
});

When('the user logs in via the auth API', async function () {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmailAuth,
      password: 'TestPassword123!'
    })
  });
  loginResponseAuth = res;
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  tokenAuth = data.token;
  userAuth = data.user;
});

Then('the login response contains a token and user', function () {
  assert.ok(tokenAuth);
  assert.ok(userAuth);
});

Given('a unique user registration payload for auth fail', function () {
  uniqueEmailAuthFail = `e2euserfail+${Date.now()}@example.com`;
});

When('the user registers via the auth API for fail', async function () {
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmailAuthFail,
      password: 'TestPassword123!',
      firstName: 'E2E',
      lastName: 'UserFail'
    })
  });
  assert.strictEqual(res.status, 201);
});

When('the user attempts to log in with a wrong password', async function () {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmailAuthFail,
      password: 'WrongPassword!'
    })
  });
  loginFailResponse = res;
});

Then('the login fails with status 401 and error', async function () {
  assert.strictEqual(loginFailResponse.status, 401);
  const data = await loginFailResponse.json();
  assert.ok(data.error);
});
