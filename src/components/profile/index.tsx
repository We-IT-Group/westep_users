import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    Award,
    BookOpen,
    Camera,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    History,
    Loader2,
    LogOut,
    Mail,
    TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrlImage } from "../../api/apiClient.ts";
import { useLogout, useUploadAvatar, useUser } from "../../api/auth/useAuth.ts";
import { useGetLearningStats, useGetStudentCourseById } from "../../api/courses/useCourse.ts";
import { useGetGlobalQuizHistory } from "../../api/quizHistory/useQuizHistory.ts";
import {
    getStudentCourseProgress,
    type StudentCourseProgressData,
} from "../../api/studentProgressCourse/studentProgressCourseApi.ts";
import type { Lesson, StudentCourse, User } from "../../types/types.ts";
import { formatUzPhone } from "../../utils/utils.ts";
import UpdateProfileUser from "./UpdateProfileUser.tsx";

const UZBEK_MONTHS = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
];

function formatJoinDate(value?: string) {
    if (!value) return "Yaqinda";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Yaqinda";

    return `${String(date.getDate()).padStart(2, "0")} ${UZBEK_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function imageUrl(path?: string | null) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${baseUrlImage}${path}`;
}

type LearningStatsResponse = {
    totalWatchedSeconds?: number;
    totalWatchedMinutes?: number;
    totalWatchedHours?: number;
    thisMonthActiveDays?: number;
    totalCompletedLessons?: number;
};

function getStudentCoursePercent(course: StudentCourse) {
    if (typeof course.progressPercentage === "number") return course.progressPercentage;
    return course.percent;
}

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

