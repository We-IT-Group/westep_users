import type { QuizDimension, QuizQuestionDto } from "../../../api/professions/types.ts";

/** Yarim qolgan testni sahifa yangilansa ham davom ettirish uchun (faqat shu brauzerda). */
export interface SavedProgress {
    tier: number;
    answers: Record<string, string>;
    index: number;
    questionIds: string[];
}

export function progressKey(userKey: string) {
    return `westep.quiz.v2.${userKey}`;
}

export function loadProgress(userKey: string, questionIds: string[], tier: number): SavedProgress | null {
    try {
        const raw = localStorage.getItem(progressKey(userKey));
        if (!raw) return null;
        const saved = JSON.parse(raw) as SavedProgress;
        // Savollar to'plami yoki daraja o'zgargan bo'lsa eski javoblar mos kelmaydi
        if (saved.tier !== tier || saved.questionIds.join() !== questionIds.join()) return null;
        return saved;
    } catch {
        return null;
    }
}

/** Yarim qolgan test qaysi darajada ekanini bilish uchun (daraja tanlash ekranida). */
export function peekSavedTier(userKey: string): number | null {
    try {
        const raw = localStorage.getItem(progressKey(userKey));
        return raw ? ((JSON.parse(raw) as SavedProgress).tier ?? null) : null;
    } catch {
        return null;
    }
}

export function saveProgress(userKey: string, progress: SavedProgress) {
    try {
        localStorage.setItem(progressKey(userKey), JSON.stringify(progress));
    } catch {
        // xususiy rejim yoki bloklangan storage — davom ettirish shunchaki ishlamaydi
    }
}

export function clearProgress(userKey: string) {
    try {
        localStorage.removeItem(progressKey(userKey));
    } catch {
        // yuqoridagi kabi
    }
}

const dimensionOf = (q: QuizQuestionDto): QuizDimension => q.dimension ?? "RIASEC";

/** Savol qaysi bo'limda, bo'lim shu yerdan boshlanadimi va bo'lim ichidagi o'rni. */
export function sectionOf(questions: QuizQuestionDto[], index: number) {
    const dimension = dimensionOf(questions[index]);
    let start = index;
    while (start > 0 && dimensionOf(questions[start - 1]) === dimension) start--;
    let end = index;
    while (end + 1 < questions.length && dimensionOf(questions[end + 1]) === dimension) end++;
    return { dimension, startsHere: start === index, index: index - start, total: end - start + 1 };
}

export const DIMENSION_META: Record<QuizDimension, { title: string; intro: string; image: string }> = {
    RIASEC: {
        title: "Kasb olamlari",
        intro: "Qaysi ishlar senga zavq berishini bilib olamiz. To'g'ri yoki noto'g'ri javob yo'q.",
        image: "/quiz/i.webp",
    },
    STRENGTH: {
        title: "Kuchli tomonlaring",
        intro: "Nimalarni yaxshi uddalashing haqida. O'zingni qanday ko'rsang, shunday belgila.",
        image: "/quiz/strength.webp",
    },
    LEARNING: {
        title: "Qanday o'rganasan",
        intro: "Yangi narsani qanday tez tushunishing haqida bir nechta savol.",
        image: "/quiz/learning.webp",
    },
    VALUES: {
        title: "Sen uchun muhim narsalar",
        intro: "Kelajakdagi ishingda nima muhim bo'lishini tanlaysan.",
        image: "/quiz/values.webp",
    },
    MOOD: {
        title: "Hozirgi holating",
        intro: "Oxirgi kunlarda o'zingni qanday his qilayotganing haqida. Javoblaring faqat senga ko'rinadi.",
        image: "/quiz/mood.webp",
    },
    SHAPE_COLOR: {
        title: "Shakl va ranglar",
        intro: "Ko'p o'ylamay, birinchi yoqqanini tanla.",
        image: "/quiz/shapes.webp",
    },
};
