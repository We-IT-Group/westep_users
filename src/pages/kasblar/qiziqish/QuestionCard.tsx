import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import type { QuizOptionDto, QuizQuestionDto } from "../../../api/professions/types.ts";
import { ShapeColorArt } from "./ShapeColorArt.tsx";

interface Props {
    question: QuizQuestionDto;
    selectedOptionId?: string;
    disabled?: boolean;
    onPick: (optionId: string) => void;
}

const optionBase =
    "relative w-full rounded-2xl border-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 disabled:opacity-60";

function optionTone(selected: boolean) {
    return selected
        ? "border-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:border-blue-500"
        : "border-slate-200 bg-white hover:border-blue-400 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-blue-500";
}

/** Klaviatura raqami — faqat katta ekranda ko'rinadi. */
function KeyHint({ n }: { n: number }) {
    return (
        <kbd className="hidden sm:flex absolute top-2 right-2 h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-1 text-[10px] font-bold text-slate-400">
            {n}
        </kbd>
    );
}

function LikertOption({ option, level, selected, ...rest }: OptionProps & { level: number }) {
    return (
        <button type="button" className={clsx(optionBase, optionTone(selected), "p-4 flex flex-col items-center gap-3")} {...rest}>
            <span className="flex items-end gap-1 h-6" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={clsx(
                            "w-2.5 rounded-full transition-colors",
                            i <= level ? (selected ? "bg-blue-600" : "bg-blue-400") : "bg-slate-200 dark:bg-slate-700",
                        )}
                        style={{ height: 8 + i * 5 }}
                    />
                ))}
            </span>
            <span className="font-fredoka text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{option.text}</span>
        </button>
    );
}

function ImageOption({ option, selected, ...rest }: OptionProps) {
    const [broken, setBroken] = useState(false);
    return (
        <button type="button" className={clsx(optionBase, optionTone(selected), "p-2 flex flex-col gap-2")} {...rest}>
            <span className="block aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                {option.imageKey && !broken ? (
                    <img
                        src={`/quiz/${option.imageKey}.webp`}
                        alt=""
                        loading="lazy"
                        onError={() => setBroken(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center text-5xl">{option.emoji ?? "✨"}</span>
                )}
            </span>
            <span className="px-1 pb-1 text-sm sm:text-[15px] font-bold leading-snug text-slate-800 dark:text-slate-100">
                {option.text}
            </span>
        </button>
    );
}

function ArtOption({ option, selected, ...rest }: OptionProps) {
    return (
        <button type="button" className={clsx(optionBase, optionTone(selected), "p-3 flex flex-col items-center gap-2")} {...rest}>
            {option.imageKey ? <ShapeColorArt imageKey={option.imageKey} className="h-20 w-20 sm:h-24 sm:w-24" /> : null}
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">{option.text}</span>
        </button>
    );
}

function ChoiceOption({ option, selected, ...rest }: OptionProps) {
    return (
        <button type="button" className={clsx(optionBase, optionTone(selected), "p-4 pr-10 flex items-center gap-3")} {...rest}>
            {option.emoji ? <span className="text-2xl shrink-0" aria-hidden="true">{option.emoji}</span> : null}
            <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">{option.text}</span>
        </button>
    );
}

interface OptionProps {
    option: QuizOptionDto;
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
    "aria-pressed": boolean;
}

export function QuestionCard({ question, selectedOptionId, disabled, onPick }: Props) {
    const type = question.type ?? "CHOICE";
    const options = question.options;
    const titleId = useId();
    const titleRef = useRef<HTMLHeadingElement>(null);
    // Har savol yangi mount bo'ladi: fokusni savol matniga o'tkazamiz — klaviatura va ekran o'quvchisi uchun
    useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);
    const grid =
        type === "LIKERT"
            ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
            : type === "IMAGE"
              ? clsx("grid gap-3", options.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")
              : type === "SHAPE" || type === "COLOR"
                ? "grid grid-cols-2 sm:grid-cols-3 gap-3"
                : "grid gap-3";

    return (
        <div className="space-y-5">
            <h2
                ref={titleRef}
                id={titleId}
                tabIndex={-1}
                className="font-fredoka text-2xl sm:text-[28px] font-semibold leading-tight text-slate-900 dark:text-white focus:outline-none"
            >
                {question.text}
            </h2>
            <div className={grid} role="group" aria-labelledby={titleId}>
                {options.map((option, i) => {
                    const props: OptionProps = {
                        option,
                        selected: option.id === selectedOptionId,
                        disabled,
                        onClick: () => onPick(option.id),
                        "aria-pressed": option.id === selectedOptionId,
                    };
                    return (
                        <div key={option.id} className="relative">
                            {type === "LIKERT" ? (
                                <LikertOption {...props} level={i} />
                            ) : type === "IMAGE" ? (
                                <ImageOption {...props} />
                            ) : type === "SHAPE" || type === "COLOR" ? (
                                <ArtOption {...props} />
                            ) : (
                                <ChoiceOption {...props} />
                            )}
                            {i < 9 ? <KeyHint n={i + 1} /> : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
