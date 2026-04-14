/**
 * 提交后评估规则（可原样迁移到服务端）。
 * 保全与理赔 3 题任一为「是」→ 不可办理退保；全部为「否」→ 可申请退保，
 * 预估退保金额 = 年交费金额 × 交费年限 × 70%
 */

const EXTRA_IDS = [
  'survival_benefit',
  'claim_incident',
  'policy_loan',
] as const

export interface SubmissionOutcome {
  /** 是否可申请退保（三题全为「否」） */
  eligible: boolean
  /** 预估退保金额（元），不可办理或无法计算时为 null */
  estimatedRefund: number | null
}

export function evaluateSubmission(
  answers: Record<string, string>,
): SubmissionOutcome {
  const anyYes = EXTRA_IDS.some((id) => answers[id]?.trim() === '是')
  if (anyYes) {
    return { eligible: false, estimatedRefund: null }
  }

  const years = parseFloat(answers.payment_years ?? '')
  const annual = parseFloat(answers.payment_annual ?? '')
  if (!Number.isFinite(years) || !Number.isFinite(annual)) {
    return { eligible: true, estimatedRefund: null }
  }

  const raw = years * annual * 0.7
  const estimatedRefund = Math.round(raw * 100) / 100
  return { eligible: true, estimatedRefund }
}

export function formatCurrencyYuan(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
