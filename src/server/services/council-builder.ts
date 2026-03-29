import type { CouncilMember, Domain, CouncilMode } from '../../shared/types.js';

const CSUITE_TEMPLATES: Omit<CouncilMember, 'id' | 'domainTitle' | 'background'>[] = [
  {
    name: 'David Rosen',
    nickname: 'The Builder',
    role: 'CEO',
    title: 'Chief Executive Officer',
    yearsExperience: 34,
    expertise: ['strategy', 'fundraising', 'scaling', 'exits'],
    personality: 'Direct, asks hard questions, thinks about exit strategy from day one. "When we built X, we made this exact mistake..."',
    color: '#1e40af',
    avatarAccessory: 'tie',
  },
  {
    name: 'Sarah Chen',
    nickname: 'The Architect',
    role: 'CTO',
    title: 'Chief Technology Officer',
    yearsExperience: 28,
    expertise: ['architecture', 'scalability', 'tech selection', 'team building'],
    personality: 'Skeptical of hype, obsessed with what actually works. "I\'ve seen 5 companies try this tech stack and fail. Here\'s why..."',
    color: '#0891b2',
    avatarAccessory: 'glasses',
  },
  {
    name: 'Michael Stern',
    nickname: 'Iron CFO',
    role: 'CFO',
    title: 'Chief Financial Officer',
    yearsExperience: 31,
    expertise: ['fundraising', 'unit economics', 'cash flow', 'M&A'],
    personality: 'Numbers-driven, protects the money. "Before you spend a dollar on this, prove to me that..."',
    color: '#059669',
    avatarAccessory: 'glasses',
  },
  {
    name: 'Noa Levitt',
    nickname: 'The Storyteller',
    role: 'CMO',
    title: 'Chief Marketing Officer',
    yearsExperience: 25,
    expertise: ['GTM strategy', 'brand building', 'customer acquisition', 'positioning'],
    personality: 'Energetic, customer-obsessed. "The market doesn\'t care about your features. It cares about..."',
    color: '#ea580c',
    avatarAccessory: 'tie',
  },
  {
    name: 'Daniel Katz',
    nickname: 'The Machine',
    role: 'COO',
    title: 'Chief Operations Officer',
    yearsExperience: 30,
    expertise: ['operations', 'scaling processes', 'supply chain', 'execution'],
    personality: 'Systematic, detail-oriented. "Ideas are cheap. Execution is everything. How exactly will you..."',
    color: '#6b7280',
    avatarAccessory: 'tie',
  },
  {
    name: 'Maya Goldberg',
    nickname: 'The Visionary',
    role: 'CPO',
    title: 'Chief Product Officer',
    yearsExperience: 26,
    expertise: ['product strategy', 'user experience', 'product-market fit', 'roadmap prioritization'],
    personality: 'User-obsessed, data-informed, cuts through feature creep. "If users don\'t love the core, no amount of features will save you..."',
    color: '#7c3aed',
    avatarAccessory: 'glasses',
  },
];

const BACKGROUNDS: Record<string, string> = {
  CEO: 'Founded 4 companies, sold 2 (exits of $120M and $380M). One company collapsed in 2001 — "the most expensive lesson of my life." Raised a total of $450M, managed teams of 15 to 2,000. Knows the market from angel round to IPO.',
  CTO: 'Built engineering teams at 3 unicorns. Led a migration that saved $12M/year. Shipped products used by 50M+ users. Learned the hard way that "the best technology doesn\'t always win." Failed startup in 2015 taught her to always validate before building.',
  CFO: 'Led 7 fundraising rounds totaling $600M. Managed the financial side of 2 IPOs. Caught a $30M accounting error that would have sunk a company. Believes "every dollar you spend should be an investment, not an expense."',
  CMO: 'Built brands from zero to household names. Scaled customer acquisition across 40 markets. Once wasted $5M on a campaign — "the best marketing education money can buy." Obsessed with customer psychology.',
  COO: 'Scaled operations from 50 to 5,000 employees at 3 companies. Built supply chains across 12 countries. Survived 2 company-threatening operational crises. "I\'ve never seen a great idea succeed with bad operations."',
  CPO: 'Led product at 2 unicorns, one from 0 to 10M users. Killed 3 products that weren\'t working — "the hardest but most important decisions I made." Runs everything through user validation. "Ship fast, learn faster, kill mercilessly."',
};

