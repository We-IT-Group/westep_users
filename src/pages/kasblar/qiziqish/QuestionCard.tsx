import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
import type { QuizOptionDto, QuizQuestionDto } from "../../../api/professions/types.ts";
import { ShapeColorArt } from "./ShapeColorArt.tsx";

interface Props {
    question: QuizQuestionDto;
    selectedOptionId?: string;
    disabled?: boolean;
    onPick: (optionId: string) => void;
}

const optionBase =
    "relative w-full rounded-2xl border-2 text-left transition-[color,background-color,border-color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 disabled:opacity-60 motion-safe:active:scale-95";

// Tanlanganda kichik "pop": biroz kattalashadi va soya oladi
const popped = "motion-safe:scale-[1.04] shadow-lg";

function optionTone(selected: boolean) {
    return selected
        ? clsx("border-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:border-blue-500", popped)
        : "border-slate-200 bg-white hover:border-blue-400 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-blue-500";
}

/** Tanlangan variant belgisi. */
function SelectedBadge() {
    return (
        <span className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white dark:ring-slate-900">
            <Check size={16} strokeWidth={3} aria-hidden="true" />
        </span>
    );
}

/** Klaviatura raqami — faqat katta ekranda ko'rinadi. */
function KeyHint({ n }: { n: number }) {
    return (
        <kbd className="hidden sm:flex absolute top-2 right-2 h-5 min-w-5 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-1 text-[10px] font-bold text-slate-400">
            {n}
        </kbd>
    );
}

// Shkala: yuz ifodasi va rang "yo'q"dan "juda"gacha o'sib boradi
const LIKERT_FACES = [
    { emoji: "😐", idle: "border-slate-200 bg-slate-50", on: "border-slate-500 bg-slate-100 dark:bg-slate-500/20" },
    { emoji: "🙂", idle: "border-amber-200 bg-amber-50", on: "border-amber-500 bg-amber-100 dark:bg-amber-500/20" },
    { emoji: "😊", idle: "border-emerald-200 bg-emerald-50", on: "border-emerald-500 bg-emerald-100 dark:bg-emerald-500/20" },
    { emoji: "🤩", idle: "border-fuchsia-200 bg-fuchsia-50", on: "border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-500/20" },
];

function LikertOption({ option, level, selected, ...rest }: OptionProps & { level: number }) {
    const face = LIKERT_FACES[Math.min(level, LIKERT_FACES.length - 1)];
    return (
        <button
            type="button"
            className={clsx(
                optionBase,
                "min-h-[88px] px-1 py-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2",
                selected ? clsx(face.on, popped) : clsx(face.idle, "hover:-translate-y-0.5 dark:bg-slate-900 dark:border-slate-700"),
            )}
            {...rest}
        >
            <span className={clsx("text-[32px] sm:text-[44px] leading-none transition-transform", selected && "motion-safe:scale-110")} aria-hidden="true">
                {face.emoji}
            </span>
            <span className="font-fredoka text-sm sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{option.text}</span>
        </button>
    );
}

const CHOICE_TILES = ["bg-blue-100", "bg-amber-100", "bg-emerald-100", "bg-pink-100", "bg-violet-100"];

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
            {option.imageKey ? <ShapeColorArt imageKey={option.imageKey} className="h-16 w-16 sm:h-24 sm:w-24" /> : null}
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">{option.text}</span>
        </button>
    );
}

function ChoiceOption({ option, selected, tile, ...rest }: OptionProps & { tile: number }) {
    return (
        <button type="button" className={clsx(optionBase, optionTone(selected), "min-h-[64px] p-3 sm:pr-10 flex items-center gap-3")} {...rest}>
            {option.emoji ? (
                <span
                    className={clsx(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[26px] dark:bg-slate-800",
                        CHOICE_TILES[tile % CHOICE_TILES.length],
                    )}
                    aria-hidden="true"
                >
                    {option.emoji}
                </span>
            ) : null}
            <span className="font-bold text-[15px] sm:text-base leading-snug text-slate-800 dark:text-slate-100">{option.text}</span>
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
    useEffect(() => {
        titleRef.current?.focus({ preventScroll: true });
        // Bo'lim ekranidan keyin sahifa pastda qolsa, savol sarlavhasi ko'rinsin
        titleRef.current?.scrollIntoView({ block: "nearest" });
    }, []);
    const grid =
        type === "LIKERT"
            ? "grid grid-cols-4 gap-2 sm:gap-3"
            : type === "IMAGE"
              ? clsx("grid gap-3", options.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")
              : type === "SHAPE" || type === "COLOR"
                ? clsx("grid gap-3", options.length >= 5 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")
                : clsx("grid gap-3", options.length >= 4 && "sm:grid-cols-2");

    return (
        <div className="space-y-5">
            <h2
                ref={titleRef}
                id={titleId}
                tabIndex={-1}
                className="scroll-mt-32 font-fredoka text-xl sm:text-[28px] font-semibold leading-tight text-slate-900 dark:text-white focus:outline-none"
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
                                <ChoiceOption {...props} tile={i} />
                            )}
                            {option.id === selectedOptionId ? <SelectedBadge /> : i < 9 ? <KeyHint n={i + 1} /> : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
