import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, text } = await req.json();

    if (!postId || !text) {
      return NextResponse.json({ error: 'Missing postId or text' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date();

    await db.execute(
      'INSERT INTO Comment (id, text, userId, postId, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, text, user.id, postId, createdAt]
    );

    const comment = {
      id,
      text,
      userId: user.id,
      postId,
      createdAt,
      user: {
        id: user.id,
        username: user.username,
      }
    };

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
