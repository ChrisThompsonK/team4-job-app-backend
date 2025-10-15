/**
 * Test script for creating a new job via the POST /api/jobs endpoint
 *
 * Run this after starting the backend server:
 * node tests/test-create-job.js
 */

const API_URL = "http://localhost:3001/api/jobs";

const sampleJob = {
  name: "DevOps Engineer",
  location: "Remote, UK",
  capability: "Platforms",
  band: "Senior Consultant",
  closingDate: "2025-12-15T23:59:59.000Z",
  summary:
    "We're seeking an experienced DevOps Engineer to help build and maintain our cloud infrastructure. You'll work with cutting-edge technologies and help drive our DevOps transformation.",
  keyResponsibilities:
    "Design and implement CI/CD pipelines. Manage cloud infrastructure using IaC. Monitor system performance and implement optimization strategies. Ensure security and compliance across environments.",
  status: "open",
  numberOfOpenPositions: 2,
};

async function createJob(jobData) {
  try {
    console.log("🚀 Creating new job...\n");
    console.log("Job Data:", JSON.stringify(jobData, null, 2));
    console.log("\n---\n");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error creating job:");
      console.error("Status:", response.status);
      console.error("Error:", result.error);
      return;
    }

    console.log("✅ Job created successfully!\n");
    console.log("Response:", JSON.stringify(result, null, 2));
    console.log("\n---\n");
    console.log(`Job ID: ${result.data.id}`);
    console.log(`Job Name: ${result.data.name}`);
    console.log(`Location: ${result.data.location}`);
    console.log(`Status: ${result.data.status}`);
    console.log(`Open Positions: ${result.data.numberOfOpenPositions}`);
  } catch (error) {
    console.error("❌ Network error:", error.message);
    console.error("\nMake sure the backend server is running on http://localhost:3001");
  }
}

// Run the test
createJob(sampleJob);
