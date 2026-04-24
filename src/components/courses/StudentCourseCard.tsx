import { ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StudentCourse } from "../../types/types.ts";
import Image from "../../ui/Image";

interface Props {
    course: StudentCourse;
}

function formatDurationFromPercent(percent: number) {
    const safePercent = Number.isFinite(percent) ? percent : 0;
    const minutes = Math.max(5, Math.round((safePercent / 100) * 120));

    if (minutes < 60) return `${minutes} daqiqa`;

    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return restMinutes > 0 ? `${hours} soat ${restMinutes} daqiqa` : `${hours} soat`;
}

export default function StudentCourseCard({ course }: Props) {
    const navigate = useNavigate();

    const handleCourse = () => {
        navigate(`/courses/${course.courseId}/${course.id}`);
    };

    const progress =
        typeof course.progressPercentage === "number"
            ? course.progressPercentage
            : Number.isFinite(course.percent)
              ? course.percent
              : 0;

    return (
        <button
            type="button"
            onClick={handleCourse}
            className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white text-left shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                {course.attachmentUrl ? (
                    <Image imageUrl={course.attachmentUrl} className="h-full transition-transform duration-[1600ms] group-hover:scale-105" />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-100 via-sky-100 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-white shadow-xl backdrop-blur-md">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em]">
                        Mening kursim
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-2xl backdrop-blur-md">
                        <Play className="ml-1 h-6 w-6 fill-current" />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div className="space-y-5">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 sm:text-sm">
                        <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-slate-900 dark:text-white">
                                {formatDurationFromPercent(progress)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600">
                            <span>Kurs</span>
                            <span className="text-2xl font-black italic tracking-tighter">
                                {progress}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="line-clamp-2 text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white sm:text-3xl">
                            {course.courseName}
                        </h3>
                        <p className="text-sm font-bold italic text-slate-400 dark:text-slate-500">
                            O'qishni davom ettirish uchun kurs ichiga kiring.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-700 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {progress >= 100 ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Tugallangan
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                O'qilmoqda
                            </span>
                        )}
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-blue-600">
                            Davom etish
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-lg transition-colors group-hover:bg-blue-600 dark:bg-blue-600 dark:group-hover:bg-blue-500">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.22em]">
                                Kursga o'tish
                            </span>
                            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}
