import { useId, useMemo, useRef, useEffect, useState } from 'react'
import type { QuestionItem } from '../types/question'
import { GROUP_LABELS } from '../constants/copy'
import { ProgressBar } from './ProgressBar'

type Props = {
  question: QuestionItem
  index: number
  total: number
  value: string
  onChange: (value: string) => void
  showSection: boolean
  error?: string
  onBack: () => void
  onNext: () => void
}

function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  hasError,
}: {
  id: string
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hasError: boolean
}) {
  const [inputValue, setInputValue] = useState(value)
  const listId = `${id}-listbox`

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase()
    if (!q) return options.slice(0, 80)
    return options.filter((o) => o.toLowerCase().includes(q)).slice(0, 80)
  }, [inputValue, options])

  return (
    <div className="searchable-field">
      <input
        id={id}
        type="text"
        enterKeyHint="search"
        className={`answer-input search-input${hasError ? ' has-error' : ''}`}
        value={inputValue}
        onChange={(e) => {
          const v = e.target.value
          setInputValue(v)
          onChange(v)
        }}
        placeholder={placeholder ?? '输入关键字筛选后点选下方选项'}
        aria-controls={listId}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <div
        id={listId}
        className="searchable-options"
        role="listbox"
        aria-label="候选项"
      >
        {filtered.map((opt) => (
          <button
            key={opt}
            type="button"
            role="option"
            className={`searchable-option${value === opt ? ' selected' : ''}`}
            onClick={() => {
              setInputValue(opt)
              onChange(opt)
            }}
          >
            {opt}
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="searchable-empty">无匹配项，请调整关键字</p>
        ) : null}
      </div>
    </div>
  )
}

export function QuestionScreen({
  question,
  index,
  total,
  value,
  onChange,
  showSection,
  error,
  onBack,
  onNext,
}: Props) {
  const labelId = useId()
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (question.inputType === 'textarea') areaRef.current?.focus()
    // 数字题不在此自动 focus：iOS WKWebView 对程序化 focus 常不弹出键盘，且易与首次点击冲突
  }, [question.id, question.inputType])

  const groupTitle = GROUP_LABELS[question.group] ?? question.group
  const opts = question.options ?? []

  const radioName = `${question.id}-radio`

  return (
    <div className="screen question-screen">
      <ProgressBar current={index} total={total} />
      {showSection ? (
        <p className="section-chip" role="status">
          {groupTitle}
        </p>
      ) : null}
      <div className="question-card">
        <h2 className="question-title" id={labelId}>
          <span className="question-bullet" aria-hidden>
            ●
          </span>
          {question.promptText}
        </h2>

        {question.inputType === 'single' ? (
          <fieldset className="radio-group" aria-labelledby={labelId}>
            <legend className="visually-hidden">{question.promptText}</legend>
            {opts.map((opt) => (
              <label key={opt} className="radio-row">
                <input
                  type="radio"
                  name={radioName}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {question.inputType === 'singleSearch' ? (
          <SearchableSelect
            id={labelId + '-search'}
            options={opts}
            value={value}
            onChange={onChange}
            placeholder={question.placeholder}
            hasError={!!error}
          />
        ) : null}

        {question.inputType === 'number' ? (
          <div className="number-field">
            <input
              id={labelId + '-num'}
              className={`answer-input number-input${error ? ' has-error' : ''}`}
              type="text"
              inputMode={question.inputMode ?? 'decimal'}
              pattern={
                question.integerOnly ? '[0-9]*' : undefined
              }
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? labelId + '-err' : undefined}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
            />
            {question.unit ? (
              <span className="number-unit">{question.unit}</span>
            ) : null}
          </div>
        ) : null}

        {question.inputType === 'textarea' ? (
          <>
            <label htmlFor={labelId + '-ta'} className="visually-hidden">
              回答：{question.promptText}
            </label>
            <textarea
              id={labelId + '-ta'}
              ref={areaRef}
              className={`answer-input${error ? ' has-error' : ''}`}
              rows={5}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder ?? '请填写'}
              aria-invalid={!!error}
              aria-describedby={error ? labelId + '-err' : undefined}
            />
          </>
        ) : null}

        {error ? (
          <p id={labelId + '-err'} className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <nav className="nav-row" aria-label="题目导航">
        <button type="button" className="btn secondary" onClick={onBack}>
          上一步
        </button>
        <button type="button" className="btn primary" onClick={onNext}>
          {index >= total - 1 ? '去审阅' : '下一步'}
        </button>
      </nav>
    </div>
  )
}
