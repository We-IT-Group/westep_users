import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Play,
    Flame,
    Clock,
    Award,
    ChevronRight,
    Star,
    Users,
    Sparkles,
    CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrlImage } from "../api/apiClient.ts";
import { useUser } from "../api/auth/useAuth.ts";
import { formatCourseDuration } from "../utils/utils.ts";
import {
    useGetCourses,
    useGetContinueLearning,
    useGetLearningStats,
    useGetStudentCourseById,
} from "../api/courses/useCourse.ts";
import {
    getStudentCourseProgress,
    type StudentCourseProgressData,
} from "../api/studentProgressCourse/studentProgressCourseApi.ts";
import { useGetStudentCourseProgress } from "../api/studentProgressCourse/useStudentProgressCourse.ts";
import type { Course, Lesson, StudentCourse } from "../types/types.ts";

type ProgressLesson = Lesson & {
    active?: boolean;
};

function getCompletedLessonsCount(lessons: ProgressLesson[], explicitCompletedLessons?: number) {
    if (typeof explicitCompletedLessons === "number") {
        return explicitCompletedLessons;
    }

    const hasExplicitFlags = lessons.some(
        (lesson) => typeof lesson.completed === "boolean" || typeof lesson.progress === "boolean",
    );
    const explicitCompleted = lessons.filter(
        (lesson) => lesson.completed === true || lesson.progress === true,
    ).length;

    if (hasExplicitFlags) {
        return explicitCompleted;
    }

    return lessons.length;
}

function getCourseProgressPercent(
    lessons: ProgressLesson[],
    totalLessons: number,
    fallbackPercent = 0,
    explicitPercent?: number,
    explicitCompletedLessons?: number,
) {
    if (typeof fallbackPercent === "number" && Number.isFinite(fallbackPercent) && fallbackPercent > 0) {
        return Math.min(100, Math.max(0, Math.round(fallbackPercent)));
    }

    if (typeof explicitPercent === "number") {
        return Math.min(100, Math.max(0, Math.round(explicitPercent)));
    }

    if (!totalLessons || totalLessons <= 0) {
        return fallbackPercent;
    }

    const completedLessons = getCompletedLessonsCount(lessons, explicitCompletedLessons);
    return Math.min(100, Math.round((completedLessons / totalLessons) * 100));
}

type ContinueLearningCard = {
    id: string;
    courseId: string;
    moduleId?: string;
    lessonId?: string;
    title: string;
    currentModule: string;
    currentLesson: string;
    lastActivityAt: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    image: string;
};

type ContinueLearningResponse = {
    id?: string;
    studentCourseId?: string;
    courseId?: string;
    courseName?: string;
    title?: string;
    nextModuleId?: string;
    nextModuleName?: string;
    nextLessonId?: string;
    nextLessonName?: string;
    moduleName?: string;
    currentModule?: string;
    lessonName?: string;
    currentLesson?: string;
    lastActivityAt?: string;
    currentSecond?: number;
    percent?: number;
    progress?: number;
    completedLessons?: number;
    totalLessons?: number;
    lessonsCount?: number;
    attachmentUrl?: string | null;
    image?: string | null;
};

type LearningStatsResponse = {
    totalWatchedSeconds?: number;
    totalWatchedMinutes?: number;
    totalWatchedHours?: number;
    thisMonthActiveDays?: number;
};

function formatLearningTime(stats?: LearningStatsResponse, fallbackMinutes = 0) {
    const totalMinutes =
        stats?.totalWatchedMinutes ??
        ((stats?.totalWatchedSeconds ?? 0) > 0
            ? Math.floor((stats?.totalWatchedSeconds ?? 0) / 60)
            : fallbackMinutes);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours} soat ${minutes} daqiqa`;
    if (hours > 0) return `${hours} soat`;
    return `${minutes} daqiqa`;
}

type RecentLessonCard = {
    id: string;
    courseId: string;
    studentCourseId: string;
    image: string;
    courseTitle: string;
    lessonTitle: string;
    duration: string;
    progress: number;
    lessonsCount?: number;
};

type RecommendedCourseCard = {
    id: string;
    image: string;
    category: string;
    rating: number;
    totalStudents: number;
    title: string;
    instructorImage: string;
    instructor: string;
    price: number;
};

function imageUrl(path?: string | null) {
    return path ? `${baseUrlImage}${path}` : "";
}

function formatPrice(price?: number) {
    if (!price) return "Bepul";
    return `${price.toLocaleString("uz-UZ")} so'm`;
}

