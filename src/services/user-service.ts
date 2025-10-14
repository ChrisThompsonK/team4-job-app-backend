import bcrypt from "bcryptjs";
import type { NewUser, PublicUser } from "../db/schema.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/custom-errors.js";
import { generateToken } from "../middleware/auth.js";
import { userRepository } from "../repositories/user-repository.js";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from "../validators/user-validator.js";

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export class UserService {
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const newUser: NewUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdUser = await userRepository.createUser(newUser);

    // Convert to public user (remove password)
    const publicUser: PublicUser = {
      id: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    // Generate JWT token
    const token = generateToken(publicUser);

    return { user: publicUser, token };
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Convert to public user (remove password)
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate JWT token
    const token = generateToken(publicUser);

    return { user: publicUser, token };
  }

  async getUserById(id: number): Promise<PublicUser> {
    const user = await userRepository.findByIdPublic(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async getAllUsers(): Promise<PublicUser[]> {
    return await userRepository.getAllUsers();
  }

  async updateUser(id: number, updateData: UpdateUserRequest): Promise<PublicUser> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new ConflictError("Email is already in use by another user");
      }
    }

    // Update user
    const updatedUser = await userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    // Convert to public user (remove password)
    const publicUser: PublicUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return publicUser;
  }

  async deleteUser(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      throw new Error("Failed to delete user");
    }
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userRepository.updateUser(id, { password: hashedNewPassword });
  }
}

export const userService = new UserService();
