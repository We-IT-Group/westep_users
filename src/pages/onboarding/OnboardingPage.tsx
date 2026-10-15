import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Clock,
    Award,
    Flame,
    X,
} from "lucide-react";
import { useUser } from "../../api/auth/useAuth.ts";
import { useProfessionsList, useSelectProfession } from "../../api/professions/useProfessions.ts";
import { useGetCourses } from "../../api/courses/useCourse.ts";
import { useToast } from "../../hooks/useToast.tsx";
import type { Course } from "../../types/types.ts";

interface GradeOption {
    id: string;
    emoji: string;
    title: string;
    ageRange: string;
    reaction: string;
}

interface FallbackProfession {
    id: string;
    slug: string;
    emoji: string;
    title: string;
    tagline: string;
    reaction: string;
    recommendedSubjects: string[];
}

interface SubjectOption {
    id: string;
    emoji: string;
    title: string;
    sub: string;
}

interface DailyGoalOption {
    id: string;
    minutes: number;
    badge: string;
    badgeColor: string;
    lessons: number;
    title: string;
    reaction: string;
}

const GRADES: GradeOption[] = [
    {
        id: "grade_0",
        emoji: "🧸",
        title: "Hali maktabga bormayman",
        ageRange: "5–6 yosh",
        reaction: "Ajoyib! O‘yinlar va qiziqarli mashg‘ulotlar orqali boshlaymiz!",
    },
    {
        id: "grade_1_2",
        emoji: "✏️",
        title: "1–2-sinf",
        ageRange: "7–8 yosh",
        reaction: "Zo‘r! Maktabdagi ilk bilimlarni mustahkamlab, ilg‘or bo‘lamiz!",
    },
    {
        id: "grade_3_4",
        emoji: "🎒",
        title: "3–4-sinf",
        ageRange: "9–10 yosh",
        reaction: "Qoyil! Fanlarni chuqur o‘rganish va o‘zlashtirish vaqti keldi!",
    },
    {
        id: "grade_5_6",
        emoji: "📐",
        title: "5–6-sinf",
        ageRange: "11–12 yosh",
        reaction: "Ajoyib bosqich! Mantiq va jiddiy bilimlar sari olg‘a!",
    },
    {
        id: "grade_7_9",
        emoji: "🔬",
        title: "7–9-sinf",
        ageRange: "13–15 yosh",
        reaction: "Kuchli tanlov! Aniq fanlar va zamonaviy kasblar kutyapti!",
    },
    {
        id: "grade_10_11",
        emoji: "🎓",
        title: "10–11-sinf / Abituriyent",
        ageRange: "16–17 yosh",
        reaction: "Imtihonlarga tayyorgarlik va nufuzli oliygohlar sari yo‘l!",
    },
    {
        id: "grade_adult",
        emoji: "🧑‍💼",
        title: "Talaba / Kattalar",
        ageRange: "18+ yosh",
        reaction: "O‘zingiz uchun o‘rganish — eng yaxshi investitsiya!",
    },
];

