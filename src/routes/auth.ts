import { Router } from "express";
import { authController } from "../controllers/auth-controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register - Register user
router.post("/register", authController.register.bind(authController));

// POST /api/auth/login - Login user
router.post("/login", authController.login.bind(authController));

// GET /api/auth/me - Get current user (protected route)
router.get("/me", authenticateToken, authController.me.bind(authController));

// POST /api/auth/logout - Logout user (protected route)
router.post("/logout", authenticateToken, authController.logout.bind(authController));

export default router;
