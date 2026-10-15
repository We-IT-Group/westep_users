import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, RotateCcw, Sparkles } from "lucide-react";
import type { InterestQuizResultDto, QuizResultFieldScore } from "../../../api/professions/types.ts";
import { useRecommendations, useSelectProfession } from "../../../api/professions/useProfessions.ts";
import { PROFILE_TIPS, RIASEC_COPY, TIER_INFO, moodPhrase, riasecCopy, type RiasecKey } from "./resultCopy.ts";
import { ShapeColorArt } from "./ShapeColorArt.tsx";

interface Props {
    result: InterestQuizResultDto;
    onRetake: () => void;
    onUpgrade: (tier: number) => void;
    maxTier: number;
}

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
    return (
        <section className="academy-card p-6 sm:p-7 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-fredoka text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                {note ? <span className="text-xs font-bold text-slate-400">{note}</span> : null}
            </div>
            {children}
        </section>
    );
}

function Bar({ label, score, color }: { label: string; score: number; color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
                <span className="font-bold tabular-nums text-slate-500">{score}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                    className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-700"
                    style={{ width: `${Math.max(3, Math.min(100, score))}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function TipCard({ item, accent }: { item: QuizResultFieldScore; accent: string }) {
    return (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-1.5" style={{ borderLeft: `4px solid ${accent}` }}>
            <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-fredoka text-lg font-semibold text-slate-900 dark:text-white">{item.fieldLabel}</h3>
                <span className="text-xs font-bold tabular-nums text-slate-400">{item.score}%</span>
            </div>
            {PROFILE_TIPS[item.fieldKey] ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">{PROFILE_TIPS[item.fieldKey]}</p>
            ) : null}
        </div>
    );
}

export function ResultView({ result, onRetake, onUpgrade, maxTier }: Props) {
    const navigate = useNavigate();
    const recQuery = useRecommendations();
    const selectMutation = useSelectProfession();
    const [selected, setSelected] = useState<string | null>(null);

    const riasec = result.riasecScores ?? [];
    const code = (result.hollandCode ?? riasec.slice(0, 3).map((s) => s.fieldKey).join("")).split("") as RiasecKey[];
    const top = riasecCopy(code[0] ?? "");
    const profile = result.profile;
    const recs = (recQuery.data?.recommendations ?? []).slice(0, 3);
    const tier = result.tier ?? null;
    // daraja yo'q natijalar (v1 testi, mobil ilova) 50 talik deb hisoblanadi
    const shownTier = tier ?? 50;
    const nextTier = shownTier < maxTier ? (shownTier === 50 ? 100 : 200) : null;

    const strengths = profile?.strengths ?? [];
    const growth = strengths.length > 3 ? strengths[strengths.length - 1] : null;
    const shapeColor = (profile?.shapeColor ?? []).slice(0, 2);

    return (
        <div className="space-y-5">
            {/* Hero: asosiy olam rasmi va Holland kodi */}
            <section className="academy-card !p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="grid sm:grid-cols-[1fr_1.1fr]">
                    {top ? <img src={top.image} alt="" className="aspect-square w-full object-cover" /> : null}
                    <div className="p-6 sm:p-8 space-y-4 self-center">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Senga eng yaqin olam</p>
                        <h1 className="font-fredoka text-3xl sm:text-4xl font-semibold leading-tight" style={{ color: top?.color }}>
                            {top?.title ?? "Natijang tayyor"}
                        </h1>
                        <div className="flex gap-2" aria-label={`Holland kodi ${code.join("")}`}>
                            {code.map((letter, i) => (
                                <span
                                    key={letter + i}
                                    className="flex items-center justify-center rounded-2xl font-fredoka font-semibold text-white shadow-sm"
                                    style={{
                                        backgroundColor: RIASEC_COPY[letter]?.color ?? "#64748B",
                                        width: i === 0 ? 64 : 48,
                                        height: i === 0 ? 64 : 48,
                                        fontSize: i === 0 ? 32 : 24,
                                    }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{top?.blurb}</p>
                        <p className="text-xs text-slate-400">
                            {tier ? `${TIER_INFO[tier]?.title ?? tier} test, ` : ""}
                            {result.totalQuestions} ta savol. Bu hukm emas — sinab ko'rish uchun yo'nalish.
                        </p>
                    </div>
                </div>
            </section>

            {recs.length > 0 ? (
                <Section title="Senga mos kasblar">
                    <div className="grid sm:grid-cols-3 gap-3">
                        {recs.map((rec) => (
                            <div key={rec.professionId} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl" aria-hidden="true">{rec.emoji ?? "💼"}</span>
                                    <div className="min-w-0">
                                        <h3 className="font-fredoka text-lg font-semibold text-slate-900 dark:text-white truncate">
                                            {rec.title ?? rec.slug}
                                        </h3>
                                        <span className="text-xs font-bold text-blue-600">{rec.score}% mos</span>
                                    </div>
                                </div>
                                {rec.tagline ? <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{rec.tagline}</p> : null}
                                <div className="mt-auto flex gap-2">
                                    <button
                                        type="button"
                                        disabled={selectMutation.isPending || selected === rec.professionId}
                                        onClick={() =>
                                            selectMutation.mutate(
                                                { professionId: rec.professionId, source: "QUIZ" },
                                                { onSuccess: () => setSelected(rec.professionId) },
                                            )
                                        }
                                        className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-500 disabled:opacity-60"
                                    >
                                        {selected === rec.professionId ? "Tanlandi" : "Tanlash"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/kasblar/${rec.slug}`)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                                    >
                                        Batafsil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectMutation.isError ? (
                        <p className="text-sm font-bold text-red-600">{selectMutation.error.message}</p>
                    ) : null}
                </Section>
            ) : null}

            {riasec.length > 0 ? (
                <Section title="Kasb olamlari">
                    <div className="grid gap-4">
                        {riasec.map((s) => {
                            const copy = riasecCopy(s.fieldKey);
                            return <Bar key={s.fieldKey} label={copy?.title ?? s.fieldLabel} score={s.score} color={copy?.color ?? "#2563EB"} />;
                        })}
                    </div>
                </Section>
            ) : null}

            {strengths.length > 0 ? (
                <Section title="Kuchli tomonlaring">
                    <div className="grid sm:grid-cols-3 gap-3">
                        {strengths.slice(0, 3).map((item) => (
                            <TipCard key={item.fieldKey} item={item} accent="#FACC15" />
                        ))}
                    </div>
                    {growth ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            <b className="text-slate-800 dark:text-slate-100">O'stirish mumkin: {growth.fieldLabel.toLowerCase()}.</b>{" "}
                            {PROFILE_TIPS[growth.fieldKey]}
                        </p>
                    ) : null}
                </Section>
            ) : null}

            {(profile?.learning?.length || profile?.values?.length) ? (
                <div className="grid lg:grid-cols-2 gap-5">
                    {profile?.learning?.length ? (
                        <Section title="Qanday o'rganasan">
                            <div className="grid gap-3">
                                {profile.learning.slice(0, 2).map((item) => (
                                    <TipCard key={item.fieldKey} item={item} accent="#2563EB" />
                                ))}
                            </div>
                        </Section>
                    ) : null}
                    {profile?.values?.length ? (
                        <Section title="Sen uchun muhim">
                            <div className="grid gap-3">
                                {profile.values.slice(0, 3).map((item) => (
                                    <TipCard key={item.fieldKey} item={item} accent="#DB2777" />
                                ))}
                            </div>
                        </Section>
                    ) : null}
                </div>
            ) : null}

            {profile?.mood?.length ? (
                <Section title="Hozirgi holating" note="Faqat senga ko'rinadi">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {profile.mood.map((item) => (
                            <div key={item.fieldKey} className="space-y-1">
                                <Bar label={item.fieldLabel} score={item.score} color={item.score >= 40 ? "#10B981" : "#F59E0B"} />
                                <p className="text-sm text-slate-500 dark:text-slate-400">{moodPhrase(item.fieldKey, item.score)}</p>
                            </div>
                        ))}
                    </div>
                    {result.attention ? (
                        <div className="flex gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-4">
                            <Heart className="shrink-0 text-amber-600" size={20} />
                            <p className="text-sm text-amber-900 dark:text-amber-200">
                                Oxirgi kunlar senga biroz og'ir o'tganga o'xshaydi — bu bo'ladi va o'tib ketadi. Ko'nglingdagini
                                ishongan kattang (ota-onang, ustozing yoki maktab psixologi) bilan bo'lishib ko'r. Gaplashish
                                yengillik beradi.
                            </p>
                        </div>
                    ) : null}
                </Section>
            ) : null}

            {shapeColor.length > 0 ? (
                <Section title="Shakl va ranglaring" note="Taxminiy belgi">
                    <div className="flex flex-wrap gap-4">
                        {shapeColor.map((item) => (
                            <div key={item.fieldKey} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 pr-5">
                                <ShapeColorArt imageKey={item.fieldKey.replace(".", "-")} className="h-14 w-14" />
                                <span className="font-bold text-slate-700 dark:text-slate-200">{item.fieldLabel}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400">
                        Shakl va rang tanlovi kayfiyat va uslubni qiziqarli tarzda aks ettiradi, lekin kasb tanlashda asosiy dalil emas.
                    </p>
                </Section>
            ) : null}

            <section className="rounded-3xl bg-blue-50 dark:bg-blue-500/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <Sparkles className="text-blue-600 shrink-0" />
                <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                    {nextTier
                        ? `${TIER_INFO[shownTier]?.note ?? ""} Aniqroq natija uchun ${TIER_INFO[nextTier].title.toLowerCase()} testni sinab ko'r.`
                        : "Natijang eng batafsil test asosida. Bir necha oydan keyin qayta topshirib, o'zgarishni ko'rishing mumkin."}
                </p>
                <div className="flex gap-2">
                    {nextTier ? (
                        <button
                            type="button"
                            onClick={() => onUpgrade(nextTier)}
                            className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-500"
                        >
                            {TIER_INFO[nextTier].title} test ({nextTier})
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={onRetake}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300"
                    >
                        <RotateCcw size={14} /> Qaytadan
                    </button>
                </div>
            </section>
        </div>
    );
}