const FALLBACK_PROFESSIONS: FallbackProfession[] = [
    {
        id: "p_doc",
        slug: "shifokor",
        emoji: "🩺",
        title: "Shifokor",
        tagline: "Insonlar salomatligi va tibbiyot",
        reaction: "Shifokorlar insonlar hayotini asraydi — buyuk orzu! 🩺",
        recommendedSubjects: ["Biologiya", "Kimyo"],
    },
    {
        id: "p_dev",
        slug: "dasturchi",
        emoji: "💻",
        title: "Dasturchi / IT mutaxassis",
        tagline: "Ilovalar, veb-saytlar va sun’iy intellekt",
        reaction: "Dasturchilar kelajak texnologiyalarini yaratadi! 💻",
        recommendedSubjects: ["Matematika", "Informatika"],
    },
    {
        id: "p_eng",
        slug: "muhandis",
        emoji: "🏗️",
        title: "Muhandis / Robototexnika",
        tagline: "Texnika, loyihalash va robotlar",
        reaction: "Muhandislar zamonaviy texnika va binolarni loyihalaydi! 🏗️",
        recommendedSubjects: ["Fizika", "Matematika"],
    },
    {
        id: "p_des",
        slug: "dizayner",
        emoji: "🎨",
        title: "Grafik dizayner",
        tagline: "Ijod, vizual san’at va interfeyslar",
        reaction: "Dizaynerlar dunyoni yanada yorqin va go‘zal qiladi! 🎨",
        recommendedSubjects: ["Informatika", "Ingliz tili"],
    },
    {
        id: "p_astro",
        slug: "kosmonavt",
        emoji: "🚀",
        title: "Kosmonavt / Astronom",
        tagline: "Koinot va fazoviy sirlar",
        reaction: "Koinotga parvoz va ulkan kashfiyotlar sari! 🚀",
        recommendedSubjects: ["Fizika", "Matematika"],
    },
    {
        id: "p_biz",
        slug: "tadbirkor",
        emoji: "💼",
        title: "Tadbirkor / Biznesmen",
        tagline: "Loyiha boshqaruvi va yetakchilik",
        reaction: "O‘z ishingni boshlash — yetakchilar tanlovi! 💼",
        recommendedSubjects: ["Matematika", "Ingliz tili"],
    },
    {
        id: "p_teach",
        slug: "oqituvchi",
        emoji: "👩‍🏫",
        title: "O‘qituvchi / Ustoz",
        tagline: "Boshqalarga bilim va tajriba ulashish",
        reaction: "Bilim berish — dunyodagi eng olijanob kasb! 👩‍🏫",
        recommendedSubjects: ["Ona tili", "Matematika"],
    },
    {
        id: "p_pilot",
        slug: "uchuvchi",
        emoji: "✈️",
        title: "Uchuvchi / Aviatsiya",
        tagline: "Osmon, samolyotlar va parvozlar",
        reaction: "Moviy osmonda ozod parvoz — ajoyib maqsad! ✈️",
        recommendedSubjects: ["Fizika", "Ingliz tili"],
    },
    {
        id: "p_lang",
        slug: "tarjimon",
        emoji: "🌍",
        title: "Xorijiy tillar / Tarjimon",
        tagline: "Dunyo tillari va xalqaro muloqot",
        reaction: "Tillarni bilish barcha eshiklarni ochadi! 🌍",
        recommendedSubjects: ["Ingliz tili", "Ona tili"],
    },
];

const DEFAULT_SUBJECTS: SubjectOption[] = [
    { id: "s_math", emoji: "📐", title: "Matematika", sub: "Mantiqiy fikrlash va hisob-kitob" },
    { id: "s_eng", emoji: "🇬🇧", title: "Ingliz tili", sub: "Xalqaro muloqot va so‘z boyligi" },
    { id: "s_prog", emoji: "💻", title: "Dasturlash & IT", sub: "Algoritm va kodlash asoslari" },
    { id: "s_phys", emoji: "⚡", title: "Fizika", sub: "Tabiat qonunlari va tajribalar" },
    { id: "s_chem_bio", emoji: "🧬", title: "Kimyo & Biologiya", sub: "Tirik tabiat va moddalar siri" },
    { id: "s_lang", emoji: "📖", title: "Ona tili & Adabiyot", sub: "Ravon nutq va to‘g‘ri yozish" },
];

