import type { RecommendationItemDto } from "../../../api/professions/types.ts";
import { PROFILE_TIPS } from "./resultCopy.ts";

const PARTS: Array<{ key: "interest" | "subjects" | "strengths" | "values"; label: string; color: string }> = [
    { key: "interest", label: "Qiziqishlar", color: "#2563EB" },
    { key: "subjects", label: "Fan va sohalar", color: "#10B981" },
    { key: "strengths", label: "Kuchli tomonlar", color: "#F59E0B" },
    { key: "values", label: "Qadriyatlar", color: "#DB2777" },
];

/** Moslik tarkibi: 4 qism, nega mos, nimani o'stirish kerak. Natija va kasb sahifasida bir xil. */
export function ProfessionFitDetails({ rec, compact = false }: { rec: RecommendationItemDto; compact?: boolean }) {
    const parts = rec.fitParts;
    const matches = rec.matches ?? [];
    const gaps = rec.gaps ?? [];
    return (
        <div className="space-y-4">
            {parts && !compact ? (
                <div className="grid gap-2.5">
                    {PARTS.filter((p) => parts[p.key] != null).map((p) => (
                        <div key={p.key} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
                            <span className="font-bold text-slate-600">{p.label}</span>
                            <span className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <span className="block h-full rounded-full" style={{ width: `${parts[p.key]}%`, backgroundColor: p.color }} />
                            </span>
                            <span className="text-right font-bold tabular-nums text-slate-500">{parts[p.key]}%</span>
                        </div>
                    ))}
                </div>
            ) : null}
            {matches.length > 0 ? (
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-1.5">Nega mos</p>
                    <div className="flex flex-wrap gap-1.5">
                        {matches.map((m) => (
                            <span key={m.key} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                {m.label}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
            {gaps.length > 0 ? (
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-1.5">O'stirish uchun</p>
                    <ul className="space-y-1">
                        {gaps.slice(0, compact ? 1 : gaps.length).map((g) => (
                            <li key={g.key} className="text-sm text-slate-600">
                                <b className="text-slate-800">{g.label}.</b> {PROFILE_TIPS[g.key] ?? ""}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
