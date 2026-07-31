import type { Swatch } from './swatches'
import { SWATCHES, TOTAL_SWATCHES } from './swatches'

// ── Icon names ──
export type IconName = 'endurance' | 'climbing' | 'gravel' | 'road' | 'versatile'

// ── Threadline step types ──
export interface RideIntentOption {
  id: string
  label: string
  description: string
  icon: IconName
}

export interface GeometryPriorityOption {
  id: string
  label: string
  description: string
}

export interface FinishTypeOption {
  id: string
  label: string
  description: string
}

// ── Brief state ──
export interface BriefState {
  rideIntent: string
  rideIntentNotes: string
  geometryPriority: string
  geometryNotes: string
  selectedSwatches: string[] // hex values
  finishType: string
  finishNotes: string
}

export const EMPTY_BRIEF: BriefState = {
  rideIntent: '',
  rideIntentNotes: '',
  geometryPriority: '',
  geometryNotes: '',
  selectedSwatches: [],
  finishType: '',
  finishNotes: '',
}

// ── Options ──
export const RIDE_INTENT_OPTIONS: RideIntentOption[] = [
  { id: 'endurance', label: 'Endurance', description: 'Long days, century rides, all-day comfort over peak speed.', icon: 'endurance' },
  { id: 'climbing', label: 'Climbing', description: 'Mountain ascents, steep grades, lightweight responsiveness.', icon: 'climbing' },
  { id: 'gravel', label: 'Mixed terrain', description: 'Gravel, broken road, paths—stable over varied surfaces.', icon: 'gravel' },
  { id: 'road', label: 'Fast road', description: 'Paced group rides, quick handling, efficient power transfer.', icon: 'road' },
  { id: 'versatile', label: 'All-round', description: 'A single frame for varied riding; balanced priorities.', icon: 'versatile' },
]

export const GEOMETRY_PRIORITY_OPTIONS: GeometryPriorityOption[] = [
  { id: 'sharp', label: 'Sharp handling', description: 'Quick steering response; shorter wheelbase, steeper head angle. Rewards precise input.' },
  { id: 'stable', label: 'Planted stability', description: 'Confidence at speed and in rough corners; longer trail, relaxed front end.' },
  { id: 'balanced', label: 'Balanced', description: 'Neutral handling that does not push toward one extreme; predictable in most conditions.' },
  { id: 'comfort', label: 'Comfort-forward', description: 'Compliance and vibration damping prioritised; slightly relaxed stack/reach.' },
  { id: 'aggressive', label: 'Race position', description: 'Lower stack, longer reach; designed for sustained aero efficiency.' },
]

export const FINISH_TYPE_OPTIONS: FinishTypeOption[] = [
  { id: 'raw', label: 'Raw carbon', description: 'Unpainted UD carbon with a matte clear coat. Shows the layup pattern.' },
  { id: 'hydrodip', label: 'Hydro dip', description: 'Full-coverage pattern transferred via water-immersion film. Endless pattern options.' },
  { id: 'solid', label: 'Solid paint', description: 'Single colour across the frame from the approved swatch palette.' },
  { id: 'custom', label: 'Custom multi-colour', description: 'Multiple colours, gradients, or masked sections. Discuss with the builder.' },
]