const DAILY_GOALS: DailyGoalOption[] = [
    {
        id: "goal_5",
        minutes: 5,
        badge: "Yengil",
        badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        lessons: 1,
        title: "5 daqiqa / kun",
        reaction: "Kichik qadam ham katta g‘alabalar poydevoridir! 👏",
    },
    {
        id: "goal_10",
        minutes: 10,
        badge: "⭐ Tavsiya",
        badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
        lessons: 2,
        title: "10 daqiqa / kun",
        reaction: "Ajoyib tanlov! Eng optimal va samarali marom. 🎯",
    },
    {
        id: "goal_15",
        minutes: 15,
        badge: "Jiddiy",
        badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
        lessons: 3,
        title: "15 daqiqa / kun",
        reaction: "Kuchli intilish! Tez kunda sezilarli natijalarga erishasan. 🚀",
    },
    {
        id: "goal_20",
        minutes: 20,
        badge: "🔥 Chempion",
        badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
        lessons: 4,
        title: "20 daqiqa / kun",
        reaction: "Haqiqiy chempion maromi! Marralar seni kutmoqda! 🔥",
    },
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { data: user } = useUser();
    const toast = useToast();

    const professionsQuery = useProfessionsList({ limit: 50 });
    const { data: courses = [] } = useGetCourses();
    const selectProfessionMutation = useSelectProfession();

    const [step, setStep] = useState<number>(() => {
        const param = new URLSearchParams(window.location.search).get("step");
        const parsed = param ? Number(param) : 0;
        return Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : 0;
    });
    const [selectedGrade, setSelectedGrade] = useState<string>(() => {
        const param = new URLSearchParams(window.location.search).get("step");
        return param && Number(param) > 1 ? "grade_5_6" : "";
    });
    const [selectedProfessions, setSelectedProfessions] = useState<string[]>(() => {
        const param = new URLSearchParams(window.location.search).get("step");
        return param && Number(param) > 2 ? ["p_dev"] : [];
    });
    const [selectedSubject, setSelectedSubject] = useState<string>(() => {
        const param = new URLSearchParams(window.location.search).get("step");
        return param && Number(param) > 3 ? "s_prog" : "";
    });
    const [selectedGoal, setSelectedGoal] = useState<string>("goal_10");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Merge backend professions with fallback metadata
    const professionsList = useMemo(() => {
        const apiItems = professionsQuery.data?.items ?? [];
        if (apiItems.length === 0) {
            return FALLBACK_PROFESSIONS;
        }
        return apiItems.map((apiItem) => {
            const fallback = FALLBACK_PROFESSIONS.find(
                (f) => f.slug === apiItem.slug || f.title.toLowerCase().includes(apiItem.title.toLowerCase()),
            );
            return {
                id: apiItem.id,
                slug: apiItem.slug,
                emoji: apiItem.emoji || fallback?.emoji || "💼",
                title: apiItem.title,
                tagline: apiItem.tagline || fallback?.tagline || apiItem.fieldLabel || "Kasb yo‘nalishi",
                reaction: fallback?.reaction || `${apiItem.title} kasbi bo‘yicha ajoyib imkoniyatlar ochiladi! ✨`,
                recommendedSubjects: fallback?.recommendedSubjects || ["Matematika", "Ingliz tili"],
            };
        });
    }, [professionsQuery.data]);

    const activeGrade = GRADES.find((g) => g.id === selectedGrade);
    const chosenProfessions = professionsList.filter((p) => selectedProfessions.includes(p.id));
    const activeGoal = DAILY_GOALS.find((g) => g.id === selectedGoal) || DAILY_GOALS[1];

    // Speech bubble dynamic messages for Westy
    const westyMessage = useMemo(() => {
        if (step === 0) {
            const firstName = user?.firstname ? ` ${user.firstname}` : "";
            return `Salom${firstName}! Men Westy — sening o‘quv do‘stingman 👋 Darslarni boshlashdan oldin senga mos shaxsiy reja tuzib olamiz!`;
        }
        if (step === 1) {
            if (activeGrade) return activeGrade.reaction;
            return "Nechanchi sinfda o‘qiysan? Senga eng mos dars va topshiriqlarni tanlaymiz!";
        }
        if (step === 2) {
            if (selectedProfessions.includes("none")) {
                return "Hammasi joyida! Darslar va testlar davomida o‘z yo‘lingni birga kashf etamiz ✨";
            }
            if (chosenProfessions.length > 0) {
                return chosenProfessions[chosenProfessions.length - 1].reaction;
            }
            return "Katta bo‘lsang, kim bo‘lmoqchisan? 2 tagacha orzu kasbingni tanla!";
        }
        if (step === 3) {
            if (selectedSubject) {
                const subObj = DEFAULT_SUBJECTS.find((s) => s.id === selectedSubject);
                return `${subObj?.title || "Bu fan"} ajoyib tanlov! Boshlang‘ich darslar juda qiziqarli tuzilgan.`;
            }
            if (chosenProfessions.length > 0) {
                const p = chosenProfessions[0];
                return `${p.title} bo‘lish uchun birinchi navbatda qaysi fanni kuchaytiramiz?`;
            }
            return "Qaysi fandan boshlaymiz? O‘zingga yoqqan birinchi fanni tanla.";
        }
        if (step === 4) {
            return activeGoal.reaction;
        }
        if (step === 5) {
            return "Rejang tayyor! Katta marralar sari birinchi qadamni tashlaymiz! 🚀";
        }
        return "Boshlashga tayyormisan?";
    }, [step, activeGrade, selectedProfessions, chosenProfessions, selectedSubject, activeGoal, user]);

    // Handle profession toggle
    const toggleProfession = (id: string) => {
        if (id === "none") {
            setSelectedProfessions(["none"]);
            return;
        }
        setSelectedProfessions((prev) => {
            const cleaned = prev.filter((p) => p !== "none");
            if (cleaned.includes(id)) {
                return cleaned.filter((p) => p !== id);
            }
            if (cleaned.length >= 2) {
                return [cleaned[1], id];
            }
            return [...cleaned, id];
        });
    };

    // Skip onboarding
    const handleSkip = () => {
        if (user?.id) {
            localStorage.setItem(`westep_onboarding_completed_${user.id}`, "true");
            navigate("/");
        } else {
            navigate("/login");
        }
    };

    // Finish onboarding
    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            // Save profession to backend if chosen
            const validSelected = chosenProfessions.filter((p) => !p.id.startsWith("p_"));
            if (validSelected.length > 0 && user?.id) {
                for (const prof of validSelected) {
                    try {
                        await selectProfessionMutation.mutateAsync({
                            professionId: prof.id,
                            source: "FREE",
                        });
                    } catch {
                        // ignore API error to not block user
                    }
                }
            }

            // Save user preferences locally
            if (user?.id) {
                localStorage.setItem(`westep_onboarding_completed_${user.id}`, "true");
                localStorage.setItem(
                    `westep_preferences_${user.id}`,
                    JSON.stringify({
                        grade: selectedGrade,
                        professions: selectedProfessions,
                        subject: selectedSubject,
                        dailyGoal: activeGoal.minutes,
                        completedAt: new Date().toISOString(),
                    }),
                );
            } else {
                localStorage.setItem(
                    "westep_guest_onboarding",
                    JSON.stringify({
                        grade: selectedGrade,
                        professions: selectedProfessions,
                        subject: selectedSubject,
                        dailyGoal: activeGoal.minutes,
                        completedAt: new Date().toISOString(),
                    }),
                );
            }

            toast.success("Shaxsiy rejangiz muvaffaqiyatli tuzildi! 🎉", "Xush kelibsiz!");

            if (!user?.id) {
                navigate("/register");
                return;
            }

            // If a subject was selected, try finding matching course
            const matchedCourse = (courses as Course[]).find(
                (c) =>
                    selectedSubject &&
                    c.name.toLowerCase().includes(
                        (DEFAULT_SUBJECTS.find((s) => s.id === selectedSubject)?.title || "").toLowerCase(),
                    ),
            );

            if (matchedCourse) {
                navigate(`/courses/${matchedCourse.id}`);
            } else {
                navigate("/");
            }
        } catch {
            navigate(user?.id ? "/" : "/login");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSteps = 5;
    const progressPercent = step === 0 ? 5 : Math.round((step / totalSteps) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
            {/* Header / Top Navigation Bar */}
            <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <img src="/academy/westy.png" alt="Westy" className="w-9 h-9 object-contain" />
                        <span className="font-fredoka font-bold text-lg text-blue-600 dark:text-blue-400">
                            Westep <span className="text-slate-900 dark:text-white">Academy</span>
                        </span>
                    </div>

                    {/* Progress Bar in center */}
                    {step > 0 ? (
                        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-4">
                            <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-400 shrink-0">
                                {step} / {totalSteps}
                            </span>
                        </div>
                    ) : null}

                    {/* Skip button */}
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                        <span>Keyinroq</span>
                        <X size={14} />
                    </button>
                </div>

                {/* Mobile progress bar */}
                {step > 0 ? (
                    <div className="sm:hidden h-1 w-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                ) : null}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-start">
                {/* Westy Mascot & Speech Bubble Banner */}
                <div className="mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100/80 dark:bg-blue-950/70 p-2 flex items-center justify-center shadow-md shadow-blue-500/10 border border-blue-200/60 dark:border-blue-800/50">
                            <img src="/academy/westy.png" alt="Westy Mascot" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="relative flex-1 w-full bg-white dark:bg-slate-800/95 rounded-2xl p-4 sm:py-3.5 sm:px-5 shadow-sm border border-slate-200/70 dark:border-slate-700/80 text-left">
                        {/* Triangle pointing to Westy */}
                        <div className="hidden sm:block absolute top-5 -left-2.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-slate-800" />
                        <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                            <Sparkles size={13} />
                            <span>Westy maslahati</span>
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
                            {westyMessage}
                        </p>
                    </div>
                </div>

                {/* STEP 0: XUSH KELIBSIZ */}
                {step === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-8 text-center animate-fadeIn">
                        <div className="space-y-3 max-w-lg mx-auto">
                            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                                🚀 Xush kelibsiz
                            </span>
                            <h1 className="font-fredoka text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                                O‘rganishni <span className="text-blue-600">shaxsiy reja</span> bilan boshlang
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                                Sizning maqsadingiz, qiziqishlaringiz va yoshingizga mos o‘quv marshrutini 1 daqiqada tuzib beramiz.
                            </p>
                        </div>

                        {/* 3 Value Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-800 space-y-2">
                                <div className="text-2xl">🎯</div>
                                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Orzu kasb yo‘li</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Kelajak kasbingiz uchun kerakli fanlar va ko‘nikmalar
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-100 dark:border-slate-800 space-y-2">
                                <div className="text-2xl">📚</div>
                                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Bosqichma-bosqich</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Video, interaktiv o‘yinlar va amaliy topshiriqlar
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/50 border border-amber-100 dark:border-slate-800 space-y-2">
                                <div className="text-2xl">⏱️</div>
                                <h2 className="font-bold text-sm text-slate-900 dark:text-white">Kuniga 10 daqiqa</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Charchatmaydigan, qiziqarli va doimiy o‘sish maromi
                                </p>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-xl shadow-blue-500/25 active:scale-98 transition-all inline-flex items-center justify-center gap-2"
                            >
                                <span>Reja tuzishni boshlash</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: SINF VA YOSH TANLASH */}
                {step === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-6 animate-fadeIn">
                        <div className="text-center sm:text-left space-y-1">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1-qadam · Sinf va yosh</span>
                            <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                Nechanchi sinfda o‘qiysan?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {GRADES.map((grade) => {
                                const isSelected = selectedGrade === grade.id;
                                return (
                                    <button
                                        key={grade.id}
                                        type="button"
                                        onClick={() => setSelectedGrade(grade.id)}
                                        className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-99 ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10"
                                                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
                                                {grade.emoji}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                    {grade.title}
                                                </h3>
                                                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block mt-0.5">
                                                    {grade.ageRange}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-slate-300 dark:border-slate-700"
                                            }`}
                                        >
                                            {isSelected && <CheckCircle2 size={15} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: KASB TANLASH (ORZU KASB) ⭐ */}
                {step === 2 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-5 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2-qadam · Kelajak kasbi</span>
                                <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    Katta bo‘lsang, kim bo‘lmoqchisan?
                                </h2>
                            </div>
                            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-3.5 py-1.5 rounded-full w-fit">
                                2 tagacha tanlash mumkin
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] sm:max-h-[390px] overflow-y-auto pr-1.5 pb-2">
                            {professionsList.map((prof) => {
                                const isSelected = selectedProfessions.includes(prof.id);
                                return (
                                    <button
                                        key={prof.id}
                                        type="button"
                                        onClick={() => toggleProfession(prof.id)}
                                        className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all duration-200 active:scale-99 ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10"
                                                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
                                                {prof.emoji}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                    {prof.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                                    {prof.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-slate-300 dark:border-slate-700"
                                            }`}
                                        >
                                            {isSelected && <CheckCircle2 size={13} />}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* "Hali bilmayman" Option */}
                            <button
                                type="button"
                                onClick={() => toggleProfession("none")}
                                className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 sm:col-span-2 transition-all duration-200 active:scale-99 ${
                                    selectedProfessions.includes("none")
                                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10"
                                        : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                    <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
                                        🤔
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                            Hali aniq bilmayman
                                        </h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                                            Darslar davomida o‘z qiziqishlarimni kashf etaman
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        selectedProfessions.includes("none")
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-slate-300 dark:border-slate-700"
                                    }`}
                                >
                                    {selectedProfessions.includes("none") && <CheckCircle2 size={13} />}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: FAN TANLASH (BOSHLANG'ICH FAN) */}
                {step === 3 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-6 animate-fadeIn">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3-qadam · Boshlang‘ich fan</span>
                            <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                Qaysi fandan boshlaymiz?
                            </h2>
                            <p className="text-xs text-slate-500">
                                Keyinchalik istalgan vaqt boshqa fanlarni ham o‘rganishingiz mumkin.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {DEFAULT_SUBJECTS.map((sub, idx) => {
                                const isSelected = selectedSubject === sub.id;
                                const isRecommended = idx === 0 || (chosenProfessions.length > 0 && idx < 2);
                                return (
                                    <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => setSelectedSubject(sub.id)}
                                        className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-99 ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10"
                                                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 shrink-0">
                                                {sub.emoji}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">
                                                        {sub.title}
                                                    </h3>
                                                    {isRecommended && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 whitespace-nowrap">
                                                            Tavsiya
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block mt-0.5 truncate">
                                                    {sub.sub}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-slate-300 dark:border-slate-700"
                                            }`}
                                        >
                                            {isSelected && <CheckCircle2 size={15} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 4: KUNLIK MAQSAD */}
                {step === 4 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-6 animate-fadeIn">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4-qadam · Kunlik odat</span>
                            <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                Kuniga qancha vaqt ajratmoqchisan?
                            </h2>
                            <p className="text-xs text-slate-500">
                                Muntazamlik natija beradi. Kunlik maqsadni keyinroq profil sozlamalaridan o‘zgartirishingiz mumkin.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {DAILY_GOALS.map((goal) => {
                                const isSelected = selectedGoal === goal.id;
                                return (
                                    <button
                                        key={goal.id}
                                        type="button"
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`p-4 sm:p-5 rounded-2xl border-2 text-left flex items-center justify-between gap-3.5 transition-all duration-200 active:scale-99 ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-md shadow-blue-500/10"
                                                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                <Clock size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white whitespace-nowrap">
                                                        {goal.title}
                                                    </h3>
                                                    <span
                                                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${goal.badgeColor}`}
                                                    >
                                                        {goal.badge}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold block mt-0.5">
                                                    Kuniga taxminan {goal.lessons} ta dars
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-slate-300 dark:border-slate-700"
                                            }`}
                                        >
                                            {isSelected && <CheckCircle2 size={15} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 5: NATIJA VA XULOSA */}
                {step === 5 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/70 dark:border-slate-800 space-y-6 animate-fadeIn">
                        <div className="text-center space-y-2 max-w-md mx-auto">
                            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
                                🎉 Hammasi tayyor!
                            </span>
                            <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                Shaxsiy o‘quv rejangiz tuzildi
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Har kuni 10 daqiqa vaqt ajrating va o‘z orzularingiz sari ishonch bilan intiling!
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                            <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                                    {chosenProfessions[0]?.emoji || "💼"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                        Tanlangan kasb
                                    </span>
                                    <b className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                                        {chosenProfessions.length > 0
                                            ? chosenProfessions.map((p) => p.title).join(", ")
                                            : "Erkin o‘rganish yo‘li"}
                                    </b>
                                </div>
                            </div>

                            <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
                                    {DEFAULT_SUBJECTS.find((s) => s.id === selectedSubject)?.emoji || "📚"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                        Boshlang‘ich fan
                                    </span>
                                    <b className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                                        {DEFAULT_SUBJECTS.find((s) => s.id === selectedSubject)?.title || "Matematika"}
                                    </b>
                                </div>
                            </div>

                            <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl shrink-0">
                                    <Flame size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                        Kunlik marom
                                    </span>
                                    <b className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                                        {activeGoal.title} ({activeGoal.lessons * 30} ta dars / oy)
                                    </b>
                                </div>
                            </div>

                            <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-xl shrink-0">
                                    <Award size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                                        Yutuq va mukofotlar
                                    </span>
                                    <b className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate block">
                                        Tanga, yulduz va sertifikatlar
                                    </b>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Action Bar */}
                {step > 0 && (
                    <div className="mt-8 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                        >
                            <ArrowLeft size={16} />
                            <span>Orqaga</span>
                        </button>

                        {step < totalSteps ? (
                            <button
                                type="button"
                                disabled={
                                    (step === 1 && !selectedGrade) ||
                                    (step === 2 && selectedProfessions.length === 0) ||
                                    (step === 3 && !selectedSubject)
                                }
                                onClick={() => setStep((s) => s + 1)}
                                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
                            >
                                <span>Davom etish</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleFinish}
                                className="px-9 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-98 disabled:opacity-60 transition-all flex items-center gap-2"
                            >
                                <Sparkles size={16} />
                                <span>{isSubmitting ? "Saqlanmoqda..." : "O‘qishni boshlash 🚀"}</span>
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Footer note */}
            <footer className="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
                Westep Academy · Har bir bola uchun shaxsiy ta’lim yo‘li
            </footer>
        </div>
    );
}
