import type { Response } from 'express';
import type {
  DiscussionState,
  DiscussionPhase,
  CouncilMember,
  SSEEvent,
  DiscussionMessage,
  CharacterState,
} from '../../shared/types.js';
import { GeminiService } from './gemini.js';
import { buildCouncil, buildGuestExpert } from './council-builder.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export async function runDiscussion(
  discussion: DiscussionState,
  res: Response,
  apiKey: string
): Promise<void> {
  const claude = new GeminiService(apiKey);

  // Build council
  const members = buildCouncil(discussion.domain, discussion.idea, discussion.mode);
  discussion.members = members;
  discussion.status = 'discussing';

  // Send members to client
  const characterStates: CharacterState[] = members.map((m) => ({
    memberId: m.id,
    location: 'boardroom' as const,
    activity: 'sitting' as const,
  }));
  discussion.characterStates = characterStates;

  // Send initial member data
  sendSSE(res, {
    type: 'phase-change',
    data: { phase: 'opening', phaseNumber: 0, totalPhases: 7, members, characterStates },
  });

  const allMessages: DiscussionMessage[] = [];

  // ===== PHASE 1: Opening Statements =====
  await runPhase(claude, res, discussion, allMessages, 'opening', members, {
    phasePrompt: `You are participating in the OPENING STATEMENTS phase of a board discussion.
Give your INITIAL REACTION to this idea. Be thorough — 2-3 full paragraphs:
- Your first analysis from your expertise angle
- Immediate questions that come to mind
- What concerns you and what excites you
- What needs to be investigated further

IMPORTANT: Be SKEPTICAL by default. Don't say "great idea!" — challenge it. Ask hard questions.
If it seems weak, say so directly. Protect the founder's money and time.`,
    speakersCount: Math.min(members.length, 4),
  });

  // ===== PHASE 2: Deep Probing =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'probing', phaseNumber: 1, totalPhases: 7 } });

  await runPhase(claude, res, discussion, allMessages, 'probing', members.slice(0, 4), {
    phasePrompt: `You are in the DEEP PROBING phase. Your job is to ASK HARD QUESTIONS to the other board members based on what they said in the opening.
- Directly address another member: "[Name], when you said X — what evidence backs that up?"
- Challenge assumptions: "You're assuming the market is Y, but what if it's actually Z?"
- Demand specifics: "Give me numbers. What's the actual TAM? What's the conversion rate?"
- Draw from your experience: "I saw this exact pattern at [company] and it didn't work because..."

Be tough. Don't accept surface-level answers. Push for depth.`,
    speakersCount: 4,
    referencePrior: true,
  });

  // ===== PHASE 3: Research & Evidence =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'research', phaseNumber: 2, totalPhases: 7 } });

  // Move some characters to research areas
  sendSSE(res, { type: 'character-move', data: { memberId: members[1]?.id, location: 'dev-room', activity: 'writing' } });

  await runPhase(claude, res, discussion, allMessages, 'research', members.slice(0, 3), {
    phasePrompt: `You are in the RESEARCH & EVIDENCE phase. Bring DATA and REAL-WORLD EXAMPLES:
- Market data, industry benchmarks, growth rates
- Case studies: "Company X tried this in 2019 and here's what happened..."
- Competitor analysis: who else is doing this, how are they doing, what's their traction
- Failure studies: "I know of 3 companies that tried this approach and failed. Here's why..."
- Financial analysis: unit economics, burn rate estimates, time to profitability

Be specific. Use numbers. Reference real companies and real outcomes.
If you don't have exact numbers, give realistic estimates based on your experience.`,
    speakersCount: 3,
    referencePrior: true,
  });

  // Move characters back
  sendSSE(res, { type: 'character-move', data: { memberId: members[1]?.id, location: 'boardroom', activity: 'sitting' } });

  // ===== PHASE 4: Challenge & Debate =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'challenge', phaseNumber: 3, totalPhases: 7 } });

  await runPhase(claude, res, discussion, allMessages, 'challenge', members.slice(0, 4), {
    phasePrompt: `You are in the CHALLENGE & DEBATE phase. This is where real disagreements surface.
- DIRECTLY DISAGREE with another member: "[Name], I strongly disagree. Here's why..."
- Play devil's advocate: "Let me argue the opposite position for a moment..."
- Challenge the fundamental premise: "What if the entire approach is wrong?"
- Bring up uncomfortable truths: "Nobody wants to say this, but..."
- Trade-offs: "We keep talking about the upside, but what about the downside of..."

This is NOT a polite discussion. This is a real debate. Be respectful but TOUGH.
Don't agree for the sake of agreeing. If you think something is wrong, say it.`,
    speakersCount: 4,
    referencePrior: true,
  });

  // ===== PHASE 5: Guest Expert =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'guest', phaseNumber: 4, totalPhases: 7 } });

  const inviter = members[0]!;
  const guest = buildGuestExpert(discussion.domain, discussion.idea, inviter);
  discussion.members.push(guest);
  sendSSE(res, { type: 'guest-join', data: { member: guest, invitedBy: inviter } });

  // Coffee break moment
  sendSSE(res, { type: 'break-start', data: { message: 'Let me bring in someone who knows this area...' } });
  await delay(1500);
  sendSSE(res, { type: 'break-end', data: {} });

  await runPhase(claude, res, discussion, allMessages, 'guest', [guest, members[0]!], {
    phasePrompt: `You are a GUEST EXPERT brought into this discussion.
You've heard everything discussed so far. Now give your specialized perspective:
- What everyone in this room is missing
- Specific field experience: "In my 25 years in this exact area..."
- Practical warnings: "Here's what actually happens when you try to..."
- Connections and resources you can offer
- The one thing that will make or break this

Be blunt. You were brought in for your expertise, not to be polite.`,
    speakersCount: 2,
    referencePrior: true,
  });

  // ===== PHASE 6: Consensus Building =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'consensus', phaseNumber: 5, totalPhases: 7 } });

  await runPhase(claude, res, discussion, allMessages, 'consensus', [members[0]!, members[2]!, members[1]!], {
    phasePrompt: `You are in the CONSENSUS BUILDING phase. Synthesize what we've discussed:
- "On X, we all agree. On Y, there's disagreement. On Z, we need more information."
- Rate your confidence level for each recommendation: HIGH / MEDIUM / LOW
- Identify the gaps: "We still don't know whether..."
- Be honest about uncertainty: "I'm not confident about this aspect because..."

This is NOT forced consensus. If there's real disagreement, state it clearly.
The founder needs to know where the board is aligned and where it's split.`,
    speakersCount: 3,
    referencePrior: true,
  });

  // ===== PHASE 7: Final Recommendations =====
  sendSSE(res, { type: 'phase-change', data: { phase: 'closing', phaseNumber: 6, totalPhases: 7 } });

  await runPhase(claude, res, discussion, allMessages, 'closing', members.slice(0, 5), {
    phasePrompt: `You are giving your FINAL RECOMMENDATION. One clear, actionable statement:
- The MOST IMPORTANT thing to do right now
- The BIGGEST MISTAKE to avoid
- Your confidence level (HIGH/MEDIUM/LOW)

Keep it to 3-4 sentences maximum. Be decisive. The founder needs clear direction.`,
    speakersCount: Math.min(members.length, 5),
    referencePrior: true,
  });

  // ===== Generate Summary =====
  discussion.status = 'summarizing';
  const summary = await generateSummary(claude, discussion, allMessages);
  discussion.summary = summary;
  discussion.messages = allMessages;
  discussion.status = 'complete';

  sendSSE(res, { type: 'discussion-complete', data: { summary } });
  res.end();
}

