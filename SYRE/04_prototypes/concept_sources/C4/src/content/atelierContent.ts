export const INSTRUCTION_NONCE = 'ORCHESTRA_SYRE_C4_20260729_A'

export type CardId = 'ride-intent' | 'geometry' | 'layup' | 'finish' | 'colour' | 'next-step'

export interface CardDefinition {
  id: CardId
  title: string
  description: string
  type: 'text' | 'select' | 'palette'
  options?: readonly string[]
  placeholder: string
  defaultValue: string
}

export const CARD_DEFINITIONS: readonly CardDefinition[] = [
  {
    id: 'ride-intent',
    title: 'Ride intent',
    description: 'What kind of riding should this frameset support? Terrain, pace, distance, and feel.',
    type: 'text',
    placeholder: 'Describe your intended ride character — e.g. all-day endurance, fast group rides, mixed-surface exploring',
    defaultValue: '',
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description: 'Rider position and handling characteristics. Stack, reach, and fit preferences.',
    type: 'text',
    placeholder: 'Note your fit priorities — e.g. slightly relaxed endurance position, responsive front-end',
    defaultValue: '',
  },
  {
    id: 'layup',
    title: 'Layup',
    description: 'Carbon layup schedule. Every ATELIER frame is hand-laid.',
    type: 'select',
    options: ['Hand layup'] as const,
    placeholder: '',
    defaultValue: 'Hand layup',
  },
  {
    id: 'finish',
    title: 'Finish',
    description: 'Surface treatment for the frame.',
    type: 'select',
    options: ['Raw carbon', 'Hydro dip'] as const,
    placeholder: '',
    defaultValue: 'Raw carbon',
  },
  {
    id: 'colour',
    title: 'Colour',
    description: 'Select a colour from the approved ATELIER palette. 39 CMYK-derived colours.',
    type: 'palette',
    placeholder: '',
    defaultValue: '#FF8FA7',
  },
  {
    id: 'next-step',
    title: 'Next step',
    description: 'What should happen after this brief is complete?',
    type: 'text',
    placeholder: 'E.g. review with builder, confirm geometry, select components',
    defaultValue: '',
  },
] as const

export const PALETTE_COLOURS: readonly string[] = [
  // Primary brights (task-supplied anchors)
  '#FF8FA7',
  '#FF6BB9',
  '#FF8F5D',
  '#FFD430',
  '#F1FF27',
  '#66FFE1',
  '#C21BFF',
  '#1C08FF',
  // Darks (task-supplied)
  '#0D1213',
  '#0A0608',
  '#181E20',
  // Tonal variants — tints of anchors
  '#FFB8C8',
  '#FF9ED0',
  '#FFB494',
  '#FFE680',
  '#F5FF73',
  '#99FFED',
  '#D966FF',
  '#5C4FFF',
  // Mid-tones and intermediates
  '#E86A8F',
  '#E04DA0',
  '#E87045',
  '#E6B820',
  '#D9E620',
  '#40E6CC',
  '#A600E6',
  '#1500CC',
  // Deep shades
  '#CC607F',
  '#CC4499',
  '#CC6033',
  '#CC9900',
  '#C0CC00',
  '#33CCB3',
  '#8C00CC',
  '#0F0099',
  // Neutral complementaries
  '#2A3033',
  '#332C30',
  '#3A3D33',
  '#4A4035',
  '#3A3530',
  '#2D3338',
  '#343330',
] as const

export interface CardState {
  id: CardId
  value: string
  order: number
}

export function createInitialCards(): CardState[] {
  return CARD_DEFINITIONS.map((def, index) => ({
    id: def.id,
    value: def.defaultValue,
    order: index,
  }))
}

export function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let random = ''
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `SYRE_C4_${random}`
}

export function buildBrief(cards: CardState[], nonce: string): string {
  const ordered = [...cards].sort((a, b) => a.order - b.order)
  const lines: string[] = [
    'SYRE C4 ATELIER — Frame Brief',
    `Nonce: ${nonce}`,
    `Instruction: ${INSTRUCTION_NONCE}`,
    '',
  ]

  for (const card of ordered) {
    const def = CARD_DEFINITIONS.find((d) => d.id === card.id)
    if (!def) continue
    const value = card.value || '(not specified)'
    lines.push(`${def.title}: ${value}`)
  }

  return lines.join('\n')
}

export const SITE_CONTENT = {
  brand: 'ATELIER',
  tagline: 'Hand-laid carbon framesets.',
  chrome: {
    skipLink: 'Skip to the frame brief studio',
    homeLabel: 'ATELIER home',
    footerNote: 'Nothing is sent or stored. This studio runs entirely in your browser.',
    copyright: '© ATELIER',
    backToTop: 'Back to top ↑',
  },
  header: {
    title: 'Frame Brief Studio',
    subtitle: 'A direct-manipulation workbench for shaping your frameset specification.',
  },
  sections: {
    cards: 'Configurator cards',
    preview: 'Live brief and treatment',
  },
  brief: {
    heading: 'Your frame brief',
    copyLabel: 'Copy brief',
    downloadLabel: 'Download brief',
    copiedMessage: 'Brief copied to clipboard.',
    copiedFallback: 'Brief ready — copy from the preview below.',
    downloadFilename: 'atelier-frame-brief.txt',
  },
  treatment: {
    heading: 'Frame treatment',
    note: 'Abstract colour reference — not a manufacturing preview.',
  },
  controls: {
    moveUp: 'Move up',
    moveDown: 'Move down',
    editLabel: 'Edit',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    nonceLabel: 'Verification nonce',
  },
  error: {
    eyebrow: 'ATELIER',
    title: 'The studio lost its thread.',
    body: 'Reload to restart. Nothing was sent or stored.',
    action: 'Reload the page',
  },
} as const
