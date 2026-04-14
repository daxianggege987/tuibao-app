import { useState } from 'react'
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
import { simulateDemoUnlock } from '../lib/unlock'
import { buildAssessmentShareText, shareAssessmentText } from '../lib/shareAssessmentText'
import { impactLight, impactMedium } from '../lib/nativeFeedback'

type Props = {
  outcome: SubmissionOutcome
  onUnlocked: () => void
  onSkipToHome: () => void
}

export function SuccessScreen({ outcome, onUnlocked, onSkipToHome }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareBusy, setShareBusy] = useState(false)
  const [shareHint, setShareHint] = useState<string | null>(null)
  const native = isNativeApp()

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

  const handleDemoUnlock = () => {
    simulateDemoUnlock()
    void impactMedium()
    onUnlocked()
  }

  const amountText =
    outcome.estimatedRefund != null
      ? formatCurrencyYuan(outcome.estimatedRefund)
      : '—'

  const eligibleBody =
    outcome.estimatedRefund != null
      ? VERDICT_ELIGIBLE_TEMPLATE.replace('{amount}', amountText)
      : '恭喜您，您的保险可以申请退保。因交费数据不完整，暂无法估算退保金额。具体操作方法，请购买后查看，如需协助操作，请付款后联系客服微信。'

  return (
    <div className="screen success-screen">
      <div
        className={`success-icon${outcome.eligible ? '' : ' ineligible'}`}
        aria-hidden
      >
        {outcome.eligible ? '✓' : '!'}
      </div>
      <h1 className="title">提交成功</h1>

      <div
        className={`verdict-card${outcome.eligible ? ' eligible' : ' ineligible'}`}
        role="status"
      >
        <p className="verdict-text">
          {outcome.eligible ? eligibleBody : VERDICT_INELIGIBLE}
        </p>
      </div>

      <p className="body-text subtle">
        我们已收到您的测评信息。以下为后续指引（评估规则由系统根据您填写的保全与理赔信息自动判断）。
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

      {outcome.eligible ? (
        <section className="purchase-card" aria-labelledby="purchase-heading">
          <h2 id="purchase-heading" className="purchase-title">
            {PURCHASE_TITLE}
          </h2>
          <p className="purchase-body">{PURCHASE_BODY}</p>

          {native ? (
            <>
              <button
                type="button"
                className="btn primary"
                disabled={busy}
                onClick={() => void handlePurchase()}
              >
                {busy ? '处理中…' : '使用 App Store 解锁'}
              </button>
              <button
                type="button"
                className="btn secondary purchase-restore"
                disabled={busy}
                onClick={() => void handleRestore()}
              >
                恢复购买
              </button>
            </>
          ) : (
            <div className="web-demo-hint">
              <p className="body-text small">
                当前为浏览器环境，无法调起 App Store。请在 Xcode 运行 iOS App
                体验真实内购；或在下方使用演示入口查看文档占位页。
              </p>
              <button
                type="button"
                className="btn primary"
                onClick={handleDemoUnlock}
              >
                演示：模拟已解锁
              </button>
            </div>
          )}

          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </section>
      ) : (
        <p className="body-text muted-block">
          当前评估结果不支持继续办理退保相关服务，无需购买操作指引。
        </p>
      )}

      <button type="button" className="btn secondary wide" onClick={onSkipToHome}>
        返回首页
      </button>
    </div>
  )
}
