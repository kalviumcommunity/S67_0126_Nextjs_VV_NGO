import prisma from '../../../lib/prisma';
import { sendSuccess, sendError } from '../../../lib/responseHandler';
import { ERROR_CODES } from '../../../lib/errorCodes';
import { createTaskSchema } from '../../../lib/schemas/taskSchema';
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
    const projectId = searchParams.get('projectId') || undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;

    const [items, total] = await Promise.all([
      prisma.task.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.task.count({ where }),
    ]);

    return sendSuccess({ page, limit, total, items }, 'Tasks fetched');
  } catch (err: any) {
    return sendError('Failed to fetch tasks', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return sendError('Validation Error', ERROR_CODES.VALIDATION_ERROR, 400, formatZodErrors(parsed.error));
    }

    const created = await prisma.task.create({ data: parsed.data });
    return sendSuccess(created, 'Task created', 201);
  } catch (err: any) {
    return sendError('Failed to create task', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
