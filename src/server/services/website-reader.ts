import { GeminiService } from './gemini.js';

export async function readWebsite(url: string, apiKey: string): Promise<string> {
  // Fetch the website HTML
  // Use r.jina.ai — a free reader service that handles cookies, JS rendering,
  // redirects, and returns clean markdown. Works where raw fetch fails.
  const readerUrl = `https://r.jina.ai/${url}`;

  let cleaned: string;
  try {
    const response = await fetch(readerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdvisoryCouncil/1.0)',
        'Accept': 'text/plain',
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (body.includes('TOO_MANY_REDIRECTS') || response.status === 422) {
        throw new Error('האתר הזה חוסם קריאה אוטומטית (לולאת redirects). נסה אתר אחר, או הוסף את פרטי העסק ידנית בשדה התיאור.');
      }
      throw new Error(`לא הצלחנו לקרוא את האתר (${response.status}). ודא שהכתובת נכונה.`);
    }

    const text = await response.text();
    cleaned = text.replace(/\s+/g, ' ').trim().substring(0, 8000);

    if (cleaned.length < 100) {
      throw new Error('לא הצלחנו להוציא תוכן מהאתר. נסה אתר אחר.');
    }
  } catch (err: any) {
    if (err.message?.startsWith('האתר') || err.message?.startsWith('לא הצלחנו')) throw err;
    throw new Error(`לא הצלחנו להגיע לאתר (${err.message || 'network error'}). ודא שהכתובת נכונה.`);
  }

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
