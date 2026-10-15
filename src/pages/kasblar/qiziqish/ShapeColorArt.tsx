import { useId } from "react";

// Arximed spirali: markazdan tashqariga 3 aylana
const SPIRAL = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * Math.PI * 6;
    const r = 3 + t * 1.85;
    return `${i ? "L" : "M"}${(50 + r * Math.cos(t)).toFixed(1)} ${(50 + r * Math.sin(t)).toFixed(1)}`;
}).join("");

const SHAPES: Record<string, { from: string; to: string; path: string; stroke?: boolean }> = {
    "shape-circle": { from: "#60A5FA", to: "#2563EB", path: "M50 12a38 38 0 1 1 0 76a38 38 0 1 1 0-76z" },
    "shape-square": { from: "#FDE047", to: "#EAB308", path: "M22 16h56a6 6 0 0 1 6 6v56a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" },
    "shape-triangle": { from: "#FCA5A5", to: "#EF4444", path: "M50 12l40 70a4 4 0 0 1-3.5 6h-73a4 4 0 0 1-3.5-6z" },
    "shape-zigzag": { from: "#86EFAC", to: "#16A34A", path: "M10 64L24 36L38 64L52 36L66 64L80 36L92 58", stroke: true },
    "shape-spiral": { from: "#FDBA74", to: "#EA580C", path: SPIRAL, stroke: true },
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