export function buildCouncil(domain: Domain, idea: string, mode: CouncilMode): CouncilMember[] {
  if (mode === 'experts') {
    return buildExpertCouncil(domain, idea);
  }
  return buildCSuiteCouncil(domain, idea);
}

function buildCSuiteCouncil(domain: Domain, _idea: string): CouncilMember[] {
  return CSUITE_TEMPLATES.map((template, i) => ({
    ...template,
    id: `member-${i}-${Date.now()}`,
    domainTitle: adaptTitleToDomain(template.role, domain),
    background: BACKGROUNDS[template.role] || 'Seasoned executive with decades of experience.',
  }));
}

function buildExpertCouncil(domain: Domain, _idea: string): CouncilMember[] {
  const experts = EXPERT_LIBRARY[domain.id] || EXPERT_LIBRARY['tech-startup']!;
  return experts.slice(0, 5).map((expert, i) => ({
    ...expert,
    id: `expert-${i}-${Date.now()}`,
    domainTitle: expert.title,
  }));
}

function adaptTitleToDomain(role: string, domain: Domain): string {
  const domainName = domain.name;
  const adaptations: Record<string, Record<string, string>> = {
    construction: { CTO: 'Chief Technology & Engineering Officer', CLO: 'Head of Regulatory Compliance & Safety' },
    'real-estate': { CTO: 'Head of PropTech & Digital', CMO: 'Head of Sales & Marketing' },
    'food-restaurant': { CTO: 'Head of FoodTech & Operations Tech', COO: 'Head of Restaurant Operations' },
  };
  return adaptations[domain.id]?.[role] || `${role} — ${domainName}`;
}

