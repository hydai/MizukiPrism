import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');

  if (authCookie?.value === 'curator') {
    return NextResponse.json({ authenticated: true, role: 'curator' });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
