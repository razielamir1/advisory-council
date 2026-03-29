import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message);

  if (err.message.includes('rate_limit')) {
    res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    return;
  }

  if (err.message.includes('authentication') || err.message.includes('api_key')) {
    res.status(401).json({ error: 'Invalid API key.' });
    return;
  }

  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
