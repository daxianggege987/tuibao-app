import {
  DISCLAIMER_SHORT,
  INTRO_BODY,
  INTRO_STEPS,
  INTRO_TITLE,
  PRIVACY_HINT,
} from '../constants/copy'

type Props = {
  onStart: () => void
  showPurchasedEntry?: boolean
  onOpenGuide?: () => void
  onOpenSettings: () => void
  onOpenHistory?: () => void
  historyCount?: number
}

export function IntroScreen({
  onStart,
  showPurchasedEntry,
  onOpenGuide,
  onOpenSettings,
  onOpenHistory,
  historyCount = 0,
}: Props) {
  return (
    <div className="screen intro-screen">
      <div className="intro-top-bar">
        <span className="intro-top-spacer" />
        <button
          type="button"
          className="btn-icon"
          onClick={onOpenSettings}
          aria-label="设置与关于"
        >
          ⚙
        </button>
      </div>

      <header className="screen-header">
        <h1 className="title">{INTRO_TITLE}</h1>
        <p className="body-text">{INTRO_BODY}</p>
      </header>

      <ol className="intro-steps" aria-label="使用步骤">
        {INTRO_STEPS.map((step, i) => (
          <li key={step.title} className="intro-step-item">
            <span className="intro-step-num">{i + 1}</span>
            <div>
              <p className="intro-step-title">{step.title}</p>
              <p className="intro-step-body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="intro-features" aria-label="应用特性">
        <span className="feature-badge">📱 离线可用</span>
        <span className="feature-badge">🔒 数据仅存本机</span>
        <span className="feature-badge">📊 本地评估</span>
      </div>

      <p className="disclaimer">{DISCLAIMER_SHORT}</p>
      <p className="privacy-hint">{PRIVACY_HINT}</p>
      <div className="intro-actions">
        <button type="button" className="btn primary" onClick={onStart}>
          开始评估
        </button>
        {showPurchasedEntry && onOpenGuide ? (
          <button
            type="button"
            className="btn secondary"
            onClick={onOpenGuide}
          >
            查看已购文档
          </button>
        ) : null}
        {historyCount > 0 && onOpenHistory ? (
          <button
            type="button"
            className="btn secondary"
            onClick={onOpenHistory}
          >
            评估记录（{historyCount}）
          </button>
        ) : null}
      </div>
    </div>
  )
}
