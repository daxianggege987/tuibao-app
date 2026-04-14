/**
 * 已提交评估的本地记录（仅存设备，不上传）。
 * 用于满足「持久化、可回顾」类原生体验，并便于审核说明。
 */

import type { SubmissionOutcome } from './submissionEvaluation'
import { formatCurrencyYuan } from './submissionEvaluation'

const STORAGE_KEY = 'tuibao-assessment-history-v1'
const MAX_RECORDS = 40

export interface AssessmentRecord {
  id: string
  submittedAt: string
  eligible: boolean
  estimatedRefund: number | null
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadAssessmentHistory(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: AssessmentRecord[] = []
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as AssessmentRecord).id === 'string' &&
        typeof (item as AssessmentRecord).submittedAt === 'string' &&
        typeof (item as AssessmentRecord).eligible === 'boolean'
      ) {
        const est = (item as AssessmentRecord).estimatedRefund
        out.push({
          id: (item as AssessmentRecord).id,
          submittedAt: (item as AssessmentRecord).submittedAt,
          eligible: (item as AssessmentRecord).eligible,
          estimatedRefund:
            est == null || typeof est === 'number' ? est : null,
        })
      }
    }
    return out
  } catch {
    return []
  }
}

function saveHistory(list: AssessmentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* quota */
  }
}

export function appendAssessmentRecord(outcome: SubmissionOutcome): AssessmentRecord {
  const record: AssessmentRecord = {
    id: newId(),
    submittedAt: new Date().toISOString(),
    eligible: outcome.eligible,
    estimatedRefund: outcome.estimatedRefund,
  }
  const prev = loadAssessmentHistory()
  const next = [record, ...prev].slice(0, MAX_RECORDS)
  saveHistory(next)
  return record
}

export function removeAssessmentRecord(id: string): void {
  const next = loadAssessmentHistory().filter((r) => r.id !== id)
  saveHistory(next)
}

export function clearAssessmentHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function formatRecordSummary(r: AssessmentRecord): string {
  if (!r.eligible) return '不符合当前评估条件'
  if (r.estimatedRefund != null) {
    return `可申请退保 · 约 ${formatCurrencyYuan(r.estimatedRefund)} 元`
  }
  return '可申请退保（金额需补充资料后估算）'
}
