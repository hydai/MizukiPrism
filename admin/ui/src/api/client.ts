import type {
  AuthUser,
  Song,
  Stream,
  ListResponse,
  DashboardStats,
  CreateSongBody,
  UpdateSongBody,
  CreateStreamBody,
  StatusUpdateBody,
} from '../../../shared/types';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  me: () => request<AuthUser>('/api/me'),

  // Dashboard
  stats: () => request<DashboardStats>('/api/stats'),

  // Songs
  listSongs: (params?: { status?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    const qs = sp.toString();
    return request<ListResponse<Song>>(`/api/songs${qs ? `?${qs}` : ''}`);
  },

  getSong: (id: string) => request<Song>(`/api/songs/${id}`),

  createSong: (body: CreateSongBody) =>
    request<Song>('/api/songs', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateSong: (id: string, body: UpdateSongBody) =>
    request<Song>(`/api/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  updateSongStatus: (id: string, body: StatusUpdateBody) =>
    request<Song>(`/api/songs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // Streams
  listStreams: (params?: { status?: string; search?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    const qs = sp.toString();
    return request<ListResponse<Stream>>(`/api/streams${qs ? `?${qs}` : ''}`);
  },

  createStream: (body: CreateStreamBody) =>
    request<Stream>('/api/streams', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateStreamStatus: (id: string, body: StatusUpdateBody) =>
    request<Stream>(`/api/streams/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export { ApiError };
