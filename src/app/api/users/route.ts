import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { withAuth } from "../../../lib/middleware";
import { sendSuccess, sendError } from "../../../lib/responseHandler";

async function handler(req: NextRequest, user: any) {
  try {
    if (req.method === "GET") {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      return sendSuccess(users, "Users fetched successfully");
    }

    return sendError("Method not allowed", "METHOD_NOT_ALLOWED", 405);
  } catch (error) {
    console.error("Users API error:", error);
    return sendError("Internal server error", "INTERNAL_ERROR", 500, error);
  }
}

export const GET = withAuth(handler);
