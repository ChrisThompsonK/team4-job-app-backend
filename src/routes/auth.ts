import { Router } from "express";
import { userController } from "../controllers/user-controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// Public routes (no authentication required)
router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));

// Protected routes (authentication required)
router.get("/me", authenticateToken, userController.getCurrentUser.bind(userController));
router.post("/logout", authenticateToken, userController.logout.bind(userController));
router.put(
  "/change-password",
  authenticateToken,
  userController.changePassword.bind(userController)
);

// Admin only routes
router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  userController.getAllUsers.bind(userController)
);
router.get(
  "/users/:id",
  authenticateToken,
  requireRole("admin"),
  userController.getUserById.bind(userController)
);
router.put("/users/:id", authenticateToken, userController.updateUser.bind(userController)); // Users can update themselves, admins can update anyone
router.delete(
  "/users/:id",
  authenticateToken,
  requireRole("admin"),
  userController.deleteUser.bind(userController)
);

export default router;
