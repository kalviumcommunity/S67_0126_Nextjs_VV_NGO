import prisma from '../../../../lib/prisma';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';
import { updateUserSchema } from '../../../../lib/schemas/userSchema';
import type { ZodError } from 'zod';

const formatZodErrors = (error: ZodError) =>
  error.errors.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError('User not found', ERROR_CODES.NOT_FOUND, 404);
    return sendSuccess(user, 'User fetched');
  } catch (err: any) {
    return sendError('Failed to fetch user', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return sendError('Validation Error', ERROR_CODES.VALIDATION_ERROR, 400, formatZodErrors(parsed.error));
    }

    const updated = await prisma.user.update({ where: { id }, data: parsed.data });
    return sendSuccess(updated, 'User updated');
  } catch (err: any) {
    return sendError('Failed to update user', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.user.delete({ where: { id } });
    return sendSuccess(null, 'User deleted');
  } catch (err: any) {
    return sendError('Failed to delete user', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
