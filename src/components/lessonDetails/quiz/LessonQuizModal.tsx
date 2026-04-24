import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2, Clock, Play, HelpCircle, LayoutGrid } from 'lucide-react';
import { useTimer } from '../../../hooks/useTimer';
import { useToast } from '../../../hooks/useToast';
import { 
    startLessonQuiz, 
    getLessonQuizSession, 
    finishLessonQuiz,
    LessonQuizSession,
    LessonQuizQuestion 
} from '../../../api/lesson-tasks/lessonTasksApi';

interface ShuffledQuestion extends LessonQuizQuestion {
    shuffledOptions: { label: string; originalKey: string }[];
}

interface SubmitResponse {
    percentage: number;
    correct: number;
    wrong: number;
    total: number;
    spentSeconds: number;
    unanswered: number;
}

interface LessonQuizModalProps {
    task: { id: string; title: string };
    onClose: () => void;
}

export function LessonQuizModal({ task, onClose }: LessonQuizModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [session, setSession] = useState<LessonQuizSession | null>(null);
    const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<SubmitResponse | null>(null);

    const shuffleOptions = useCallback((q: LessonQuizQuestion): ShuffledQuestion => {
        const options = [
            { label: q.optionA, originalKey: 'A' },
            { label: q.optionB, originalKey: 'B' },
            { label: q.optionC, originalKey: 'C' },
            { label: q.optionD, originalKey: 'D' }
        ].sort(() => Math.random() - 0.5);
        return { ...q, shuffledOptions: options };
    }, []);

    const handleFinalSubmit = useCallback(async (finalAnswers: (number | null)[]) => {
        if (submitting || !session) return;
        setSubmitting(true);

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

            const data = await finishLessonQuiz(session.sessionId, formattedAnswers);
            setResult(data);
            setShowResult(true);
            localStorage.removeItem(`activeLessonTaskSessionId_${task.id}`);
            toast.success('Test yakunlandi!');
        } catch (error) {
            toast.error('Xatolik yuz berdi');
        } finally {
            setSubmitting(false);
        }
    }, [questions, submitting, session, task.id, toast]);

    const { timeLeft, startTimer, setTimeLeft } = useTimer(0, () => {
        handleFinalSubmit(answers);
    });

    const initQuizSession = useCallback((data: LessonQuizSession) => {
        setSession(data);
        const shuffled = data.questions.map(shuffleOptions);
        setQuestions(shuffled);
        
        const initialAnswers = shuffled.map(q => {
            if (q.selectedOption) {
                return q.shuffledOptions.findIndex(o => o.originalKey === q.selectedOption);
            }
            return null;
        });
        setAnswers(initialAnswers);

        // Prioritize remainingSeconds from backend for maximum accuracy
        const secondsLeft = data.remainingSeconds ?? Math.max(0, Math.floor((new Date(data.endsAt).getTime() - new Date().getTime()) / 1000));
        setTimeLeft(secondsLeft);
        startTimer();
        setLoading(false);
    }, [shuffleOptions, setTimeLeft, startTimer]);

    useEffect(() => {
        const loadQuiz = async () => {
            const savedSessionId = localStorage.getItem(`activeLessonTaskSessionId_${task.id}`);
            if (savedSessionId) {
                try {
                    const data = await getLessonQuizSession(savedSessionId);
                    if (data.status === 'IN_PROGRESS') {
                        initQuizSession(data);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem(`activeLessonTaskSessionId_${task.id}`);
                }
            }
            
            try {
                const data = await startLessonQuiz(task.id);
                localStorage.setItem(`activeLessonTaskSessionId_${task.id}`, data.sessionId);
                initQuizSession(data);
            } catch (error: any) {
                const message = error.response?.data?.message || error.message || 'Testni boshlab bo\'lmadi';
                toast.error(message);
                console.error("Quiz start error:", error);
                onClose();
            }
        };

        loadQuiz();
    }, [task.id, initQuizSession, onClose, toast]);

    const handleSelectOption = (index: number) => {
        if (submitting) return;
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = index;
        setAnswers(newAnswers);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                                {task.title}
                            </h3>
                            {!showResult && session && (
                                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className={`text-[10px] sm:text-xs font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Questions Section */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-10 scrollbar-hide">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                <p className="text-sm font-black uppercase italic tracking-widest text-slate-400 animate-pulse">Yuklanmoqda...</p>
                            </div>
                        ) : showResult && result ? (
                            <div className="space-y-8 py-4 max-w-2xl mx-auto">
                                <div className="text-center space-y-4">
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center border-8 border-blue-600 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white italic">{Math.round(result.percentage)}%</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Natija</div>
                                        </div>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                                        {result.percentage >= 80 ? 'Ajoyib natija!' : result.percentage >= 60 ? 'Yaxshi natija!' : "O'rganishda davom eting!"}
                                    </h2>
                                </div>
                                
                                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                                    {[
                                        { label: "To'g'ri", value: result.correct, color: "text-emerald-500" },
                                        { label: "Xato", value: result.wrong, color: "text-red-500" },
                                        { label: "Bo'sh", value: result.unanswered, color: "text-slate-400" },
                                        { label: "Vaqt", value: `${Math.floor(result.spentSeconds / 60)}:${String(result.spentSeconds % 60).padStart(2, '0')}`, color: "text-blue-600" },
                                        { label: "Jami", value: result.total, color: "text-slate-900 dark:text-white" }
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <p className={`text-lg sm:text-2xl font-black italic ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Chiqish
                                    </button>
                                    <button 
                                        onClick={onClose} 
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                                    >
                                        Tahlil qilish
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-y-10 max-w-2xl mx-auto">
                                <div className="space-y-4 text-center">
                                    <span className="inline-block px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase tracking-[3px]">
                                        Savol #{currentQuestion + 1} / {questions.length}
                                    </span>
                                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white italic leading-tight">
                                        {questions[currentQuestion]?.questionText}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    {questions[currentQuestion]?.shuffledOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(idx)}
                                            className={`group w-full p-4 sm:p-6 rounded-[24px] text-left transition-all border-2 ${
                                                answers[currentQuestion] === idx
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-blue-100 text-slate-700 dark:text-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 font-black text-xs sm:text-sm ${
                                                    answers[currentQuestion] === idx ? 'border-white bg-white text-blue-600' : 'border-slate-100'
                                                }`}>
                                                    {answers[currentQuestion] === idx ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="flex-1 text-sm sm:text-lg font-bold leading-tight">{opt.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Drawer/Aside */}
                    {!loading && !showResult && (
                        <aside className="w-full lg:w-80 bg-slate-50/50 dark:bg-slate-900/50 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col shrink-0">
                            <div className="flex items-center gap-2 mb-6">
                                <LayoutGrid className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Navigatsiya</h3>
                            </div>
                            <div className="grid grid-cols-6 lg:grid-cols-4 gap-2.5">
                                {questions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                                            currentQuestion === idx
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : answers[idx] !== null
                                                    ? 'bg-blue-600/20 border-blue-600/30 text-blue-700 dark:text-blue-400'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-auto pt-8">
                                <div className="p-4 rounded-3xl bg-blue-600/5 dark:bg-blue-900/10 border border-blue-600/10">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                        <span className="text-xs font-black text-blue-600">{Math.round((answers.filter(a => a !== null).length / questions.length) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div 
                                            animate={{ width: `${(answers.filter(a => a !== null).length / questions.length) * 100}%` }}
                                            className="h-full bg-blue-600" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Footer Controls */}
                {!loading && !showResult && (
                    <div className="p-5 sm:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                        <button 
                            onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                            disabled={currentQuestion === 0}
                            className="px-6 py-3 rounded-xl font-black text-[10px] text-slate-400 disabled:opacity-20 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                            Orqaga
                        </button>
                        <div className="flex gap-3">
                            {currentQuestion === questions.length - 1 ? (
                                <button 
                                    onClick={() => handleFinalSubmit(answers)}
                                    className="px-10 py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>Yakunlash <Play className="w-3 h-3 fill-current" /></>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentQuestion(q => q + 1)}
                                    className="px-10 py-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
                                >
                                    Keyingisi
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
