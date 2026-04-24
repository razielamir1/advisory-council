import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { isDbEnabled } from '../db/neon.js';
import { listDiscussionsForUser, getUser } from '../db/repo.js';

const router = Router();

// GET /api/history - user's discussion history from DB
router.get('/', requireAuth(), async (req: Request, res: Response) => {
  if (!isDbEnabled() || !req.user) {
    res.json({ discussions: [] });
    return;
  }

  try {
    const rows = await listDiscussionsForUser(req.user.id, 50);
    res.json({ discussions: rows });
  } catch (err) {
    console.error('[history] list failed', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/me - current user profile + plan + usage
router.get('/me', requireAuth(), async (req: Request, res: Response) => {
  if (!isDbEnabled() || !req.user) {
    res.json({ authenticated: false });
    return;
  }

  try {
    const user = await getUser(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const freeLimit = Number(process.env.FREE_MONTHLY_LIMIT ?? '2');
    res.json({
      authenticated: true,
      email: user.email,
      plan: user.plan,
      usage: {
        current: user.monthly_usage_count,
        limit: freeLimit,
        resets_at: user.monthly_usage_reset_at,
      },
      subscription: {
        id: user.subscription_id,
        current_period_end: user.current_period_end,
      },
    });
  } catch (err) {
    console.error('[me] failed', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export { router as historyRouter };
