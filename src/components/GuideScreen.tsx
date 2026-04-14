import { useCallback, useMemo, useRef, useState } from 'react'
import { GUIDE_INTRO } from '../constants/copy'
import {
  GUIDE_PAGE_COUNT,
  guidePageSrc,
} from '../data/guidePages'

const SHARE_FILENAME = 'tuibao.pdf'

type Props = {
  onBack: () => void
}

export function GuideScreen({ onBack }: Props) {
  const pdfUrl = useMemo(
    () => new URL('tuibao.pdf', window.location.href).href,
    [],
  )
  const [shareBusy, setShareBusy] = useState(false)
  const shareBusyRef = useRef(false)

  const count = GUIDE_PAGE_COUNT
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const imageHref = useMemo(() => {
    if (count < 1) return ''
    const safe = Math.min(Math.max(0, index), count - 1)
    return new URL(guidePageSrc(safe), window.location.href).href
  }, [count, index])

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const c = GUIDE_PAGE_COUNT
        if (c < 1) return 0
        return Math.min(Math.max(0, i + delta), c - 1)
      })
    },
    [],
  )

  const openPdfExternal = useCallback(async () => {
    if (shareBusyRef.current) return
    shareBusyRef.current = true
    setShareBusy(true)
    try {
      const res = await fetch(pdfUrl)
      if (!res.ok) throw new Error(`无法加载 PDF（${res.status}）`)
      const buf = await res.arrayBuffer()
      const blob = new Blob([buf], { type: 'application/pdf' })
      const file = new File([blob], SHARE_FILENAME, { type: 'application/pdf' })

      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>
        canShare?: (data: ShareData) => boolean
      }
      if (typeof nav.share === 'function') {
        const shareData: ShareData = {
          title: '退保方法说明',
          text: '《退保方法说明》PDF',
          files: [file],
        }
        const can =
          typeof nav.canShare !== 'function' || nav.canShare(shareData)
        if (can) {
          await nav.share(shareData)
          return
        }
      }

      const blobUrl = URL.createObjectURL(blob)
      const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer')
      if (!opened) {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = SHARE_FILENAME
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '无法分享或打开，请稍后再试。'
      window.alert(msg)
    } finally {
      shareBusyRef.current = false
      setShareBusy(false)
    }
  }, [pdfUrl])

  return (
    <div className="screen guide-screen">
      <header className="screen-header">
        <h1 className="title">退保方法说明</h1>
        <p className="body-text">{GUIDE_INTRO}</p>
      </header>

      {count > 0 ? (
        <>
          <div className="guide-book-toolbar">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index <= 0}
            >
              上一页
            </button>
            <span aria-live="polite">
              第 {index + 1} / {count} 页
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= count - 1}
            >
              下一页
            </button>
          </div>

          <div
            className="guide-book-stage"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null
            }}
            onTouchEnd={(e) => {
              const start = touchStartX.current
              touchStartX.current = null
              if (start == null) return
              const end = e.changedTouches[0]?.clientX
              if (end == null) return
              const dx = end - start
              if (dx > 56) go(-1)
              else if (dx < -56) go(1)
            }}
          >
            <img
              className="guide-book-image"
              src={imageHref}
              alt={`第 ${index + 1} 页`}
              draggable={false}
            />
          </div>

          <p className="body-text small guide-book-hint">
            左右滑动屏幕，或使用上方按钮翻页。
          </p>
        </>
      ) : (
        <div className="guide-book-empty">
          <p className="body-text">
            尚未配置阅读页图片。请将 Word 按页导出为{' '}
            <code>page-01.png</code>、<code>page-02.png</code> … 放入项目的{' '}
            <code>public/guide/</code>，并把{' '}
            <code>src/data/guidePages.ts</code> 里的{' '}
            <code>GUIDE_PAGE_COUNT</code>{' '}
            改为实际页数后重新打包同步。
          </p>
          <p className="body-text small muted-block">
            下方仍可使用《退保方法说明》PDF 的下载与分享（文件为{' '}
            <code>public/tuibao.pdf</code>）。
          </p>
        </div>
      )}

      <p className="pdf-open-link">
        <button
          type="button"
          className="link-accent link-like"
          onClick={openPdfExternal}
          disabled={shareBusy}
        >
          {shareBusy ? '正在准备…' : '下载 PDF / 用其他应用打开'}
        </button>
      </p>

      <button type="button" className="btn secondary wide" onClick={onBack}>
        返回首页
      </button>
    </div>
  )
}
