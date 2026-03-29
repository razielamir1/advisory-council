import { GoogleGenerativeAI } from '@google/generative-ai';

export class ClaudeService {
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
      model: options.model || 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    return result.response.text();
  }

  async *streamMessage(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    options: { model?: string; maxTokens?: number } = {}
  ): AsyncGenerator<string> {
    const model = this.genAI.getGenerativeModel({
      model: options.model || 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}
