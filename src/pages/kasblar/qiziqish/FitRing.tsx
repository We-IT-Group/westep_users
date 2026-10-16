import { fitTone } from "./resultCopy.ts";

/** Kasbga moslik halqasi: foiz markazda, rang darajaga qarab. */
export function FitRing({ fit, size = 64 }: { fit: number; size?: number }) {
    const tone = fitTone(fit);
    const stroke = Math.max(5, Math.round(size / 10));
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${fit}% mos, ${tone.label.toLowerCase()}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={tone.color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, fit)) / 100)}
                    className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
                />
            </svg>
            <span
                className="absolute inset-0 flex items-center justify-center font-fredoka font-semibold text-slate-900 tabular-nums"
                style={{ fontSize: Math.round(size * 0.26) }}
            >
                {fit}%
            </span>
        </div>
    );
}
