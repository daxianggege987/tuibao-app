import type { QuestionItem } from '../types/question'

export function validateAnswer(
  q: QuestionItem,
  raw: string,
): string | null {
  const v = raw.trim()
  if (q.isRequired && !v) {
    return '请完成此题'
  }
  if (!v) return null

  if (q.inputType === 'singleSearch' && q.options?.length) {
    if (!q.options.includes(v)) {
      return '请从下方列表中点选一项'
    }
  }

  if (q.inputType === 'number') {
    if (q.integerOnly) {
      if (!/^\d+$/.test(v)) return '请填写非负整数'
    } else {
      if (!/^\d+(\.\d{1,2})?$/.test(v)) {
        return '请填写有效金额（数字，最多两位小数）'
      }
    }
  }

  return null
}
