import { GoogleGenerativeAI } from '@google/generative-ai';

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

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('No Gemini API key provided');
    this.genAI = new GoogleGenerativeAI(key);
  }

  async generateMessage(
    systemPrompt: string,
    userMessage: string,
    options: { model?: string; maxTokens?: number } = {}
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: options.model || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    return withRetry(async () => {
      const result = await model.generateContent(userMessage);
      return result.response.text();
    }, 'generateMessage');
  }

  async *streamMessage(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    options: { model?: string; maxTokens?: number } = {}
  ): AsyncGenerator<string> {
    const model = this.genAI.getGenerativeModel({
      model: options.model || 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

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
  }
}
