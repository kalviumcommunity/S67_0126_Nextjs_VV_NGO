import prisma from '../../../../lib/prisma';
import { sendSuccess, sendError } from '../../../../lib/responseHandler';
import { ERROR_CODES } from '../../../../lib/errorCodes';
import { updateProjectSchema } from '../../../../lib/schemas/projectSchema';
import type { ZodError } from 'zod';

const formatZodErrors = (error: ZodError) =>
  error.errors.map((err) => ({
    field: err.path[0],
    message: err.message,
  }));

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const project = await prisma.project.findUnique({ where: { id }, include: { pipelines: true, tasks: true } });
    if (!project) return sendError('Project not found', ERROR_CODES.NOT_FOUND, 404);
    return sendSuccess(project, 'Project fetched');
  } catch (err: any) {
    return sendError('Failed to fetch project', ERROR_CODES.INTERNAL_ERROR, 500, err?.message || err);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return sendError('Validation Error', ERROR_CODES.VALIDATION_ERROR, 400, formatZodErrors(parsed.error));
    }

    const updated = await prisma.project.update({ where: { id }, data: parsed.data });
    return sendSuccess(updated, 'Project updated');
  } catch (err: any) {
    return sendError('Failed to update project', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.project.delete({ where: { id } });
    return sendSuccess(null, 'Project deleted');
  } catch (err: any) {
    return sendError('Failed to delete project', ERROR_CODES.DATABASE_FAILURE, 500, err?.message || err);
  }
}
