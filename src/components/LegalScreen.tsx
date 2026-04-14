import { LEGAL_PRIVACY_BODY, LEGAL_TERMS_BODY } from '../constants/legalPages'

type Props = {
  kind: 'privacy' | 'terms'
  onBack: () => void
}

export function LegalScreen({ kind, onBack }: Props) {
  const title = kind === 'privacy' ? '隐私政策' : '用户协议'
  const body = kind === 'privacy' ? LEGAL_PRIVACY_BODY : LEGAL_TERMS_BODY

  return (
    <div className="screen legal-screen">
      <header className="screen-header legal-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>
          ← 返回
        </button>
        <h1 className="title">{title}</h1>
      </header>
      <div className="legal-body doc-card">
        <p className="legal-paragraph">{body}</p>
      </div>
    </div>
  )
}
