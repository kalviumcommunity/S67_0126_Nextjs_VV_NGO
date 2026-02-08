import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendSuccess, sendError } from "../../../lib/responseHandler";

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return sendSuccess(users, "Users fetched successfully");
  } catch (error) {
    console.error("Users API error:", error);
    return sendError("Internal server error", "INTERNAL_ERROR", 500, error);
  }
}
