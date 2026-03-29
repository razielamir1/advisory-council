import { randomUUID } from 'crypto';
import { Router, type Request, type Response } from 'express';
import type { DiscussionState, UserInteraction, SSEEvent, CouncilMode } from '../../shared/types.js';
import { apiKeyMiddleware } from '../middleware/api-key.js';
import { runDiscussion } from '../services/discussion-engine.js';
import { DOMAINS } from '../config/domains.js';

const router = Router();
const discussions = new Map<string, DiscussionState>();
const sseClients = new Map<string, Response>();

const VALID_MODES: CouncilMode[] = ['csuite', 'experts'];
const MAX_IDEA_LENGTH = 2000;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// Cleanup old sessions
function scheduleCleanup(id: string): void {
  setTimeout(() => {
    discussions.delete(id);
    sseClients.delete(id);
  }, SESSION_TTL_MS);
}

// POST /api/discussion/start
router.post('/start', apiKeyMiddleware, (req: Request, res: Response): void => {
  const { idea, mode } = req.body;
  const domainId = req.body.domain?.id;

  // Validate domain server-side
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) {
    res.status(400).json({ error: 'Invalid domain.' });
    return;
  }

  // Validate idea
  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    res.status(400).json({ error: 'Idea must be at least 10 characters.' });
    return;
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    res.status(400).json({ error: `Idea must be under ${MAX_IDEA_LENGTH} characters.` });
    return;
  }

  // Validate mode
  const validMode: CouncilMode = VALID_MODES.includes(mode) ? mode : 'csuite';

  const discussionId = randomUUID();

  const discussion: DiscussionState = {
    id: discussionId,
    domain,
    idea: idea.trim(),
    mode: validMode,
    members: [],
    messages: [],
    characterStates: [],
    currentPhase: 'opening',
    activeSpeakerId: null,
    status: 'idle',
    summary: null,
  };

  discussions.set(discussionId, discussion);
  scheduleCleanup(discussionId);

  res.json({ discussionId });
});

// GET /api/discussion/:id/stream
router.get('/:id/stream', apiKeyMiddleware, (req: Request, res: Response): void => {
  const discussion = discussions.get(String(req.params.id));
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.set(discussion.id, res);

  req.on('close', () => {
    sseClients.delete(discussion.id);
  });

  const apiKey = (req as any).apiKey;
  if (apiKey) {
    runDiscussion(discussion, res, apiKey).catch((err) => {
      sendSSE(res, { type: 'error', data: { message: 'Discussion failed. Please try again.' } });
      res.end();
    });
  } else {
    sendSSE(res, { type: 'error', data: { message: 'API key required.' } });
    res.end();
  }
});

// POST /api/discussion/:id/interact
router.post('/:id/interact', apiKeyMiddleware, (req: Request, res: Response): void => {
  const discussion = discussions.get(String(req.params.id));
  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found.' });
    return;
  }

  const interaction = req.body as UserInteraction;
  res.json({ received: true, type: interaction.type });
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
