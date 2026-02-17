import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin-auth');

    if (authCookie?.value === 'curator') {
      return NextResponse.json({ authenticated: true, role: 'curator' });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Failed to check auth' }, { status: 500 });
  }
}
