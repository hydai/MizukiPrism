import type { Context, Next } from 'hono';
import type { AuthUser, Role } from '../shared/types';

type Bindings = {
  DB: D1Database;
  CURATOR_EMAILS: string;
};

type Env = { Bindings: Bindings; Variables: { user: AuthUser } };

function resolveRole(email: string, curatorEmails: string): Role {
  const curators = curatorEmails.split(',').map((e) => e.trim().toLowerCase());
  return curators.includes(email.toLowerCase()) ? 'curator' : 'contributor';
}

export async function requireAuth(c: Context<Env>, next: Next) {
  const email = c.req.header('CF-Access-Authenticated-User-Email');
  if (!email) {
    return c.json({ error: 'Unauthorized: missing CF Access header' }, 401);
  }
  const role = resolveRole(email, c.env.CURATOR_EMAILS);
  c.set('user', { email, role });
  await next();
}

export async function requireCurator(c: Context<Env>, next: Next) {
  const user = c.get('user');
  if (!user || user.role !== 'curator') {
    return c.json({ error: 'Forbidden: curator access required' }, 403);
  }
  await next();
}