interface PhaseOptions {
  phasePrompt: string;
  speakersCount: number;
  referencePrior?: boolean;
}

async function runPhase(
  claude: GeminiService,
  res: Response,
  discussion: DiscussionState,
  allMessages: DiscussionMessage[],
  phase: DiscussionPhase,
  speakers: CouncilMember[],
  options: PhaseOptions
): Promise<void> {
  const selectedSpeakers = speakers.slice(0, options.speakersCount);

  for (const member of selectedSpeakers) {
    const messageId = generateId();

    // Move character to speaking position
    sendSSE(res, {
      type: 'character-move',
      data: { memberId: member.id, location: 'boardroom', activity: 'speaking' },
    });

    sendSSE(res, {
      type: 'member-start',
      data: { memberId: member.id, messageId, phase, messageType: 'speech' },
    });

    const priorContext = options.referencePrior
      ? allMessages
          .slice(-10)
          .map((m) => {
            const speaker = discussion.members.find((mb) => mb.id === m.memberId);
            return `${speaker?.role || 'Unknown'} (${speaker?.name || ''}): ${m.content}`;
          })
          .join('\n\n')
      : '';

    const systemPrompt = buildSystemPrompt(member, discussion, options.phasePrompt);
    const userMessage = buildUserMessage(discussion.idea, discussion.domain.name, priorContext, phase);

    let fullContent = '';

    try {
      const messages = [{ role: 'user' as const, content: userMessage }];

      for await (const token of claude.streamMessage(systemPrompt, messages)) {
        fullContent += token;
        sendSSE(res, { type: 'token', data: { messageId, token } });
      }
    } catch (err: any) {
      fullContent = `[Error generating response: ${err.message}]`;
    }

    const message: DiscussionMessage = {
      id: messageId,
      memberId: member.id,
      phase,
      content: fullContent,
      timestamp: Date.now(),
      type: 'speech',
    };
    allMessages.push(message);

    sendSSE(res, { type: 'member-end', data: { messageId, fullContent } });

    // Return to sitting
    sendSSE(res, {
      type: 'character-move',
      data: { memberId: member.id, location: 'boardroom', activity: 'sitting' },
    });

    // Brief pause between speakers
    await delay(800);
  }
}

