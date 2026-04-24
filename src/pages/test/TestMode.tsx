import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Clock, LayoutGrid, Play, History, ChevronRight } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { testApi, BackendQuestion, SubmitResponse } from '../../api/module-tests/testApi';
import { useToast } from '../../hooks/useToast';
import { useTimer } from '../../hooks/useTimer';
import { QuizHistoryDetailModal } from '../../components/quizHistory/QuizHistoryDetailModal.tsx';
import {
  finishLessonQuiz,
  getLessonQuizSession,
  LessonQuizQuestion,
  startLessonQuiz,
} from '../../api/lesson-tasks/lessonTasksApi.ts';

type UnifiedQuestion = BackendQuestion | LessonQuizQuestion;
type UnifiedSession = {
  sessionId: string;
  questions: UnifiedQuestion[];
  endsAt: string;
  durationMinutes: number;
  questionCount?: number;
  status: 'IN_PROGRESS' | 'FINISHED' | string;
  moduleId?: string;
};
type TestSource = 'module' | 'lesson-task';

type ShuffledQuestion = UnifiedQuestion & {
  shuffledOptions: { label: string; originalKey: string }[];
};

type PreviewModuleLesson = {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
};

type PreviewModule = {
  id: string;
  title: string;
  lessons: PreviewModuleLesson[];
};

