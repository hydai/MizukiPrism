import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FanUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

const usersPath = path.join(process.cwd(), 'data', 'users.json');
const FAN_COOKIE_NAME = 'fan-auth';
const FAN_SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'mizuki-fan-salt').digest('hex');
}

export function readUsers(): FanUser[] {
  try {
    if (!fs.existsSync(usersPath)) {
      return [];
    }
    const raw = fs.readFileSync(usersPath, 'utf-8');
    return JSON.parse(raw) as FanUser[];
  } catch {
    return [];
  }
}

export function writeUsers(users: FanUser[]): void {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
}

export function findUserByUsername(username: string): FanUser | null {
  const users = readUsers();
  return users.find(u => u.username === username) ?? null;
}

export function findUserById(id: string): FanUser | null {
  const users = readUsers();
  return users.find(u => u.id === id) ?? null;
}

export function createUser(username: string, password: string): FanUser {
  const users = readUsers();
  const newUser: FanUser = {
    id: `fan-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    username,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const signature = crypto.createHash('sha256').update(payload + 'mizuki-session-secret').digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;
    const signature = parts.pop()!;
    const payload = parts.join(':');
    const expectedSignature = crypto.createHash('sha256').update(payload + 'mizuki-session-secret').digest('hex');
    if (signature !== expectedSignature) return null;
    const userId = payload.split(':')[0];
    return userId;
  } catch {
    return null;
  }
}

export { FAN_COOKIE_NAME, FAN_SESSION_DURATION };
