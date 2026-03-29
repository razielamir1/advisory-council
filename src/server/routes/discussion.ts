import { Router, type Request, type Response } from 'express';
import type { DiscussionState, StartDiscussionRequest, UserInteraction, SSEEvent } from '../../shared/types.js';
import { apiKeyMiddleware } from '../middleware/api-key.js';
import { runDiscussion } from '../services/discussion-engine.js';

const router = Router();
const discussions = new Map<string, DiscussionState>();
const sseClients = new Map<string, Response>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

// POST /api/discussion/start
router.post('/start', apiKeyMiddleware, (req: Request, res: Response): void => {
  const body = req.body as StartDiscussionRequest;

  if (!body.domain || !body.idea) {
    res.status(400).json({ error: 'Domain and idea are required.' });
    return;
  }

  const discussionId = generateId();

  const discussion: DiscussionState = {
    id: discussionId,
    domain: body.domain,
    idea: body.idea,
    mode: body.mode || 'csuite',
    members: [],
    messages: [],
    characterStates: [],
    currentPhase: 'opening',
    activeSpeakerId: null,
    status: 'idle',
    summary: null,
  };

  discussions.set(discussionId, discussion);

  res.json({ discussionId });
});

// GET /api/discussion/:id/stream
router.get('/:id/stream', (req: Request, res: Response): void => {
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

  // Clean up on disconnect
  req.on('close', () => {
    sseClients.delete(discussion.id);
  });

  // Run the discussion engine
  const apiKey = (req as any).apiKey || process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    runDiscussion(discussion, res, apiKey).catch((err) => {
      sendSSE(res, { type: 'error', data: { message: err.message } });
      res.end();
    });
  } else {
    sendSSE(res, { type: 'error', data: { message: 'No API key available' } });
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
  // Will be handled by discussion engine
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
