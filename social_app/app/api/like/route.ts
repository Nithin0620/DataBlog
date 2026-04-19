import { NextResponse } from 'next/server';
import dbReady from '@/lib/db';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    const db = await dbReady;

    const [existingLikes] = await db.execute<any[]>(
      'SELECT id FROM `Like` WHERE userId = ? AND postId = ? LIMIT 1',
      [user.id, postId]
    );

    if (existingLikes.length > 0) {
      await db.execute('DELETE FROM `Like` WHERE id = ?', [existingLikes[0].id]);
      return NextResponse.json({ liked: false });
    } else {
      const id = crypto.randomUUID();
      await db.execute(
        'INSERT INTO `Like` (id, userId, postId) VALUES (?, ?, ?)',
        [id, user.id, postId]
      );
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
