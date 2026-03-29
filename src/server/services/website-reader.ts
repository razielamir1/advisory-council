import { GeminiService } from './gemini.js';

export async function readWebsite(url: string, apiKey: string): Promise<string> {
  // Fetch the website HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AdvisoryCouncilBot/1.0)',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.status}`);
  }

  const html = await response.text();

  // Extract meaningful text — strip tags, scripts, styles
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000); // Limit to avoid token overflow

  if (cleaned.length < 50) {
    throw new Error('Could not extract meaningful content from this website.');
  }

  // Use Gemini to summarize the business
  const gemini = new GeminiService(apiKey);
  const summary = await gemini.generateMessage(
    `You are a business analyst. Analyze this website content and create a concise business profile.
Include: what the company does, target market, products/services, value proposition, business model (if apparent), team size hints, technology used.
Be factual — only state what you can infer from the content. Write in the language of the website content.`,
    `Website URL: ${url}\n\nWebsite content:\n${cleaned}`,
    { maxTokens: 1500 }
  );

  return summary;
}
