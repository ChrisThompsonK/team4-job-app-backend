import { Router } from "express";
import { auth } from "../auth.js";
import { betterAuthMiddleware, requireAuth } from "../middleware/better-auth.js";

const router = Router();

// Apply Better Auth middleware to all routes
router.use(betterAuthMiddleware);

// Registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        error: "Email, password, firstName, and lastName are required",
      });
      return;
    }

    // Use Better Auth's sign up API
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: `${firstName} ${lastName}`,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: response.user,
      token: response.token,
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to register user",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    res.status(200).json({
      message: "Login successful",
      user: response.user,
      token: response.token,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    res.status(401).json({
      error: error instanceof Error ? error.message : "Invalid credentials",
    });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    await auth.api.signOut({
      headers: req.headers as Record<string, string>,
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error: unknown) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to logout",
    });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    user: req.user,
    session: req.session,
  });
});

router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const sessions = await auth.api.listSessions({
      headers: req.headers as Record<string, string>,
    });

    res.status(200).json({ sessions });
  } catch (error: unknown) {
    console.error("List sessions error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list sessions",
    });
  }
});

export default router;
