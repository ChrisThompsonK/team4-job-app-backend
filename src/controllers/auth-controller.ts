import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { handleError } from "../errors/custom-errors.js";
import { auth } from "../lib/auth.js";
import { generateToken } from "../middleware/auth.js";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Try Better Auth first
      try {
        const session = await auth.api.signInEmail({
          body: { email, password },
          headers: req.headers as Record<string, string>,
        });

        if (session && session.token) {
          // Generate JWT token for compatibility
          const token = generateToken({
            id: parseInt(session.user.id),
            email: session.user.email,
            role: "user", // Default role since Better Auth doesn't have role by default
          });

          const [firstName, lastName] = session.user.name.split(" ");

          res.status(200).json({
            message: "Login successful",
            token,
            user: {
              id: session.user.id,
              email: session.user.email,
              role: "user",
              firstName: firstName || "",
              lastName: lastName || "",
            },
            betterAuthSession: session.token,
          });
          return;
        }
      } catch (betterAuthError) {
        console.log("Better Auth failed, trying fallback:", betterAuthError);
      }

      // Fallback to hardcoded users for demo purposes
      const users = [
        {
          id: 1,
          email: "admin@example.com",
          password: await bcrypt.hash("password123", 12),
          role: "admin",
          firstName: "Admin",
          lastName: "User",
        },
        {
          id: 2,
          email: "user@example.com",
          password: await bcrypt.hash("password123", 12),
          role: "user",
          firstName: "Regular",
          lastName: "User",
        },
      ];

      const user = users.find((u) => u.email === email);

      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
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

      // Use Better Auth for registration
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: `${firstName} ${lastName}`,
        },
        headers: req.headers as Record<string, string>,
      });

      // Update the user with firstName and lastName after creation
      if (result && result.user) {
        await db.update(schema.user)
          .set({ 
            firstName, 
            lastName 
          })
          .where(eq(schema.user.id, result.user.id));
      }

      if (result && result.user) {
        // Generate JWT token for compatibility
        const token = generateToken({
          id: parseInt(result.user.id),
          email: result.user.email,
          role: "user", // Default role
        });

        const [userFirstName, userLastName] = result.user.name.split(" ");

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: {
            id: result.user.id,
            email: result.user.email,
            role: "user",
            firstName: userFirstName || firstName,
            lastName: userLastName || lastName,
          },
          betterAuthSession: result.token,
        });
      } else {
        res.status(400).json({ error: "Registration failed" });
      }
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

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Try to logout from Better Auth if session token is provided
      const sessionToken =
        req.headers.authorization?.split(" ")[1] || (req.headers["x-session-token"] as string);

      if (sessionToken) {
        try {
          await auth.api.signOut({
            headers: {
              ...(req.headers as Record<string, string>),
              authorization: `Bearer ${sessionToken}`,
            },
          });
        } catch (betterAuthError) {
          console.log("Better Auth logout failed:", betterAuthError);
        }
      }

      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      handleError(error, res, "Failed to logout");
    }
  }
}

export const authController = new AuthController();
