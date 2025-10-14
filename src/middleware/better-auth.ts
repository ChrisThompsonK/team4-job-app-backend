import type { NextFunction, Request, Response } from "express";
import { auth } from "../auth.js";

// Better Auth types
export type BetterAuthSession = typeof auth.$Infer.Session.session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;

// Extend the Request interface to include better-auth session
declare global {
  namespace Express {
    interface Request {
      session?: BetterAuthSession;
      user?: BetterAuthUser;
    }
  }
}

export const betterAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      next();
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      next();
      return;
    }

    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (session) {
      req.session = session.session;
      req.user = session.user as BetterAuthUser; // Type assertion to handle Better Auth user structure
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.session) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
};

export const requireRole = (role: string) => {
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
