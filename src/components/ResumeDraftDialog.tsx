type Props = {
  onResume: () => void
  onDismiss: () => void
}

export function ResumeDraftDialog({ onResume, onDismiss }: Props) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
      >
        <h2 id="resume-title" className="modal-title">
          继续上次填写？
        </h2>
        <p className="body-text">
          检测到本地草稿，可继续上次的进度；选择「重新开始」将清空草稿。
        </p>
        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onDismiss}>
            重新开始
          </button>
          <button type="button" className="btn primary" onClick={onResume}>
            继续填写
          </button>
        </div>
      </div>
    </div>
  )
}
