import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "../../../../lib/schemas/userSchema";
import { comparePassword, generateToken, getUserByEmail } from "../../../../lib/auth";
import { sendSuccess, sendError } from "../../../../lib/responseHandler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return sendError("Validation Error", "VALIDATION_ERROR", 400, validatedData.error.errors);
    }

    const { email, password } = validatedData.data;

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return sendError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return sendError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return sendSuccess(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendError("Internal server error", "INTERNAL_ERROR", 500, error);
  }
}
