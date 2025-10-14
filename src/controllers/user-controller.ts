import type { Request, Response } from "express";
import { handleError } from "../errors/custom-errors.js";
import { userService } from "../services/user-service.js";
import {
  validateLoginRequest,
  validateRegisterRequest,
  validateUpdateUserRequest,
} from "../validators/user-validator.js";

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = validateRegisterRequest(req.body);
      const result = await userService.register(userData);

      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      handleError(error, res, "Failed to register user");
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData = validateLoginRequest(req.body);
      const result = await userService.login(loginData);

      res.status(200).json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      handleError(error, res, "Failed to login");
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await userService.getUserById(req.user.id);
      res.status(200).json({
        user,
      });
    } catch (error) {
      handleError(error, res, "Failed to get current user");
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userIdParam = req.params.id;
      if (!userIdParam) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const userId = Number.parseInt(userIdParam, 10);
      if (Number.isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const user = await userService.getUserById(userId);
      res.status(200).json({
        user,
      });
    } catch (error) {
      handleError(error, res, "Failed to get user");
    }
  }

  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        users,
        count: users.length,
      });
    } catch (error) {
      handleError(error, res, "Failed to get users");
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userIdParam = req.params.id;
      if (!userIdParam) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const userId = Number.parseInt(userIdParam, 10);
      if (Number.isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      // Users can only update their own profile unless they're admin
      if (req.user?.role !== "admin" && req.user?.id !== userId) {
        res.status(403).json({ error: "You can only update your own profile" });
        return;
      }

      const updateData = validateUpdateUserRequest(req.body);
      const user = await userService.updateUser(userId, updateData);

      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      handleError(error, res, "Failed to update user");
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userIdParam = req.params.id;
      if (!userIdParam) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const userId = Number.parseInt(userIdParam, 10);
      if (Number.isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      // Users cannot delete themselves
      if (req.user?.id === userId) {
        res.status(400).json({ error: "You cannot delete your own account" });
        return;
      }

      await userService.deleteUser(userId);

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      handleError(error, res, "Failed to delete user");
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: "Current password and new password are required" });
        return;
      }

      if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        res.status(400).json({ error: "Passwords must be strings" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters long" });
        return;
      }

      await userService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      handleError(error, res, "Failed to change password");
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // For JWT, logout is typically handled on the frontend by removing the token
      // But we can provide a response to acknowledge the logout
      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      handleError(error, res, "Failed to logout");
    }
  }
}

export const userController = new UserController();
