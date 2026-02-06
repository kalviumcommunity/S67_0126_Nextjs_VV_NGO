import prisma from '../../../lib/prisma';
import { sendSuccess, sendError } from '../../../lib/responseHandler';
import { ERROR_CODES } from '../../../lib/errorCodes';

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
    if (!body.title || !body.projectId) return NextResponse.json({ error: 'title and projectId are required' }, { status: 400 });
    const created = await prisma.task.create({ data: body });
    return sendSuccess(created, 'Task created', 201);
  } catch (err: any) {
    return sendError('Failed to create task', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
