export type IconName = 'focus' | 'flow' | 'signal'

export const siteContent = {
  brand: 'SYRE',
  tagline: 'Work, in rhythm.',
  chrome: {
    homeLabel: 'SYRE home',
    primaryNavigationLabel: 'Primary navigation',
    mobileNavigationLabel: 'Mobile navigation',
    footerNavigationLabel: 'Footer navigation',
    menuLabel: 'Menu',
    menuTitle: 'Navigate SYRE',
    menuCloseLabel: 'Close navigation menu',
    menuNote: 'Close this menu with Escape at any time.',
    headerAction: 'Build a brief',
    mobileAction: 'Build a starting brief',
    skipLink: 'Skip to main content',
    backToTop: 'Back to top ↑',
    copyright: '© SYRE',
  },
  navigation: [
    { label: 'Why SYRE', href: '#why' },
    { label: 'Method', href: '#process' },
    { label: 'Commitments', href: '#commitments' },
    { label: 'FAQ', href: '#faq' },
  ],
  hero: {
    eyebrow: 'A calmer operating rhythm',
    title: 'Move important work',
    accent: 'without losing the thread.',
    body: 'SYRE gives teams a clear place to shape decisions, carry context, and keep the next meaningful step in view.',
    primaryAction: { label: 'Build a starting brief', href: '#start' },
    secondaryAction: { label: 'See the working method', href: '#process' },
    note: 'A focused approach for shared clarity and continuity',
    visualLabels: ['Shared context', 'Clear next step'],
    ticker: ['Clarity', 'Continuity', 'Momentum', 'Shared rhythm', 'Clarity', 'Continuity'],
  },
  capabilitiesIntro: {
    eyebrow: 'Why SYRE',
    title: 'Good work needs a clear throughline.',
    body: 'When context scatters, momentum becomes expensive. SYRE is shaped around three conditions that make progress easier to follow.',
  },
  pillars: [
    {
      number: '01',
      icon: 'focus' as IconName,
      title: 'Focus the signal',
      body: 'Bring the decisions, open questions, and essential context forward—without adding another wall of noise.',
    },
    {
      number: '02',
      icon: 'flow' as IconName,
      title: 'Create a shared rhythm',
      body: 'Turn scattered updates into a cadence your team can understand, trust, and act on together.',
    },
    {
      number: '03',
      icon: 'signal' as IconName,
      title: 'Keep momentum visible',
      body: 'Make progress legible and the next step obvious, so good work can keep moving with less friction.',
    },
  ],
  process: [
    {
      step: 'Frame',
      title: 'Start with what matters',
      body: 'Name the outcome, the context around it, and the few questions that deserve the team’s attention.',
    },
    {
      step: 'Align',
      title: 'Make the decision clear',
      body: 'Gather perspective in one place and leave a durable trail from consideration to commitment.',
    },
    {
      step: 'Move',
      title: 'Carry the thread forward',
      body: 'Connect the decision to a concrete next step, with enough context for momentum to survive the handoff.',
    },
  ],
  processIntro: {
    eyebrow: 'A simple operating loop',
    title: 'From open question to onward motion.',
    body: 'A practical rhythm for keeping the people, thinking, and action around important work connected.',
  },
  commitments: {
    eyebrow: 'What the approach commits to',
    title: 'Proof should be visible in the work.',
    body: 'There are no borrowed logos or inflated numbers here. The useful test is whether the work becomes easier to understand, revisit, and move forward.',
    items: [
      {
        marker: 'Understand',
        title: 'A visible point of view',
        body: 'The outcome, open questions, and decision criteria stay close enough to inspect together.',
      },
      {
        marker: 'Revisit',
        title: 'A durable context trail',
        body: 'The reasoning around a decision remains legible after the meeting or handoff ends.',
      },
      {
        marker: 'Move',
        title: 'An explicit next step',
        body: 'A thread closes with a clear movement, not another ambiguous status update.',
      },
    ],
    note: 'These are design commitments for SYRE—not customer results or performance claims.',
  },
  principlesIntro: {
    eyebrow: 'Design principles',
    title: 'Calm by design. Useful by default.',
    body: 'SYRE’s foundation favors comprehension over volume: enough structure to move together, enough space to think clearly.',
  },
  principles: [
    { value: 'Less noise', label: 'Attention stays on the work that matters.' },
    { value: 'More context', label: 'Decisions remain understandable over time.' },
    { value: 'Clear movement', label: 'Every thread points toward a next step.' },
  ],
  statement: {
    quote: 'Progress is easier to sustain when everyone can see what matters, why it matters, and what happens next.',
    attribution: 'A principle for the product',
  },
  faq: {
    eyebrow: 'Questions, answered plainly',
    title: 'Before you start.',
    body: 'A short, honest view of what this site does—and does not—claim today.',
    items: [
      {
        question: 'What is SYRE?',
        answer: 'SYRE is presented here as a focused approach to keeping decisions, context, and next steps connected around important team work.',
      },
      {
        question: 'Is this page describing a finished product?',
        answer: 'No. This page explains the intended working rhythm and design principles without claiming features, integrations, availability, or results that have not been approved.',
      },
      {
        question: 'Who is the approach for?',
        answer: 'It is framed for teams that want a calmer way to make shared work understandable. No specific industry, company size, or customer outcome is assumed.',
      },
      {
        question: 'How can I start a conversation?',
        answer: 'An external contact route has not been configured. You can build and copy a concise working brief below so the important context is ready when an approved route is added.',
      },
    ],
  },
  brief: {
    eyebrow: 'Start with useful context',
    title: 'Shape the first conversation.',
    body: 'Capture the outcome and the context that matters. SYRE will turn it into a concise brief you can copy—nothing is sent or stored.',
    outcomeLabel: 'What outcome are you trying to move?',
    outcomePlaceholder: 'Example: reach a clear decision on the next phase',
    contextLabel: 'What context should stay attached?',
    contextPlaceholder: 'Example: constraints, open questions, and people who need to weigh in',
    submitLabel: 'Create and copy the brief',
    privacy: 'Local only: this page does not submit or save what you type.',
    previewLabel: 'Your working brief',
    validationMessage: 'Add the outcome you want to move before creating the brief.',
    copiedMessage: 'Brief created and copied to your clipboard.',
    fallbackMessage: 'Brief created. Copy it from the preview below.',
    template: {
      title: 'SYRE working brief',
      outcomePrefix: 'Outcome to move:',
      contextPrefix: 'Context to carry:',
      emptyContext: 'To be clarified together.',
      firstConversation: 'First conversation: clarify the open question, decision criteria, and next meaningful step.',
    },
  },
  contact: {
    href: '' as string,
    label: 'Continue to the approved contact route',
  },
  footerLinks: [
    { label: 'Why SYRE', href: '#why' },
    { label: 'Method', href: '#process' },
    { label: 'Commitments', href: '#commitments' },
    { label: 'Principles', href: '#principles' },
    { label: 'FAQ', href: '#faq' },
  ],
  error: {
    eyebrow: 'SYRE',
    title: 'The page lost its thread.',
    body: 'Reload to start again. Anything typed into the local brief builder was never sent or stored.',
    action: 'Reload the page',
  },
} as const
