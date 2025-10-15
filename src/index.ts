import express from "express";
import { auth } from "./lib/auth.js";
import applicationsRouter from "./routes/applications.js";
import authRouter from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// CORS middleware for frontend integration
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Better Auth API routes (for direct Better Auth access)
app.use("/api/better-auth", auth.handler);

// Our simplified JWT + Better Auth routes
app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Job Application Backend API",
    status: "healthy",
    endpoints: {
      // Authentication endpoints (JWT + Better Auth)
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me (requires JWT token)",
      logout: "POST /api/auth/logout (requires JWT token)",

      // Better Auth direct API (optional)
      betterAuthAPI: "/api/better-auth/*",

      // Job endpoints
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      jobsByStatus: "/api/jobs/status/:status",
      createJob: "POST /api/jobs",
      updateJob: "PUT /api/jobs/:id",
      deleteJob: "DELETE /api/jobs/:id (supports ?force=true query parameter)",

      // Application endpoints
      applications: "/api/applications",
      createApplication: "POST /api/applications",
      applicationById: "/api/applications/:id",
      applicationsByJobRole: "/api/applications/job/:jobRoleId",
      hireApplicant: "PUT /api/applications/:id/hire",
      rejectApplicant: "PUT /api/applications/:id/reject",
    },
  });
}); // Start the server
const main = async (): Promise<void> => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

main().catch(console.error);
