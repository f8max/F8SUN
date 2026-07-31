import { useCallback, useMemo, useState } from 'react'
import {
  type BriefState,
  EMPTY_BRIEF,
} from '../content/siteContent'

export type ThreadlineStep = 1 | 2 | 3

export function useThreadline() {
  const [step, setStep] = useState<ThreadlineStep>(1)
  const [brief, setBrief] = useState<BriefState>(() => ({ ...EMPTY_BRIEF }))
  const [lastInteraction, setLastInteraction] = useState<string>('')

  const stepProgress = useMemo(() => ({
    current: step,
    total: 3 as const,
    label: `Step ${step} of 3`,
    percent: Math.round((step / 3) * 100),
  }), [step])

  const updateBrief = useCallback((patch: Partial<BriefState>) => {
    setBrief((prev) => ({ ...prev, ...patch }))
    setLastInteraction(`updated ${Object.keys(patch).join(', ')} at ${new Date().toISOString()}`)
  }, [])

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 3) as ThreadlineStep)
  }, [])

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1) as ThreadlineStep)
  }, [])

  const resetBrief = useCallback(() => {
    setBrief({ ...EMPTY_BRIEF })
    setStep(1)
    setLastInteraction(`reset at ${new Date().toISOString()}`)
  }, [])

  const generateBriefText = useCallback((nonce?: string): string => {
    const lines = [
      'SYRE FRAME BRIEF',
      '=================',
      '',
      `Generated: ${new Date().toISOString()}`,
      ...(nonce ? [`Nonce: ${nonce}`] : []),
      '',
      'RIDE INTENT',
      '-----------',
      `Selection: ${brief.rideIntent || '(skipped)'}`,
      ...(brief.rideIntentNotes ? [`Notes: ${brief.rideIntentNotes}`] : []),
      '',
      'RESPONSE / GEOMETRY PRIORITY',
      '----------------------------',
      `Selection: ${brief.geometryPriority || '(skipped)'}`,
      ...(brief.geometryNotes ? [`Notes: ${brief.geometryNotes}`] : []),
      '',
      'FINISH / CUSTOMISATION',
      '----------------------',
      `Type: ${brief.finishType || '(skipped)'}`,
      `Colours: ${brief.selectedSwatches.length > 0 ? brief.selectedSwatches.map((h) => h.toUpperCase()).join(', ') : '(none selected)'}`,
      ...(brief.finishNotes ? [`Notes: ${brief.finishNotes}`] : []),
      '',
      '───',
      'Local only. Nothing was sent or stored.',
      'Take this to your first builder conversation.',
    ]
    return lines.join('\n')
  }, [brief])

  const isStepComplete = useCallback((s: ThreadlineStep): boolean => {
    switch (s) {
      case 1:
        return brief.rideIntent !== ''
      case 2:
        return brief.geometryPriority !== ''
      case 3:
        return true // finish is never required
    }
  }, [brief])

  return {
    step,
    brief,
    stepProgress,
    lastInteraction,
    updateBrief,
    goNext,
    goBack,
    resetBrief,
    generateBriefText,
    isStepComplete,
  }
}
