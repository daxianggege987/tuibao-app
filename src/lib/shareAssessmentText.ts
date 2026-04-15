import { DISCLAIMER_SHORT } from '../constants/copy'
import type { SubmissionOutcome } from './submissionEvaluation'
import { formatCurrencyYuan } from './submissionEvaluation'

/** 供系统分享Sheet使用的纯文本摘要（不含完整问卷答案，降低隐私风险） */
export function buildAssessmentShareText(outcome: SubmissionOutcome): string {
  const lines: string[] = ['【退保评估】摘要', '']

  if (outcome.eligible) {
    if (outcome.estimatedRefund != null) {
      lines.push(
        `初步结论：可申请退保。预估退保金额约 ${formatCurrencyYuan(outcome.estimatedRefund)} 元（仅供参考）。`,
      )
    } else {
      lines.push(
        '初步结论：可申请退保。因交费信息不完整，金额需补充资料后估算（仅供参考）。',
      )
    }
  } else {
    lines.push('初步结论：按当前保全与理赔信息，不符合本次评估中的退保办理条件。')
  }

  lines.push('', `— ${DISCLAIMER_SHORT}`)
  return lines.join('\n')
}

/** 返回 shared=已调起分享；copied=已复制；cancelled=用户取消分享 */
export async function shareAssessmentText(
  text: string,
  title = '退保评估摘要',
): Promise<'shared' | 'copied' | 'cancelled'> {
  const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title, text })
      return 'shared'
    } catch (e) {
      const name = e instanceof Error ? e.name : ''
      if (name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'copied'
  }
}
