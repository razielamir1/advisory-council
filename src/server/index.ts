import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { discussionRouter } from './routes/discussion.js';
import { errorHandler } from './middleware/error-handler.js';
import { DOMAINS } from './config/domains.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/domains', (_req, res) => {
  res.json({ domains: DOMAINS });
});

app.use('/api/discussion', discussionRouter);

// In production, serve Vite build
const clientDist = path.resolve(__dirname, '../../dist/client');
app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Advisory Council] Server running on http://localhost:${PORT}`);
});
