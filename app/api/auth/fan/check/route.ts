import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, findUserById, FAN_COOKIE_NAME } from '@/lib/fan-auth';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(FAN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false });
    }

    const userId = verifySessionToken(token);
    if (!userId) {
      return NextResponse.json({ loggedIn: false });
    }

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    return NextResponse.json({
      loggedIn: true,
      user: { id: user.id, username: user.username },
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
