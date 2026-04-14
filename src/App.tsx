import { useCallback, useMemo, useState } from 'react'
import { QUESTIONS } from './data/questions'
import { IntroScreen } from './components/IntroScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ReviewScreen } from './components/ReviewScreen'
import { SuccessScreen } from './components/SuccessScreen'
import { GuideScreen } from './components/GuideScreen'
import { LegalScreen } from './components/LegalScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { ResumeDraftDialog } from './components/ResumeDraftDialog'
import { hasMeaningfulProgress, loadDraft, useDraft } from './hooks/useDraft'
import type { DraftPhase } from './hooks/useDraft'
import { appendAssessmentRecord, loadAssessmentHistory } from './lib/assessmentHistory'
import type { AssessmentRecord } from './lib/assessmentHistory'
import { isGuideUnlocked } from './lib/unlock'
import { getVisibleQuestions } from './lib/questionFlow'
import { validateAnswer } from './lib/validateAnswer'
import { evaluateSubmission } from './lib/submissionEvaluation'
import type { SubmissionOutcome } from './lib/submissionEvaluation'
import { impactLight, impactMedium } from './lib/nativeFeedback'
import { HistoryScreen } from './components/HistoryScreen'
import './App.css'

const initialDraft = (): import('./hooks/useDraft').DraftState => ({
  version: 1,
  phase: 'intro',
  questionIndex: 0,
  answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, ''])),
})

