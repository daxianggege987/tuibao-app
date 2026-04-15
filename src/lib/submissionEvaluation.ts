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

export interface AnalysisFactor {
  label: string
  value: string
  favorable: boolean | null
  note: string
}

export interface SubmissionOutcome {
  eligible: boolean
  estimatedRefund: number | null
  factors: AnalysisFactor[]
  favorableCount: number
  totalFactors: number
}

function analyzeFactor(
  label: string,
  value: string,
  favorableWhen: string,
  favorableNote: string,
  unfavorableNote: string,
): AnalysisFactor {
  const trimmed = value.trim()
  if (!trimmed) return { label, value: '未填写', favorable: null, note: '信息不完整，无法判断' }
  const favorable = trimmed === favorableWhen
  return { label, value: trimmed, favorable, note: favorable ? favorableNote : unfavorableNote }
}

function buildFactors(answers: Record<string, string>): AnalysisFactor[] {
  const factors: AnalysisFactor[] = []

  factors.push(analyzeFactor(
    '保单签名', answers.signature_self ?? '', '否',
    '非本人签名，可能构成合同瑕疵，有利于申诉',
    '本人签名，合同签署规范',
  ))
  factors.push(analyzeFactor(
    '风险告知抄写', answers.copied_passage ?? '', '否',
    '未抄写风险提示，投保流程可能不规范',
    '已抄写风险提示，投保流程较规范',
  ))
  factors.push(analyzeFactor(
    '个人信息准确性', answers.info_wrong ?? '', '是',
    '信息录入有误，可能影响合同效力',
    '信息录入准确，合同信息无误',
  ))
  factors.push(analyzeFactor(
    '业务员返佣/送礼', answers.agent_gifts ?? '', '是',
    '存在返佣或赠礼行为，违反行业规范',
    '无返佣或赠礼行为',
  ))
  factors.push(analyzeFactor(
    '回访电话', answers.callback_received ?? '', '否',
    '未接到回访电话，保险公司可能存在程序缺失',
    '已接到回访电话，程序完整',
  ))
  factors.push(analyzeFactor(
    '保险合同', answers.contract_kept ?? '', '是',
    '合同在手，办理退保更方便',
    '合同遗失，需先补办',
  ))

  const survivalVal = answers.survival_benefit?.trim() ?? ''
  factors.push({
    label: '生存金领取',
    value: survivalVal || '未填写',
    favorable: survivalVal === '否' ? true : survivalVal === '是' ? false : null,
    note: survivalVal === '否' ? '未领取生存金，不影响退保' : survivalVal === '是' ? '已领取生存金，可能影响退保办理' : '信息不完整',
  })

  const claimVal = answers.claim_incident?.trim() ?? ''
  factors.push({
    label: '出险理赔',
    value: claimVal || '未填写',
    favorable: claimVal === '否' ? true : claimVal === '是' ? false : null,
    note: claimVal === '否' ? '未出险理赔，不影响退保' : claimVal === '是' ? '已出险理赔，可能无法全额退保' : '信息不完整',
  })

  const loanVal = answers.policy_loan?.trim() ?? ''
  factors.push({
    label: '保单贷款',
    value: loanVal || '未填写',
    favorable: loanVal === '否' ? true : loanVal === '是' ? false : null,
    note: loanVal === '否' ? '无保单贷款，不影响退保' : loanVal === '是' ? '存在保单贷款，可能影响退保办理' : '信息不完整',
  })

  return factors
}

export function evaluateSubmission(
  answers: Record<string, string>,
): SubmissionOutcome {
  const factors = buildFactors(answers)
  const favorableCount = factors.filter((f) => f.favorable === true).length
  const totalFactors = factors.filter((f) => f.favorable !== null).length

  const anyYes = EXTRA_IDS.some((id) => answers[id]?.trim() === '是')
  if (anyYes) {
    return { eligible: false, estimatedRefund: null, factors, favorableCount, totalFactors }
  }

  const years = parseFloat(answers.payment_years ?? '')
  const annual = parseFloat(answers.payment_annual ?? '')
  if (!Number.isFinite(years) || !Number.isFinite(annual)) {
    return { eligible: true, estimatedRefund: null, factors, favorableCount, totalFactors }
  }

  const raw = years * annual * 0.7
  const estimatedRefund = Math.round(raw * 100) / 100
  return { eligible: true, estimatedRefund, factors, favorableCount, totalFactors }
}

export function formatCurrencyYuan(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
