import { Router, type Request, type Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { isDbEnabled } from '../db/neon.js';
import { decryptIdea } from '../lib/crypto.js';
import {
  getOverviewMetrics,
  listAllDiscussions,
  listAllUsers,
  listDailyCosts,
  getEncryptedIdea,
  logAdminAction,
} from '../db/repo.js';

const router = Router();

router.use(requireAuth(), requireAdmin());

router.get('/overview', async (_req: Request, res: Response) => {
  if (!isDbEnabled()) {
    res.json({ dbEnabled: false });
    return;
  }
  try {
    const metrics = await getOverviewMetrics();
    res.json({ dbEnabled: true, ...metrics });
  } catch (err) {
    console.error('[admin/overview] failed', err);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

router.get('/discussions', async (_req: Request, res: Response) => {
  try {
    const rows = await listAllDiscussions(100);
    res.json({ discussions: rows });
  } catch (err) {
    console.error('[admin/discussions] failed', err);
    res.status(500).json({ error: 'Failed to load discussions' });
  }
});

router.post('/discussions/:id/decrypt', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const encrypted = await getEncryptedIdea(id);
    if (!encrypted) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const plaintext = decryptIdea(encrypted);
    await logAdminAction(req.user!.id, 'decrypt_idea', id, {
      admin_email: req.user!.email,
    });
    res.json({ idea: plaintext });
  } catch (err) {
    console.error('[admin/decrypt] failed', err);
    res.status(500).json({ error: 'Failed to decrypt' });
  }
});

router.get('/users', async (_req: Request, res: Response) => {
  try {
    const rows = await listAllUsers(200);
    res.json({ users: rows });
  } catch (err) {
    console.error('[admin/users] failed', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.get('/costs', async (req: Request, res: Response) => {
  const days = Math.max(1, Math.min(90, Number(req.query.days) || 30));
  try {
    const rows = await listDailyCosts(days);
    res.json({ days: rows });
  } catch (err) {
    console.error('[admin/costs] failed', err);
    res.status(500).json({ error: 'Failed to load costs' });
  }
});

export { router as adminRouter };
