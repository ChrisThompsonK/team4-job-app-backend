import express from "express";
import applicationsRouter from "./routes/applications.js";
import authRouter from "./routes/auth.js";
import betterAuthRouter from "./routes/better-auth.js";
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

// Routes
app.use("/api/auth", betterAuthRouter); // Better Auth routes (main)
app.use("/api/legacy-auth", authRouter); // Legacy auth routes (for backward compatibility)
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Job Application Backend API",
    status: "healthy",
    endpoints: {
      // Better Auth endpoints (recommended)
      betterAuthRegister: "POST /api/better-auth/register",
      betterAuthLogin: "POST /api/better-auth/login",
      betterAuthMe: "GET /api/better-auth/me",
      betterAuthLogout: "POST /api/better-auth/logout",
      betterAuthSessions: "GET /api/better-auth/sessions",

      // Legacy Auth endpoints (deprecated)
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      getCurrentUser: "GET /api/auth/me",
      logout: "POST /api/auth/logout",
      changePassword: "PUT /api/auth/change-password",
      getAllUsers: "GET /api/auth/users (admin only)",
      getUserById: "GET /api/auth/users/:id (admin only)",
      updateUser: "PUT /api/auth/users/:id",
      deleteUser: "DELETE /api/auth/users/:id (admin only)",

      // Job endpoints
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      jobsByStatus: "/api/jobs/status/:status",
      createJob: "POST /api/jobs",

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