export function Profile() {
    const navigate = useNavigate();
    const { data: user, isPending: loading } = useUser();
    const { mutate: logout, isPending: isLogoutPending } = useLogout();
    const { mutate: uploadAvatar, isPending: isAvatarUploading } = useUploadAvatar();
    const { data: myCourses = [] } = useGetStudentCourseById(user?.id);
    const { data: learningStats } = useGetLearningStats();
    const { data: quizHistory = [] } = useGetGlobalQuizHistory();
    const [edit, setEdit] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState("");
    const enrolledCourses = myCourses as StudentCourse[];

    const progressQueries = useQueries({
        queries: enrolledCourses.map((course: StudentCourse) => ({
            queryKey: ["profile-course-progress", course.id],
            queryFn: () => getStudentCourseProgress(course.id),
            enabled: !!course.id,
            retry: false,
        })),
    });

    const courseProgressMap = useMemo(() => {
        return enrolledCourses.reduce((acc: Record<string, StudentCourseProgressData>, course: StudentCourse, index: number) => {
            const progress = progressQueries[index]?.data as StudentCourseProgressData | undefined;
            acc[course.id] = progress || { lessons: [] };
            return acc;
        }, {});
    }, [enrolledCourses, progressQueries]);

    const totalLessons = useMemo(() => {
        return Object.values(courseProgressMap).reduce(
            (acc: number, progress) => acc + (progress.totalLessons ?? progress.lessons.length),
            0,
        );
    }, [courseProgressMap]);

    const completedLessonsCount =
        (learningStats as LearningStatsResponse | undefined)?.totalCompletedLessons ?? totalLessons;

    const totalLearningMinutes = useMemo(() => {
        return Object.values(courseProgressMap).reduce((acc: number, progress) => {
            const lessons = progress.lessons as Lesson[];
            return (
                acc +
                lessons.reduce(
                    (sum: number, lesson: Lesson) => sum + (lesson.estimatedDuration || 0),
                    0,
                )
            );
        }, 0);
    }, [courseProgressMap]);

    const completedCourses = enrolledCourses.filter((course: StudentCourse) => {
        const percent = getStudentCoursePercent(course);
        return percent === 100;
    }).length;

    const activeCourses = enrolledCourses.filter((course: StudentCourse) => {
        const percent = getStudentCoursePercent(course);
        return percent > 0;
    }).length;

    const displayUser = useMemo(() => {
        const stats = learningStats as LearningStatsResponse | undefined;
        const fullName =
            `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || "Westep User";

        return {
            name: fullName,
            email: formatUzPhone(user?.phoneNumber || ""),
            joinDate: formatJoinDate((user as User & { createdAt?: string })?.createdAt),
            totalLearningTime: formatLearningTime(stats, totalLearningMinutes),
            totalCourses: enrolledCourses.length,
            completedCourses,
            currentStreak: stats?.thisMonthActiveDays ?? 0,
            roleName: user?.roleName || "Premium Member",
            avatar: imageUrl(
                user?.avatarUrl ||
                user?.avatar ||
                user?.attachmentUrl ||
                user?.profileImageUrl ||
                user?.imageUrl ||
                null
            ),
        };
    }, [completedCourses, enrolledCourses.length, learningStats, totalLearningMinutes, user]);

    useEffect(() => {
        if (displayUser.avatar) {
            setAvatarPreview(displayUser.avatar);
        }
    }, [displayUser.avatar]);

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const localPreview = URL.createObjectURL(file);
        setAvatarPreview(localPreview);
        uploadAvatar(file, {
            onError: () => {
                URL.revokeObjectURL(localPreview);
                setAvatarPreview(displayUser.avatar);
            },
        });
        event.target.value = "";
    };

    const profileCourses = useMemo(() => {
        return enrolledCourses.map((course: StudentCourse) => {
            const progressData = courseProgressMap[course.id] || { lessons: [] };
            const lessons = progressData.lessons || [];
            const progress =
                getStudentCoursePercent(course);
            const completedLessons =
                typeof course.completedLessons === "number"
                    ? course.completedLessons
                    : typeof progressData.completedLessons === "number"
                    ? progressData.completedLessons
                    : lessons.filter((lesson) => lesson.completed === true || lesson.progress === true).length;
            const totalLessons =
                typeof course.totalLessons === "number"
                    ? course.totalLessons
                    : progressData.totalLessons ?? lessons.length;

            return {
                ...course,
                title: course.courseName,
                category: progress === 100 ? "Yakunlangan" : "Davom etmoqda",
                progress,
                instructor: "Westep Academy",
                totalLessons,
                completedLessons,
                image: imageUrl(course.attachmentUrl),
            };
        });
    }, [courseProgressMap, enrolledCourses]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 transition-colors duration-300 dark:bg-slate-950 sm:px-8 sm:pt-16 sm:pb-16">
            <main className="mx-auto max-w-[1200px] space-y-10 sm:space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[48px] sm:p-12"
                >
                    <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-blue-600/5 transition-transform duration-1000 group-hover:scale-125" />

                    <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-start sm:gap-12">
                        <div className="group/avatar relative">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt={displayUser.name}
                                    className="h-32 w-32 rounded-[32px] object-cover shadow-2xl ring-4 ring-slate-50 transition-transform duration-500 group-hover/avatar:scale-105 dark:ring-slate-800 sm:h-44 sm:w-44 sm:rounded-[48px]"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-slate-100 text-slate-400 ring-4 ring-slate-50 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-800 sm:h-44 sm:w-44 sm:rounded-[48px]">
                                    <GraduationCap className="h-14 w-14 sm:h-20 sm:w-20" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-white shadow-xl dark:border-slate-900 sm:h-12 sm:w-12">
                                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <label className="absolute -bottom-2 left-0 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-lg transition-all hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:text-blue-400">
                                <Camera className="h-3.5 w-3.5" />
                                {isAvatarUploading ? "Yuklanmoqda..." : "Rasm"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={isAvatarUploading}
                                />
                            </label>
                        </div>

                        <div className="w-full flex-1 space-y-8 text-center md:text-left">
                            <div className="space-y-4">
                                <div className="flex flex-col justify-center gap-2 md:flex-row md:items-center md:justify-start md:gap-4">
                                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
                                        {displayUser.name}
                                    </h1>
                                    <span className="mx-auto inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 md:mx-0 sm:text-xs">
                                        {displayUser.roleName}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold italic text-slate-500 md:justify-start sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <span>{displayUser.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span>Qo'shilgan sana: {displayUser.joinDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                                {[
                                    {
                                        icon: Clock,
                                        label: "Vaqt",
                                        value: displayUser.totalLearningTime,
                                        color: "from-blue-500 to-blue-600",
                                    },
                                    {
                                        icon: BookOpen,
                                        label: "Kurslar",
                                        value: displayUser.totalCourses,
                                        color: "from-indigo-500 to-indigo-600",
                                    },
                                    {
                                        icon: Award,
                                        label: "Yutuqlar",
                                        value: displayUser.completedCourses,
                                        color: "from-emerald-500 to-emerald-600",
                                    },
                                    {
                                        icon: TrendingUp,
                                        label: "Streak",
                                        value: displayUser.currentStreak,
                                        color: "from-orange-500 to-orange-600",
                                    },
                                ].map((stat, index) => (
                                    <div
                                        key={index}
                                        className={`group/stat relative overflow-hidden rounded-[24px] bg-gradient-to-br ${stat.color} p-4 text-white shadow-lg sm:rounded-[32px] sm:p-6`}
                                    >
                                        <div className="absolute right-0 top-0 h-16 w-16 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 transition-transform group-hover/stat:scale-150" />
                                        <stat.icon className="mb-3 h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                                        <div className="text-xl font-black italic tracking-tighter sm:text-3xl">
                                            {stat.value}
                                        </div>
                                        <div className="mt-1 text-[9px] font-black uppercase tracking-widest opacity-80 sm:text-[10px]">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                                <button
                                    onClick={() => setEdit((prev) => !prev)}
                                    className="rounded-2xl bg-slate-900 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                                    type="button"
                                >
                                    {edit ? "Bekor qilish" : "Profilni tahrirlash"}
                                </button>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {completedLessonsCount} ta jami dars
                                </div>
                                <button
                                    onClick={() =>
                                        logout(undefined, {
                                            onSuccess: () => navigate("/login"),
                                        })
                                    }
                                    disabled={isLogoutPending}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.2em] text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                                    type="button"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLogoutPending ? "Chiqilmoqda..." : "Chiqish"}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {edit && user && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[40px] sm:p-10"
                        >
                            <UpdateProfileUser user={user} setEdit={setEdit} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className="space-y-8 sm:space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Mening kurslarim
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 sm:text-xs">
                            {activeCourses} ta faol kurs
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        {profileCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                            >
                                <Link
                                    to={`/courses/${course.courseId}/${course.id}`}
                                    className="block h-full"
                                >
                                    <div className="group flex h-full flex-col gap-6 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:rounded-[36px] sm:p-6">
                                        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-[20px] sm:w-40 sm:rounded-[24px]">
                                            {course.image ? (
                                                <img
                                                    src={course.image}
                                                    alt={course.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                                            )}
                                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex h-full flex-col justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        {course.progress >= 100 ? (
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400 sm:text-[9px]">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Yakunlangan
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:text-[9px]">
                                                                Davom etmoqda
                                                            </span>
                                                        )}
                                                        <div className="shrink-0 text-lg font-black italic text-blue-600 sm:text-xl">
                                                            {course.progress}%
                                                        </div>
                                                    </div>
                                                    <h3 className="line-clamp-1 text-base font-black uppercase italic leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white sm:text-lg">
                                                        {course.title}
                                                    </h3>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div
                                                            className="h-full rounded-full bg-blue-600 transition-all duration-1000 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-widest text-slate-500 italic sm:text-[10px]">
                                                        <span>{course.instructor}</span>
                                                        <span className="text-blue-600">
                                                            {course.completedLessons}/
                                                            {course.totalLessons} Darslar
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}

                        {!profileCourses.length && (
                            <div className="rounded-[28px] border-4 border-dashed border-slate-100 p-10 text-center dark:border-slate-800 sm:rounded-[36px] sm:p-16">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700">
                                    <BookOpen className="h-8 w-8" />
                                </div>
                                <p className="text-sm font-semibold italic text-slate-500">
                                    Hozircha sizga biriktirilgan kurslar topilmadi.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-8 sm:space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Testlar natijalari
                        </h2>
                        <Link
                            to="/test-history"
                            className="group inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 sm:text-xs"
                        >
                            Tarixni ko'rish
                            <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>

                    <div className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-[48px] sm:p-12">
                        <div className="absolute left-0 top-0 h-64 w-64 -ml-32 -mt-32 rounded-full bg-blue-600/5 transition-transform duration-1000 group-hover:scale-125" />

                        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                            <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-10 sm:text-left">
                                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 sm:h-20 sm:w-20 sm:rounded-[32px]">
                                    <History className="h-8 w-8 sm:h-10 sm:w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                        O'z bilimingizni tekshiring
                                    </h3>
                                    <p className="text-sm font-semibold italic text-slate-500">
                                        Barcha topshirilgan testlar va ularning batafsil tahlili bilan tanishing.
                                    </p>
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                                        {quizHistory.length} ta topshirilgan test
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/test-history"
                                className="relative z-10 w-full rounded-2xl bg-slate-900 px-10 py-4 text-center text-xs font-black uppercase tracking-[0.2em] !text-white shadow-xl transition-all hover:shadow-blue-500/20 active:scale-95 dark:bg-blue-600 sm:w-auto sm:text-sm"
                            >
                                Tarixga o'tish
                            </Link>
                        </div>
                    </div>

                </section>

                <section className="space-y-8 sm:space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Sertifikatlar
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group relative overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-2xl sm:rounded-[48px] sm:p-12"
                    >
                        <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-blue-600/10 transition-transform duration-1000 group-hover:scale-125" />
                        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 h-64 w-64 rounded-full bg-emerald-600/10 transition-transform duration-1000 group-hover:scale-125" />

                        <div className="relative flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-12">
                            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-10 sm:text-left">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md transition-transform group-hover:rotate-6 sm:h-24 sm:w-24 sm:rounded-[32px]">
                                    <Award className="h-10 w-10 text-blue-400 sm:h-12 sm:w-12" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 sm:text-xs">
                                        Muvaffaqiyatli yakunlandi
                                    </p>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white sm:text-4xl">
                                        Sertifikat tizimi tayyorlanmoqda
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-semibold italic text-slate-500 sm:justify-start sm:text-xs">
                                        <span>{completedCourses} ta yakunlangan kurs</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                                        <span>API ulanishi kutilmoqda</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full shrink-0 rounded-2xl bg-blue-600 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-500/20 sm:w-auto sm:px-12 sm:py-5 sm:text-sm"
                                type="button"
                                disabled
                            >
                                Download
                            </button>
                        </div>
                    </motion.div>

                    <div className="space-y-4 rounded-[32px] border-4 border-dashed border-slate-100 p-10 text-center dark:border-slate-800 sm:rounded-[48px] sm:p-20">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-50 text-slate-200 dark:bg-slate-900 dark:text-slate-700 sm:h-16 sm:w-16 sm:rounded-[24px]">
                            <Award className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <p className="text-xs font-semibold italic text-slate-500 sm:text-sm">
                            Yangi sertifikatlarga erishish uchun ko'proq kurslarni yakunlang.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Profile;
