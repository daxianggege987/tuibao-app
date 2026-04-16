import { useEffect, useState } from 'react'
import {
  PURCHASE_BODY,
  PURCHASE_TITLE,
  VERDICT_ELIGIBLE_TEMPLATE,
  VERDICT_INELIGIBLE,
} from '../constants/copy'
import type { SubmissionOutcome } from '../lib/submissionEvaluation'
import { formatCurrencyYuan } from '../lib/submissionEvaluation'
import {
  purchaseGuideWithAppStore,
  isNativeApp,
  restoreGuidePurchase,
} from '../lib/iapBridge'
import { buildAssessmentShareText, shareAssessmentText } from '../lib/shareAssessmentText'
import { impactLight, impactMedium } from '../lib/nativeFeedback'
import { showInterstitialAfterAssessment } from '../lib/adMobInit'

type Props = {
  outcome: SubmissionOutcome
  onUnlocked: () => void
  onSkipToHome: () => void
  onGoChecklist: () => void
  onGoProcess: () => void
  onGoKnowledge: () => void
  onGoCalculator: () => void
}

export function SuccessScreen({
  outcome,
  onUnlocked,
  onSkipToHome,
  onGoChecklist,
  onGoProcess,
  onGoKnowledge,
  onGoCalculator,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareBusy, setShareBusy] = useState(false)
  const [shareHint, setShareHint] = useState<string | null>(null)
  const [showFactors, setShowFactors] = useState(false)
  const native = isNativeApp()

  useEffect(() => {
    void showInterstitialAfterAssessment()
  }, [])

  const handleShareSummary = async () => {
    setShareHint(null)
    setShareBusy(true)
    void impactLight()
    try {
      const text = buildAssessmentShareText(outcome)
      const r = await shareAssessmentText(text)
      if (r === 'copied') setShareHint('已复制摘要到剪贴板（当前环境不支持系统分享）')
      else if (r === 'cancelled') setShareHint(null)
      else setShareHint(null)
    } catch {
      setShareHint('无法分享，请稍后再试')
    } finally {
      setShareBusy(false)
    }
  }

  const handlePurchase = async () => {
    setError(null)
    setBusy(true)
    try {
      await purchaseGuideWithAppStore()
      await impactMedium()
      onUnlocked()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('USER_CANCELLED') || msg.includes('User cancelled')) {
        setError('已取消支付')
      } else {
        setError(msg || '购买失败，请稍后重试')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async () => {
    setError(null)
    setBusy(true)
    try {
      const ok = await restoreGuidePurchase()
      if (ok) {
        await impactMedium()
        onUnlocked()
      }
      else setError('未找到可恢复的购买记录')
    } catch (e) {
      setError(e instanceof Error ? e.message : '恢复失败')
    } finally {
      setBusy(false)
    }
  }

  const amountText =
    outcome.estimatedRefund != null
      ? formatCurrencyYuan(outcome.estimatedRefund)
      : '—'

  const eligibleBody =
    outcome.estimatedRefund != null
      ? VERDICT_ELIGIBLE_TEMPLATE.replace('{amount}', amountText)
      : '根据您填写的信息，初步评估可申请退保。因交费数据不完整，暂无法估算退保金额。建议查看下方工具进一步了解。'

  return (
    <div className="screen success-screen">
      <div
        className={`success-icon${outcome.eligible ? '' : ' ineligible'}`}
        aria-hidden
      >
        {outcome.eligible ? '✓' : '!'}
      </div>
      <h1 className="title">评估报告</h1>

      <div
        className={`verdict-card${outcome.eligible ? ' eligible' : ' ineligible'}`}
        role="status"
      >
        <p className="verdict-text">
          {outcome.eligible ? eligibleBody : VERDICT_INELIGIBLE}
        </p>
        {outcome.totalFactors > 0 ? (
          <p className="verdict-score">
            有利因素 {outcome.favorableCount} / {outcome.totalFactors} 项
          </p>
        ) : null}
      </div>

      {/* 逐项分析 */}
      {outcome.factors.length > 0 ? (
        <section className="analysis-section">
          <button
            type="button"
            className="analysis-toggle"
            onClick={() => { void impactLight(); setShowFactors((v) => !v) }}
          >
            <span>{showFactors ? '收起' : '展开'}逐项分析（{outcome.factors.length} 项）</span>
            <span aria-hidden>{showFactors ? '▲' : '▼'}</span>
          </button>
          {showFactors ? (
            <ul className="analysis-list">
              {outcome.factors.map((f) => (
                <li
                  key={f.label}
                  className={`analysis-item${f.favorable === true ? ' favorable' : f.favorable === false ? ' unfavorable' : ' neutral'}`}
                >
                  <span className="analysis-icon" aria-hidden>
                    {f.favorable === true ? '✓' : f.favorable === false ? '✗' : '—'}
                  </span>
                  <div className="analysis-detail">
                    <p className="analysis-label">
                      {f.label}
                      <span className="analysis-value">（{f.value}）</span>
                    </p>
                    <p className="analysis-note">{f.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* 下一步行动建议 — 免费闭环 */}
      <section className="next-steps-section">
        <h2 className="next-steps-title">下一步行动</h2>
        <div className="next-steps-grid">
          <button type="button" className="next-step-card" onClick={onGoChecklist}>
            <span className="next-step-icon" aria-hidden>✅</span>
            <span className="next-step-label">准备退保材料</span>
          </button>
          <button type="button" className="next-step-card" onClick={onGoProcess}>
            <span className="next-step-icon" aria-hidden>📋</span>
            <span className="next-step-label">查看退保流程</span>
          </button>
          <button type="button" className="next-step-card" onClick={onGoCalculator}>
            <span className="next-step-icon" aria-hidden>🧮</span>
            <span className="next-step-label">精确估算金额</span>
          </button>
          <button type="button" className="next-step-card" onClick={onGoKnowledge}>
            <span className="next-step-icon" aria-hidden>📚</span>
            <span className="next-step-label">退保知识库</span>
          </button>
        </div>
      </section>

      {/* IAP — 醒目购买卡片 */}
      {outcome.eligible && native ? (
        <section className="iap-highlight-card" aria-labelledby="iap-heading">
          <div className="iap-highlight-badge" aria-hidden>推荐</div>
          <h2 id="iap-heading" className="iap-highlight-title">{PURCHASE_TITLE}</h2>
          <p className="iap-highlight-body">{PURCHASE_BODY}</p>
          <button
            type="button"
            className="btn iap-highlight-btn"
            disabled={busy}
            onClick={() => void handlePurchase()}
          >
            {busy ? '处理中…' : '立即解锁 · App Store'}
          </button>
          <button
            type="button"
            className="btn-text iap-highlight-restore"
            disabled={busy}
            onClick={() => void handleRestore()}
          >
            已购买？恢复购买
          </button>
          {error ? (
            <p className="field-error" role="alert">{error}</p>
          ) : null}
        </section>
      ) : null}

      <p className="body-text subtle">
        评估规则由系统根据您填写的信息在本机自动判断，结论仅供参考，不构成法律意见。
      </p>

      <button
        type="button"
        className="btn secondary wide"
        disabled={shareBusy}
        onClick={() => void handleShareSummary()}
      >
        {shareBusy ? '分享中…' : '分享评估摘要'}
      </button>
      {shareHint ? (
        <p className="body-text small muted-block" role="status">
          {shareHint}
        </p>
      ) : null}

      <button type="button" className="btn primary wide" onClick={onSkipToHome}>
        返回首页
      </button>
    </div>
  )
}
