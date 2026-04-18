import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import crypto from 'crypto';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [existingUsers] = await db.execute<any[]>(
      'SELECT id FROM User WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    await db.execute(
      'INSERT INTO User (id, username, email, password, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [id, username, email, hashedPassword]
    );

    const user = { id, username, email };

    const token = await signToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ id: user.id, username: user.username, email: user.email }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
