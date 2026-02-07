import prisma from '../../../lib/prisma';
import { sendSuccess, sendError } from '../../../lib/responseHandler';
import { ERROR_CODES } from '../../../lib/errorCodes';
import { createUserSchema } from '../../../lib/schemas/userSchema';
import type { ZodError } from 'zod';

const formatZodErrors = (error: ZodError) =>
  error.errors.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 100);
    const skip = (page - 1) * limit;
    const q = searchParams.get('q') || undefined;

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess({ page, limit, total, items }, 'Users fetched');
  } catch (err: any) {
    return sendError('Failed to fetch users', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return sendError('Validation Error', ERROR_CODES.VALIDATION_ERROR, 400, formatZodErrors(parsed.error));
    }

    const created = await prisma.user.create({
      data: {
        ...parsed.data,
        passwordHash: parsed.data.passwordHash ?? '',
      },
    });
    return sendSuccess(created, 'User created', 201);
  } catch (err: any) {
    return sendError('Failed to create user', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
