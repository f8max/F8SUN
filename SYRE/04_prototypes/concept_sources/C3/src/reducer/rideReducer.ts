// ── RIDE REPLAY pure reducer — temporal state machine ──
// DEFINE → SHAPE → LAYUP → FINISH → READY
//
// Anti-vacuity:
//  - Every session includes a nonce generated at DEFINE entry.
//  - visitedStates tracks the exact ordered path through the machine.
//  - On READY, the receipt captures nonce + state=ready + visited path.
//  - A tampered reducer (e.g. frozen at LAYUP) is detectable via oracle.
//
// The reducer is a pure function: (RideStateT, RideAction) → RideStateT

import type { RideState } from '../content/rideContent'

// ── Nonce ──
let counter = 0
function generateNonce(): string {
  const base = `SYRE_C3_${Date.now().toString(36)}_${(++counter).toString(36)}`
  let hash = 0
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i)
    hash |= 0
  }
  return `${base}_${Math.abs(hash).toString(16).padStart(8, '0')}`
}

export const NONCE_LENGTH = 20 // minimum expected nonce string length

// ── Choices ──
export interface RideChoices {
  scenario: string       // ride label from DEFINE
  geometry?: string      // shape choice
  layupSchedule?: string // layup choice
  finishTreatment?: string // finish choice
}

// ── Receipt (visible on READY) ──
export interface RideReceipt {
  nonce: string
  state: RideState
  visitedStates: RideState[]
  choices: RideChoices
  timestamp: number
}

// ── Full state ──
export interface RideMachineState {
  state: RideState
  scenario: string
  choices: RideChoices
  visitedStates: RideState[]
  nonce: string
  playing: boolean
  receipt: RideReceipt | null
}

// ── Actions ──
export type RideAction =
  | { type: 'SET_SCENARIO'; scenario: string }
  | { type: 'SET_GEOMETRY'; value: string }
  | { type: 'SET_LAYUP'; value: string }
  | { type: 'SET_FINISH'; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_TO'; state: RideState }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }

// ── State ordering ──
const ORDER: RideState[] = ['define', 'shape', 'layup', 'finish', 'ready']

function stateIndex(s: RideState): number {
  return ORDER.indexOf(s)
}

function stateAtIndex(i: number): RideState {
  if (i < 0) return ORDER[0]
  if (i >= ORDER.length) return ORDER[ORDER.length - 1]
  return ORDER[i]
}

// ── Initial state ──
export function createInitialState(): RideMachineState {
  const nonce = generateNonce()
  return {
    state: 'define',
    scenario: '',
    choices: { scenario: '' },
    visitedStates: ['define'],
    nonce,
    playing: false,
    receipt: null,
  }
}

// ── Build receipt on READY ──
function buildReceipt(state: RideMachineState): RideReceipt {
  return {
    nonce: state.nonce,
    state: 'ready',
    visitedStates: [...state.visitedStates],
    choices: { ...state.choices },
    timestamp: Date.now(),
  }
}

// ── Pure reducer ──
export function rideReducer(state: RideMachineState, action: RideAction): RideMachineState {
  switch (action.type) {

    // ── Data actions (state-agnostic) ──
    case 'SET_SCENARIO': {
      const scenario = action.scenario.slice(0, 120)
      return {
        ...state,
        scenario,
        choices: { ...state.choices, scenario },
      }
    }

    case 'SET_GEOMETRY':
      return { ...state, choices: { ...state.choices, geometry: action.value } }

    case 'SET_LAYUP':
      return { ...state, choices: { ...state.choices, layupSchedule: action.value } }

    case 'SET_FINISH':
      return { ...state, choices: { ...state.choices, finishTreatment: action.value } }

    // ── Navigation ──
    case 'NEXT': {
      if (state.state === 'ready') return state

      // Gate: scenario required to leave DEFINE
      if (state.state === 'define' && !state.scenario.trim()) return state

      const nextIndex = stateIndex(state.state) + 1
      const nextState: RideState = stateAtIndex(nextIndex) as RideState
      const visited = nextState === state.state
        ? state.visitedStates
        : [...state.visitedStates, nextState]

      const advanced: RideMachineState = {
        ...state,
        state: nextState,
        visitedStates: visited,
        playing: nextState === 'ready' ? false : state.playing,
        receipt: nextState === 'ready' ? buildReceipt({ ...state, state: nextState, visitedStates: visited }) : state.receipt,
      }
      return advanced
    }

    case 'BACK': {
      if (state.state === 'define') return state
      const prevIndex = stateIndex(state.state) - 1
      const prevState: RideState = stateAtIndex(prevIndex) as RideState
      const visited = [...state.visitedStates, prevState]

      return {
        ...state,
        state: prevState,
        visitedStates: visited,
        receipt: null,
      }
    }

    case 'GO_TO': {
      const target = action.state
      const currentIdx = stateIndex(state.state)
      const targetIdx = stateIndex(target)

      if (target === state.state) return state

      // Can only jump to states we've visited or forward one at a time
      const allowed = targetIdx <= currentIdx + 1
      if (!allowed) return state

      // Gate: scenario required to advance past DEFINE
      if (targetIdx > 0 && !state.scenario.trim()) return state

      const visited = targetIdx > currentIdx
        ? [...state.visitedStates, target]
        : [...state.visitedStates, target]

      return {
        ...state,
        state: target,
        visitedStates: visited,
        playing: target === 'ready' ? false : state.playing,
        receipt: target === 'ready' ? buildReceipt({ ...state, state: target, visitedStates: visited }) : state.receipt,
      }
    }

    // ── Playback ──
    case 'PLAY':
      return { ...state, playing: true }

    case 'PAUSE':
      return { ...state, playing: false }

    // ── Reset ──
    case 'RESET':
      return createInitialState()

    default:
      return state
  }
}

// ── Oracle — verifies receipt integrity ──
export interface OracleVerdict {
  pass: boolean
  reasons: string[]
}

export function verifyReceipt(receipt: RideReceipt): OracleVerdict {
  const reasons: string[] = []

  if (!receipt.nonce || receipt.nonce.length < NONCE_LENGTH) {
    reasons.push('Invalid or missing nonce')
  }
  if (receipt.state !== 'ready') {
    reasons.push(`Expected state=ready, got state=${receipt.state}`)
  }
  if (!receipt.visitedStates || receipt.visitedStates.length < 1) {
    reasons.push('No visited states recorded')
  }
  if (!receipt.visitedStates.includes('ready')) {
    reasons.push('READY not found in visited states')
  }
  if (!receipt.choices?.scenario) {
    reasons.push('No scenario label recorded')
  }
  if (receipt.timestamp <= 0) {
    reasons.push('Invalid timestamp')
  }

  return { pass: reasons.length === 0, reasons }
}

// ── Oracle variant that validates full machine state ──
export function verifyMachineState(ms: RideMachineState): OracleVerdict {
  const reasons: string[] = []

  if (!ms.nonce || ms.nonce.length < NONCE_LENGTH) {
    reasons.push('Invalid or missing nonce in machine state')
  }
  if (ms.visitedStates.length < 1) {
    reasons.push('No visited states in machine state')
  }
  if (ms.visitedStates[0] !== 'define') {
    reasons.push('First visited state must be DEFINE')
  }
  if (!ms.choices?.scenario && ms.state !== 'define') {
    reasons.push('Scenario missing but state advanced past DEFINE')
  }

  if (ms.state === 'ready') {
    if (!ms.receipt) {
      reasons.push('State is READY but no receipt generated')
    } else {
      return verifyReceipt(ms.receipt)
    }
  }

  return { pass: reasons.length === 0, reasons }
}
