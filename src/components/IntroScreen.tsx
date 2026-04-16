import {
  DISCLAIMER_SHORT,
  INTRO_BODY,
  INTRO_TITLE,
  PRIVACY_HINT,
} from '../constants/copy'

type Props = {
  onStart: () => void
  showPurchasedEntry?: boolean
  onOpenGuide?: () => void
  onOpenSettings: () => void
  onOpenHistory?: () => void
  onOpenKnowledge?: () => void
  onOpenChecklist?: () => void
  onOpenProcess?: () => void
  onOpenCalculator?: () => void
  onOpenFaq?: () => void
  historyCount?: number
}

export function IntroScreen({
  onStart,
  showPurchasedEntry,
  onOpenGuide,
  onOpenSettings,
  onOpenHistory,
  onOpenKnowledge,
  onOpenChecklist,
  onOpenProcess,
  onOpenCalculator,
  onOpenFaq,
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

      <div className="intro-features" aria-label="应用特性">
        <span className="feature-badge">📱 离线可用</span>
        <span className="feature-badge">🔒 数据仅存本机</span>
        <span className="feature-badge">📊 本地评估</span>
      </div>

      <div className="intro-actions">
        <button type="button" className="btn primary" onClick={onStart}>
          开始退保评估
        </button>
      </div>

      <section className="tool-grid" aria-label="工具与知识">
        <button type="button" className="tool-card" onClick={onOpenCalculator}>
          <span className="tool-card-icon" aria-hidden>🧮</span>
          <span className="tool-card-label">退保金估算</span>
          <span className="tool-card-desc">快速估算可退回金额范围</span>
        </button>
        <button type="button" className="tool-card" onClick={onOpenChecklist}>
          <span className="tool-card-icon" aria-hidden>✅</span>
          <span className="tool-card-label">材料清单</span>
          <span className="tool-card-desc">逐项准备退保所需材料</span>
        </button>
        <button type="button" className="tool-card" onClick={onOpenProcess}>
          <span className="tool-card-icon" aria-hidden>📋</span>
          <span className="tool-card-label">流程与进度</span>
          <span className="tool-card-desc">查看退保步骤、跟踪办理进度</span>
        </button>
        <button type="button" className="tool-card" onClick={onOpenKnowledge}>
          <span className="tool-card-icon" aria-hidden>📚</span>
          <span className="tool-card-label">退保知识库</span>
          <span className="tool-card-desc">10 篇科普文章，系统了解退保</span>
        </button>
        <button type="button" className="tool-card" onClick={onOpenFaq}>
          <span className="tool-card-icon" aria-hidden>❓</span>
          <span className="tool-card-label">常见问题</span>
          <span className="tool-card-desc">12 个高频问题快速解答</span>
        </button>
        {historyCount > 0 && onOpenHistory ? (
          <button type="button" className="tool-card" onClick={onOpenHistory}>
            <span className="tool-card-icon" aria-hidden>🗂</span>
            <span className="tool-card-label">评估记录</span>
            <span className="tool-card-desc">{historyCount} 条本地记录</span>
          </button>
        ) : null}
      </section>

      {showPurchasedEntry && onOpenGuide ? (
        <div className="intro-actions">
          <button type="button" className="btn secondary" onClick={onOpenGuide}>
            查看已购文档
          </button>
        </div>
      ) : null}

      <p className="disclaimer">{DISCLAIMER_SHORT}</p>
      <p className="privacy-hint">{PRIVACY_HINT}</p>
    </div>
  )
}
