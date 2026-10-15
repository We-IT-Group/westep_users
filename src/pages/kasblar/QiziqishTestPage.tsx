import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, RefreshCw } from "lucide-react";
import { useUser } from "../../api/auth/useAuth.ts";
import {
    useInterestQuiz,
    useInterestQuizTiers,
    useLatestQuizResult,
    useSubmitInterestQuiz,
} from "../../api/professions/useProfessions.ts";
import type { InterestQuizResultDto } from "../../api/professions/types.ts";
import { QuestionCard } from "./qiziqish/QuestionCard.tsx";
import { ResultView } from "./qiziqish/ResultView.tsx";
import { SectionBreak } from "./qiziqish/SectionBreak.tsx";
import { TierPicker } from "./qiziqish/TierPicker.tsx";
import {
    DIMENSION_META,
    clearProgress,
    loadProgress,
    peekSavedTier,
    saveProgress,
    sectionOf,
} from "./qiziqish/quizProgress.ts";

type Phase = "pick" | "quiz" | "result";

// Tanlov ko'rinib turishi uchun keyingi savolga o'tishdan oldingi qisqa pauza
const ADVANCE_DELAY_MS = 180;

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="academy-card p-12 text-center space-y-4 border border-slate-100 dark:border-slate-800">{children}</div>;
}

