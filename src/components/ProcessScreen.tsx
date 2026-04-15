import { useState } from 'react'
import { SURRENDER_STEPS, loadProgress, saveProgress } from '../data/surrenderSteps'
import { impactLight } from '../lib/nativeFeedback'

type Props = { onBack: () => void }

export function ProcessScreen({ onBack }: Props) {
  const [currentStepId, setCurrentStepId] = useState<string | null>(() => loadProgress())

  const currentIdx = currentStepId
    ? SURRENDER_STEPS.findIndex((s) => s.id === currentStepId)
    : -1

  const markStep = (stepId: string) => {
    void impactLight()
    const next = currentStepId === stepId ? null : stepId
    setCurrentStepId(next)
    saveProgress(next)
  }

  const resetProgress = () => {
    if (!window.confirm('将重置退保进度，是否继续？')) return
    setCurrentStepId(null)
    saveProgress(null)
  }

  return (
    <div className="screen process-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">退保流程与进度</h1>
        <p className="body-text small">了解标准退保步骤，点击标记您当前所在阶段。</p>
      </header>

      <ol className="process-timeline">
        {SURRENDER_STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStepId
          const isPast = currentIdx >= 0 && idx < currentIdx
          const statusClass = isCurrent ? ' current' : isPast ? ' past' : ''
          return (
            <li key={step.id} className={`process-step${statusClass}`}>
              <button type="button" className="process-step-btn" onClick={() => markStep(step.id)}>
                <span className="process-step-indicator">
                  {isPast ? '✓' : isCurrent ? '●' : (idx + 1)}
                </span>
                <div className="process-step-content">
                  <p className="process-step-title">{step.title}</p>
                  <p className="process-step-desc">{step.description}</p>
                  {step.duration ? (
                    <span className="process-step-duration">预计：{step.duration}</span>
                  ) : null}
                </div>
              </button>
            </li>
          )
        })}
      </ol>

      {currentStepId ? (
        <button type="button" className="btn secondary wide" onClick={resetProgress}>
          重置进度
        </button>
      ) : null}

      <p className="body-text small muted-block">
        以上为一般流程参考，不同保险公司可能有所差异。点击任一步骤标记为「当前进度」。
      </p>
    </div>
  )
}
