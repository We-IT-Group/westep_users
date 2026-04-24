import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    Clock,
    HelpCircle,
    History,
    LayoutGrid,
    Loader2,
    Play,
    X,
} from "lucide-react";
import {
    finishLessonQuiz,
    getLessonQuizSession,
    LessonQuizSession,
    startLessonQuiz,
} from "../../../api/lesson-tasks/lessonTasksApi.ts";
import { useToast } from "../../../hooks/useToast.tsx";
import { useTimer } from "../../../hooks/useTimer.ts";

interface BackendQuestion {
    sessionQuestionId: string;
    questionId: string;
    orderIndex: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    selectedOption: string | null;
}

interface ShuffledQuestion extends BackendQuestion {
    shuffledOptions: { label: string; originalKey: string }[];
}

interface SessionResponse {
    sessionId: string;
    questions: BackendQuestion[];
    endsAt: string;
    durationMinutes: number;
    status: "IN_PROGRESS" | "FINISHED";
}

function normalizeSession(data: LessonQuizSession): SessionResponse {
    return {
        sessionId: data.sessionId,
        questions: data.questions,
        endsAt: data.endsAt,
        durationMinutes: data.durationMinutes,
        status: data.status === "FINISHED" ? "FINISHED" : "IN_PROGRESS",
    };
}

interface SubmitResponse {
    percentage: number;
    correct: number;
    wrong: number;
    total: number;
    spentSeconds: number;
    unanswered: number;
}

interface InlineLessonQuizProps {
    task: { id: string; title: string };
    onClose: () => void;
}

