import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import redis from "../../../lib/redis";
import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { createUserSchema } from "../../../lib/schemas/userSchema";

const USERS_CACHE_KEY = "users:list";
const USERS_TTL_SECONDS = 60;

export async function GET(req: NextRequest) {
  try {
    const cached = await redis.get(USERS_CACHE_KEY);
    if (cached) {
      console.info("Users cache hit");
      return sendSuccess(JSON.parse(cached), "Users fetched successfully (cache)");
    }

    console.info("Users cache miss");
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await redis.set(USERS_CACHE_KEY, JSON.stringify(users), "EX", USERS_TTL_SECONDS);
    return sendSuccess(users, "Users fetched successfully");
  } catch (error) {
    console.error("Users API error:", error);
    return sendError("Internal server error", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, parsed.error.errors);
    }

    const created = await prisma.user.create({
      data: {
        ...parsed.data,
        passwordHash: parsed.data.passwordHash ?? "",
      },
    });

    await redis.del(USERS_CACHE_KEY);
    return sendSuccess(created, "User created", 201);
  } catch (error) {
    console.error("Users API error:", error);
    return sendError("Internal server error", ERROR_CODES.DATABASE_FAILURE, 500, error);
  }
}
