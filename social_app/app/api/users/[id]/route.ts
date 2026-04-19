import { NextResponse } from 'next/server';
import dbReady from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Add type for valid params
type RouteParams = { id: string };

export async function GET(req: Request, props: { params: Promise<RouteParams> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const authUser = await getAuthUser();

    const db = await dbReady;

    const [userRows] = await db.execute<any[]>(
      'SELECT id, username, email, createdAt FROM User WHERE id = ? LIMIT 1',
      [id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRow = userRows[0];

    const [followersResult] = await db.execute<any[]>('SELECT COUNT(*) as count FROM Follow WHERE followingId = ?', [id]);
    const [followingResult] = await db.execute<any[]>('SELECT COUNT(*) as count FROM Follow WHERE followerId = ?', [id]);
    const [postsResult] = await db.execute<any[]>('SELECT COUNT(*) as count FROM Post WHERE userId = ?', [id]);

    const user = {
      ...userRow,
      _count: {
        followers: followersResult[0].count,
        following: followingResult[0].count,
        posts: postsResult[0].count,
      }
    };

    let isFollowing = false;
    if (authUser && authUser.id !== id) {
      const [followRows] = await db.execute<any[]>(
        'SELECT 1 FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1',
        [authUser.id, id]
      );
      isFollowing = followRows.length > 0;
    }

    return NextResponse.json({ ...user, isFollowing });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