export default function App() {
  const { draft, setAnswerCascade, setPhase, setQuestionIndex, resetDraft } =
    useDraft()

  const [uiPhase, setUiPhase] = useState<
    | 'intro'
    | 'question'
    | 'review'
    | 'success'
    | 'guide'
    | 'settings'
    | 'legal'
    | 'history'
  >('intro')
  const [historyReturnTarget, setHistoryReturnTarget] = useState<
    'intro' | 'settings'
  >('settings')
  const [historyRecords, setHistoryRecords] = useState<AssessmentRecord[]>(() =>
    loadAssessmentHistory(),
  )
  const [legalKind, setLegalKind] = useState<'privacy' | 'terms'>('privacy')
  const [questionIndex, setQIndex] = useState(0)
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [showResume, setShowResume] = useState(() =>
    hasMeaningfulProgress(loadDraft()),
  )
  const [unlockVersion, setUnlockVersion] = useState(0)
  const [submissionOutcome, setSubmissionOutcome] =
    useState<SubmissionOutcome | null>(null)

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(QUESTIONS, draft.answers),
    [draft.answers],
  )

  /** 条件题隐藏后 questionIndex 可能越界，展示时钳制 */
  const effectiveIndex = Math.min(
    questionIndex,
    Math.max(0, visibleQuestions.length - 1),
  )

  const unlocked = useMemo(
    () => isGuideUnlocked() || unlockVersion > 0,
    [unlockVersion],
  )

  const handleResume = () => {
    if (draft.phase === 'review') {
      setUiPhase('review')
    } else if (draft.phase === 'question') {
      setUiPhase('question')
      setQIndex(draft.questionIndex)
    }
    setShowResume(false)
  }

  const handleDismissResume = () => {
    resetDraft(initialDraft())
    setUiPhase('intro')
    setQIndex(0)
    setShowResume(false)
  }

  const persistProgress = useCallback(
    (phase: DraftPhase, idx: number) => {
      setPhase(phase)
      setQuestionIndex(idx)
    },
    [setPhase, setQuestionIndex],
  )

  const startFresh = () => {
    setUiPhase('question')
    setQIndex(0)
    persistProgress('question', 0)
    setFieldError(undefined)
  }

  const handleStart = () => {
    startFresh()
  }

  const currentQuestion = visibleQuestions[effectiveIndex]
  const prevGroup =
    effectiveIndex > 0
      ? visibleQuestions[effectiveIndex - 1].group
      : null
  const showSection =
    currentQuestion != null && currentQuestion.group !== prevGroup

  const answerValue = currentQuestion
    ? (draft.answers[currentQuestion.id] ?? '')
    : ''

  const goBackFromQuestion = () => {
    void impactLight()
    setFieldError(undefined)
    if (effectiveIndex <= 0) {
      setUiPhase('intro')
      persistProgress('intro', 0)
      return
    }
    const next = effectiveIndex - 1
    setQIndex(next)
    persistProgress('question', next)
  }

  const goNextFromQuestion = () => {
    if (!currentQuestion) return
    const v = draft.answers[currentQuestion.id] ?? ''
    const err = validateAnswer(currentQuestion, v)
    if (err) {
      setFieldError(err)
      return
    }
    setFieldError(undefined)
    void impactLight()
    if (effectiveIndex >= visibleQuestions.length - 1) {
      setUiPhase('review')
      persistProgress('review', effectiveIndex)
      return
    }
    const next = effectiveIndex + 1
    setQIndex(next)
    persistProgress('question', next)
  }

  const handleEditFromReview = (index: number) => {
    setQIndex(index)
    setUiPhase('question')
    persistProgress('question', index)
  }

  const handleBackFromReview = () => {
    setUiPhase('question')
    setQIndex(Math.max(0, visibleQuestions.length - 1))
    persistProgress('question', Math.max(0, visibleQuestions.length - 1))
  }

  const handleSubmit = () => {
    void impactMedium()
    const submittedAt = new Date().toISOString()
    const outcome = evaluateSubmission(draft.answers)
    const payload = {
      submittedAt,
      answers: draft.answers,
      outcome,
    }
    console.log('[tuibao] submit', payload)
    appendAssessmentRecord(outcome)
    setHistoryRecords(loadAssessmentHistory())
    setSubmissionOutcome(outcome)
    resetDraft(initialDraft())
    setUiPhase('success')
  }

  const handleResetToIntro = () => {
    resetDraft(initialDraft())
    setSubmissionOutcome(null)
    setUiPhase('intro')
    setQIndex(0)
  }

  const handleSkipSuccessToHome = () => {
    handleResetToIntro()
  }

  const handleUnlocked = () => {
    setUnlockVersion((v) => v + 1)
    setUiPhase('guide')
  }

  const onAnswerChange = (value: string) => {
    if (!currentQuestion) return
    setAnswerCascade(currentQuestion.id, value)
  }

  const shellClass = useMemo(
    () => `app-shell phase-${uiPhase}`,
    [uiPhase],
  )

  return (
    <div className={shellClass}>
      {showResume ? (
        <ResumeDraftDialog onResume={handleResume} onDismiss={handleDismissResume} />
      ) : null}

      {uiPhase === 'intro' ? (
        <IntroScreen
          onStart={handleStart}
          showPurchasedEntry={unlocked}
          onOpenGuide={() => setUiPhase('guide')}
          onOpenSettings={() => setUiPhase('settings')}
          historyCount={historyRecords.length}
          onOpenHistory={() => {
            setHistoryReturnTarget('intro')
            setUiPhase('history')
          }}
        />
      ) : null}

      {uiPhase === 'settings' ? (
        <SettingsScreen
          onBack={() => setUiPhase('intro')}
          onOpenHistory={() => {
            setHistoryReturnTarget('settings')
            setUiPhase('history')
          }}
          onOpenLegalPrivacy={() => {
            setLegalKind('privacy')
            setUiPhase('legal')
          }}
          onOpenLegalTerms={() => {
            setLegalKind('terms')
            setUiPhase('legal')
          }}
          onClearDraft={() => {
            resetDraft(initialDraft())
            setShowResume(false)
            setQIndex(0)
            window.alert('已清除本地草稿。')
          }}
        />
      ) : null}

      {uiPhase === 'history' ? (
        <HistoryScreen
          records={historyRecords}
          onRecordsChange={() => setHistoryRecords(loadAssessmentHistory())}
          onBack={() => setUiPhase(historyReturnTarget)}
        />
      ) : null}

      {uiPhase === 'legal' ? (
        <LegalScreen
          kind={legalKind}
          onBack={() => setUiPhase('settings')}
        />
      ) : null}

      {uiPhase === 'question' && currentQuestion ? (
        <QuestionScreen
          question={currentQuestion}
          index={effectiveIndex}
          total={visibleQuestions.length}
          value={answerValue}
          onChange={onAnswerChange}
          showSection={showSection}
          error={fieldError}
          onBack={goBackFromQuestion}
          onNext={goNextFromQuestion}
        />
      ) : null}

      {uiPhase === 'review' ? (
        <ReviewScreen
          questions={visibleQuestions}
          answers={draft.answers}
          onEdit={handleEditFromReview}
          onSubmit={handleSubmit}
          onBack={handleBackFromReview}
        />
      ) : null}

      {uiPhase === 'success' && submissionOutcome ? (
        <SuccessScreen
          outcome={submissionOutcome}
          onUnlocked={handleUnlocked}
          onSkipToHome={handleSkipSuccessToHome}
        />
      ) : null}

      {uiPhase === 'guide' ? (
        <GuideScreen onBack={() => setUiPhase('intro')} />
      ) : null}
    </div>
  )
}
