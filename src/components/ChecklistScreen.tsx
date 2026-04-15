import { useState, useCallback } from 'react'
import { SURRENDER_CHECKLIST, loadCheckedIds, saveCheckedIds } from '../data/checklistItems'
import { impactLight } from '../lib/nativeFeedback'

type Props = { onBack: () => void }

export function ChecklistScreen({ onBack }: Props) {
  const [checked, setChecked] = useState<string[]>(() => loadCheckedIds())

  const toggle = useCallback((id: string) => {
    void impactLight()
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveCheckedIds(next)
      return next
    })
  }, [])

  const resetAll = () => {
    if (!window.confirm('将清除全部已勾选项，是否继续？')) return
    setChecked([])
    saveCheckedIds([])
  }

  const total = SURRENDER_CHECKLIST.length
  const done = checked.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="screen checklist-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">退保材料清单</h1>
        <p className="body-text small">逐项准备退保所需材料，准备就绪后前往保险公司办理。</p>
      </header>

      <div className="checklist-progress">
        <div className="checklist-progress-bar">
          <div className="checklist-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="checklist-progress-text">{done} / {total} 已准备</span>
      </div>

      <ul className="checklist-items">
        {SURRENDER_CHECKLIST.map((item) => {
          const isChecked = checked.includes(item.id)
          return (
            <li key={item.id} className={`checklist-item${isChecked ? ' checked' : ''}`}>
              <button type="button" className="checklist-toggle" onClick={() => toggle(item.id)}>
                <span className={`checklist-box${isChecked ? ' done' : ''}`} aria-hidden>
                  {isChecked ? '✓' : ''}
                </span>
                <span className="checklist-label-group">
                  <span className="checklist-label">{item.label}</span>
                  {item.hint ? <span className="checklist-hint">{item.hint}</span> : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {done > 0 ? (
        <button type="button" className="btn secondary wide" onClick={resetAll}>
          重置清单
        </button>
      ) : null}

      <p className="body-text small muted-block">
        不同保险公司要求可能有所差异，办理前建议致电客服确认。
      </p>
    </div>
  )
}
