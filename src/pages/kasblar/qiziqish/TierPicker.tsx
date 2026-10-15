import clsx from "clsx";
import { Clock, ListChecks } from "lucide-react";
import { TIER_INFO } from "./resultCopy.ts";

interface Props {
    tiers: Array<{ tier: number; questionCount: number }>;
    hasLatest: boolean;
    resumeTier?: number | null;
    onPick: (tier: number) => void;
    onShowLatest: () => void;
}

const WORLD_IMAGES = ["r", "i", "a", "s", "e", "c"];

export function TierPicker({ tiers, hasLatest, resumeTier, onPick, onShowLatest }: Props) {
    return (
        <div className="space-y-6">
            <section className="academy-card !p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="grid sm:grid-cols-[1.1fr_1fr]">
                    <div className="p-6 sm:p-8 space-y-3 self-center">
                        <h1 className="font-fredoka text-3xl sm:text-4xl font-semibold leading-tight text-slate-900 dark:text-white">
                            Qaysi olam seniki?
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md">
                            Savollarga javob ber — qaysi kasblar senga mos kelishini, kuchli tomonlaringni va qanday
                            o'rganishingni bilib olasan. To'g'ri yoki noto'g'ri javob yo'q.
                        </p>
                        {hasLatest ? (
                            <button
                                type="button"
                                onClick={onShowLatest}
                                className="text-sm font-bold text-blue-600 hover:text-blue-500 underline underline-offset-4"
                            >
                                Oxirgi natijamni ko'rish
                            </button>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-3 bg-slate-50 dark:bg-slate-900/60" aria-hidden="true">
                        {WORLD_IMAGES.map((key) => (
                            <img key={key} src={`/quiz/${key}.webp`} alt="" className="aspect-square w-full rounded-xl object-cover" />
                        ))}
                    </div>
                </div>
            </section>

            <div>
                <h2 className="font-fredoka text-xl font-semibold text-slate-900 dark:text-white mb-3">Test hajmini tanla</h2>
                <div className={clsx("grid gap-3", tiers.length > 1 ? "sm:grid-cols-3" : "sm:max-w-sm")}>
                    {tiers.map(({ tier, questionCount }) => {
                        const info = TIER_INFO[tier];
                        const recommended = tier === 100;
                        return (
                            <button
                                key={tier}
                                type="button"
                                onClick={() => onPick(tier)}
                                className={clsx(
                                    "group relative flex flex-col text-left rounded-3xl border-2 p-5 transition-colors bg-white dark:bg-slate-900",
                                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40",
                                    recommended
                                        ? "border-blue-600 dark:border-blue-500"
                                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400",
                                )}
                            >
                                {recommended ? (
                                    <span className="absolute -top-3 left-5 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold text-white">
                                        Tavsiya
                                    </span>
                                ) : null}
                                <span className="block font-fredoka text-5xl font-semibold text-slate-900 dark:text-white tabular-nums">
                                    {questionCount}
                                </span>
                                <span className="block font-fredoka text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    {info?.title ?? `${tier} savol`}
                                </span>
                                <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{info?.note}</span>
                                <span className="mt-4 flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock size={14} /> ~{info?.minutes ?? Math.round(questionCount / 5)} daqiqa
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <ListChecks size={14} /> {questionCount} savol
                                    </span>
                                </span>
                                {resumeTier === tier ? (
                                    <span className="mt-3 block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        Yarim qolgan — shu joydan davom etasan
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
