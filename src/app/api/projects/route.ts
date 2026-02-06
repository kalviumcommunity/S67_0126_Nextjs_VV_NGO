import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

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

    return NextResponse.json({ page, limit, total, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.ownerId) return NextResponse.json({ error: 'title and ownerId are required' }, { status: 400 });
    const created = await prisma.project.create({ data: body });
    return NextResponse.json({ message: 'Project created', data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
