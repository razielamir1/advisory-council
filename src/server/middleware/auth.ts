import type { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { isDbEnabled } from '../db/neon';
import { upsertUser } from '../db/repo';

export type AuthedUser = {
  id: string;
  email: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthedUser;
  }
}

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is required for auth middleware');
    }
    clerkClient = createClerkClient({ secretKey });
  }
  return clerkClient;
}

function authDisabled(): boolean {
  return !process.env.CLERK_SECRET_KEY || !isDbEnabled();
}

async function resolveUserFromToken(token: string): Promise<AuthedUser | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const payload = await verifyToken(token, { secretKey });
  const userId = payload.sub;
  if (!userId) return null;

  const client = getClerkClient();
  const user = await client.users.getUser(userId);
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    '';

  if (isDbEnabled()) {
    await upsertUser(userId, email);
  }

  return { id: userId, email };
}

export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (authDisabled()) {
      // Legacy path: auth not configured yet. Skip so BYOK flow can keep working.
      return next();
    }

    const header = req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Missing Authorization bearer token' });
      return;
    }

    try {
      const user = await resolveUserFromToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      req.user = user;
      next();
    } catch (err) {
      console.error('[auth] token verification failed', err);
      res.status(401).json({ error: 'Token verification failed' });
    }
  };
}

export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const email = req.user?.email.toLowerCase();
    if (!email || !adminEmails.includes(email)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    next();
  };
}
