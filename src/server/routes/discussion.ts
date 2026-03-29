import { randomUUID } from 'crypto';
import { Router, type Request, type Response } from 'express';
import type { DiscussionState, UserInteraction, SSEEvent, CouncilMode, DiscussionLanguage } from '../../shared/types.js';
import { apiKeyMiddleware } from '../middleware/api-key.js';
import { runDiscussion } from '../services/discussion-engine.js';
import { readWebsite } from '../services/website-reader.js';
import { DOMAINS } from '../config/domains.js';

const router = Router();
const discussions = new Map<string, DiscussionState>();
const discussionKeys = new Map<string, string>(); // discussionId -> apiKey
const sseClients = new Map<string, Response>();

const VALID_MODES: CouncilMode[] = ['csuite', 'experts'];
const MAX_IDEA_LENGTH = 2000;
const SESSION_TTL_MS = 60 * 60 * 1000;

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function scheduleCleanup(id: string): void {
  setTimeout(() => {
    discussions.delete(id);
    discussionKeys.delete(id);
    sseClients.delete(id);
  }, SESSION_TTL_MS);
}

// POST /api/discussion/analyze-website
router.post('/analyze-website', apiKeyMiddleware, async (req: Request, res: Response): Promise<void> => {
  let { url } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'URL is required.' });
    return;
  }

  // Auto-add https:// if missing
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL.' });
    return;
  }

  try {
    const summary = await readWebsite(url, (req as any).apiKey);
    res.json({ summary, url });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to analyze website.' });
  }
});

// POST /api/discussion/start
router.post('/start', apiKeyMiddleware, (req: Request, res: Response): void => {
  const { idea, mode, language } = req.body;
  const domainId = req.body.domain?.id;

  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) {
    res.status(400).json({ error: 'Invalid domain.' });
    return;
  }

  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    res.status(400).json({ error: 'Idea must be at least 10 characters.' });
    return;
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    res.status(400).json({ error: `Idea must be under ${MAX_IDEA_LENGTH} characters.` });
    return;
  }

  const validMode: CouncilMode = VALID_MODES.includes(mode) ? mode : 'csuite';
  const validLangs: DiscussionLanguage[] = ['he', 'en', 'ar', 'ru', 'fr', 'es'];
  const validLang: DiscussionLanguage = validLangs.includes(language) ? language : 'he';
  const discussionId = randomUUID();

  const discussion: DiscussionState = {
    id: discussionId,
    domain,
    idea: idea.trim(),
    mode: validMode,
    language: validLang,
    members: [],
    messages: [],
    characterStates: [],
    currentPhase: 'opening',
    activeSpeakerId: null,
    status: 'idle',
    summary: null,
  };

  discussions.set(discussionId, discussion);
  // Store the API key from /start so the SSE stream can use it
  discussionKeys.set(discussionId, (req as any).apiKey);
  scheduleCleanup(discussionId);

  res.json({ discussionId });
});

// GET /api/discussion/:id/stream
// No apiKeyMiddleware — EventSource can't send headers.
// Auth is via the key stored at /start time.
router.get('/:id/stream', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const discussion = discussions.get(id);
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  const apiKey = discussionKeys.get(id);
  if (!apiKey) {
    res.status(401).json({ error: 'Session expired.' });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.set(id, res);

  req.on('close', () => {
    sseClients.delete(id);
  });

  runDiscussion(discussion, res, apiKey).catch((err) => {
    console.error('[Discussion Error]', err);
    sendSSE(res, { type: 'error', data: { message: 'Discussion failed. Please try again.' } });
    res.end();
  });
});

// POST /api/discussion/:id/interact
router.post('/:id/interact', apiKeyMiddleware, (req: Request, res: Response): void => {
  const discussion = discussions.get(String(req.params.id));
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  const interaction = req.body as UserInteraction;
  res.status(501).json({ error: 'Interactive mode not yet implemented.', type: interaction.type });
});

// POST /api/discussion/:id/cancel
router.post('/:id/cancel', (req: Request, res: Response): void => {
  const discussion = discussions.get(String(req.params.id));
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  discussion.status = 'complete';
  const client = sseClients.get(discussion.id);
  if (client) {
    sendSSE(client, { type: 'error', data: { message: 'Discussion cancelled' } });
    client.end();
    sseClients.delete(discussion.id);
  }

  res.json({ cancelled: true });
});

// GET /api/discussion/:id/summary
router.get('/:id/summary', (req: Request, res: Response): void => {
  const discussion = discussions.get(String(req.params.id));
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  if (!discussion.summary) {
    res.status(400).json({ error: 'Discussion has not completed yet.' });
    return;
  }

  res.json({ summary: discussion.summary });
});

export { router as discussionRouter, discussions, sseClients, sendSSE };
