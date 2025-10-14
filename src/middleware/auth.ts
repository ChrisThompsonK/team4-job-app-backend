import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { PublicUser } from "../db/schema.js";

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as "admin" | "user",
      firstName: "",
      lastName: "",
      createdAt: "",
      updatedAt: "",
    };
    next();
  } catch (_error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (role: "admin" | "user") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (req.user.role !== role && req.user.role !== "admin") {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};

export const generateToken = (user: PublicUser): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};
