import type { Request, Response, NextFunction } from 'express';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const envKey = process.env.GEMINI_API_KEY;
  const headerKey = req.headers['x-api-key'] as string | undefined;

  if (!envKey && !headerKey) {
    res.status(401).json({ error: 'API key required. Set GEMINI_API_KEY or pass x-api-key header.' });
    return;
  }

  (req as any).apiKey = envKey || headerKey;
  next();
}