const LANG_NAMES: Record<string, string> = {
  he: 'Hebrew (עברית)',
  en: 'English',
  ar: 'Arabic (العربية)',
  ru: 'Russian (Русский)',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
};

function buildSystemPrompt(member: CouncilMember, discussion: DiscussionState, phasePrompt: string): string {
  const langName = LANG_NAMES[discussion.language] || 'Hebrew';

  return `You are ${member.name}${member.nickname ? ` ("${member.nickname}")` : ''}, the ${member.title}.

ROLE: ${member.role}
EXPERIENCE: ${member.yearsExperience}+ years
EXPERTISE: ${member.expertise.join(', ')}
BACKGROUND: ${member.background}
SPEAKING STYLE: ${member.personality}

DOMAIN: ${discussion.domain.name} (${discussion.domain.nameHe})

${phasePrompt}

CRITICAL — LANGUAGE: You MUST respond entirely in ${langName}. Every word of your response must be in ${langName}.

RULES:
- Speak in YOUR authentic voice — use your known communication style and mental models
- Reference your real experience, companies you've built/invested in, lessons learned
- Be SKEPTICAL by default — don't praise the idea, challenge it
- Address other board members by name when responding to their points
- Keep response to 2-3 substantial paragraphs
- Use specific numbers, examples, and case studies where possible
- If you disagree with someone, say so directly and explain why
- Think about what could go WRONG, not just what could go right`;
}

function buildUserMessage(idea: string, domainName: string, priorContext: string, phase: DiscussionPhase): string {
  let msg = `THE IDEA/CHALLENGE:\n${idea}\n\nDOMAIN: ${domainName}`;

  if (priorContext) {
    msg += `\n\nPRIOR DISCUSSION:\n${priorContext}`;
  }

  msg += `\n\nNow give your perspective for the ${phase} phase. Remember: be specific, be skeptical, be real.`;

  return msg;
}

async function generateSummary(
  claude: GeminiService,
  discussion: DiscussionState,
  allMessages: DiscussionMessage[]
): Promise<any> {
  const transcript = allMessages
    .map((m) => {
      const member = discussion.members.find((mb) => mb.id === m.memberId);
      return `[${m.phase}] ${member?.role} (${member?.name}): ${m.content}`;
    })
    .join('\n\n---\n\n');

  const prompt = `You are the MODERATOR synthesizing a board discussion.

IDEA: ${discussion.idea}
DOMAIN: ${discussion.domain.name}

FULL TRANSCRIPT:
${transcript}

Generate a structured JSON summary with this EXACT format:
{
  "executiveSummary": "2-3 paragraph overview of the discussion and key findings",
  "keyTension": "The central X vs Y tension that emerged",
  "consensus": ["point 1 everyone agreed on", "point 2", ...],
  "dissent": ["point of disagreement 1", "point 2", ...],
  "openQuestion": "The one question only the founder can answer",
  "memberRecommendations": [
    {
      "memberId": "member-id",
      "recommendation": "their main recommendation",
      "doThis": "most important action",
      "avoidThis": "biggest mistake to avoid"
    }
  ],
  "actionItems": [
    { "action": "specific action", "priority": "critical|high|medium|low", "owner": "role/department", "timeframe": "timeline" }
  ],
  "risks": [
    { "risk": "description", "severity": "critical|high|medium|low", "probability": "high|medium|low", "mitigation": "how to mitigate", "flaggedBy": ["member-id"] }
  ],
  "opportunities": [
    { "opportunity": "description", "potential": "high|medium|low", "description": "details", "flaggedBy": ["member-id"] }
  ]
}

Return ONLY valid JSON, no markdown code fences.`;

  try {
    const response = await claude.generateMessage(
      'You are an expert moderator. Output only valid JSON.',
      prompt,
      { model: 'gemini-2.0-flash', maxTokens: 4096 }
    );

    // Fix member IDs in the response
    const summary = JSON.parse(response);
    summary.memberRecommendations = (summary.memberRecommendations || []).map((rec: any, i: number) => ({
      ...rec,
      memberId: discussion.members[i]?.id || rec.memberId,
    }));
    summary.risks = (summary.risks || []).map((r: any) => ({
      ...r,
      flaggedBy: r.flaggedBy?.map((_: any, i: number) => discussion.members[i]?.id) || [],
    }));
    summary.opportunities = (summary.opportunities || []).map((o: any) => ({
      ...o,
      flaggedBy: o.flaggedBy?.map((_: any, i: number) => discussion.members[i]?.id) || [],
    }));

    return summary;
  } catch {
    return {
      executiveSummary: 'Summary generation failed. Please review the transcript.',
      keyTension: 'N/A',
      consensus: [],
      dissent: [],
      openQuestion: 'N/A',
      memberRecommendations: [],
      actionItems: [],
      risks: [],
      opportunities: [],
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
