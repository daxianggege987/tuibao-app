export interface SurrenderStep {
  id: string
  title: string
  description: string
  duration?: string
}

export const SURRENDER_STEPS: SurrenderStep[] = [
  {
    id: 'understand',
    title: '了解保单状态',
    description: '拨打保险公司客服热线，确认保单是否在有效期内，查询当前现金价值，了解退保需要准备的材料。',
    duration: '约 1 天',
  },
  {
    id: 'prepare',
    title: '准备退保材料',
    description: '准备身份证、保险合同、银行卡等必要材料。如保单遗失需先补办。可在「材料清单」中逐项核对。',
    duration: '1～3 天',
  },
  {
    id: 'submit',
    title: '提交退保申请',
    description: '前往保险公司营业网点柜台或通过官方 App、在线客服提交退保申请，签署退保申请书。',
    duration: '约 1 天',
  },
  {
    id: 'review',
    title: '保险公司审核',
    description: '保险公司收到申请后进行审核，可能电话核实身份与退保意愿。',
    duration: '3～10 个工作日',
  },
  {
    id: 'refund',
    title: '退保金到账',
    description: '审核通过后，退保金（现金价值）退至指定银行账户。注意核对到账金额。',
    duration: '3～5 个工作日',
  },
]

const TRACKER_KEY = 'tuibao-progress-v1'

export function loadProgress(): string | null {
  try {
    return localStorage.getItem(TRACKER_KEY)
  } catch {
    return null
  }
}

export function saveProgress(stepId: string | null): void {
  try {
    if (stepId === null) {
      localStorage.removeItem(TRACKER_KEY)
    } else {
      localStorage.setItem(TRACKER_KEY, stepId)
    }
  } catch { /* quota */ }
}
