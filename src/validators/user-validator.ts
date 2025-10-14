export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "user";
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const validateLoginRequest = (data: unknown): LoginRequest => {
  if (!data || typeof data !== "object") {
    throw new Error("Request body must be an object");
  }

  const { email, password } = data as Record<string, unknown>;

  // Validate email
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password
  if (!password || typeof password !== "string") {
    throw new Error("Password is required and must be a string");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  return { email: email.toLowerCase().trim(), password };
};

export const validateRegisterRequest = (data: unknown): RegisterRequest => {
  if (!data || typeof data !== "object") {
    throw new Error("Request body must be an object");
  }

  const { email, password, firstName, lastName, role } = data as Record<string, unknown>;

  // Validate email
  if (!email || typeof email !== "string") {
    throw new Error("Email is required and must be a string");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password
  if (!password || typeof password !== "string") {
    throw new Error("Password is required and must be a string");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Validate firstName
  if (!firstName || typeof firstName !== "string") {
    throw new Error("First name is required and must be a string");
  }

  if (firstName.trim().length < 1) {
    throw new Error("First name cannot be empty");
  }

  // Validate lastName
  if (!lastName || typeof lastName !== "string") {
    throw new Error("Last name is required and must be a string");
  }

  if (lastName.trim().length < 1) {
    throw new Error("Last name cannot be empty");
  }

  // Validate role (optional)
  let validatedRole: "admin" | "user" = "user";
  if (role !== undefined) {
    if (typeof role !== "string" || !["admin", "user"].includes(role)) {
      throw new Error("Role must be either 'admin' or 'user'");
    }
    validatedRole = role as "admin" | "user";
  }

  return {
    email: email.toLowerCase().trim(),
    password,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role: validatedRole,
  };
};

export const validateUpdateUserRequest = (data: unknown): UpdateUserRequest => {
  if (!data || typeof data !== "object") {
    throw new Error("Request body must be an object");
  }

  const { firstName, lastName, email } = data as Record<string, unknown>;
  const result: UpdateUserRequest = {};

  // Validate firstName (optional)
  if (firstName !== undefined) {
    if (typeof firstName !== "string") {
      throw new Error("First name must be a string");
    }
    if (firstName.trim().length < 1) {
      throw new Error("First name cannot be empty");
    }
    result.firstName = firstName.trim();
  }

  // Validate lastName (optional)
  if (lastName !== undefined) {
    if (typeof lastName !== "string") {
      throw new Error("Last name must be a string");
    }
    if (lastName.trim().length < 1) {
      throw new Error("Last name cannot be empty");
    }
    result.lastName = lastName.trim();
  }

  // Validate email (optional)
  if (email !== undefined) {
    if (typeof email !== "string") {
      throw new Error("Email must be a string");
    }
    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
    result.email = email.toLowerCase().trim();
  }

  return result;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
