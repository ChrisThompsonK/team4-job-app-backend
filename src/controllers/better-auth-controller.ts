import type { Request, Response } from "express";
import { auth } from "../auth.js";

export class BetterAuthController {
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          error: "Email, password, firstName, and lastName are required",
        });
        return;
      }

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
    } catch (error) {
      console.error("Sign up error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(400).json({ error: "No session token provided" });
        return;
      }

      await auth.api.signOut({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Sign out error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).json({ error: "No session token provided" });
        return;
      }

      const session = await auth.api.getSession({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (!session) {
        res.status(401).json({ error: "Invalid or expired session" });
        return;
      }

      res.status(200).json({
        user: session.user,
        session: session.session,
      });
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(401).json({ error: "No session token provided" });
        return;
      }

      const sessions = await auth.api.listSessions({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      res.status(200).json({ sessions });
    } catch (error) {
      console.error("List sessions error:", error);
      res.status(500).json({ error: "Failed to list sessions" });
    }
  }
}

export const betterAuthController = new BetterAuthController();
