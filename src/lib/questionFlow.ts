import type { QuestionItem } from '../types/question'

export function getVisibleQuestions(
  all: QuestionItem[],
  answers: Record<string, string>,
): QuestionItem[] {
  return all.filter((q) => {
    if (!q.showIf) return true
    return answers[q.showIf.parentId] === q.showIf.value
  })
}

/** 父题答案变化时，应清空的子题 id */
export function getDescendantIdsToClear(
  all: QuestionItem[],
  parentId: string,
  newParentValue: string,
): string[] {
  const out: string[] = []
  for (const q of all) {
    if (q.showIf?.parentId === parentId && newParentValue !== q.showIf.value) {
      out.push(q.id)
    }
  }
  return out
}