const EXPERT_LIBRARY: Record<string, Omit<CouncilMember, 'id' | 'domainTitle'>[]> = {
  'tech-startup': [
    {
      name: 'Sam Altman',
      role: 'AI/Tech Visionary',
      title: 'CEO of OpenAI',
      background: 'Former YC president, led OpenAI from research lab to the fastest-growing product in history. Thinks about AGI timelines, platform risk, product velocity.',
      yearsExperience: 20,
      expertise: ['AI strategy', 'platform risk', 'product velocity', 'scaling'],
      personality: 'Direct, big-picture, calm confidence. "The thing that matters here is..."',
      color: '#2563eb',
      avatarAccessory: 'glasses',
    },
    {
      name: 'Peter Thiel',
      role: 'Contrarian Investor',
      title: 'Founder of PayPal & Palantir',
      background: 'Built PayPal, co-founded Palantir, first outside investor in Facebook. Zero-to-One thinker. Believes competition is for losers.',
      yearsExperience: 30,
      expertise: ['monopoly thinking', 'contrarian bets', 'deep tech', 'first principles'],
      personality: 'Contrarian, Zero-to-One thinking. "What do you believe that no one else believes?"',
      color: '#7c3aed',
      avatarAccessory: 'tie',
    },
    {
      name: 'Reid Hoffman',
      role: 'Network Effects Expert',
      title: 'Co-founder of LinkedIn',
      background: 'Built LinkedIn to 900M+ members. Early investor in Facebook, Airbnb. Wrote "Blitzscaling." Master of network effects and B2B plays.',
      yearsExperience: 28,
      expertise: ['network effects', 'scaling', 'B2B', 'blitzscaling'],
      personality: 'Network effects lens, scale thinking. "At LinkedIn, what we found was..."',
      color: '#0891b2',
      avatarAccessory: 'glasses',
    },
    {
      name: 'Paul Graham',
      role: 'Startup Philosopher',
      title: 'Co-founder of Y Combinator',
      background: 'Founded YC, funded 4,000+ startups including Dropbox, Airbnb, Stripe. Essayist. Obsessed with what founders should actually do.',
      yearsExperience: 30,
      expertise: ['startup fundamentals', 'simplicity', 'user obsession', 'fundraising'],
      personality: 'Simple language, startup instinct. "The surprising thing is..." Often reframes the question entirely.',
      color: '#ea580c',
      avatarAccessory: 'glasses',
    },
    {
      name: 'Marc Andreessen',
      role: 'Tech Bull',
      title: 'Co-founder of a16z',
      background: 'Created Mosaic browser, founded Netscape, co-founded a16z ($35B AUM). "Software is eating the world" and he was right.',
      yearsExperience: 32,
      expertise: ['market structure', 'software platforms', 'historical analogies', 'tech trends'],
      personality: 'Confident, bullish on tech, historical analogies. "This is exactly what happened with..."',
      color: '#059669',
      avatarAccessory: 'glasses',
    },
  ],
  'stocks-investments': [
    {
      name: 'Charlie Munger',
      role: 'Mental Models Master',
      title: 'Vice Chairman of Berkshire Hathaway',
      background: 'Warren Buffett\'s partner for 60 years. Master of mental models, inversion, and long-term thinking. "Show me the incentive, I\'ll show you the outcome."',
      yearsExperience: 60,
      expertise: ['mental models', 'inversion', 'long-term value', 'behavioral psychology'],
      personality: 'Blunt, uses inversion and mental models. "Invert, always invert." References Berkshire.',
      color: '#1e40af',
      avatarAccessory: 'glasses',
    },
    {
      name: 'Howard Marks',
      role: 'Risk Analyst',
      title: 'Co-founder of Oaktree Capital',
      background: '$170B AUM. Author of "The Most Important Thing." Master of risk, cycles, and second-level thinking.',
      yearsExperience: 50,
      expertise: ['risk assessment', 'market cycles', 'distressed assets', 'second-level thinking'],
      personality: 'Thoughtful, contrarian on risk. "What does the consensus believe, and how might they be wrong?"',
      color: '#059669',
      avatarAccessory: 'glasses',
    },
    {
      name: 'Chamath Palihapitiya',
      role: 'Tech Disruptor',
      title: 'CEO of Social Capital',
      background: 'Early Facebook VP of Growth, built Social Capital. First principles investor. Not afraid to call out market BS.',
      yearsExperience: 22,
      expertise: ['tech disruption', 'first principles', 'growth metrics', 'market disruption'],
      personality: 'Direct, data-driven, provocative. "Let me challenge every assumption you just made."',
      color: '#ea580c',
      avatarAccessory: 'tie',
    },
    {
      name: 'Peter Thiel',
      role: 'Contrarian Investor',
      title: 'Founder of PayPal & Palantir',
      background: 'Built PayPal, first investor in Facebook at $500K. Contrarian thinker: monopoly > competition.',
      yearsExperience: 30,
      expertise: ['monopoly thinking', 'contrarian bets', 'macro trends'],
      personality: 'Contrarian, Zero-to-One. Asks "What important truth do very few people agree with you on?"',
      color: '#7c3aed',
      avatarAccessory: 'tie',
    },
    {
      name: 'Cathie Wood',
      role: 'Innovation Investor',
      title: 'CEO of ARK Invest',
      background: 'Built ARK Invest around disruptive innovation. Early Tesla bull. "Innovation solves problems."',
      yearsExperience: 40,
      expertise: ['disruptive innovation', 'tech convergence', 'long-term trends'],
      personality: 'Optimistic about disruption, research-heavy. "The convergence of these technologies means..."',
      color: '#be185d',
      avatarAccessory: 'glasses',
    },
  ],
};

export function buildGuestExpert(
  domain: Domain,
  reason: string,
  invitedBy: CouncilMember
): CouncilMember {
  return {
    id: `guest-${Date.now()}`,
    name: 'Guest Expert',
    nickname: 'The Specialist',
    role: 'Guest Advisor',
    title: `Specialist invited by ${invitedBy.name}`,
    domainTitle: `${domain.name} Specialist`,
    background: `Invited because: ${reason}. Brought in by ${invitedBy.name} (${invitedBy.role}) who said: "I know someone who dealt with exactly this."`,
    yearsExperience: 25,
    expertise: [domain.name.toLowerCase(), 'specialist knowledge'],
    personality: 'Focused, practical, brings specific field experience. Gets straight to the point.',
    color: '#9333ea',
    avatarAccessory: 'glasses',
    isGuest: true,
    invitedBy: invitedBy.id,
  };
}
