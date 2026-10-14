export type IslandVariant = "math" | "phys" | "chem" | "lang";

export function subjectIsland(name: string): { variant: IslandVariant; emoji: string } {
    const n = name.toLowerCase();
    if (n.includes("fizik")) return { variant: "phys", emoji: "⚛" };
    if (n.includes("kimyo") || n.includes("chem")) return { variant: "chem", emoji: "⚗" };
    if (n.includes("matemat")) return { variant: "math", emoji: "∑" };
    if (n.includes("ingliz") || n.includes("english")) return { variant: "lang", emoji: "Aa" };
    if (n.includes("ona") || n.includes("til")) return { variant: "lang", emoji: "✎" };
    return { variant: "phys", emoji: "📘" };
}
