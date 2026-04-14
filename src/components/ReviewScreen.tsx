import { useMemo, useState } from 'react'
import type { QuestionItem } from '../types/question'
import { DISCLAIMER_REVIEW, GROUP_LABELS } from '../constants/copy'

type Props = {
  questions: QuestionItem[]
  answers: Record<string, string>
  onEdit: (index: number) => void
  onSubmit: () => void
  onBack: () => void
}

export function ReviewScreen({
  questions,
  answers,
  onEdit,
  onSubmit,
  onBack,
}: Props) {
  const [accepted, setAccepted] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, QuestionItem[]>()
    for (const q of questions) {
      const list = map.get(q.group) ?? []
      list.push(q)
      map.set(q.group, list)
    }
    return map
  }, [questions])

  const order = useMemo(() => {
    const seen = new Set<string>()
    const g: string[] = []
    for (const q of questions) {
      if (!seen.has(q.group)) {
        seen.add(q.group)
        g.push(q.group)
      }
    }
    return g
  }, [questions])

  return (
    <div className="screen review-screen">
      <header className="screen-header">
        <h1 className="title">审阅与提交</h1>
        <p className="body-text">请核对各题填写，可点击条目返回修改。</p>
      </header>

      <div className="review-groups">
        {order.map((group) => {
          const items = grouped.get(group) ?? []
          return (
            <section key={group} className="review-group">
              <h2 className="review-group-title">
                {GROUP_LABELS[group] ?? group}
              </h2>
              <ul className="review-list">
                {items.map((q) => {
                  const idx = questions.findIndex((x) => x.id === q.id)
                  const text = (answers[q.id] ?? '').trim() || '（未填写）'
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        className="review-item"
                        onClick={() => onEdit(idx)}
                      >
                        <span className="review-q">{q.promptText}</span>
                        <span className="review-a">{text}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span>{DISCLAIMER_REVIEW}</span>
      </label>

      <nav className="nav-row" aria-label="审阅导航">
        <button type="button" className="btn secondary" onClick={onBack}>
          返回修改
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={onSubmit}
          disabled={!accepted}
        >
          提交评估
        </button>
      </nav>
    </div>
  )
}
