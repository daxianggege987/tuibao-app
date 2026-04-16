import { useState } from 'react'
import { FAQ_LIST } from '../data/faqData'
import { impactLight } from '../lib/nativeFeedback'

type Props = { onBack: () => void }

const ALL_TAG = '全部'

export function FaqScreen({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState(ALL_TAG)

  const categories = [ALL_TAG, ...Array.from(new Set(FAQ_LIST.map((f) => f.category)))]
  const filtered = activeTag === ALL_TAG ? FAQ_LIST : FAQ_LIST.filter((f) => f.category === activeTag)

  const toggle = (id: string) => {
    void impactLight()
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="screen faq-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">常见问题</h1>
        <p className="body-text small">退保过程中最常遇到的疑问，点击展开查看解答。</p>
      </header>

      <div className="knowledge-tags" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeTag === cat}
            className={`knowledge-tag-btn${activeTag === cat ? ' active' : ''}`}
            onClick={() => setActiveTag(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="faq-list">
        {filtered.map((item) => {
          const isOpen = expanded === item.id
          return (
            <li key={item.id} className={`faq-item${isOpen ? ' open' : ''}`}>
              <button type="button" className="faq-question" onClick={() => toggle(item.id)}>
                <span className="faq-q-text">{item.question}</span>
                <span className="faq-arrow" aria-hidden>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen ? (
                <div className="faq-answer">
                  {item.answer.split('\n').map((line, i) => {
                    const trimmed = line.trim()
                    if (!trimmed) return <br key={i} />
                    return <p key={i}>{trimmed}</p>
                  })}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <p className="body-text small muted-block">
        以上回答仅供一般性参考，不构成法律或保险专业意见。具体情况以保险合同和监管规则为准。
      </p>
    </div>
  )
}
