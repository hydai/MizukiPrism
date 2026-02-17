import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FAN_COOKIE_NAME } from '@/lib/fan-auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(FAN_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '登出失敗，請重試' }, { status: 500 });
  }
}
