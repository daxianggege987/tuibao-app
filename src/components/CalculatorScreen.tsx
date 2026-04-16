import { useState } from 'react'
import { formatCurrencyYuan } from '../lib/submissionEvaluation'
import { impactLight } from '../lib/nativeFeedback'

type Props = { onBack: () => void }

export function CalculatorScreen({ onBack }: Props) {
  const [annualPremium, setAnnualPremium] = useState('')
  const [years, setYears] = useState('')
  const [totalPaid, setTotalPaid] = useState('')
  const [showResult, setShowResult] = useState(false)

  const annual = parseFloat(annualPremium)
  const y = parseFloat(years)
  const hasValidInput = Number.isFinite(annual) && annual > 0 && Number.isFinite(y) && y > 0
  const computedTotal = hasValidInput ? annual * y : parseFloat(totalPaid)
  const hasTotal = Number.isFinite(computedTotal) && computedTotal > 0

  const cashValueLow = hasTotal ? Math.round(computedTotal * 0.15 * 100) / 100 : 0
  const cashValueMid = hasTotal ? Math.round(computedTotal * 0.40 * 100) / 100 : 0
  const cashValueHigh = hasTotal ? Math.round(computedTotal * 0.70 * 100) / 100 : 0
  const lossLow = hasTotal ? Math.round((computedTotal - cashValueHigh) * 100) / 100 : 0
  const lossHigh = hasTotal ? Math.round((computedTotal - cashValueLow) * 100) / 100 : 0

  const handleCalc = () => {
    if (!hasTotal) return
    void impactLight()
    setShowResult(true)
  }

  const handleReset = () => {
    setAnnualPremium('')
    setYears('')
    setTotalPaid('')
    setShowResult(false)
  }

  return (
    <div className="screen calculator-screen">
      <header className="screen-header settings-header">
        <button type="button" className="btn-text settings-back" onClick={onBack}>← 返回</button>
        <h1 className="title">退保金估算器</h1>
        <p className="body-text small">快速估算退保可能拿回的金额范围，帮助您做出决策。</p>
      </header>

      <section className="calc-form">
        <label className="calc-field">
          <span className="calc-label">每年保费（元）</span>
          <input
            type="number"
            inputMode="decimal"
            className="answer-input number-input"
            placeholder="例如：5000"
            value={annualPremium}
            onChange={(e) => { setAnnualPremium(e.target.value); setShowResult(false) }}
          />
        </label>
        <label className="calc-field">
          <span className="calc-label">已交年数</span>
          <input
            type="number"
            inputMode="numeric"
            className="answer-input number-input"
            placeholder="例如：3"
            value={years}
            onChange={(e) => { setYears(e.target.value); setShowResult(false) }}
          />
        </label>

        <div className="calc-divider">
          <span className="calc-divider-text">或直接输入</span>
        </div>

        <label className="calc-field">
          <span className="calc-label">已交总保费（元）</span>
          <input
            type="number"
            inputMode="decimal"
            className="answer-input number-input"
            placeholder="例如：15000"
            value={totalPaid}
            onChange={(e) => { setTotalPaid(e.target.value); setShowResult(false) }}
            disabled={hasValidInput}
          />
          {hasValidInput ? (
            <span className="calc-auto-total">
              自动计算：{formatCurrencyYuan(annual * y)} 元
            </span>
          ) : null}
        </label>

        <div className="calc-actions">
          <button type="button" className="btn primary" onClick={handleCalc} disabled={!hasTotal}>
            开始估算
          </button>
          {showResult ? (
            <button type="button" className="btn secondary" onClick={handleReset}>
              重新输入
            </button>
          ) : null}
        </div>
      </section>

      {showResult && hasTotal ? (
        <section className="calc-result">
          <h2 className="calc-result-title">估算结果</h2>
          <p className="calc-result-total">
            已交总保费：<strong>{formatCurrencyYuan(computedTotal)} 元</strong>
          </p>

          <div className="calc-range-group">
            <div className="calc-range-item pessimistic">
              <span className="calc-range-label">保守估算（投保前 1-2 年）</span>
              <span className="calc-range-value">{formatCurrencyYuan(cashValueLow)} 元</span>
              <span className="calc-range-note">约为已交保费的 15%</span>
            </div>
            <div className="calc-range-item moderate">
              <span className="calc-range-label">中等估算（投保 3-5 年）</span>
              <span className="calc-range-value">{formatCurrencyYuan(cashValueMid)} 元</span>
              <span className="calc-range-note">约为已交保费的 40%</span>
            </div>
            <div className="calc-range-item optimistic">
              <span className="calc-range-label">乐观估算（投保 5 年以上/有瑕疵）</span>
              <span className="calc-range-value">{formatCurrencyYuan(cashValueHigh)} 元</span>
              <span className="calc-range-note">约为已交保费的 70%</span>
            </div>
          </div>

          <div className="calc-loss-hint">
            <p>预计损失范围：<strong>{formatCurrencyYuan(lossLow)} ~ {formatCurrencyYuan(lossHigh)} 元</strong></p>
          </div>

          <div className="calc-tips">
            <h3 className="calc-tips-title">影响退保金额的因素</h3>
            <ul className="calc-tips-list">
              <li>保单类型（储蓄型 {'>'} 消费型）</li>
              <li>已交费年限（年限越长，现金价值占比越高）</li>
              <li>是否存在合同瑕疵（可能争取全额退保）</li>
              <li>保险公司政策（各公司退保规则不同）</li>
            </ul>
            <p className="calc-tips-note">
              实际退保金额以保单上的「现金价值表」为准，本估算仅供决策参考。可拨打保险公司客服热线查询精确金额。
            </p>
          </div>
        </section>
      ) : null}

      <p className="body-text small muted-block">
        本工具基于行业一般规律估算，不代表实际退保金额。精确数值请查阅保险合同现金价值表或致电保险公司客服。
      </p>
    </div>
  )
}
