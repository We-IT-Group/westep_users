import { useEffect, useRef } from "react";
import type { QuizDimension } from "../../../api/professions/types.ts";
import { DIMENSION_META } from "./quizProgress.ts";

interface Props {
    dimension: QuizDimension;
    sectionNumber: number;
    sectionCount: number;
    questionCount: number;
    onContinue: () => void;
}

/** Yangi bo'lim boshida qisqa to'xtash: nima kelishini aytadi, uzun testda charchoqni kamaytiradi. */
export function SectionBreak({ dimension, sectionNumber, sectionCount, questionCount, onContinue }: Props) {
    const meta = DIMENSION_META[dimension];
    const buttonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => buttonRef.current?.focus(), [dimension]);

    return (
        <section className="academy-card !p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="grid sm:grid-cols-[220px_1fr]">
                <img src={meta.image} alt="" className="aspect-square w-full object-cover sm:h-full" />
                <div className="p-6 sm:p-8 space-y-3 self-center">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {sectionNumber}-bo'lim, jami {sectionCount}
                    </p>
                    <h2 className="font-fredoka text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{meta.title}</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{meta.intro}</p>
                    <p className="text-xs font-bold text-slate-400">{questionCount} ta savol</p>
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={onContinue}
                        className="mt-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40"
                    >
                        Boshladik
                    </button>
                </div>
            </div>
        </section>
    );
}
