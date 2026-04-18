import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const [existingFollows] = await db.execute<any[]>(
      'SELECT 1 FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1',
      [user.id, targetUserId]
    );

    if (existingFollows.length > 0) {
      await db.execute(
        'DELETE FROM Follow WHERE followerId = ? AND followingId = ?',
        [user.id, targetUserId]
      );
      return NextResponse.json({ followed: false });
    } else {
      await db.execute(
        'INSERT INTO Follow (followerId, followingId) VALUES (?, ?)',
        [user.id, targetUserId]
      );
      return NextResponse.json({ followed: true });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
