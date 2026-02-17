import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  findUserByUsername,
  hashPassword,
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

    const user = findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: '用戶名或密碼錯誤' }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return NextResponse.json({ error: '用戶名或密碼錯誤' }, { status: 401 });
    }

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
    return NextResponse.json({ error: '登入失敗，請重試' }, { status: 500 });
  }
}
