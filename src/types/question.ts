export type QuestionGroup =
  | 'policy'
  | 'payment'
  | 'compliance'
  | 'agent'
  | 'contract'
  | 'extra'

/** 是/否类单选 */
export const YES_NO = ['是', '否'] as const

export type QuestionInputType =
  | 'single'
  | 'singleSearch'
  | 'number'
  | 'textarea'

export interface ShowIf {
  parentId: string
  value: string
}

export interface QuestionItem {
  id: string
  group: QuestionGroup
  promptText: string
  isRequired: boolean
  inputType: QuestionInputType
  /** 单选选项（single / singleSearch） */
  options?: string[]
  showIf?: ShowIf
  /** 数字/文本占位提示 */
  placeholder?: string
  /** 数字题后缀，如 年、元 */
  unit?: string
  inputMode?: 'numeric' | 'decimal' | 'text'
  /** 数字题是否仅允许整数（如交费年限） */
  integerOnly?: boolean
}
