import { useId } from "react";

// Arximed spirali: markazdan tashqariga 3 aylana
const SPIRAL = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * Math.PI * 6;
    const r = 3 + t * 1.85;
    return `${i ? "L" : "M"}${(50 + r * Math.cos(t)).toFixed(1)} ${(50 + r * Math.sin(t)).toFixed(1)}`;
}).join("");

// Muntazam ko'pburchak / yulduz uchlari (markaz 50,52)
function polygon(points: number, outer: number, inner = outer, rotate = -90) {
    const n = inner === outer ? points : points * 2;
    return (
        Array.from({ length: n }, (_, i) => {
            const r = i % 2 && inner !== outer ? inner : outer;
            const a = ((rotate + (360 / n) * i) * Math.PI) / 180;
            return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(52 + r * Math.sin(a)).toFixed(1)}`;
        }).join("") + "z"
    );
}

const SHAPES: Record<string, { from: string; to: string; path: string; stroke?: boolean }> = {
    "shape-circle": { from: "#60A5FA", to: "#2563EB", path: "M50 12a38 38 0 1 1 0 76a38 38 0 1 1 0-76z" },
    "shape-square": { from: "#FDE047", to: "#EAB308", path: "M22 16h56a6 6 0 0 1 6 6v56a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" },
    "shape-triangle": { from: "#FCA5A5", to: "#EF4444", path: "M50 12l40 70a4 4 0 0 1-3.5 6h-73a4 4 0 0 1-3.5-6z" },
    "shape-zigzag": { from: "#86EFAC", to: "#16A34A", path: "M10 64L24 36L38 64L52 36L66 64L80 36L92 58", stroke: true },
    "shape-spiral": { from: "#FDBA74", to: "#EA580C", path: SPIRAL, stroke: true },
    "shape-star": { from: "#FDE68A", to: "#F59E0B", path: polygon(5, 42, 18) },
    "shape-heart": { from: "#F9A8D4", to: "#DB2777", path: "M50 86C24 68 10 52 12 36C14 22 26 14 37 15c6 1 10 4 13 9c3-5 7-8 13-9c11-1 23 7 25 21c2 16-12 32-38 50z" },
    "shape-hexagon": { from: "#C4B5FD", to: "#7C3AED", path: polygon(6, 40, 40, 0) },
    "shape-wave": { from: "#67E8F9", to: "#0891B2", path: "M8 50Q22 26 36 50T64 50T92 50", stroke: true },
    "shape-rhombus": { from: "#A5B4FC", to: "#4F46E5", path: "M50 8L88 50L50 92L12 50z" },
};

const COLORS: Record<string, string[]> = {
    "color-warm": ["#EF4444", "#F97316", "#FACC15"],
    "color-cool": ["#2563EB", "#0EA5E9", "#10B981"],
    "color-bright": ["#EC4899", "#FACC15", "#22D3EE"],
    "color-soft": ["#FBCFE8", "#BFDBFE", "#BBF7D0"],
    "color-dark": ["#1E3A8A", "#4C1D95", "#14532D"],
};

/** Shakl yoki rang variantining rasmi — rasm fayli emas, chiziladi (har o'lchamda tiniq). */
export function ShapeColorArt({ imageKey, className = "" }: { imageKey: string; className?: string }) {
    const gradientId = useId();
    const shape = SHAPES[imageKey];
    if (shape) {
        return (
            <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                        <stop offset="0" stopColor={shape.from} />
                        <stop offset="1" stopColor={shape.to} />
                    </linearGradient>
                </defs>
                {shape.stroke ? (
                    <path
                        d={shape.path}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : (
                    <path d={shape.path} fill={`url(#${gradientId})`} />
                )}
            </svg>
        );
    }
    const palette = COLORS[imageKey];
    if (!palette) return null;
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            <circle cx="38" cy="40" r="26" fill={palette[0]} />
            <circle cx="64" cy="44" r="24" fill={palette[1]} opacity="0.92" />
            <circle cx="50" cy="66" r="22" fill={palette[2]} opacity="0.92" />
        </svg>
    );
}
