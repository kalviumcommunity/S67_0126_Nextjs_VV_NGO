import prisma from '../../../lib/prisma';
import { sendSuccess, sendError } from '../../../lib/responseHandler';
import { ERROR_CODES } from '../../../lib/errorCodes';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 100);
    const skip = (page - 1) * limit;
    const q = searchParams.get('q') || undefined;
    const ownerId = searchParams.get('ownerId') || undefined;

    const where: any = {};
    if (q) where.title = { contains: q, mode: 'insensitive' };
    if (ownerId) where.ownerId = ownerId;

    const [items, total] = await Promise.all([
      prisma.project.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.project.count({ where }),
    ]);

    return sendSuccess({ page, limit, total, items }, 'Projects fetched');
  } catch (err: any) {
    return sendError('Failed to fetch projects', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.ownerId) return sendError('title and ownerId are required', ERROR_CODES.VALIDATION_ERROR, 400);
    const created = await prisma.project.create({ data: body });
    return sendSuccess(created, 'Project created', 201);
  } catch (err: any) {
    return sendError('Failed to create project', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
