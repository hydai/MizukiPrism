import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  findUserByUsername,
  createUser,
  createSessionToken,
  FAN_COOKIE_NAME,
  FAN_SESSION_DURATION,
} from '@/lib/fan-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '用戶名和密碼不可為空' }, { status: 400 });
    }

    if (username.length < 2 || username.length > 30) {
      return NextResponse.json({ error: '用戶名長度需為 2-30 個字元' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密碼長度至少需要 6 個字元' }, { status: 400 });
    }

    const existing = findUserByUsername(username);
    if (existing) {
      return NextResponse.json({ error: '此用戶名已被使用' }, { status: 409 });
    }

    const user = createUser(username, password);
    const token = createSessionToken(user.id);

    const cookieStore = await cookies();
    cookieStore.set(FAN_COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      maxAge: FAN_SESSION_DURATION,
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
    });
  } catch {
    return NextResponse.json({ error: '註冊失敗，請重試' }, { status: 500 });
  }
}
