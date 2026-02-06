import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

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

    return NextResponse.json({ page, limit, total, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    const created = await prisma.user.create({ data: { name: body.name, email: body.email, role: body.role || 'CONTRIBUTOR', passwordHash: body.passwordHash || '' } });
    return NextResponse.json({ message: 'User created', data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