// ── Site content ──
export const siteContent = {
  brand: 'SYRE',
  tagline: 'A pursuit of response.',
  chrome: {
    homeLabel: 'SYRE home',
    primaryNavigationLabel: 'Primary navigation',
    mobileNavigationLabel: 'Mobile navigation',
    footerNavigationLabel: 'Footer navigation',
    menuLabel: 'Menu',
    menuTitle: 'SYRE',
    menuCloseLabel: 'Close navigation menu',
    menuNote: 'Close this menu with Escape at any time.',
    headerAction: 'Frame brief',
    mobileAction: 'Start a frame brief',
    skipLink: 'Skip to main content',
    backToTop: 'Back to top',
    copyright: '© SYRE',
  },
  navigation: [
    { label: 'Engineering', href: '#engineering' },
    { label: 'Layup', href: '#layup' },
    { label: 'Finish', href: '#finish' },
    { label: 'FAQ', href: '#faq' },
  ],
  hero: {
    eyebrow: 'Hand-laid carbon frames',
    title: 'A frame shaped by intent.',
    accent: 'Not by catalogue.',
    body: 'SYRE builds one frame at a time: hand-laid unidirectional carbon, tuned to how you ride. No stock geometry. No off-the-shelf compromise.',
    primaryAction: { label: 'Build your frame brief', href: '#brief' },
    secondaryAction: { label: 'Understand the process', href: '#engineering' },
    visualLabels: ['~920 g frame', 'Hand layup'],
    ticker: ['Raw Carbon', 'Hydro Dip', '39 Approved Swatches', 'Hand Layup', 'Unidirectional', 'Made to Order'],
  },
  engineering: {
    eyebrow: 'Engineering',
    title: 'Every ply has a reason.',
    body: 'Our layup schedules put stiffness where you push and compliance where the road talks back. Each frame uses unidirectional pre-preg carbon laid by hand, cured under heat and pressure.',
    details: [
      { label: 'Frame weight', value: 'Approximately 920 g for a size 54 road frame. Weight varies with layup specification and finish.' },
      { label: 'Material', value: 'Unidirectional pre-preg carbon fibre. UD fibres are oriented ply by ply for directional stiffness.' },
      { label: 'Construction', value: 'Hand layup into precision moulds. Each ply is placed, debulked, and inspected before the next.' },
      { label: 'Cure', value: 'Heat and pressure cure in a controlled cycle. Post-cure inspection includes tap test and weight verification.' },
    ],
  },
  layup: {
    eyebrow: 'Layup philosophy',
    title: 'Tuned, not just made.',
    body: 'Layup is not one recipe. The fibre orientation, ply count, and material grade in each zone are chosen to suit your ride intent. An endurance frame gets more ±45° plies in the seat stays for vertical compliance; a climbing frame gets higher-modulus fibres in the down tube for direct power transfer.',
    zones: [
      { zone: 'Down tube / BB shell', priority: 'Torsional stiffness for power transfer. Higher modulus fibres, ±30–45° orientation.' },
      { zone: 'Seat stays', priority: 'Vertical compliance for road chatter. ±45° plies, lower modulus in comfort-oriented layups.' },
      { zone: 'Head tube / front triangle', priority: 'Lateral stiffness for steering precision. Balanced ply schedule with reinforcement at junctions.' },
      { zone: 'Chain stays', priority: 'Direct drive-side transfer. Higher ply count, minimal flex dissipation.' },
    ],
  },
  finish: {
    eyebrow: 'Finish & customisation',
    title: 'Make your own.',
    body: `Choose from ${TOTAL_SWATCHES} approved CMYK-derived colours, applied as solid paint, hydro dip, or left as raw carbon with a matte clear. Multi-colour, masked, and gradient finishes are possible—describe what you want in the brief.`,
    process: [
      { step: 'Surface prep', detail: 'Frames are sanded, cleaned, and primed. Raw carbon gets a UV-stable matte clear coat.' },
      { step: 'Hydro dip', detail: 'A water-immersion film transfers the pattern. After activation and rinse, a clear top coat is applied.' },
      { step: 'Paint', detail: 'Solid or multi-colour paint is applied in controlled coats. Each coat is cured before the next.' },
      { step: 'Clear coat', detail: 'A final UV-stable clear coat protects colour and carbon from sun and abrasion.' },
    ],
    swatches: SWATCHES as readonly Swatch[],
    swatchCount: TOTAL_SWATCHES,
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Straight answers.',
    body: 'Common questions about the frame, the process, and what happens after you send a brief.',
    items: [
      {
        question: 'How long from brief to frame?',
        answer: 'Each frame is made to order. Build time depends on the layup specification and finish complexity. A typical timeline is discussed after the brief is reviewed. No deposit is asked before that conversation.',
      },
      {
        question: 'Can I supply my own geometry?',
        answer: 'Yes. The brief captures your ride intent and geometry priorities. If you have a full geometry chart from a fitter or an existing frame you want matched, include those details in the notes.',
      },
      {
        question: 'What is hydro dip?',
        answer: 'Hydro dipping (water-transfer printing) uses a film printed with the desired pattern. The film floats on water, is activated, and the pattern transfers to the submerged frame. It can produce effects—carbon fibre, camo, marble, geometric patterns—that paint alone cannot.',
      },
      {
        question: 'Why raw carbon as an option?',
        answer: 'Unidirectional carbon has a distinctive visual texture. Some riders prefer the honesty of seeing the material. A UV-stable matte clear coat protects it. Raw carbon is lighter than paint by approximately 20–40 g.',
      },
      {
        question: 'What is a "frame brief"?',
        answer: 'A frame brief is a concise summary of your ride intent, geometry priorities, and finish preferences. It is the starting point for a conversation with the builder. Nothing is ordered or paid through the brief—it is a thinking tool.',
      },
      {
        question: 'Is there a warranty?',
        answer: 'Frame construction is warrantied against manufacturing defects. Specific terms are discussed before an order is placed. The brief captures what you want; the conversation captures the commitment.',
      },
    ],
  },
  contact: {
    href: '',
    label: 'Continue to the approved contact route',
  },
  brief: {
    eyebrow: 'Threadline',
    title: 'Frame brief.',
    body: 'A three-step guided brief. Your answers shape a concise spec for a conversation with the builder. Nothing is sent or stored.',
    privacy: 'Local only — nothing leaves your device.',
    steps: {
      intent: {
        number: 1,
        label: 'Ride intent',
        question: 'How do you plan to ride this frame?',
        notesLabel: 'Anything else the builder should know about your riding?',
        notesPlaceholder: 'Example: weekly mileage, typical terrain, current bike, fit data',
      },
      geometry: {
        number: 2,
        label: 'Response priority',
        question: 'What matters most in how the frame responds?',
        notesLabel: 'Geometry notes, fit numbers, or existing frame reference?',
        notesPlaceholder: 'Example: stack 560, reach 390, or "matches my current 54 cm"',
      },
      finish: {
        number: 3,
        label: 'Finish',
        question: 'Pick colours and finish type.',
        notesLabel: 'Custom finish instructions?',
        notesPlaceholder: 'Example: fade between two colours, masked logo area, custom pattern',
        swatchLabel: `Choose from ${TOTAL_SWATCHES} approved colours`,
        maxSwatches: TOTAL_SWATCHES,
      },
    },
    backLabel: 'Back',
    skipLabel: 'Skip',
    nextLabel: 'Continue',
    generateLabel: 'Generate brief',
    generatingLabel: 'Generating…',
    downloadLabel: 'Download brief',
    copyLabel: 'Copy brief',
  },
  footerLinks: [
    { label: 'Engineering', href: '#engineering' },
    { label: 'Layup', href: '#layup' },
    { label: 'Finish', href: '#finish' },
    { label: 'FAQ', href: '#faq' },
  ],
  error: {
    eyebrow: 'SYRE',
    title: 'The page lost its thread.',
    body: 'Reload to start again. Nothing was sent or stored.',
    action: 'Reload the page',
  },
} as const