function formatLastActivityAt(value?: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStudentCoursePercent(course?: StudentCourse | null) {
    if (!course) return 0;
    if (typeof course.progressPercentage === "number") return course.progressPercentage;
    return course.percent || 0;
}

export function Dashboard() {
    const navigate = useNavigate();
    const { data: user } = useUser();
    const { data: studentCourses = [] } = useGetStudentCourseById(user?.id);
    const { data: allCourses = [] } = useGetCourses();
    const { data: continueLearningData } = useGetContinueLearning();
    const { data: learningStats } = useGetLearningStats();

    const activeStudentCourse = studentCourses[0] as StudentCourse | undefined;
    const { data: activeCourseProgress } = useGetStudentCourseProgress(activeStudentCourse?.id);
    const enrolledCourses = studentCourses as StudentCourse[];

    const recentProgressQueries = useQueries({
        queries: enrolledCourses.slice(0, 3).map((course: StudentCourse) => ({
            queryKey: ["mainpage-course-progress", course.id],
            queryFn: () => getStudentCourseProgress(course.id),
            enabled: !!course.id,
            retry: false,
        })),
    });

    const recentCourseProgressMap = useMemo(() => {
        return enrolledCourses.slice(0, 3).reduce((acc: Record<string, StudentCourseProgressData>, course: StudentCourse, index) => {
            const progress = recentProgressQueries[index]?.data as StudentCourseProgressData | undefined;
            acc[course.id] = progress || { lessons: [] };
            return acc;
        }, {});
    }, [enrolledCourses, recentProgressQueries]);

    const continueLearning = useMemo<ContinueLearningCard | null>(() => {
        const apiData = Array.isArray(continueLearningData)
            ? ((continueLearningData[0] as ContinueLearningResponse | undefined) ?? undefined)
            : (continueLearningData as ContinueLearningResponse | undefined);

        if (apiData) {
            const matchedStudentCourse = (studentCourses as StudentCourse[]).find(
                (item) => item.courseId === apiData.courseId,
            );
            const totalLessons =
                apiData.totalLessons ??
                apiData.lessonsCount ??
                matchedStudentCourse?.totalLessons ??
                0;
            const progress =
                getStudentCoursePercent(matchedStudentCourse as StudentCourse | undefined) ??
                apiData.progress ??
                apiData.percent ??
                0;
            const completedLessons =
                apiData.completedLessons ??
                matchedStudentCourse?.completedLessons ??
                (totalLessons > 0 ? Math.round((totalLessons * progress) / 100) : 0);

            return {
                id: apiData.studentCourseId || apiData.id || matchedStudentCourse?.id || "",
                courseId: apiData.courseId || "",
                moduleId: apiData.nextModuleId || undefined,
                lessonId: apiData.nextLessonId || undefined,
                title: apiData.courseName || apiData.title || "Kursni davom ettirish",
                currentModule:
                    apiData.nextModuleName ||
                    apiData.moduleName ||
                    apiData.currentModule ||
                    `Progress ${progress}%`,
                currentLesson:
                    apiData.nextLessonName ||
                    apiData.lessonName ||
                    apiData.currentLesson ||
                    "Darsni davom ettirishga tayyor",
                lastActivityAt: formatLastActivityAt(apiData.lastActivityAt),
                progress,
                completedLessons,
                totalLessons,
                image: imageUrl(apiData.attachmentUrl || apiData.image || matchedStudentCourse?.attachmentUrl || ""),
            };
        }

        if (!activeStudentCourse) return null;

        const lessons = (activeCourseProgress?.lessons || []) as ProgressLesson[];
        const currentLesson = lessons.find((lesson) => lesson.active) || lessons[0];
        const totalLessons =
            activeCourseProgress?.totalLessons ??
            (getStudentCoursePercent(activeStudentCourse) > 0
                ? Math.max(lessons.length, Math.round((lessons.length * 100) / getStudentCoursePercent(activeStudentCourse)))
                : lessons.length);
        const completedLessons = getCompletedLessonsCount(
            lessons,
            activeCourseProgress?.completedLessons,
        );
        const progress = getCourseProgressPercent(
            lessons,
            totalLessons,
            getStudentCoursePercent(activeStudentCourse),
            undefined,
            activeCourseProgress?.completedLessons,
        );

        return {
            id: activeStudentCourse.id,
            courseId: activeStudentCourse.courseId,
            moduleId: undefined,
            lessonId: undefined,
            title: activeStudentCourse.courseName,
            currentModule: `Progress ${progress}%`,
            currentLesson: currentLesson?.name || "Darsni davom ettirishga tayyor",
            lastActivityAt: "",
            progress,
            completedLessons,
            totalLessons,
            image: imageUrl(activeStudentCourse.attachmentUrl),
        };
    }, [activeCourseProgress, activeStudentCourse, continueLearningData, studentCourses]);

    const continueLearningHref = useMemo(() => {
        if (!continueLearning) return "";

        if (continueLearning.moduleId && continueLearning.lessonId) {
            return `/courses/${continueLearning.courseId}/${continueLearning.id}/${continueLearning.moduleId}/${continueLearning.lessonId}/questions`;
        }

        return `/courses/${continueLearning.courseId}/${continueLearning.id}`;
    }, [continueLearning]);

    const recentLessons = useMemo<RecentLessonCard[]>(() => {
        return enrolledCourses.slice(0, 3).map((course) => {
            const courseDetails = (allCourses as Course[]).find(c => c.id === course.courseId);
            const progressData = recentCourseProgressMap[course.id] || { lessons: [] };
            const lessons = (progressData.lessons || []) as ProgressLesson[];
            const totalLessons = progressData.totalLessons || courseDetails?.lessonsCount || 0;
            const computedProgress = getCourseProgressPercent(
                lessons,
                totalLessons,
                getStudentCoursePercent(course),
                undefined,
                progressData.completedLessons,
            );
            
            // Format duration string using the utility
            const durationStr = formatCourseDuration(courseDetails?.totalDuration) || 
                                (courseDetails?.lessonsCount ? `${courseDetails.lessonsCount} dars` : "---");

            return {
                id: course.id,
                courseId: course.courseId,
                studentCourseId: course.id,
                image: imageUrl(course.attachmentUrl),
                courseTitle: "Mening Kurslarim",
                lessonTitle: course.courseName,
                duration: durationStr,
                progress: computedProgress,
                lessonsCount: totalLessons
            };
        });
    }, [allCourses, enrolledCourses, recentCourseProgressMap]);

    const recommendedCourses = useMemo<RecommendedCourseCard[]>(() => {
        const enrolledIds = new Set(
            studentCourses.map((course: StudentCourse) => course.courseId),
        );

        return (allCourses as Course[])
            .filter((course) => !enrolledIds.has(course.id))
            .slice(0, 3)
            .map((course, index) => ({
                id: course.id,
                image: imageUrl(course.attachmentUrl),
                category: course.price > 0 ? "Premium" : "Bepul",
                rating: 4.8,
                totalStudents: 1200 + (index + 1) * 340,
                title: course.name,
                instructorImage: imageUrl(course.attachmentUrl),
                instructor: "Westep Academy",
                price: course.price,
            }));
    }, [allCourses, studentCourses]);

    const userProfile = useMemo(() => {
        const stats = learningStats as LearningStatsResponse | undefined;
        const totalLearningMinutes = ((activeCourseProgress?.lessons || []) as Lesson[]).reduce(
            (acc, lesson) => acc + (lesson.estimatedDuration || 0),
            0,
        );

        const completedCourses = studentCourses.filter(
            (item: StudentCourse) => getStudentCoursePercent(item) === 100,
        ).length;

        return {
            currentStreak: stats?.thisMonthActiveDays ?? 0,
            totalLearningTime: formatLearningTime(stats, totalLearningMinutes),
            totalCourses: studentCourses.length,
            completedCourses,
            name: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim(),
        };
    }, [activeCourseProgress, learningStats, studentCourses, user]);

    function handleRecommendedCourse(course: RecommendedCourseCard) {
        navigate(`/roadmap/${course.id}`);
    }

    return (
        <div className="min-h-[calc(100dvh-76px)] bg-[#F8FAFC] transition-colors duration-300 dark:bg-slate-950">
            <main className="mx-auto flex-1 w-full max-w-[1440px] space-y-10 px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 sm:space-y-16">
                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex min-h-[350px] items-stretch overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:min-h-[400px] sm:rounded-[32px] lg:col-span-8"
                    >
                        <div className="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-10 lg:w-[60%] lg:flex-none">
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:border-blue-800 dark:bg-blue-600/20 dark:text-blue-400 sm:px-3 sm:text-[10px]">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                        Darsni davom ettirish
                                    </div>
                                    <div className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-800 sm:px-3 sm:text-[10px]">
                                        {continueLearning?.currentModule || "Yangi bosqich"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                                        {continueLearning?.title ||
                                            `${user?.firstname || "Talaba"}, o'qishni boshlash vaqti`}
                                    </h1>
                                    <div className="flex items-center gap-2 border-l-2 border-blue-600 py-1 pl-4 text-sm font-bold italic text-slate-500 dark:text-slate-400 sm:text-base">
                                        <span>Keyingi dars:</span>
                                        <span className="line-clamp-1 text-slate-900 dark:text-slate-200">
                                            {continueLearning?.currentLesson ||
                                                "Kurs tanlang va o'qishni boshlang"}
                                        </span>
                                    </div>
                                    {continueLearning?.lastActivityAt ? (
                                        <p className="pl-4 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 sm:text-xs">
                                            Oxirgi faollik: {continueLearning.lastActivityAt}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between gap-6 pt-6 sm:flex-row sm:items-end sm:gap-8">
                                {continueLearning ? (
                                    <Link
                                        to={continueLearningHref}
                                        className="w-full sm:w-auto"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group flex w-full items-center justify-center gap-4 rounded-[18px] bg-slate-900 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl dark:bg-blue-600 sm:w-auto sm:rounded-[20px] sm:px-10 sm:py-5 sm:text-xs"
                                            type="button"
                                        >
                                            Darsni boshlash
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30 sm:h-8 sm:w-8">
                                                <Play className="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5" />
                                            </div>
                                        </motion.button>
                                    </Link>
                                ) : (
                                    <div className="w-full rounded-[18px] bg-slate-900 px-8 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white dark:bg-blue-600 sm:w-auto sm:text-xs">
                                        Kursni tanlang
                                    </div>
                                )}

                                <motion.div
                                    className="group/progress cursor-pointer rounded-[24px] border border-slate-100 bg-slate-50 p-3 pr-5 transition-all hover:bg-white hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 sm:rounded-[28px] sm:p-4 sm:pr-8"
                                    whileHover="hover"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="relative flex h-12 w-12 items-center justify-center sm:h-16 sm:w-16">
                                            <motion.div
                                                className="absolute inset-0"
                                                variants={{ hover: { rotate: 360 } }}
                                                transition={{ duration: 1, ease: "easeInOut" }}
                                            >
                                                <svg className="h-full w-full -rotate-90">
                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="44%"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        className="text-slate-200 dark:text-slate-700"
                                                    />
                                                    <circle
                                                        cx="50%"
                                                        cy="50%"
                                                        r="44%"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        className="text-blue-600"
                                                        strokeDasharray="100%"
                                                        strokeDashoffset={`${100 - (continueLearning?.progress || 0)}%`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </motion.div>
                                            <motion.span
                                                className="relative z-10 text-[9px] font-black text-slate-900 dark:text-white sm:text-[11px]"
                                                variants={{ hover: { scale: 1.2 } }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {continueLearning?.progress || 0}%
                                            </motion.span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 sm:text-[9px]">
                                                Progress
                                            </p>
                                            <p className="whitespace-nowrap text-xs font-black italic text-slate-900 dark:text-white sm:text-sm">
                                                {continueLearning
                                                    ? `${continueLearning.completedLessons}/${continueLearning.totalLessons} Darslar`
                                                    : "0/0 Darslar"}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="relative hidden w-[40%] bg-slate-50 dark:bg-slate-800/20 lg:block">
                            {continueLearning?.image ? (
                                <>
                                    <img
                                        src={continueLearning.image}
                                        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply dark:mix-blend-overlay"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-white dark:via-slate-900/10 dark:to-slate-900" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-2">
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[40px] sm:p-9">
                            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-orange-500/5 blur-3xl transition-transform duration-1000 group-hover:scale-150 dark:bg-orange-500/10" />
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-orange-600 shadow-inner dark:bg-orange-950/40 dark:text-orange-500 sm:h-14 sm:w-14">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Flame className="h-6 w-6 fill-current sm:h-7 sm:w-7" />
                                    </motion.div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 sm:text-xs">
                                        Streak
                                    </span>
                                    <div className="mt-1 flex items-center justify-end gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 mt-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-7xl">
                                        {userProfile.currentStreak}
                                    </span>
                                    <span className="text-sm font-black uppercase italic tracking-widest text-slate-400 dark:text-slate-500 sm:text-base">
                                        Kun
                                    </span>
                                </div>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Shu oyda o'rtacha davomiylik
                                </p>
                            </div>
                        </div>

                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-blue-600 p-6 text-white shadow-2xl shadow-blue-500/20 sm:rounded-[40px] sm:p-9">
                            <div className="absolute right-0 top-0 -mr-24 -mt-24 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-transform duration-[1500ms] group-hover:scale-150" />
                            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-white shadow-xl backdrop-blur-md sm:h-14 sm:w-14">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                        transition={{ duration: 0.8, ease: "anticipate" }}
                                    >
                                        <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 underline decoration-white/20 underline-offset-8 sm:text-xs">
                                    Statistika
                                </span>
                            </div>
                            <div className="relative z-10 mt-8 origin-left scale-100 transition-transform duration-500 group-hover:scale-105">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black italic leading-none tracking-tighter sm:text-5xl">
                                        {userProfile.totalLearningTime}
                                    </p>
                                    <p className="ml-1 mt-2 border-l-2 border-white/30 pl-1 text-[10px] font-bold uppercase tracking-widest opacity-70 italic sm:text-xs">
                                        Umumiy o'rganish vaqti
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-end">
                        <div className="space-y-3">
                            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600 dark:border-blue-800/50 dark:bg-blue-600/10 dark:text-blue-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    O'qishda davom eting
                                </span>
                            </div>
                            <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
                                Mening <span className="text-blue-600">kurslarim</span>
                            </h2>
                            <p className="text-sm font-bold italic tracking-tight text-slate-400 dark:text-slate-500 sm:text-base">
                                Boshlangan kurslaringizni davom ettiring
                            </p>
                        </div>
                        <Link
                            to="/my-courses"
                            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:bg-slate-900 hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-none dark:hover:bg-blue-600 sm:text-xs"
                        >
                            Barchasi
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {recentLessons.map((lesson) => (
                            <Link
                                key={lesson.id}
                                to={`/courses/${lesson.courseId}/${lesson.studentCourseId}`}
                                className="group"
                            >
                                <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[36px]">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {lesson.image ? (
                                            <img
                                                src={lesson.image}
                                                className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                                        )}
                                        <div className="absolute left-3 top-3 rounded-lg border border-white/20 bg-white/90 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-blue-600 shadow-sm backdrop-blur-md dark:bg-slate-900/90 sm:left-4 sm:top-4 sm:rounded-xl sm:px-3 sm:text-[9px]">
                                            {lesson.courseTitle}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-100 sm:h-14 sm:w-14">
                                                <Play className="ml-1 h-5 w-5 fill-current sm:h-6 sm:w-6" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between space-y-4 p-6 sm:space-y-6 sm:p-8">
                                        <div className="space-y-4 sm:space-y-5">
                                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 sm:text-sm">
                                                <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
                                                    <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                                    <span className="text-slate-900 dark:text-white">{lesson.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 font-bold italic text-blue-600 sm:text-base">
                                                    KURS <span className="text-xl sm:text-2xl font-black italic tracking-tighter">{lesson.progress}%</span>
                                                </div>
                                            </div>
                                            <h4 className="line-clamp-2 text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white sm:text-3xl">
                                                {lesson.lessonTitle}
                                            </h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-blue-600 transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                                    style={{ width: `${lesson.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                {lesson.progress >= 100 ? (
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Tugallangan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                                        O'qilmoqda
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-blue-600">
                                                    Davom etish
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="space-y-12 pb-24 sm:space-y-16">
                    <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-10 dark:border-slate-800 sm:flex-row sm:items-center">
                        <div className="space-y-3">
                            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600 dark:border-blue-800/50 dark:bg-blue-600/10 dark:text-blue-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    Yangi imkoniyatlar
                                </span>
                            </div>
                            <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
                                Kurs <span className="text-blue-600">xarid qilish</span>
                            </h2>
                            <p className="text-sm font-bold italic tracking-tight text-slate-400 dark:text-slate-500 sm:text-base">
                                O'z sohangizning eng yuqori cho'qqisiga chiqing
                            </p>
                        </div>
                        <Link to="/courses?source=purchase" className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:bg-slate-900 hover:text-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-none dark:hover:bg-blue-600 sm:text-xs">
                            Barcha kurslar
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-3">
                        {recommendedCourses.map((course) => (
                            <div key={course.id} className="group">
                                <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] dark:border-slate-800/50 dark:bg-[#0F172A] dark:hover:shadow-blue-500/10 sm:rounded-[40px]">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {course.image ? (
                                            <img
                                                src={course.image}
                                                className="h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                                        <div className="absolute left-4 top-4 rounded-xl border border-white/30 bg-white/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                                            {course.category}
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between space-y-6 p-6 sm:p-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/50">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3.5 w-3.5 ${
                                                                    i < Math.floor(course.rating)
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-slate-200 dark:text-slate-800"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="ml-0.5 text-sm font-black tracking-tighter text-slate-900 dark:text-white">
                                                        {course.rating}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 pr-1 text-slate-400 dark:text-slate-500">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white sm:text-sm">
                                                        {course.totalStudents.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="line-clamp-2 text-xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 transition-all duration-500 group-hover:text-blue-600 dark:text-white sm:text-2xl">
                                                {course.title}
                                            </h4>
                                        </div>

                                        <div className="space-y-5 pt-4">
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[16px] border-2 border-white bg-slate-100 shadow-lg transition-transform group-hover:rotate-6 dark:border-slate-900 dark:bg-slate-800">
                                                            {course.instructorImage ? (
                                                                <img
                                                                    src={course.instructorImage}
                                                                    className="h-full w-full object-cover"
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">
                                                                    WA
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-md border-2 border-white bg-blue-600 dark:border-slate-900">
                                                            <Award className="h-2 w-2 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="mb-0.5 text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                            Ekspert
                                                        </p>
                                                        <p className="max-w-[120px] truncate text-xs font-black uppercase italic text-slate-900 dark:text-white sm:text-sm">
                                                            {course.instructor}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {course.price > 0 && (
                                                        <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-red-500 opacity-90 line-through decoration-[2px] dark:text-red-400 sm:text-xs">
                                                            Premium
                                                        </p>
                                                    )}
                                                    <div className="whitespace-nowrap text-xl font-black italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-2xl">
                                                        {formatPrice(course.price)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="group/btn relative pt-1">
                                                <div className="absolute inset-0 rounded-2xl bg-blue-600 opacity-0 blur-lg transition-opacity group-hover/btn:opacity-15" />
                                                <button
                                                    className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-b-[3px] border-slate-950 bg-slate-900 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-500 active:scale-95 dark:border-blue-700 dark:bg-blue-600 sm:text-xs"
                                                    type="button"
                                                    onClick={() => handleRecommendedCourse(course)}
                                                >
                                                    <span className="relative z-10">
                                                        Boshlash
                                                    </span>
                                                    <CheckCircle2 className="relative z-10 h-4 w-4" />
                                                    <div className="absolute -left-[100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-1000 ease-in-out group-hover:left-[100%]" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
