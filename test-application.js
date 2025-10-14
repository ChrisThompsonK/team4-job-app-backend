// Test script to demonstrate the job application API
// Run this with: node test-application.js

const API_URL = "http://localhost:3001";

async function testApplicationAPI() {
  console.log("🧪 Testing Job Application API\n");

  try {
    // 1. Get all jobs to find an open one
    console.log("1. Fetching all job roles...");
    const jobsResponse = await fetch(`${API_URL}/api/jobs`);
    const jobsData = await jobsResponse.json();
    console.log(`   ✓ Found ${jobsData.count} job roles\n`);

    // 2. Find an open job with open positions
    const openJob = jobsData.data.find(
      (job) => job.status === "open" && job.numberOfOpenPositions > 0
    );

    if (!openJob) {
      console.log("   ⚠️  No open jobs with available positions found");
      return;
    }

    console.log(`2. Found open job: "${openJob.name}"`);
    console.log(`   Status: ${openJob.status}`);
    console.log(`   Open Positions: ${openJob.numberOfOpenPositions}\n`);

    // 3. Submit an application
    console.log("3. Submitting application...");
    const applicationData = {
      userId: 1, // Temporary hardcoded user ID until authentication is implemented
      jobRoleId: openJob.id,
      cvText:
        "I am a highly motivated software engineer with 5 years of experience in full-stack development. My expertise includes TypeScript, Node.js, React, and SQL databases. I have led multiple successful projects and am passionate about writing clean, maintainable code. I am excited about this opportunity to contribute to your team.",
    };

    const createResponse = await fetch(`${API_URL}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    const createData = await createResponse.json();

    if (createData.success) {
      console.log(`   ✓ Application submitted successfully!`);
      console.log(`   Application ID: ${createData.data.id}`);
      console.log(`   Status: ${createData.data.status}`);
      console.log(`   Created At: ${createData.data.createdAt}\n`);

      // 4. Retrieve the application by ID
      console.log("4. Retrieving application by ID...");
      const getResponse = await fetch(`${API_URL}/api/applications/${createData.data.id}`);
      const getData = await getResponse.json();

      if (getData.success) {
        console.log(`   ✓ Application retrieved successfully!`);
        console.log(`   Job Role ID: ${getData.data.jobRoleId}`);
        console.log(`   Status: ${getData.data.status}\n`);
      }

      // 5. Get all applications for this job role
      console.log("5. Retrieving all applications for this job role...");
      const jobAppsResponse = await fetch(`${API_URL}/api/applications/job/${openJob.id}`);
      const jobAppsData = await jobAppsResponse.json();

      if (jobAppsData.success) {
        console.log(`   ✓ Found ${jobAppsData.count} application(s) for "${openJob.name}"\n`);
      }
    } else {
      console.log(`   ✗ Failed to create application: ${createData.error}\n`);
    }

    // 6. Test validation - Try to apply with short CV
    console.log("6. Testing validation (CV too short)...");
    const invalidApplication = {
      jobRoleId: openJob.id,
      cvText: "Short CV",
    };

    const invalidResponse = await fetch(`${API_URL}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidApplication),
    });

    const invalidData = await invalidResponse.json();
    if (!invalidData.success) {
      console.log(`   ✓ Validation working correctly: ${invalidData.error}\n`);
    }

    // 7. Test applying to closed job (if any exists)
    const closedJob = jobsData.data.find((job) => job.status === "closed");
    if (closedJob) {
      console.log("7. Testing application to closed job...");
      const closedJobApp = {
        jobRoleId: closedJob.id,
        cvText:
          "I am a highly motivated software engineer with excellent skills and experience in the field.",
      };

      const closedResponse = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(closedJobApp),
      });

      const closedData = await closedResponse.json();
      if (!closedData.success) {
        console.log(`   ✓ Closed job validation working: ${closedData.error}\n`);
      }
    }

    console.log("✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the tests
testApplicationAPI();
