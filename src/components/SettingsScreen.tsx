import { useCallback, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import {
  APP_DISPLAY_NAME,
  APP_VERSION,
  CONTACT_EMAIL,
  CONTACT_WECHAT_HINT,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '../constants/appMeta'

type Props = {
  onBack: () => void
  onOpenHistory: () => void
  onOpenLegalPrivacy: () => void
  onOpenLegalTerms: () => void
  onClearDraft: () => void
}

export function SettingsScreen({
  onBack,
  onOpenHistory,
  onOpenLegalPrivacy,
  onOpenLegalTerms,
  onClearDraft,
}: Props) {
  const [copyDone, setCopyDone] = useState(false)

  const openExternal = useCallback(async (url: string) => {
    if (!url) return
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url })
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const handlePrivacy = () => {
    if (PRIVACY_POLICY_URL.trim()) {
      void openExternal(PRIVACY_POLICY_URL.trim())
    } else {
      onOpenLegalPrivacy()
    }
  }

  const handleTerms = () => {
    if (TERMS_OF_SERVICE_URL.trim()) {
      void openExternal(TERMS_OF_SERVICE_URL.trim())
    } else {
      onOpenLegalTerms()
    }
  }

  const copyEmail = () => {
    void navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setCopyDone(true)
      window.setTimeout(() => setCopyDone(false), 2000)
    })
  }

  const confirmClear = () => {
    if (
      !window.confirm(
        '将删除本设备上已保存的未提交问卷草稿，且无法恢复。是否继续？',
      )
    ) {
      return
    }
    onClearDraft()
  }

  return (
    <div className="screen settings-screen">
      <header className="screen-header settings-header">
        <button
          type="button"
          className="btn-text settings-back"
          onClick={onBack}
        >
          ← 返回
        </button>
        <h1 className="title">设置与关于</h1>
      </header>

      <section className="settings-card" aria-labelledby="records-h">
        <h2 id="records-h" className="settings-section-title">
          评估记录
        </h2>
        <button type="button" className="settings-link-row" onClick={onOpenHistory}>
          查看评估摘要
          <span aria-hidden>›</span>
        </button>
        <p className="body-text small settings-footnote">
          已提交评估的本地摘要，不含完整问卷答案；可离线查看。
        </p>
      </section>

      <section className="settings-card" aria-labelledby="about-h">
        <h2 id="about-h" className="settings-section-title">
          关于
        </h2>
        <p className="settings-row">
          <span className="settings-label">应用</span>
          <span className="settings-value">{APP_DISPLAY_NAME}</span>
        </p>
        <p className="settings-row">
          <span className="settings-label">版本</span>
          <span className="settings-value mono">{APP_VERSION}</span>
        </p>
      </section>

      <section className="settings-card" aria-labelledby="legal-h">
        <h2 id="legal-h" className="settings-section-title">
          法律信息
        </h2>
        <button type="button" className="settings-link-row" onClick={handlePrivacy}>
          隐私政策
          <span aria-hidden>›</span>
        </button>
        <button type="button" className="settings-link-row" onClick={handleTerms}>
          用户协议
          <span aria-hidden>›</span>
        </button>
      </section>

      <section className="settings-card" aria-labelledby="contact-h">
        <h2 id="contact-h" className="settings-section-title">
          联系我们
        </h2>
        <p className="body-text small settings-contact-hint">{CONTACT_WECHAT_HINT}</p>
        <div className="settings-email-row">
          <code className="settings-email">{CONTACT_EMAIL}</code>
          <button type="button" className="btn secondary settings-copy-btn" onClick={copyEmail}>
            {copyDone ? '已复制' : '复制邮箱'}
          </button>
        </div>
      </section>

      <section className="settings-card" aria-labelledby="data-h">
        <h2 id="data-h" className="settings-section-title">
          数据
        </h2>
        <button type="button" className="btn secondary wide" onClick={confirmClear}>
          清除本地草稿
        </button>
        <p className="body-text small settings-footnote">
          仅影响未提交的问卷进度；不影响「评估记录」里已保存的摘要。
        </p>
      </section>
    </div>
  )
}
