import { useCallback, useEffect, useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { getDescendantIdsToClear } from '../lib/questionFlow'

const STORAGE_KEY = 'tuibao-assessment-draft-v1'

export type DraftPhase = 'intro' | 'question' | 'review'

export interface DraftState {
  version: 1
  phase: DraftPhase
  questionIndex: number
  answers: Record<string, string>
}

function emptyAnswers(): Record<string, string> {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, '']))
}

function mergeAnswers(
  stored: Record<string, string> | undefined,
): Record<string, string> {
  const base = emptyAnswers()
  if (!stored) return base
  return { ...base, ...stored }
}

export function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftState
    if (parsed?.version !== 1 || typeof parsed.answers !== 'object') return null
    return {
      ...parsed,
      answers: mergeAnswers(parsed.answers),
    }
  } catch {
    return null
  }
}

function saveDraft(state: DraftState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function defaultDraft(): DraftState {
  return {
    version: 1,
    phase: 'intro',
    questionIndex: 0,
    answers: emptyAnswers(),
  }
}

export function hasMeaningfulProgress(d: DraftState | null): boolean {
  if (!d) return false
  if (d.phase !== 'intro') return true
  return Object.values(d.answers).some((v) => v.trim() !== '')
}

export function useDraft() {
  const [draft, setDraft] = useState<DraftState>(() => {
    const saved = loadDraft()
    return saved ?? defaultDraft()
  })

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const setAnswer = useCallback((id: string, value: string) => {
    setDraft((d) => ({
      ...d,
      answers: { ...d.answers, [id]: value },
    }))
  }, [])

  /** 修改答案时自动清空不再满足 showIf 的子题 */
  const setAnswerCascade = useCallback((id: string, value: string) => {
    setDraft((d) => {
      const clears = getDescendantIdsToClear(QUESTIONS, id, value)
      const answers = { ...d.answers, [id]: value }
      for (const cid of clears) {
        answers[cid] = ''
      }
      return { ...d, answers }
    })
  }, [])

  const setPhase = useCallback((phase: DraftPhase) => {
    setDraft((d) => ({ ...d, phase }))
  }, [])

  const setQuestionIndex = useCallback((questionIndex: number) => {
    setDraft((d) => ({ ...d, questionIndex }))
  }, [])

  const resetDraft = useCallback((next: DraftState) => {
    setDraft(next)
    saveDraft(next)
  }, [])

  return {
    draft,
    setAnswer,
    setAnswerCascade,
    setPhase,
    setQuestionIndex,
    resetDraft,
    clearDraft,
  }
}
