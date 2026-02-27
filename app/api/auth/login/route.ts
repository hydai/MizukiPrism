import { NextResponse } from 'next/server';

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
      const response = NextResponse.json({ success: true, role: 'curator' });
      response.cookies.set('admin-auth', 'curator', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
      });
      return response;
    }

    // Any other username/password combo is treated as non-curator
    if (username && password) {
      return NextResponse.json({ error: '您沒有管理權限', role: 'non-curator' }, { status: 403 });
    }

    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
