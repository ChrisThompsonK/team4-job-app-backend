import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { handleError } from "../errors/custom-errors.js";
import { generateToken } from "../middleware/auth.js";
import { userRepository } from "../repositories/user-repository.js";

export class AuthController {
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }

            // Find user in database
            const user = await userRepository.findByEmail(email);

            if (!user) {
                res.status(401).json({ error: "Invalid email or password" });
                return;
            }

            // Validate password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ error: "Invalid email or password" });
                return;
            }

            // Generate JWT token
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
            const { email, password, firstName, lastName, role } = req.body;

            if (!email || !password || !firstName || !lastName) {
                res.status(400).json({
                    error: "Email, password, first name, and last name are required",
                });
                return;
            }

            // Check if user already exists but does not let know error of the existing user for security reasons
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                res.status(409).json({ error: "Invalid Email or Password" });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const userData = {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || "user", // Default to "user" if no role specified
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const user = await userRepository.createUser(userData);

            // Generate JWT token
            const token = generateToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            res.status(201).json({
                message: "User registered successfully",
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
            // For JWT-based authentication, logout is primarily handled on the client side
            // by removing the token. We can implement token blacklisting here if needed.

            res.status(200).json({
                message: "Logout successful",
            });
        } catch (error) {
            handleError(error, res, "Failed to logout");
        }
    }
}

export const authController = new AuthController();
