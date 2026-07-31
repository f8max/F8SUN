// ── RIDE REPLAY state machine content ──
// Boutique hand-laid carbon bicycle-frame brand.

export const palette = {
  accents: {
    pink:       '#FF8FA7',
    magenta:    '#FF6BB9',
    coral:      '#FF8F5D',
    gold:       '#FFD430',
    neon:       '#F1FF27',
    aqua:       '#66FFE1',
    violet:     '#C21BFF',
    blue:       '#1C08FF',
  },
  darks: {
    primary:    '#0D1213',
    deepest:    '#0A0608',
    steel:      '#181E20',
  },
} as const

export const brand = {
  name: 'SYRE',
  tagline: 'Hand-laid. Purpose-built.',
  weightApprox: '≈920 g',
  construction: 'Hand layup — unidirectional and 3K twill carbon plies',
  finish: 'Hydro-dip with masked paint reveal; raw carbon exposed',
  customisation: 'Geometry, layup schedule, and finish treatment across defined stages',
} as const

export type RideState = 'define' | 'shape' | 'layup' | 'finish' | 'ready'

export interface StateContent {
  state: RideState
  number: string
  title: string
  heading: string
  description: string
  accent: string           // hex from palette.accents
  prompt: string           // question or instruction
  choices?: readonly { value: string; label: string; context: string }[]
  annotations: readonly { summary: string; detail: string }[]
  outcome?: string         // used in READY to describe the built configuration
}

