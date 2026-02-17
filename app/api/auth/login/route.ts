import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CURATOR_USERNAME = 'curator';
const CURATOR_PASSWORD = 'mizuki-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
    }

    if (username === CURATOR_USERNAME && password === CURATOR_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin-auth', 'curator', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
      });

      return NextResponse.json({ success: true, role: 'curator' });
    }

    // Check if this is a non-curator account login attempt
    // For demo: any other username/password combo is treated as non-curator
    if (username && password) {
      return NextResponse.json({ error: '您沒有管理權限', role: 'non-curator' }, { status: 403 });
    }

    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
