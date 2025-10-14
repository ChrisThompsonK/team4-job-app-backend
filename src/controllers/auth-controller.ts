import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { account, user } from "../db/schema.js";
import { handleError } from "../errors/custom-errors.js";
import { base64Encode, verifyBase64Password } from "../lib/auth.js";
import { generateToken } from "../middleware/auth.js";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Find account by email
      const accountRecord = await db
        .select()
        .from(account)
        .where(eq(account.accountId, email))
        .limit(1);

      if (accountRecord.length === 0) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password
      const accountData = accountRecord[0];
      if (!accountData) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isPasswordValid = verifyBase64Password(password, accountData.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Get user details
      const userRecord = await db.select().from(user).where(eq(user.email, email)).limit(1);

      if (userRecord.length === 0) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      const userData = userRecord[0];
      if (!userData) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        id: userData.id,
        email: userData.email,
        role: userData.role,
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });
    } catch (error) {
      handleError(error, res, "Failed to login");
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: "Email, password, first name, and last name are required",
        });
        return;
      }

      // Check if user already exists
      const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

      if (existingUser.length > 0) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      // Generate user ID and encode password
      const userId = crypto.randomUUID();
      const encodedPassword = base64Encode(password);

      // Create user
      const newUser = {
        id: userId,
        email,
        firstName,
        lastName,
        role: "user" as const,
      };

      await db.insert(user).values(newUser);

      // Create account
      const newAccount = {
        id: crypto.randomUUID(),
        accountId: email,
        password: encodedPassword,
      };

      await db.insert(account).values(newAccount);

      // Generate JWT token
      const token = generateToken({
        id: userId,
        email,
        role: "user",
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: userId,
          email,
          role: "user",
          firstName,
          lastName,
        },
      });
    } catch (error) {
      handleError(error, res, "Failed to register");
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      res.status(200).json({
        user: req.user,
      });
    } catch (error) {
      handleError(error, res, "Failed to get current user");
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // With JWT tokens, logout is handled client-side by removing the token
      // No server-side session to invalidate
      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      handleError(error, res, "Failed to logout");
    }
  }
}

export const authController = new AuthController();