export default function QiziqishTestPage() {
    const navigate = useNavigate();
    const userQuery = useUser();
    const userKey = userQuery.data?.id ?? "anon";
    const tiersQuery = useInterestQuizTiers();
    const latestQuery = useLatestQuizResult();
    const submitMutation = useSubmitInterestQuiz();

    const [phase, setPhase] = useState<Phase>("pick");
    const [tier, setTier] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [index, setIndex] = useState(0);
    const [dismissedBreaks, setDismissedBreaks] = useState<Set<number>>(new Set());
    const [result, setResult] = useState<InterestQuizResultDto | null>(null);
    const advanceTimer = useRef<number | undefined>(undefined);

    const quizQuery = useInterestQuiz(phase === "quiz" ? tier : null);
    const questions = useMemo(() => quizQuery.data?.questions ?? [], [quizQuery.data]);
    const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
    const current = questions[index];
    const tiers = tiersQuery.data?.tiers ?? [];
    const maxTier = tiers.length ? tiers[tiers.length - 1].tier : 50;

    // Savollar kelgach yarim qolgan javoblarni tiklash
    const restoredFor = useRef<string | null>(null);
    useEffect(() => {
        if (!tier || questions.length === 0) return;
        const signature = `${tier}:${questionIds.join()}`;
        if (restoredFor.current === signature) return;
        restoredFor.current = signature;
        const saved = loadProgress(userKey, questionIds, tier);
        setAnswers(saved?.answers ?? {});
        setIndex(saved ? Math.min(saved.index, questions.length - 1) : 0);
        setDismissedBreaks(new Set(saved ? [saved.index] : []));
    }, [tier, questions.length, questionIds, userKey]);

    useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

    const submit = useCallback(
        async (finalAnswers: Record<string, string>) => {
            if (!tier) return;
            const submitted = await submitMutation.mutateAsync({
                answers: Object.entries(finalAnswers).map(([questionId, optionId]) => ({ questionId, optionId })),
                tier,
            });
            clearProgress(userKey);
            setResult(submitted);
            setPhase("result");
            window.scrollTo({ top: 0 });
        },
        [submitMutation, tier, userKey],
    );

    const handlePick = useCallback(
        (optionId: string) => {
            if (!current || !tier || submitMutation.isPending) return;
            const next = { ...answers, [current.id]: optionId };
            setAnswers(next);
            const isLast = index === questions.length - 1;
            saveProgress(userKey, { tier, answers: next, index: isLast ? index : index + 1, questionIds });
            window.clearTimeout(advanceTimer.current);
            advanceTimer.current = window.setTimeout(() => {
                if (isLast) {
                    void submit(next).catch(() => undefined);
                } else {
                    setIndex(index + 1);
                }
            }, ADVANCE_DELAY_MS);
        },
        [answers, current, index, questionIds, questions.length, submit, submitMutation.isPending, tier, userKey],
    );

    const goBack = useCallback(() => {
        window.clearTimeout(advanceTimer.current);
        setIndex((i) => Math.max(0, i - 1));
    }, []);

    const section = current ? sectionOf(questions, index) : null;
    const showBreak = !!section && section.startsHere && !dismissedBreaks.has(index);

    // Klaviatura: 1–9 javob, ← orqaga
    useEffect(() => {
        if (phase !== "quiz" || !current || showBreak) return;
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const n = Number(e.key);
            if (Number.isInteger(n) && n >= 1 && n <= current.options.length) {
                e.preventDefault();
                handlePick(current.options[n - 1].id);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                goBack();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [phase, current, showBreak, handlePick, goBack]);

    const startTier = (picked: number) => {
        restoredFor.current = null;
        submitMutation.reset();
        setTier(picked);
        setResult(null);
        setPhase("quiz");
        window.scrollTo({ top: 0 });
    };

    const backLink = (
        <button
            type="button"
            onClick={() => (phase === "pick" ? navigate("/kasblar") : setPhase("pick"))}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
            <ArrowLeft size={16} />
            <span>{phase === "pick" ? "Kasblar katalogiga qaytish" : "Test hajmini tanlashga qaytish"}</span>
        </button>
    );

    if (phase === "result" && result) {
        return (
            <div className="space-y-5 pb-12 max-w-4xl mx-auto">
                {backLink}
                <ResultView result={result} maxTier={maxTier} onRetake={() => startTier(tier ?? result.tier ?? 50)} onUpgrade={startTier} />
            </div>
        );
    }

    if (phase === "pick") {
        return (
            <div className="space-y-5 pb-12 max-w-4xl mx-auto">
                {backLink}
                {tiersQuery.isLoading ? (
                    <Centered>
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </Centered>
                ) : tiers.length === 0 ? (
                    <Centered>
                        <Compass size={32} className="mx-auto text-amber-500" />
                        <h3 className="font-fredoka text-xl font-semibold text-slate-900 dark:text-white">Test hozircha tayyor emas</h3>
                        <p className="text-sm text-slate-500">Savollar tez orada qo'shiladi. Keyinroq qaytib ko'r.</p>
                    </Centered>
                ) : (
                    <TierPicker
                        tiers={tiers}
                        hasLatest={!!latestQuery.data}
                        resumeTier={peekSavedTier(userKey)}
                        onPick={startTier}
                        onShowLatest={() => {
                            if (!latestQuery.data) return;
                            setResult(latestQuery.data);
                            setTier(latestQuery.data.tier ?? null);
                            setPhase("result");
                        }}
                    />
                )}
            </div>
        );
    }

    // phase === "quiz"
    if (quizQuery.isLoading || (questions.length > 0 && restoredFor.current === null)) {
        return (
            <div className="space-y-5 pb-12 max-w-3xl mx-auto">
                {backLink}
                <Centered>
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-500">Savollar yuklanmoqda...</p>
                </Centered>
            </div>
        );
    }

    if (quizQuery.isError || !current || !section) {
        return (
            <div className="space-y-5 pb-12 max-w-3xl mx-auto">
                {backLink}
                <Centered>
                    <h3 className="font-fredoka text-xl font-semibold text-slate-900 dark:text-white">Savollarni yuklab bo'lmadi</h3>
                    <p className="text-sm text-slate-500">{quizQuery.error?.message ?? "Internet aloqasini tekshirib, qayta urinib ko'r."}</p>
                    <button type="button" onClick={() => void quizQuery.refetch()} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white">
                        Qayta yuklash
                    </button>
                </Centered>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const progress = Math.round((answeredCount / questions.length) * 100);
    const sectionStarts = questions.reduce<number[]>((acc, _q, i) => (sectionOf(questions, i).startsHere ? [...acc, i] : acc), []);
    const sectionNumber = sectionStarts.filter((s) => s <= index).length;

    return (
        <div className="space-y-5 pb-12 max-w-3xl mx-auto">
            {backLink}

            <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-700 dark:text-slate-200">{DIMENSION_META[section.dimension].title}</span>
                    <span className="tabular-nums text-slate-500">
                        {index + 1} / {questions.length}
                    </span>
                </div>
                <div
                    className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Test jarayoni"
                >
                    <div className="h-full rounded-full bg-blue-600 motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {showBreak ? (
                <SectionBreak
                    dimension={section.dimension}
                    sectionNumber={sectionNumber}
                    sectionCount={sectionStarts.length}
                    questionCount={section.total}
                    onContinue={() => setDismissedBreaks((prev) => new Set(prev).add(index))}
                />
            ) : (
                <section className="academy-card p-6 sm:p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                    <QuestionCard
                        key={current.id}
                        question={current}
                        selectedOptionId={answers[current.id]}
                        disabled={submitMutation.isPending}
                        onPick={handlePick}
                    />
                    <div className="flex items-center justify-between gap-3 pt-1">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={index === 0 || submitMutation.isPending}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 disabled:opacity-40"
                        >
                            <ArrowLeft size={16} /> Oldingi savol
                        </button>
                        {answers[current.id] && index < questions.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setIndex(index + 1)}
                                className="text-sm font-bold text-blue-600 hover:text-blue-500"
                            >
                                Keyingisi
                            </button>
                        ) : null}
                    </div>
                </section>
            )}

            {submitMutation.isPending ? (
                <p className="text-center text-sm font-bold text-slate-500">Natijang hisoblanmoqda...</p>
            ) : null}
            {submitMutation.isError ? (
                <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="flex-1 text-sm text-red-700 dark:text-red-300">
                        Natijani yuborib bo'lmadi: {submitMutation.error.message}. Javoblaring saqlangan.
                    </p>
                    <button
                        type="button"
                        onClick={() => void submit(answers).catch(() => undefined)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white"
                    >
                        <RefreshCw size={14} /> Qayta yuborish
                    </button>
                </div>
            ) : null}
        </div>
    );
}
