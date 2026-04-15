import { useState } from 'react'
import { KNOWLEDGE_ARTICLES } from '../data/knowledgeArticles'
import type { KnowledgeArticle } from '../data/knowledgeArticles'

type Props = { onBack: () => void }

const ALL_TAG = '全部'

function ArticleDetail({ article, onBack }: { article: KnowledgeArticle; onBack: () => void }) {
  return (
    <div className="screen knowledge-detail-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">{article.title}</h1>
        <span className="knowledge-tag">{article.tag}</span>
      </header>
      <article className="knowledge-article-body">
        {article.body.split('\n').map((line, i) => {
          const trimmed = line.trim()
          if (!trimmed) return <br key={i} />
          if (/^[•●]/.test(trimmed)) return <p key={i} className="knowledge-bullet">{trimmed}</p>
          if (/^\d+[.、]/.test(trimmed)) return <p key={i} className="knowledge-numbered">{trimmed}</p>
          return <p key={i}>{trimmed}</p>
        })}
      </article>
      <p className="body-text small muted-block knowledge-disclaimer">
        以上内容仅供一般性参考，不构成法律、财务或保险专业意见。
      </p>
    </div>
  )
}

export function KnowledgeScreen({ onBack }: Props) {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [activeTag, setActiveTag] = useState(ALL_TAG)

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
  }

  const tags = [ALL_TAG, ...Array.from(new Set(KNOWLEDGE_ARTICLES.map((a) => a.tag)))]
  const filtered = activeTag === ALL_TAG
    ? KNOWLEDGE_ARTICLES
    : KNOWLEDGE_ARTICLES.filter((a) => a.tag === activeTag)

  return (
    <div className="screen knowledge-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">退保知识库</h1>
        <p className="body-text small">了解退保相关知识，做出更明智的决策。</p>
      </header>

      <div className="knowledge-tags" role="tablist">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            role="tab"
            aria-selected={activeTag === tag}
            className={`knowledge-tag-btn${activeTag === tag ? ' active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <ul className="knowledge-list">
        {filtered.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              className="knowledge-card"
              onClick={() => setSelectedArticle(article)}
            >
              <span className="knowledge-card-tag">{article.tag}</span>
              <span className="knowledge-card-title">{article.title}</span>
              <span className="knowledge-card-arrow" aria-hidden>›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