export function InlineLessonQuiz({ task, onClose }: InlineLessonQuizProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [session, setSession] = useState<SessionResponse | null>(null);
    const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<SubmitResponse | null>(null);
    const [isTestActive, setIsTestActive] = useState(false);

    const shuffleOptions = useCallback((question: BackendQuestion): ShuffledQuestion => {
        const originalOptions = [
            { label: question.optionA, originalKey: "A" },
            { label: question.optionB, originalKey: "B" },
            { label: question.optionC, originalKey: "C" },
            { label: question.optionD, originalKey: "D" },
        ];
        const shuffled = [...originalOptions];

        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[index],
            ];
        }

        return { ...question, shuffledOptions: shuffled };
    }, []);

    const handleFinalSubmit = useCallback(
        async (finalAnswers: (number | null)[]) => {
            if (submitting || !session) return;

            setSubmitting(true);
            setIsTestActive(false);

            try {
                const formattedAnswers = questions
                    .map((question, index) => ({
                        questionId: question.questionId,
                        selection: finalAnswers[index],
                    }))
                    .filter(
                        (
                            answer,
                        ): answer is { questionId: string; selection: number } =>
                            answer.selection !== null,
                    )
                    .map((answer) => ({
                        questionId: answer.questionId,
                        selectedOption:
                            questions.find(
                                (question) => question.questionId === answer.questionId,
                            )?.shuffledOptions[answer.selection].originalKey || "A",
                    }));

                const data = await finishLessonQuiz(session.sessionId, formattedAnswers);
                setResult(data);
                setShowResult(true);
                localStorage.removeItem(`activeLessonTaskSessionId_${task.id}`);
                toast.success("Test muvaffaqiyatli yakunlandi!");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Natijalarni yuborishda xatolik yuz berdi",
                );
                setIsTestActive(true);
            } finally {
                setSubmitting(false);
            }
        },
        [questions, session, submitting, task.id, toast],
    );

    const { timeLeft, startTimer, setTimeLeft } = useTimer(0, () => {
        handleFinalSubmit(answers);
    });

    const initSession = useCallback(
        (data: SessionResponse) => {
            setSession(data);
            const shuffledQuestions = data.questions.map(shuffleOptions);
            setQuestions(shuffledQuestions);

            const initialAnswers = shuffledQuestions.map((question) => {
                if (!question.selectedOption) return null;

                return question.shuffledOptions.findIndex(
                    (option) => option.originalKey === question.selectedOption,
                );
            });

            setAnswers(initialAnswers);

            const endsAt = new Date(data.endsAt).getTime();
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));

            setTimeLeft(remaining);
            setIsTestActive(true);
            startTimer();
            setLoading(false);
        },
        [setTimeLeft, shuffleOptions, startTimer],
    );

    useEffect(() => {
        async function recoverSession() {
            const activeSessionId = localStorage.getItem(
                `activeLessonTaskSessionId_${task.id}`,
            );

            if (activeSessionId) {
                try {
                    const data = await getLessonQuizSession(activeSessionId);
                    if (data.status === "IN_PROGRESS") {
                        initSession(normalizeSession(data));
                        return;
                    }
                } catch (error) {
                    localStorage.removeItem(`activeLessonTaskSessionId_${task.id}`);
                }
            }

            setLoading(false);
        }

        recoverSession();
    }, [initSession, task.id]);

    const handleStartTest = async () => {
        try {
            setLoading(true);
            const data = await startLessonQuiz(task.id);
            localStorage.setItem(`activeLessonTaskSessionId_${task.id}`, data.sessionId);
            initSession(normalizeSession(data));
            toast.success("Test boshlandi! Omad yor bo'lsin.");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Testni boshlashda xatolik yuz berdi",
            );
            setLoading(false);
        }
    };

    const handleSelectOption = (index: number) => {
        if (!isTestActive || submitting) return;
        const nextAnswers = [...answers];
        nextAnswers[currentQuestion] = index;
        setAnswers(nextAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            return;
        }

        handleFinalSubmit(answers);
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;
        return `${minutes}:${remainder.toString().padStart(2, "0")}`;
    };

    const progress = questions.length
        ? ((currentQuestion + 1) / questions.length) * 100
        : 0;

    const question = questions[currentQuestion];
    const currentSelected = answers[currentQuestion];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[40px]"
        >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-900/20">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-xl">
                            {task.title}
                        </h3>
                        {!showResult && session && (
                            <div className="mt-1 flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span
                                    className={`text-[10px] font-black sm:text-xs ${
                                        timeLeft <= 60
                                            ? "animate-pulse text-red-500"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 p-8">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm font-black uppercase italic tracking-widest text-slate-400">
                        Yuklanmoqda...
                    </p>
                </div>
            ) : !session && !showResult ? (
                <div className="p-6 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-xl"
                    >
                        <div className="space-y-8 rounded-[32px] border border-slate-100 bg-slate-50/60 p-8 text-center dark:border-slate-800 dark:bg-slate-950/40 sm:rounded-[40px] sm:p-12">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[32px] bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                                <Play className="h-10 w-10 fill-current" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                                    Testni boshlash
                                </h2>
                                <p className="font-medium text-slate-500">
                                    Ushbu test savollaridan o'tib, dars bo'yicha bilimingizni tekshiring.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-3xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="text-xl font-black text-slate-900 dark:text-white">
                                        {question?.shuffledOptions.length ? questions.length : "?"}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Savollar
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="text-xl font-black text-slate-900 dark:text-white">
                                        10m
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Vaqt
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={handleStartTest}
                                    className="w-full rounded-2xl bg-blue-600 py-5 font-black uppercase tracking-widest text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 dark:shadow-none"
                                >
                                    Testni boshlash
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-4 font-bold text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-800"
                                >
                                    <History className="h-4 w-4" />
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : showResult && result ? (
                <div className="p-6 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-4xl space-y-8"
                    >
                        <div className="space-y-6 text-center">
                            <div className="relative mx-auto h-32 w-32 sm:h-40 sm:w-40">
                                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-8 border-blue-600 bg-blue-50 dark:bg-blue-900/20">
                                    <div className="text-3xl font-black italic text-slate-900 dark:text-white sm:text-4xl">
                                        {Math.round(result.percentage)}%
                                    </div>
                                    <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Natija
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                {result.percentage >= 80
                                    ? "Ajoyib natija!"
                                    : result.percentage >= 60
                                      ? "Yaxshi natija!"
                                      : "O'rganishda davom eting!"}
                            </h2>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    {
                                        label: "To'g'ri",
                                        value: result.correct,
                                        color: "text-emerald-500",
                                    },
                                    {
                                        label: "Xato",
                                        value: result.wrong,
                                        color: "text-red-500",
                                    },
                                    {
                                        label: "Bo'sh",
                                        value: result.unanswered,
                                        color: "text-slate-400",
                                    },
                                    {
                                        label: "Vaqt",
                                        value: `${Math.floor((result.spentSeconds || 0) / 60)}:${String((result.spentSeconds || 0) % 60).padStart(2, "0")}`,
                                        color: "text-blue-600",
                                    },
                                    {
                                        label: "Jami",
                                        value: result.total,
                                        color: "text-slate-900 dark:text-white",
                                    },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className={`text-lg font-black italic sm:text-2xl ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 sm:text-[10px]">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-2xl bg-slate-100 py-4 font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            >
                                Yopish
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-4 sm:p-6 lg:p-10">
                        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
                            <div className="space-y-3 text-center sm:space-y-4">
                                <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-[9px] font-black uppercase tracking-[3px] text-blue-600 dark:bg-blue-900/30">
                                    Savol #{currentQuestion + 1}
                                </span>
                                <h2 className="text-xl font-black italic text-slate-900 dark:text-white sm:text-2xl lg:text-3xl">
                                    {question?.questionText}
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentQuestion}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 gap-2.5 sm:gap-3"
                                    >
                                        {question?.shuffledOptions.map((option, index) => (
                                            <button
                                                key={option.originalKey}
                                                type="button"
                                                onClick={() => handleSelectOption(index)}
                                                className={`w-full rounded-[20px] border-2 p-4 text-left transition-all sm:p-5 ${
                                                    currentSelected === index
                                                        ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                                        : "border-slate-100 bg-white text-slate-700 hover:border-blue-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-xs font-black sm:h-10 sm:w-10 sm:text-sm ${
                                                            currentSelected === index
                                                                ? "border-white bg-white text-blue-600"
                                                                : "border-slate-100"
                                                        }`}
                                                    >
                                                        {currentSelected === index ? (
                                                            <Check className="h-5 w-5" />
                                                        ) : (
                                                            String.fromCharCode(65 + index)
                                                        )}
                                                    </div>
                                                    <span className="flex-1 text-sm font-bold leading-tight sm:text-lg">
                                                        {option.label}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={currentQuestion === 0}
                                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-black text-slate-700 transition-all disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:text-sm"
                                >
                                    Oldingi
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={submitting}
                                    className="rounded-2xl border border-blue-500 bg-blue-600 px-8 py-3.5 text-xs font-black text-white transition-all hover:bg-blue-700 disabled:opacity-50 sm:text-sm"
                                >
                                    {currentQuestion === questions.length - 1
                                        ? "Yakunlash"
                                        : "Keyingi savol"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <aside className="w-full border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/40 lg:w-80 lg:border-l lg:border-t-0">
                        <div className="mb-6 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-slate-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">
                                Navigatsiya
                            </h3>
                        </div>

                        <div className="mb-6">
                            <div className="mb-1.5 flex items-center justify-center gap-3">
                                <div
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black sm:text-xs ${
                                        timeLeft <= 60
                                            ? "animate-pulse bg-red-50 text-red-600"
                                            : "bg-white text-slate-600 dark:bg-slate-800"
                                    }`}
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-blue-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-6 gap-2.5 lg:grid-cols-4">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`aspect-square rounded-full border-2 text-[11px] font-black transition-all ${
                                        currentQuestion === index
                                            ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : answers[index] !== null
                                              ? "border-blue-600/30 bg-blue-600/20 text-blue-700 dark:text-blue-400"
                                              : "border-slate-100 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-800"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>
            )}
        </motion.div>
    );
}
