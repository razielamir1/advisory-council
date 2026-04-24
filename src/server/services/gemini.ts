import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini 2.5 Flash pricing (USD per 1M tokens). Keep in sync with docs.
// https://ai.google.dev/pricing
const PRICE_PROMPT_PER_M = 0.075;
const PRICE_COMPLETION_PER_M = 0.3;

export type UsageMetadata = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
};

function estimateCost(promptTokens: number, completionTokens: number): number {
  return (
    (promptTokens * PRICE_PROMPT_PER_M) / 1_000_000 +
    (completionTokens * PRICE_COMPLETION_PER_M) / 1_000_000
  );
}

// Retry on transient Gemini errors (429 rate limit, 5xx). Exponential backoff
// with jitter. Tries up to 4 times total (~1s, 2s, 4s, 8s + jitter).
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const msg = String(err?.message || err);
      const transient = /\b(429|500|502|503|504)\b/.test(msg) || /overloaded|rate.?limit|quota/i.test(msg);
      if (!transient || attempt === maxAttempts) throw err;
      const delay = Math.min(8000, 2 ** (attempt - 1) * 1000) + Math.random() * 500;
      console.warn(`[gemini] ${label} attempt ${attempt} failed (${msg.slice(0, 120)}). Retrying in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  lastUsage: UsageMetadata | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('No Gemini API key provided');
    this.genAI = new GoogleGenerativeAI(key);
  }

  private recordUsage(
    modelName: string,
    startedAt: number,
    metadata: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } | undefined,
  ): void {
    const promptTokens = metadata?.promptTokenCount ?? 0;
    const completionTokens = metadata?.candidatesTokenCount ?? 0;
    const totalTokens = metadata?.totalTokenCount ?? promptTokens + completionTokens;
    this.lastUsage = {
      model: modelName,
      promptTokens,
      completionTokens,
      totalTokens,
      costUsd: estimateCost(promptTokens, completionTokens),
      latencyMs: Date.now() - startedAt,
    };
  }

  async generateMessage(
    systemPrompt: string,
    userMessage: string,
    options: { model?: string; maxTokens?: number } = {}
  ): Promise<string> {
    const modelName = options.model || 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const startedAt = Date.now();
    return withRetry(async () => {
      const result = await model.generateContent(userMessage);
      this.recordUsage(modelName, startedAt, result.response.usageMetadata);
      return result.response.text();
    }, 'generateMessage');
  }

  async *streamMessage(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    options: { model?: string; maxTokens?: number } = {}
  ): AsyncGenerator<string> {
    const modelName = options.model || 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const startedAt = Date.now();
    const result = await withRetry(async () => {
      const chat = model.startChat({ history });
      return chat.sendMessageStream(lastMessage.content);
    }, 'streamMessage');

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }

    try {
      const agg = await result.response;
      this.recordUsage(modelName, startedAt, agg.usageMetadata);
    } catch (err) {
      console.warn('[gemini] failed to read usage metadata from stream', err);
    }
  }
}
