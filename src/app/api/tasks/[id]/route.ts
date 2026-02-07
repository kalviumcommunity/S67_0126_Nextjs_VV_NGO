import prisma from '../../../../lib/prisma';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';
import { updateTaskSchema } from '../../../../lib/schemas/taskSchema';
import type { ZodError } from 'zod';

const formatZodErrors = (error: ZodError) =>
  error.errors.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return sendError('Task not found', ERROR_CODES.NOT_FOUND, 404);
    return sendSuccess(task, 'Task fetched');
  } catch (err: any) {
    return sendError('Failed to fetch task', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return sendError('Validation Error', ERROR_CODES.VALIDATION_ERROR, 400, formatZodErrors(parsed.error));
    }

    const updated = await prisma.task.update({ where: { id }, data: parsed.data });
    return sendSuccess(updated, 'Task updated');
  } catch (err: any) {
    return sendError('Failed to update task', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.task.delete({ where: { id } });
    return sendSuccess(null, 'Task deleted');
  } catch (err: any) {
    return sendError('Failed to delete task', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
