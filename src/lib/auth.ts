import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

// Custom base64 password utilities
function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

function base64Decode(str: string): string {
  return Buffer.from(str, "base64").toString("utf8");
}

function verifyBase64Password(inputPassword: string, storedHash: string): boolean {
  const decodedStored = base64Decode(storedHash);
  return inputPassword === decodedStored;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Custom password hash functions
    password: {
      hash: async (password: string) => {
        // Use base64 encoding instead of bcrypt
        return base64Encode(password);
      },
      verify: async (data: { password: string; hash: string }) => {
        // Verify base64 encoded password
        return verifyBase64Password(data.password, data.hash);
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 24, // 24 hours
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