export const rideContent: Record<RideState, StateContent> = {
  define: {
    state: 'define',
    number: '01',
    title: 'Define',
    heading: 'What ride are you building for?',
    description:
      'Name the ride or scenario. This label will travel through every decision that follows — an illustrative design journey, not a performance simulation.',
    accent: palette.accents.coral,
    prompt: 'Ride label — a neutral name or scenario',
    annotations: [
      { summary: 'What does the label do?', detail: 'The label anchors your design journey. It appears in every stage as a reminder of the riding context you are building toward. No performance claims are attached to it.' },
      { summary: 'Why no riding style selector?', detail: 'SYRE frames are built to your explicit geometry, layup, and finish choices — not to a pre-baked category. The label helps you stay oriented; the decisions define the frame.' },
    ],
  },
  shape: {
    state: 'shape',
    number: '02',
    title: 'Shape',
    heading: 'Choose the geometry profile.',
    description:
      'Frame shape determines how the ride feels under you. Each profile is a starting point that you refine in layup.',
    accent: palette.accents.gold,
    prompt: 'Select a geometry profile',
    choices: [
      { value: 'endurance',  label: 'Endurance',  context: 'Longer wheelbase, relaxed head angle,  stack-forward position for long days in the saddle.' },
      { value: 'race',       label: 'Race',       context: 'Shorter wheelbase, aggressive drop, responsive front-end for quick direction changes.' },
      { value: 'all-road',   label: 'All-Road',   context: 'Balanced geometry with clearance for wider tyres; stable on pavement and light gravel alike.' },
    ],
    annotations: [
      { summary: 'Does geometry affect weight?', detail: 'Geometry primarily affects fit and handling. The layup stage (next) determines the final weight and ride quality within your chosen profile.' },
      { summary: 'What does the ≈920 g figure refer to?', detail: 'A size-medium road disc frame in raw carbon before paint. Actual finished weight depends on layup, size, and finish choices.' },
    ],
  },
  layup: {
    state: 'layup',
    number: '03',
    title: 'Layup',
    heading: 'Specify the carbon layup schedule.',
    description:
      'Hand-laid unidirectional and 3K twill carbon. The layup schedule balances stiffness, comfort, and weight for your riding conditions.',
    accent: palette.accents.aqua,
    prompt: 'Select a layup schedule',
    choices: [
      { value: 'standard',   label: 'Standard',   context: 'Balanced layup — a confident mix of unidirectional and twill plies for dependable all-round ride quality.' },
      { value: 'lightweight',label: 'Lightweight', context: 'Optimised ply count and orientation to reduce frame weight. Expect a more direct road feel.' },
      { value: 'endurance+', label: 'Endurance+', context: 'Additional compliance layers in the seat cluster and chainstay junction for reduced fatigue on long rides.' },
    ],
    annotations: [
      { summary: 'What carbon is used?', detail: 'Hand-laid unidirectional and 3K twill carbon plies, selected for directional strength and surface character. No intermediate-modulus or exotic-fibre claims are made.' },
      { summary: 'How much does layup affect weight?', detail: 'Lightweight versus Standard can shift frame weight by approximately 60–100 g in a medium size. Endurance+ adds minimal mass for targeted compliance.' },
    ],
  },
  finish: {
    state: 'finish',
    number: '04',
    title: 'Finish',
    heading: 'Choose the finish treatment.',
    description:
      'Hydro-dip and masked paint application let you reveal raw carbon where it counts. The 39-colour CMYK-derived palette covers the gamut.',
    accent: palette.accents.pink,
    prompt: 'Select a finish approach',
    choices: [
      { value: 'raw',        label: 'Raw Carbon',  context: 'Clear coat over raw 3K twill. The layup speaks for itself.' },
      { value: 'masked',     label: 'Masked Paint',context: 'Paint applied in controlled panels, revealing carbon weave along the downtube, chainstays, or fork.' },
      { value: 'full-dip',   label: 'Full Hydro-Dip', context: 'Complete hydro-dip coverage in a single colour from the palette, with raw carbon accents at the dropouts.' },
    ],
    annotations: [
      { summary: 'What is hydro-dip?', detail: 'A water-transfer printing process that applies a continuous film to the frame surface. It is followed by a clear coat for durability.' },
      { summary: 'How many colours are available?', detail: 'A 39-colour CMYK-derived palette. The vivid accent range starts from process primaries and extends into neon, aqua, violet, and deep blue territory.' },
      { summary: 'Does paint add weight?', detail: 'A full hydro-dip finish adds approximately 30–50 g over raw clear coat. Masked paint sits between the two.' },
    ],
  },
  ready: {
    state: 'ready',
    number: '05',
    title: 'Ready',
    heading: 'Your configuration is complete.',
    description:
      'This is an illustrative design journey, not an order form. The receipt below captures every choice made — a traceable record of your path through the configurator.',
    accent: palette.accents.violet,
    prompt: '',
    annotations: [
      { summary: 'Is this frame available to order?', detail: 'This is a concept design journey. No price, lead time, or availability is attached. The receipt is a record, not a purchase confirmation.' },
      { summary: 'What does the receipt contain?', detail: 'A unique session nonce, the READY state marker, and the complete sequence of states you visited. It is verifiable by any observer that the path was honoured.' },
    ],
  },
} as const

export interface ChromeContent {
  homeLabel: string
  primaryNavigationLabel: string
  skipLink: string
  backToTop: string
  copyright: string
  menuLabel: string
  menuTitle: string
  menuCloseLabel: string
  mobileNavigationLabel: string
  menuNote: string
  footerNavigationLabel: string
  replayLabel: string
  noScript: string
}

export const chrome: ChromeContent = {
  homeLabel: 'SYRE home',
  primaryNavigationLabel: 'Primary navigation',
  skipLink: 'Skip to ride replay',
  backToTop: 'Back to top ↑',
  copyright: '© SYRE',
  menuLabel: 'Menu',
  menuTitle: 'Navigate SYRE',
  menuCloseLabel: 'Close navigation menu',
  mobileNavigationLabel: 'Mobile navigation',
  menuNote: 'Close this menu with Escape at any time.',
  footerNavigationLabel: 'Footer navigation',
  replayLabel: 'RIDE REPLAY — temporal design journey',
  noScript: 'SYRE needs JavaScript to present the ride replay configurator. No information is sent or stored.',
}
