import express from "express";
import jobsRouter from "./routes/jobs.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// CORS middleware for frontend integration
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Routes
app.use("/api/jobs", jobsRouter);

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Job Application Backend API",
    status: "healthy",
    endpoints: {
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      jobsByStatus: "/api/jobs/status/:status",
      createJob: "POST /api/jobs",
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
