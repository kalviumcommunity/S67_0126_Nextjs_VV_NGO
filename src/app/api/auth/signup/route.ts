import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "../../../../lib/schemas/userSchema";
import { hashPassword, createUser, getUserByEmail } from "../../../../lib/auth";
import { sendSuccess, sendError } from "../../../../lib/responseHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createUserSchema.safeParse(body);

    if (!validatedData.success) {
      return sendError("Validation Error", "VALIDATION_ERROR", 400, validatedData.error.errors);
    }

    const { name, email, role } = validatedData.data;
    const password = body.password; // Not in schema for security

    if (!password || password.length < 6) {
      return sendError("Password must be at least 6 characters", "VALIDATION_ERROR", 400);
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return sendError("User already exists", "USER_EXISTS", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
    });

    return sendSuccess(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      "User created successfully",
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return sendError("Internal server error", "INTERNAL_ERROR", 500, error);
  }
}
