import { NextResponse } from 'next/server';
import dbReady from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    
    // Fetch users. Just a limited number for now, excluding the current user.
    let query = 'SELECT id, username, email, createdAt FROM User ';
    let params: any[] = [];
    
    if (authUser) {
      query += 'WHERE id != ? ';
      params.push(authUser.id);
    }
    
    query += 'ORDER BY createdAt DESC LIMIT 20';

    const db = await dbReady;

    const [users] = await db.execute<any[]>(query, params);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
