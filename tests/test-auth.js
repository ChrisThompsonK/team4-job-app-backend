/**
 * Test script for authentication endpoints
 * Run this with: node tests/test-auth.js
 */

const API_URL = "http://localhost:3001";

const testUsers = [
  { email: "admin@example.com", password: "password123", role: "admin" },
  { email: "member@example.com", password: "password123", role: "user" },
  { email: "john.doe@example.com", password: "password123", role: "user" },
];

async function testAuth() {
  console.log("🔐 Testing Authentication API\n");

  for (const user of testUsers) {
    console.log(`Testing login for ${user.email} (${user.role})...`);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (data.token) {
        console.log(`   ✓ Login successful!`);
        console.log(`   Token: ${data.token.substring(0, 20)}...`);
        console.log(`   User: ${data.user.firstName} ${data.user.lastName}`);
        console.log(`   Role: ${data.user.role}\n`);

        // Test the /me endpoint
        const meResponse = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const meData = await meResponse.json();
        if (meData.user) {
          console.log(`   ✓ /me endpoint working for ${user.email}\n`);
        }
      } else {
        console.log(`   ✗ Login failed: ${data.error}\n`);
      }
    } catch (error) {
      console.log(`   ✗ Network error: ${error.message}\n`);
    }
  }

  // Test invalid credentials
  console.log("Testing invalid credentials...");
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "invalid@example.com",
        password: "wrongpassword",
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.log(`   ✓ Invalid credentials properly rejected: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`   ✗ Network error: ${error.message}\n`);
  }
}

// Test registration
async function testRegistration() {
  console.log("📝 Testing User Registration\n");

  const newUser = {
    email: "testuser@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    role: "user",
  };

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    const data = await response.json();

    if (data.token) {
      console.log(`   ✓ Registration successful!`);
      console.log(`   User: ${data.user.firstName} ${data.user.lastName}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...\n`);
    } else {
      console.log(`   ✗ Registration failed: ${data.error}\n`);
    }
  } catch (error) {
    console.log(`   ✗ Network error: ${error.message}\n`);
  }
}

async function main() {
  await testAuth();
  await testRegistration();

  console.log("🎯 Frontend Integration Info:");
  console.log("For your frontend login form, use these test credentials:");
  console.log("- Email: admin@example.com, Password: password123 (Admin)");
  console.log("- Email: member@example.com, Password: password123 (Member)");
  console.log("- Email: john.doe@example.com, Password: password123 (User)");
}

main();
