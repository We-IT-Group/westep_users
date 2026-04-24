import { BookOpen, Flame, Sparkles } from "lucide-react";
import { useGetStudentCourseById } from "../../api/courses/useCourse.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import StudentCourseCard from "./StudentCourseCard.tsx";
import type { StudentCourse } from "../../types/types.ts";

export default function Courses() {
    const { data: user } = useUser();
    const { data = [], isPending } = useGetStudentCourseById(user?.id);
    const courses = data as StudentCourse[];
    const getCoursePercent = (course: StudentCourse) =>
        typeof course.progressPercentage === "number"
            ? course.progressPercentage
            : course.percent;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-16 pt-4 dark:bg-slate-950">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 sm:gap-12">
                <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600 dark:border-blue-800/50 dark:bg-blue-600/10 dark:text-blue-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    O'qishda davom eting
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-5xl">
                                    Mening <span className="text-blue-600">kurslarim</span>
                                </h1>
                                <p className="max-w-2xl text-sm font-bold italic tracking-tight text-slate-400 dark:text-slate-500 sm:text-base">
                                    Boshlangan kurslaringizni davom ettiring va bilim yo'lingizni to'xtatmang.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:min-w-[320px]">
                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                                    {courses.length}
                                </div>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Jami kurslar
                                </p>
                            </div>

                            <div className="rounded-[28px] bg-blue-600 p-5 text-white shadow-xl shadow-blue-500/20">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                                    <Flame className="h-6 w-6" />
                                </div>
                                <div className="text-4xl font-black italic tracking-tighter">
                                    {courses.filter((course) => getCoursePercent(course) >= 100).length}
                                </div>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                    Tugallangan
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {isPending ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[420px] animate-pulse rounded-[32px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                            />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => (
                            <StudentCourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <section className="rounded-[32px] border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                            <BookOpen className="h-10 w-10" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                            Hozircha kurs yo'q
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-sm font-bold italic text-slate-400 dark:text-slate-500">
                            Siz hali birorta kurs boshlamagansiz. Yangi kurs tanlab, o'qishni boshlashingiz mumkin.
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
