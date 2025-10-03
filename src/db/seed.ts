import { db } from "./index.js";
import { jobRoles } from "./schema.js";

const sampleJobs = [
  {
    name: "Frontend Developer",
    location: "London, UK",
    capability: "Software Development",
    band: "Mid Level",
    closingDate: "2025-11-15T23:59:59.000Z",
    summary:
      "We're looking for a skilled Frontend Developer to join our dynamic team. You'll be responsible for creating engaging user interfaces and working with modern web technologies.",
    keyResponsibilities:
      "Develop responsive web applications using React and TypeScript. Collaborate with design teams to implement UI/UX requirements. Write clean, maintainable code following best practices.",
    status: "open",
    numberOfOpenPositions: 2,
  },
  {
    name: "Backend Developer",
    location: "Manchester, UK",
    capability: "Software Development",
    band: "Senior Level",
    closingDate: "2025-10-30T23:59:59.000Z",
    summary:
      "Join our backend team to build scalable APIs and microservices. You'll work with cutting-edge technologies and solve complex technical challenges.",
    keyResponsibilities:
      "Design and implement REST APIs. Manage database architecture and optimization. Ensure system scalability and performance.",
    status: "open",
    numberOfOpenPositions: 1,
  },
  {
    name: "Full Stack Developer",
    location: "Remote",
    capability: "Software Development",
    band: "Junior Level",
    closingDate: "2025-12-01T23:59:59.000Z",
    summary:
      "Exciting opportunity to work with a fast-growing startup. You'll be involved in both frontend and backend development, working across the entire stack.",
    keyResponsibilities:
      "Develop full-stack applications. Work with React, Node.js, and databases. Participate in code reviews and team collaboration.",
    status: "open",
    numberOfOpenPositions: 3,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    await db.insert(jobRoles).values(sampleJobs);
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
