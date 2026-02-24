import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, findUserById, FAN_COOKIE_NAME } from '@/lib/fan-auth';
import { readUserPlaylists, writeUserPlaylists, CloudPlaylist } from '@/lib/user-playlists';

export const dynamic = 'force-static';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(FAN_COOKIE_NAME)?.value;
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return findUserById(userId);
}

// GET /api/playlists - get user's cloud playlists
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const playlists = readUserPlaylists(user.id);
    return NextResponse.json({ playlists });
  } catch {
    return NextResponse.json({ error: '讀取播放清單失敗' }, { status: 500 });
  }
}

// POST /api/playlists - create or bulk update playlists
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await request.json();

    // Bulk replace all playlists (used for sync)
    if (body.playlists && Array.isArray(body.playlists)) {
      const playlists = body.playlists as CloudPlaylist[];
      writeUserPlaylists(user.id, playlists);
      return NextResponse.json({ success: true, playlists });
    }

    // Create a single playlist
    const { name } = body;
    if (!name) {
      return NextResponse.json({ error: '播放清單名稱不可為空' }, { status: 400 });
    }

    const playlists = readUserPlaylists(user.id);
    const now = Date.now();
    const newPlaylist: CloudPlaylist = {
      id: body.id || `playlist-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      versions: body.versions || [],
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    playlists.push(newPlaylist);
    writeUserPlaylists(user.id, playlists);

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch {
    return NextResponse.json({ error: '建立播放清單失敗' }, { status: 500 });
  }
}

// PUT /api/playlists - update a playlist
export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少播放清單 ID' }, { status: 400 });
    }

    const playlists = readUserPlaylists(user.id);
    const index = playlists.findIndex(p => p.id === id);

    if (index === -1) {
      // Create it if it doesn't exist (sync scenario)
      const now = Date.now();
      const newPlaylist: CloudPlaylist = {
        id,
        name: body.name || '未命名清單',
        versions: body.versions || [],
        createdAt: body.createdAt || now,
        updatedAt: body.updatedAt || now,
      };
      playlists.push(newPlaylist);
      writeUserPlaylists(user.id, playlists);
      return NextResponse.json({ success: true, playlist: newPlaylist });
    }

    // Last-write-wins: check updatedAt
    const existing = playlists[index];
    const incomingUpdatedAt = body.updatedAt || Date.now();
    const conflict = existing.updatedAt > incomingUpdatedAt;

    const updated: CloudPlaylist = {
      ...existing,
      name: body.name ?? existing.name,
      versions: body.versions ?? existing.versions,
      updatedAt: conflict ? existing.updatedAt : incomingUpdatedAt,
    };

    playlists[index] = updated;
    writeUserPlaylists(user.id, playlists);

    return NextResponse.json({
      success: true,
      playlist: updated,
      conflict,
      keptVersion: conflict ? 'cloud' : 'local',
    });
  } catch {
    return NextResponse.json({ error: '更新播放清單失敗' }, { status: 500 });
  }
}

// DELETE /api/playlists - delete a playlist
export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少播放清單 ID' }, { status: 400 });
    }

    const playlists = readUserPlaylists(user.id);
    const newPlaylists = playlists.filter(p => p.id !== id);
    writeUserPlaylists(user.id, newPlaylists);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '刪除播放清單失敗' }, { status: 500 });
  }
}
