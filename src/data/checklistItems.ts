export interface ChecklistItem {
  id: string
  label: string
  hint?: string
}

export const SURRENDER_CHECKLIST: ChecklistItem[] = [
  { id: 'id-card', label: '投保人身份证原件及复印件', hint: '需在有效期内' },
  { id: 'policy-contract', label: '保险合同原件', hint: '如遗失，需先联系保险公司补办或出具遗失声明' },
  { id: 'bank-card', label: '投保人本人银行卡', hint: '用于接收退保金' },
  { id: 'surrender-form', label: '退保申请书', hint: '到保险公司柜台领取，或从官网下载模板' },
  { id: 'premium-receipt', label: '最近一次保费缴纳凭证', hint: '部分公司可能要求' },
  { id: 'call-confirm', label: '致电保险公司确认退保要求', hint: '提前确认所需材料和流程，避免白跑' },
  { id: 'cash-value-check', label: '查询当前保单现金价值', hint: '通过客服热线或保险公司 App 查询' },
  { id: 'evidence-collect', label: '整理相关证据材料（如有）', hint: '聊天记录、录音、宣传资料等，用于申诉时参考' },
]

const STORAGE_KEY = 'tuibao-checklist-v1'

export function loadCheckedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function saveCheckedIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* quota */ }
}