export default function TestMode() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const navigateBackOrTo = (fallback: string) => {
    if (testSource === 'lesson-task') {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<UnifiedSession | null>(null);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [testSource, setTestSource] = useState<TestSource>('module');
  const [showLessonResultDetail, setShowLessonResultDetail] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [testInfo, setTestInfo] = useState<{
    questionCount?: number;
    durationMinutes?: number;
  }>({
    questionCount: location.state?.questionCount,
    durationMinutes: location.state?.durationMinutes,
  });
  const previewModules = (location.state?.modules || []) as PreviewModule[];
  const selectedLessonId = location.state?.selectedLessonId as string | undefined;
  const selectedModuleId = location.state?.selectedModuleId as string | undefined;
  const courseTitle = (location.state?.courseTitle as string | undefined) || "Kurs";
  const [expandedPreviewModules, setExpandedPreviewModules] = useState<string[]>(
    selectedModuleId ? [selectedModuleId] : previewModules[0] ? [previewModules[0].id] : [],
  );

  const moduleSessionStorageKey = 'activeTestSessionId';
  const lessonTaskSessionStorageKey = `activeLessonTaskSessionId_${testId}`;

  useEffect(() => {
    if (selectedModuleId) {
      setExpandedPreviewModules([selectedModuleId]);
      return;
    }
    if (previewModules[0]?.id) {
      setExpandedPreviewModules([previewModules[0].id]);
    }
  }, [selectedModuleId, previewModules]);

  const shuffleOptions = (q: UnifiedQuestion): ShuffledQuestion => {
    const originalOptions = [
      { label: q.optionA, originalKey: 'A' },
      { label: q.optionB, originalKey: 'B' },
      { label: q.optionC, originalKey: 'C' },
      { label: q.optionD, originalKey: 'D' }
    ];
    const shuffled = [...originalOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return { ...q, shuffledOptions: shuffled };
  };

  const handleFinalSubmit = useCallback(async (finalAnswers: (number | null)[]) => {
    if (submitting || !session) return;
    setSubmitting(true);
    setIsTestActive(false);

    try {
      const formattedAnswers = questions
        .map((q, idx) => ({
          questionId: q.questionId,
          selection: finalAnswers[idx]
        }))
        .filter(a => a.selection !== null)
        .map(a => ({
          questionId: a.questionId,
          selectedOption: questions.find(q => q.questionId === a.questionId)!.shuffledOptions[a.selection!].originalKey
        }));

      const response = testSource === 'lesson-task'
        ? await finishLessonQuiz(session.sessionId, formattedAnswers)
        : await testApi.finishSession(session.sessionId, formattedAnswers);
      setResult(response);
      setShowResult(true);
      if (testSource === 'lesson-task') {
        localStorage.removeItem(lessonTaskSessionStorageKey);
      } else {
        localStorage.removeItem(moduleSessionStorageKey);
      }
      toast.success('Test muvaffaqiyatli yakunlandi!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Natijalarni yuborishda xatolik yuz berdi');
      setIsTestActive(true);
    } finally {
      setSubmitting(false);
    }
  }, [questions, submitting, session, testSource, lessonTaskSessionStorageKey]);

  const { timeLeft, startTimer, setTimeLeft } = useTimer(0, () => {
    handleFinalSubmit(answers);
  });

  const initSession = (data: UnifiedSession, source: TestSource) => {
    setSession(data);
    setTestSource(source);
    setTestInfo({
      questionCount: data.questionCount,
      durationMinutes: data.durationMinutes,
    });
    const shuffled = data.questions.map(shuffleOptions);
    setQuestions(shuffled);

    const initialAnswers = shuffled.map(q => {
      if (q.selectedOption) {
        return q.shuffledOptions.findIndex(o => o.originalKey === q.selectedOption);
      }
      return null;
    });
    setAnswers(initialAnswers);

    const endsAt = new Date(data.endsAt).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
    setTimeLeft(remaining);

    setIsTestActive(true);
    startTimer();
    setLoading(false);
  };

  useEffect(() => {
    async function recoverSession() {
      const activeLessonTaskSessionId = localStorage.getItem(lessonTaskSessionStorageKey);
      if (activeLessonTaskSessionId) {
        try {
          const data = await getLessonQuizSession(activeLessonTaskSessionId);
          if (data.status === 'IN_PROGRESS') {
            initSession(data, 'lesson-task');
            return;
          }
          localStorage.removeItem(lessonTaskSessionStorageKey);
        } catch (error) {
          localStorage.removeItem(lessonTaskSessionStorageKey);
        }
      }

      const activeModuleSessionId = localStorage.getItem(moduleSessionStorageKey);
      if (activeModuleSessionId) {
        try {
          const data = await testApi.getSession(activeModuleSessionId);
          if (data.status === 'IN_PROGRESS' && data.moduleId === testId) {
            initSession(data, 'module');
            return;
          } else {
            localStorage.removeItem(moduleSessionStorageKey);
          }
        } catch (error) {
          localStorage.removeItem(moduleSessionStorageKey);
        }
      }
      setLoading(false);
    }
    recoverSession();
  }, [testId, lessonTaskSessionStorageKey]);

  const handleStartTest = async () => {
    try {
      setLoading(true);
      const data = await testApi.startSession(testId!);
      localStorage.setItem(moduleSessionStorageKey, data.sessionId);
      initSession(data, 'module');
      toast.success('Test boshlandi! Omad yor bo\'lsin.');
    } catch (error) {
      try {
        const data = await startLessonQuiz(testId!);
        localStorage.setItem(lessonTaskSessionStorageKey, data.sessionId);
        initSession(data, 'lesson-task');
        toast.success('Test boshlandi! Omad yor bo\'lsin.');
      } catch (lessonTaskError) {
        toast.error(
          lessonTaskError instanceof Error
            ? lessonTaskError.message
            : 'Testni boshlashda xatolik yuz berdi',
        );
        setLoading(false);
      }
    }
  };

  const handleRetryTest = async () => {
    if (testSource === 'lesson-task') {
      localStorage.removeItem(lessonTaskSessionStorageKey);
    } else {
      localStorage.removeItem(moduleSessionStorageKey);
    }

    setShowLessonResultDetail(false);
    setShowResult(false);
    setResult(null);
    setSession(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setIsTestActive(false);

    await handleStartTest();
  };

  const handleExitAttempt = useCallback(() => {
    if (isTestActive && !showResult) {
      setShowExitWarning(true);
      return;
    }

    navigate('/');
  }, [isTestActive, navigate, showResult]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isTestActive || showResult) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTestActive, showResult]);

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinalSubmit(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSelectOption = (index: number) => {
    if (!isTestActive || submitting) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-black italic animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!session && !showResult) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-8 lg:flex-row">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full lg:flex-1">
            <div className="p-8 sm:p-12 rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center text-blue-600 mx-auto">
                <Play className="w-10 h-10 fill-current" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Testni boshlash</h2>
                <p className="text-slate-500 font-medium">Ushbu test teacher tomonidan belgilangan barcha savollar va vaqt limiti bilan ochiladi.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-black text-slate-900 dark:text-white">{testInfo.questionCount ?? '—'}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savollar</div>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {typeof testInfo.durationMinutes === 'number' ? `${testInfo.durationMinutes}m` : '—'}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaqt</div>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleStartTest} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
                  Testni boshlash
                </button>
                <button onClick={() => navigateBackOrTo('/test-history')} className="w-full py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <History className="w-4 h-4" />
                  {testSource === 'lesson-task' ? "Orqaga qaytish" : "Natijalar tarixi"}
                </button>
              </div>
            </div>
          </motion.div>

          {previewModules.length > 0 ? (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex w-full shrink-0 flex-col overflow-hidden border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:w-[420px]"
            >
              <div className="shrink-0 border-b border-slate-100 bg-slate-50/30 p-6 dark:border-slate-800 dark:bg-slate-900/30 sm:p-8">
                <h3 className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 sm:text-[11px]">
                  Kurs mundarijasi
                  <span className="rounded-lg border border-slate-100 bg-white px-2 py-0.5 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400">
                    {courseTitle}
                  </span>
                </h3>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800 sm:h-2">
                  <div className="h-full w-1/2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                </div>
              </div>

              <div className="max-h-[70vh] flex-1 space-y-3 overflow-y-auto p-4 sm:p-5 lg:max-h-none">
                {previewModules.map((module) => {
                  const isSelectedModule = module.id === selectedModuleId;
                  const isExpanded = expandedPreviewModules.includes(module.id);
                  return (
                    <div key={module.id} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPreviewModules((prev) => (prev.includes(module.id) ? [] : [module.id]))
                        }
                        className={`flex w-full items-center justify-between gap-1 rounded-xl border p-4 text-left text-[12px] font-black transition-all sm:rounded-[24px] sm:p-5 sm:text-[13px] ${
                          isExpanded || isSelectedModule
                            ? "border-blue-100 bg-blue-600/10 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400"
                            : "border-transparent bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-left uppercase tracking-wide">
                            {module.title}
                          </span>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                          <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                        </motion.div>
                      </button>

                      {isExpanded && (
                        <div className="space-y-1.5 pl-1 pt-1">
                          {module.lessons.map((lesson) => {
                            const isSelectedLesson = lesson.id === selectedLessonId;
                            return (
                              <div
                                key={lesson.id}
                                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all sm:rounded-[24px] sm:p-4 ${
                                  isSelectedLesson
                                    ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none"
                                    : "border-transparent bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                                }`}
                              >
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                    lesson.completed && !isSelectedLesson
                                      ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20"
                                      : isSelectedLesson
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-slate-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                  }`}
                                >
                                  {lesson.completed && !isSelectedLesson ? (
                                    <Check className="h-4.5 w-4.5" strokeWidth={4} />
                                  ) : (
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="truncate text-[12px] font-black uppercase italic leading-tight sm:text-[13px]">
                                    {lesson.title}
                                  </p>
                                  <span className="mt-1 block text-[8px] font-black uppercase tracking-widest text-inherit opacity-70 sm:text-[10px]">
                                    {lesson.duration}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          ) : null}
        </div>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full">
            <div className="p-6 sm:p-10 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
              <div className="text-center space-y-6">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                   <div className="absolute inset-0 flex flex-col items-center justify-center border-8 border-blue-600 rounded-full">
                      <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white italic">{Math.round(result.percentage)}%</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Natija</div>
                   </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                  {result.percentage >= 80 ? 'Ajoyib natija!' : result.percentage >= 60 ? 'Yaxshi natija!' : "O'rganishda davom eting!"}
                </h2>
                <div className="grid grid-cols-5 gap-3">
                   <div className="text-center">
                    <p className="text-lg font-black text-emerald-500">{result.correct}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">To'g'ri</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-red-500">{result.wrong}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Xato</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-400">{result.unanswered}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Bo'sh</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-blue-600 italic">{Math.floor((result.spentSeconds || 0) / 60)}:{String((result.spentSeconds || 0) % 60).padStart(2, '0')}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Vaqt</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{result.total}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Jami</p>
                  </div>
                </div>
              </div>
              <div className={`grid gap-4 ${testSource === 'lesson-task' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                <button onClick={() => navigateBackOrTo('/')} className="py-4 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-500">{testSource === 'lesson-task' ? "Darsga qaytish" : "Asosiyga qaytish"}</button>
                {testSource === 'module' ? (
                  <button onClick={() => navigate(`/test-result/${result.sessionId}`)} className="py-4 bg-blue-600 text-white rounded-xl font-bold">To'liq tahlil</button>
                ) : (
                  <>
                    <button onClick={() => setShowLessonResultDetail(true)} className="py-4 bg-blue-600 text-white rounded-xl font-bold">Natijalarni ko'rish</button>
                    <button onClick={handleRetryTest} className="py-4 rounded-xl border border-blue-200 bg-blue-50 font-bold text-blue-600 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-400">Qayta topshirish</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {testSource === 'lesson-task' && showLessonResultDetail ? (
            <QuizHistoryDetailModal
              sessionId={result.sessionId}
              onClose={() => setShowLessonResultDetail(false)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentSelected = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <div className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 sm:px-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleExitAttempt}
            className="flex items-center gap-2 group text-slate-500 hover:text-red-500 transition-colors"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-50">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="hidden sm:inline text-xs font-black uppercase tracking-tighter">Chiqish</span>
          </button>
          <div className="flex-1 max-w-xl mx-2 sm:mx-8">
            <div className="flex items-center justify-center gap-3 mb-1.5">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] sm:text-xs ${timeLeft <= 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[2px]">Navigatsiya</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <AnimatePresence mode="wait">
                <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 sm:space-y-8 flex-1">
                  <div className="space-y-3 sm:space-y-4 text-center">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[9px] font-black uppercase tracking-[3px]">
                      Savol #{currentQuestion + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white italic">
                      {question.questionText}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                    {question.shuffledOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`group w-full p-4 sm:p-5 rounded-[20px] text-left transition-all border-2 ${currentSelected === idx
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100 text-slate-700 dark:text-slate-200'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border-2 ${currentSelected === idx ? 'border-white bg-white text-blue-600' : 'border-slate-100'}`}>
                            {currentSelected === idx ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-black">{String.fromCharCode(65 + idx)}</span>}
                          </div>
                          <span className="text-sm sm:text-base font-bold leading-tight">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100 shrink-0">
                <button onClick={handlePrevious} disabled={currentQuestion === 0} className="px-6 py-3 rounded-xl font-black text-[10px] text-slate-400 disabled:opacity-20 uppercase tracking-widest">
                  Oldingisi
                </button>
                <motion.button onClick={handleNext} className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : currentQuestion === questions.length - 1 ? 'Yakunlash' : 'Keyingisi'}
                </motion.button>
              </div>
            </div>
          </div>
          <aside className="w-full lg:w-[300px] bg-slate-50/50 dark:bg-slate-900/50 border-t lg:border-t-0 p-6 flex flex-col gap-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Navigatsiya</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${currentQuestion === idx
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                      : answers[idx] !== null
                        ? 'bg-blue-600/20 border-blue-600/30 text-blue-700'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {showExitWarning ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setShowExitWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
                  <X className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                    Test hali yakunlanmagan
                  </h3>
                  <p className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                    Chiqishdan oldin testni yakunlashingiz kerak. Natijalar saqlanishi uchun avval testni tugating.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setShowExitWarning(false)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Testga qaytish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitWarning(false);
                      handleFinalSubmit(answers);
                    }}
                    className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition-all hover:bg-blue-700"
                  >
                    Testni yakunlash
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
