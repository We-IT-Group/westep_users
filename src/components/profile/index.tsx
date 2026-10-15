import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    Award,
    BarChart3,
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
import DeviceSessionsSection from "./DeviceSessionsSection.tsx";
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

const secondaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e8eefb] px-4 py-2.5 text-sm font-extrabold !text-[color:var(--navy)] transition-colors hover:bg-[#d7e3fb]";
const chipBase = "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold";

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
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </div>
        );
    }

    const kpis = [
        { icon: Clock, label: "O'qish vaqti", value: displayUser.totalLearningTime, tone: "" },
        { icon: BookOpen, label: "Kurslar", value: displayUser.totalCourses, tone: "" },
        { icon: Award, label: "Yakunlangan kurs", value: displayUser.completedCourses, tone: "ok" },
        { icon: TrendingUp, label: "Faol kunlar (oy)", value: displayUser.currentStreak, tone: "sun" },
    ];

    return (
        <div className="academy-stats academy-dash">
            <div className="academy-dash-head">
                <div className="academy-stats-head">
                    <h2>Profil</h2>
                    <p>Ma'lumotlar, kurslar va qurilmalar</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="academy-card !p-5 sm:!p-7"
            >
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                    <div className="relative shrink-0">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt={displayUser.name}
                                className="h-32 w-32 rounded-[28px] object-cover ring-4 ring-[#e8eefb] sm:h-40 sm:w-40"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-[28px] bg-[#e8eefb] text-primary-300 ring-4 ring-[#e8eefb] sm:h-40 sm:w-40">
                                <GraduationCap className="h-14 w-14 sm:h-16 sm:w-16" />
                            </div>
                        )}
                        <label className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-primary-500 shadow-[0_8px_18px_rgba(12,36,97,0.15)] transition-colors hover:bg-primary-50">
                            <Camera className="h-3.5 w-3.5 shrink-0" />
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

                    <div className="w-full min-w-0 flex-1 space-y-5 text-center md:text-left">
                        <div className="space-y-3">
                            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                                <h1 className="font-fredoka text-3xl font-semibold leading-tight sm:text-4xl">
                                    {displayUser.name}
                                </h1>
                                <span className={`${chipBase} bg-primary-50 text-primary-500`}>{displayUser.roleName}</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 text-sm font-bold text-[color:var(--hint)] md:flex-row md:flex-wrap md:gap-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary-500" />
                                    <span>{displayUser.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary-500" />
                                    <span>Qo'shilgan sana: {displayUser.joinDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {kpis.map((stat) => (
                                <div key={stat.label} className={`academy-kpi !bg-[#f4f8ff] !shadow-none ${stat.tone}`}>
                                    <stat.icon className="mb-1 h-4 w-4 text-[color:var(--hint)]" />
                                    <b className="!text-xl sm:!text-2xl">{stat.value}</b>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
                            <button
                                onClick={() => setEdit((prev) => !prev)}
                                className="academy-cta academy-cta-brand academy-cta-compact"
                                type="button"
                            >
                                {edit ? "Bekor qilish" : "Profilni tahrirlash"}
                            </button>
                            <Link to="/statistics" className={secondaryBtn}>
                                <BarChart3 className="h-4 w-4" />
                                Statistika
                            </Link>
                            <Link to="/rewards" className={secondaryBtn}>
                                Mukofotlar
                            </Link>
                            <Link to="/leaderboard" className={secondaryBtn}>
                                Reyting
                            </Link>
                            <Link to="/shop" className={secondaryBtn}>
                                Sovg‘alar
                            </Link>
                            <span className={`${chipBase} bg-[#f4f8ff] py-2.5 text-[color:var(--hint)]`}>
                                {completedLessonsCount} ta jami dars
                            </span>
                            <button
                                onClick={() =>
                                    logout(undefined, {
                                        onSuccess: () => navigate("/login"),
                                    })
                                }
                                disabled={isLogoutPending}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-extrabold text-rose-600 transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="academy-card !p-5 sm:!p-7"
                    >
                        <UpdateProfileUser user={user} setEdit={setEdit} />
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-fredoka text-2xl font-semibold">Mening kurslarim</h3>
                    <span className={`${chipBase} bg-primary-50 text-primary-500`}>{activeCourses} ta faol kurs</span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {profileCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                        >
                            <Link to={`/courses/${course.courseId}/${course.id}`} className="block h-full">
                                <div className="academy-card group flex h-full flex-col gap-4 !p-4 transition-transform hover:-translate-y-0.5 sm:flex-row">
                                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-[18px] sm:w-40">
                                        {course.image ? (
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-primary-100 to-[#e8eefb]" />
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                {course.progress >= 100 ? (
                                                    <span className={`${chipBase} gap-1.5 bg-emerald-50 text-emerald-700`}>
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Yakunlangan
                                                    </span>
                                                ) : (
                                                    <span className={`${chipBase} bg-[#e8eefb] text-[color:var(--hint)]`}>
                                                        Davom etmoqda
                                                    </span>
                                                )}
                                                <div className="font-fredoka text-xl font-semibold text-primary-500">
                                                    {course.progress}%
                                                </div>
                                            </div>
                                            <h4 className="line-clamp-1 font-fredoka text-lg font-semibold leading-tight transition-colors group-hover:text-primary-500">
                                                {course.title}
                                            </h4>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8eefb]">
                                                <div
                                                    className="h-full rounded-full bg-primary-500 transition-all duration-700"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-xs font-bold text-[color:var(--hint)]">
                                                <span>{course.instructor}</span>
                                                <span className="text-primary-500">
                                                    {course.completedLessons}/{course.totalLessons} dars
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {!profileCourses.length && (
                        <div className="academy-card col-span-full space-y-3 !py-10 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-300">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <p className="academy-quiet">Hozircha sizga biriktirilgan kurslar topilmadi.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-fredoka text-2xl font-semibold">Testlar natijalari</h3>
                    <Link
                        to="/test-history"
                        className="group inline-flex items-center gap-2 text-sm font-extrabold !text-primary-500"
                    >
                        Tarixni ko'rish
                        <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    </Link>
                </div>

                <div className="academy-card flex flex-col items-center justify-between gap-5 !p-5 sm:!p-6 md:flex-row">
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
                            <History className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-fredoka text-xl font-semibold">O'z bilimingizni tekshiring</h4>
                            <p className="academy-quiet text-sm">
                                Barcha topshirilgan testlar va ularning batafsil tahlili bilan tanishing.
                            </p>
                            <p className="text-sm font-extrabold text-primary-500">{quizHistory.length} ta topshirilgan test</p>
                        </div>
                    </div>

                    <Link to="/test-history" className="academy-cta academy-cta-brand academy-cta-compact shrink-0">
                        Tarixga o'tish
                    </Link>
                </div>
            </section>

            <DeviceSessionsSection />

            <section className="space-y-4">
                <h3 className="font-fredoka text-2xl font-semibold">Sertifikatlar</h3>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="flex flex-col items-center justify-between gap-5 rounded-[24px] bg-gradient-to-br from-[#0c2461] to-[#16327a] p-5 text-white shadow-[var(--shadow)] sm:flex-row sm:p-7"
                >
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                            <Award className="h-8 w-8 text-amber-300" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-fredoka text-xl font-semibold !text-white">Sertifikat tizimi tayyorlanmoqda</h4>
                            <p className="text-sm font-bold text-white/70">
                                {completedCourses} ta yakunlangan kurs · tez orada shu yerda yuklab olasiz
                            </p>
                        </div>
                    </div>

                    <button
                        className="shrink-0 rounded-2xl bg-white/15 px-6 py-3 text-sm font-extrabold text-white/70"
                        type="button"
                        disabled
                    >
                        Yuklab olish
                    </button>
                </motion.div>

                <p className="academy-quiet text-center text-sm">
                    Yangi sertifikatlarga erishish uchun ko'proq kurslarni yakunlang.
                </p>
            </section>
        </div>
    );
}

export default Profile;
