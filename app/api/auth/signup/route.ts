import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User exists' }, { status: 409 });
  }
  const hashed = await hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed } });
  return NextResponse.json({ message: 'User created' }, { status: 201 });
}