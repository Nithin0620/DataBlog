import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    let postsQuery = 'SELECT p.*, u.id as u_id, u.username as u_username, u.email as u_email FROM Post p JOIN User u ON p.userId = u.id';
    const queryParams: any[] = [];
    if (userId) {
      postsQuery += ' WHERE p.userId = ?';
      queryParams.push(userId);
    }
    postsQuery += ' ORDER BY p.createdAt DESC';

    const [postRows] = await db.execute<any[]>(postsQuery, queryParams);

    if (postRows.length === 0) {
      return NextResponse.json([]);
    }

    const postIds = postRows.map((row: any) => row.id);
    const placeholders = postIds.map(() => '?').join(',');

    const [allLikes] = await db.execute<any[]>(
      `SELECT * FROM \`Like\` WHERE postId IN (${placeholders})`,
      postIds
    );

    const [allComments] = await db.execute<any[]>(
      `SELECT c.*, u.id as u_id, u.username as u_username FROM Comment c JOIN User u ON c.userId = u.id WHERE c.postId IN (${placeholders}) ORDER BY c.createdAt ASC`,
      postIds
    );

    const posts = postRows.map((row: any) => {
      const likes = allLikes.filter((l: any) => l.postId === row.id);
      const comments = allComments.filter((c: any) => c.postId === row.id).map((c: any) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        userId: c.userId,
        postId: c.postId,
        user: {
          id: c.u_id,
          username: c.u_username,
        }
      }));

      return {
        id: row.id,
        content: row.content,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt,
        userId: row.userId,
        user: {
          id: row.u_id,
          username: row.u_username,
          email: row.u_email,
        },
        likes,
        comments
      };
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, imageUrl } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date();

    await db.execute(
      'INSERT INTO Post (id, content, imageUrl, userId, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, content, imageUrl || null, user.id, createdAt]
    );

    const post = {
      id,
      content,
      imageUrl: imageUrl || null,
      userId: user.id,
      createdAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      likes: [],
      comments: []
    };

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
