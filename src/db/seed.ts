// import bcrypt from "bcrypt";
import { db } from "./index.js";
import { type JobRoleStatus, jobRoles, users } from "./schema.js";

const sampleJobs = [
  {
    name: "Frontend Developer",
    location: "Belfast, Northern Ireland",
    capability: "Software Development",
    band: "Mid Level",
    closingDate: "2025-11-15T23:59:59.000Z",
    summary:
      "We're looking for a skilled Frontend Developer to join our dynamic team. You'll be responsible for creating engaging user interfaces and working with modern web technologies.",
    keyResponsibilities:
      "Develop responsive web applications using React and TypeScript. Collaborate with design teams to implement UI/UX requirements. Write clean, maintainable code following best practices.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 2,
  },
  {
    name: "Backend Developer",
    location: "Birmingham, England",
    capability: "Software Development",
    band: "Senior Level",
    closingDate: "2025-10-30T23:59:59.000Z",
    summary:
      "Join our backend team to build scalable APIs and microservices. You'll work with cutting-edge technologies and solve complex technical challenges.",
    keyResponsibilities:
      "Design and implement REST APIs. Manage database architecture and optimization. Ensure system scalability and performance.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Full Stack Developer",
    location: "Dublin, Ireland",
    capability: "Software Development",
    band: "Junior Level",
    closingDate: "2025-12-01T23:59:59.000Z",
    summary:
      "Exciting opportunity to work with a fast-growing startup. You'll be involved in both frontend and backend development, working across the entire stack.",
    keyResponsibilities:
      "Develop full-stack applications. Work with React, Node.js, and databases. Participate in code reviews and team collaboration.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 3,
  },
  {
    name: "DevOps Engineer",
    location: "Amsterdam, Netherlands",
    capability: "Infrastructure & Operations",
    band: "Senior Level",
    closingDate: "2025-11-20T23:59:59.000Z",
    summary:
      "Lead our DevOps initiatives to streamline development and deployment processes. Work with containerization, CI/CD pipelines, and cloud infrastructure.",
    keyResponsibilities:
      "Manage Kubernetes clusters and Docker containers. Implement CI/CD pipelines using Jenkins/GitLab CI. Monitor system performance and optimize cloud costs.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Data Scientist",
    location: "Helsinki, Finland",
    capability: "Data & Analytics",
    band: "Mid Level",
    closingDate: "2025-12-10T23:59:59.000Z",
    summary:
      "Join our data science team to extract insights from complex datasets. Use machine learning to drive business decisions and improve product offerings.",
    keyResponsibilities:
      "Develop predictive models using Python and R. Create data visualizations and reports. Collaborate with stakeholders to identify analytical opportunities.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 2,
  },
  {
    name: "UX Designer",
    location: "Gdańsk, Poland",
    capability: "Design & User Experience",
    band: "Mid Level",
    closingDate: "2025-11-25T23:59:59.000Z",
    summary:
      "Create exceptional user experiences through thoughtful design. Work closely with product teams to research, prototype, and test user interfaces.",
    keyResponsibilities:
      "Conduct user research and usability testing. Design wireframes and prototypes using Figma. Collaborate with developers to implement designs.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Product Manager",
    location: "Toronto, Canada",
    capability: "Product Management",
    band: "Senior Level",
    closingDate: "2025-11-30T23:59:59.000Z",
    summary:
      "Drive product strategy and roadmap development. Work with cross-functional teams to deliver innovative features that delight customers.",
    keyResponsibilities:
      "Define product requirements and user stories. Analyze market trends and competitor landscape. Coordinate with engineering and design teams.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Mobile Developer",
    location: "Buenos Aires, Argentina",
    capability: "Software Development",
    band: "Mid Level",
    closingDate: "2025-12-05T23:59:59.000Z",
    summary:
      "Develop native mobile applications for iOS and Android platforms. Create smooth, intuitive experiences for millions of users worldwide.",
    keyResponsibilities:
      "Build native apps using Swift and Kotlin. Implement REST API integrations. Optimize app performance and user experience.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 2,
  },
  {
    name: "Cybersecurity Analyst",
    location: "Indianapolis, United States",
    capability: "Security & Compliance",
    band: "Senior Level",
    closingDate: "2025-11-18T23:59:59.000Z",
    summary:
      "Protect our systems and data from cyber threats. Monitor security incidents, implement safeguards, and ensure compliance with regulations.",
    keyResponsibilities:
      "Monitor security events and respond to incidents. Conduct vulnerability assessments. Develop security policies and procedures.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Cloud Architect",
    location: "Nova Scotia, Canada",
    capability: "Infrastructure & Operations",
    band: "Senior Level",
    closingDate: "2025-12-15T23:59:59.000Z",
    summary:
      "Design and implement cloud infrastructure solutions. Lead the migration of legacy systems to modern cloud platforms like AWS and Azure.",
    keyResponsibilities:
      "Design scalable cloud architectures. Implement Infrastructure as Code using Terraform. Optimize cloud costs and performance.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Quality Assurance Engineer",
    location: "Derry, Northern Ireland",
    capability: "Quality Assurance",
    band: "Mid Level",
    closingDate: "2025-11-22T23:59:59.000Z",
    summary:
      "Ensure software quality through comprehensive testing strategies. Develop automated test suites and work closely with development teams.",
    keyResponsibilities:
      "Design and execute test plans. Develop automated tests using Selenium and Jest. Perform regression and performance testing.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 2,
  },
  {
    name: "Machine Learning Engineer",
    location: "Amsterdam, Netherlands",
    capability: "Data & Analytics",
    band: "Senior Level",
    closingDate: "2025-12-08T23:59:59.000Z",
    summary:
      "Build and deploy machine learning models at scale. Work with large datasets to create intelligent systems that drive business value.",
    keyResponsibilities:
      "Develop ML models using TensorFlow and PyTorch. Deploy models to production environments. Optimize model performance and accuracy.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Frontend Engineer",
    location: "Helsinki, Finland",
    capability: "Software Development",
    band: "Junior Level",
    closingDate: "2025-12-03T23:59:59.000Z",
    summary:
      "Join our frontend team to build beautiful, responsive web applications. Great opportunity for a junior developer to grow their skills.",
    keyResponsibilities:
      "Develop user interfaces using Vue.js and CSS. Implement responsive designs for mobile and desktop. Write unit tests for frontend components.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 3,
  },
  {
    name: "Business Analyst",
    location: "Dublin, Ireland",
    capability: "Business Analysis",
    band: "Mid Level",
    closingDate: "2025-11-28T23:59:59.000Z",
    summary:
      "Bridge the gap between business requirements and technical solutions. Analyze processes and recommend improvements to drive efficiency.",
    keyResponsibilities:
      "Gather and document business requirements. Create process flow diagrams. Facilitate stakeholder meetings and workshops.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 1,
  },
  {
    name: "Site Reliability Engineer",
    location: "Toronto, Canada",
    capability: "Infrastructure & Operations",
    band: "Mid Level",
    closingDate: "2025-12-12T23:59:59.000Z",
    summary:
      "Ensure high availability and reliability of our production systems. Monitor performance, troubleshoot issues, and implement automation.",
    keyResponsibilities:
      "Monitor system health and performance metrics. Implement automation scripts. Participate in on-call rotation for incident response.",
    status: "open" as JobRoleStatus,
    numberOfOpenPositions: 2,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create sample users with base64 encoded passwords (for demo only)
    function base64Encode(str: string): string {
      return Buffer.from(str).toString("base64");
    }
    const encodedPassword = base64Encode("password123");

    const sampleUsers = [
      {
        email: "admin@example.com",
        passwordHash: encodedPassword,
        role: "admin" as const,
        createdAt: new Date().toISOString(),
      },
      {
        email: "user@example.com",
        passwordHash: encodedPassword,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      },
      {
        email: "john.doe@example.com",
        passwordHash: encodedPassword,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      },
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✅ Sample users created!");
    console.log("   - admin@example.com (password: password123)");
    console.log("   - user@example.com (password: password123)");
    console.log("   - john.doe@example.com (password: password123)");

    await db.insert(jobRoles).values(sampleJobs);
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
