import type { Request, Response, NextFunction } from 'express';
import { isDbEnabled } from '../db/neon';
import { getUser, resetMonthlyUsageIfDue } from '../db/repo';

const FREE_MONTHLY_LIMIT = Number(process.env.FREE_MONTHLY_LIMIT ?? '2');

export function usageLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isDbEnabled() || !req.user) {
      return next();
    }

    try {
      await resetMonthlyUsageIfDue(req.user.id);
      const user = await getUser(req.user.id);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      const now = new Date();
      const activeSub =
        user.plan === 'paid' &&
        user.current_period_end &&
        new Date(user.current_period_end) > now;

      if (activeSub) return next();

      if (user.monthly_usage_count >= FREE_MONTHLY_LIMIT) {
        res.status(402).json({
          error: 'Monthly free limit reached',
          code: 'USAGE_LIMIT_EXCEEDED',
          limit: FREE_MONTHLY_LIMIT,
          current_usage: user.monthly_usage_count,
        });
        return;
      }

      next();
    } catch (err) {
      console.error('[usage-limit] failed to check usage', err);
      next();
    }
  };
}
