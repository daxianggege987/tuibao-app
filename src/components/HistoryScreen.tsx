import {
  type AssessmentRecord,
  clearAssessmentHistory,
  formatRecordSummary,
  removeAssessmentRecord,
} from '../lib/assessmentHistory'
import { impactLight } from '../lib/nativeFeedback'

type Props = {
  onBack: () => void
  records: AssessmentRecord[]
  onRecordsChange: () => void
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function HistoryScreen({ onBack, records, onRecordsChange }: Props) {
  const handleDelete = (id: string) => {
    void impactLight()
    removeAssessmentRecord(id)
    onRecordsChange()
  }

  const handleClearAll = () => {
    if (
      !window.confirm(
        '将删除本设备上全部已保存的评估记录摘要，且无法恢复。是否继续？',
      )
    ) {
      return
    }
    void impactLight()
    clearAssessmentHistory()
    onRecordsChange()
  }

  return (
    <div className="screen history-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>
          ← 返回
        </button>
        <h1 className="title">评估记录</h1>
        <p className="body-text small history-intro">
          以下为已提交评估的摘要，保存在本机，可随时删除。不含问卷详细答案。
        </p>
      </header>

      {records.length === 0 ? (
        <p className="body-text muted-block history-empty">
          暂无记录。完成一次评估并提交后，将在此显示摘要。
        </p>
      ) : (
        <ul className="history-list" aria-label="评估记录列表">
          {records.map((r) => (
            <li key={r.id} className="history-card">
              <div className="history-card-main">
                <p className="history-card-time">{formatWhen(r.submittedAt)}</p>
                <p className="history-card-summary">{formatRecordSummary(r)}</p>
              </div>
              <button
                type="button"
                className="btn-text history-delete"
                onClick={() => handleDelete(r.id)}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}

      {records.length > 0 ? (
        <button type="button" className="btn secondary wide" onClick={handleClearAll}>
          清空全部记录
        </button>
      ) : null}

      <p className="body-text small settings-footnote">
        与「设置」中的清除草稿不同：草稿为未提交进度；此处为已提交摘要。
      </p>
    </div>
  )
}
