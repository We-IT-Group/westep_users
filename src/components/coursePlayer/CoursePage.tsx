import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    ClipboardList,
    ChevronRight,
    Check,
    Download,
    ExternalLink,
    FileText,
    FolderArchive,
    Lock,
    Play,
    Star,
    Video,
    HelpCircle,
    History,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
    CoursePlayerData,
    CoursePlayerLesson,
    CoursePlayerMaterial,
    CoursePlayerTab,
} from "./types.ts";
import { DiscussionSection } from "../lessonDetails/discussion/DiscussionSection";
import { ReviewSection } from "../lessonDetails/review/ReviewSection";
import { getFileById, getFileByUrl } from "../../api/file/filesApi.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import { useGetMyHomeworkSubmissionsByLesson } from "../../api/lesson-homework/useLessonHomework.ts";
import HomeworkSubmitForm from "../homework/HomeworkSubmitForm.tsx";
import HomeworkSubmissionHistory from "../homework/HomeworkSubmissionHistory.tsx";

type CoursePageProps = {
    data: CoursePlayerData;
    withHeader?: boolean;
    HeaderComponent?: React.ComponentType;
    onNavigateToPurchase?: (courseId: string) => void;
    onLessonChange?: (lesson: CoursePlayerLesson) => void;
    onQuizOpen?: (
        quizId: string,
        meta?: { questionCount?: number; durationMinutes?: number },
    ) => void;
    renderVideoPlayer?: (args: {
        lesson: CoursePlayerLesson | undefined;
        lessonId: string;
        poster?: string;
    }) => React.ReactNode;
};

function LessonStatusIcon({
    type,
    isLocked,
    isCompleted,
    isSelected,
}: {
    type: CoursePlayerLesson["type"];
    isLocked: boolean;
    isCompleted: boolean;
    isSelected: boolean;
}) {
    if (isLocked) {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
        );
    }

    if (isCompleted && !isSelected) {
        return (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20">
                <Check className="h-4.5 w-4.5" strokeWidth={4} />
            </div>
        );
    }

    return (
        <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isSelected
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
            }`}
        >
            {type === "LESSON" ? (
                <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
                <FileText className="h-3.5 w-3.5" />
            )}
        </div>
    );
}

function VideoPlayer({
    videoUrl,
    lessonId,
    poster,
}: {
    videoUrl?: string;
    lessonId: string;
    poster?: string;
}) {
    const getYoutubeEmbedUrl = (source?: string) => {
        if (!source) return "";

        try {
            const url = new URL(source);
            const hostname = url.hostname.replace("www.", "");

            if (hostname === "youtu.be") {
                const videoId = url.pathname.split("/").filter(Boolean)[0];
                return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
            }

            if (hostname === "youtube.com" || hostname === "m.youtube.com") {
                if (url.pathname.startsWith("/embed/")) {
                    return source;
                }

                if (url.pathname === "/watch") {
                    const videoId = url.searchParams.get("v");
                    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
                }

                if (url.pathname.startsWith("/shorts/")) {
                    const videoId = url.pathname.split("/").filter(Boolean)[1];
                    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
                }
            }
        } catch {
            return "";
        }

        return "";
    };

    const youtubeEmbedUrl = getYoutubeEmbedUrl(videoUrl);
    const isYoutubeVideo = Boolean(youtubeEmbedUrl);

    return (
        <div className="relative group">
            <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl sm:rounded-[36px]">
                {videoUrl ? (
                    isYoutubeVideo ? (
                        <iframe
                            key={lessonId}
                            src={`${youtubeEmbedUrl}?autoplay=1&rel=0&playsinline=1`}
                            className="h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            key={lessonId}
                            src={videoUrl}
                            className="h-full w-full object-cover"
                            controls
                            autoPlay
                            playsInline
                            preload="metadata"
                            poster={poster}
                        />
                    )
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-900">
                        <Play className="h-12 w-12 fill-white/10 text-white/20" />
                        <p className="text-[10px] font-black uppercase tracking-[2px] text-white/40">
                            Video kutilmoqda...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LessonHeader({
    title,
    lessonNumber,
    duration,
    rating,
    onPrev,
    onNext,
    onRatingClick,
    isPrevDisabled,
    isNextDisabled,
}: {
    title: string;
    lessonNumber: number;
    duration: string;
    rating: number;
    onPrev: () => void;
    onNext: () => void;
    onRatingClick: () => void;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
}) {
    return (
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:gap-6 sm:pb-8 md:flex-row md:items-start">
            <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Dars {lessonNumber}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-sm font-black tracking-tight text-slate-500 dark:text-slate-400 sm:text-base">
                        {duration}
                    </span>
                    <button
                        type="button"
                        onClick={onRatingClick}
                        className="flex items-center gap-2 rounded-full border border-yellow-100 bg-yellow-50 px-4 py-2 transition-all hover:scale-[1.02] hover:border-yellow-200 hover:bg-yellow-100/80 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:hover:border-yellow-800 dark:hover:bg-yellow-900/30"
                    >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5" />
                        <span className="text-sm font-black text-yellow-700 dark:text-yellow-500 sm:text-base">
                            {rating.toFixed(1)}
                        </span>
                    </button>
                </div>
                <h2 className="text-xl font-black uppercase italic leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl sm:leading-[1.1] lg:text-4xl">
                    {title}
                </h2>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <motion.button
                    onClick={onPrev}
                    disabled={isPrevDisabled}
                    whileHover={{ scale: !isPrevDisabled ? 1.02 : 1 }}
                    whileTap={{ scale: !isPrevDisabled ? 0.98 : 1 }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
                    type="button"
                >
                    Oldingi
                </motion.button>
                <motion.button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    whileHover={{ scale: !isNextDisabled ? 1.02 : 1 }}
                    whileTap={{ scale: !isNextDisabled ? 0.98 : 1 }}
                    className="w-full rounded-xl border border-blue-500 bg-blue-600 px-6 py-3 text-xs font-black text-white transition-all hover:bg-blue-700 disabled:opacity-30 sm:w-auto sm:rounded-2xl sm:px-8 sm:py-3.5 sm:text-sm"
                    type="button"
                >
                    Keyingi dars
                </motion.button>
            </div>
        </div>
    );
}

function LessonContentTabs({
    activeTab,
    lessonId,
    materials,
    onQuizOpen,
    canAccessHomework,
}: {
    activeTab: CoursePlayerTab;
    lessonId: string;
    materials: CoursePlayerMaterial[];
    onQuizOpen?: (material: CoursePlayerMaterial) => void;
    canAccessHomework: boolean;
}) {
    const navigate = useNavigate();

    const downloadAttachment = async (material: CoursePlayerMaterial) => {
        if (!material.attachmentId && !material.attachmentUrl) return;

        const blob = material.attachmentUrl
            ? await getFileByUrl(material.attachmentUrl)
            : await getFileById(material.attachmentId);
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = material.fileName || material.title || "resource";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    };

    const openExternal = (url?: string) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleMaterialAction = async (material: CoursePlayerMaterial) => {
        if (material.type === "quiz") {
            onQuizOpen?.(material);
            return;
        }

        if (material.resourceUrl) {
            openExternal(material.resourceUrl);
            return;
        }

        if (material.attachmentId || material.attachmentUrl) {
            await downloadAttachment(material);
        }
    };

    const homeworkMaterial = materials.find((item) => item.type === "homework");
    const {
        data: lessonSubmissions = [],
        isPending: isLessonSubmissionsPending,
        error: lessonSubmissionsError,
    } = useGetMyHomeworkSubmissionsByLesson(
        canAccessHomework && homeworkMaterial?.taskId ? lessonId : null,
    );

    const getMaterialMeta = (material: CoursePlayerMaterial) => {
        switch (material.type) {
            case "quiz":
                return {
                    accent: "border-amber-100 hover:border-amber-300 dark:border-amber-900/30",
                    iconBox: "bg-amber-50 group-hover:bg-amber-100 dark:bg-amber-900/20",
                    icon: <ClipboardList className="h-6 w-6 text-amber-500 transition-colors sm:h-8 sm:w-8" />,
                    badge: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                };
            case "homework":
                return {
                    accent: "border-indigo-100 hover:border-indigo-300 dark:border-indigo-900/30",
                    iconBox: "bg-indigo-50 group-hover:bg-indigo-100 dark:bg-indigo-900/20",
                    icon: <FileText className="h-6 w-6 text-indigo-500 transition-colors sm:h-8 sm:w-8" />,
                    badge: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
                };
            case "zip":
                return {
                    accent: "border-violet-100 hover:border-violet-300 dark:border-violet-900/30",
                    iconBox: "bg-violet-50 group-hover:bg-violet-100 dark:bg-violet-900/20",
                    icon: <FolderArchive className="h-6 w-6 text-violet-500 transition-colors sm:h-8 sm:w-8" />,
                    badge: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
                };
            case "video":
                return {
                    accent: "border-rose-100 hover:border-rose-300 dark:border-rose-900/30",
                    iconBox: "bg-rose-50 group-hover:bg-rose-100 dark:bg-rose-900/20",
                    icon: <Video className="h-6 w-6 text-rose-500 transition-colors sm:h-8 sm:w-8" />,
                    badge: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
                };
            case "doc":
                return {
                    accent: "border-sky-100 hover:border-sky-300 dark:border-sky-900/30",
                    iconBox: "bg-sky-50 group-hover:bg-sky-100 dark:bg-sky-900/20",
                    icon: <FileText className="h-6 w-6 text-sky-500 transition-colors sm:h-8 sm:w-8" />,
                    badge: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
                };
            default:
                return {
                    accent: "border-slate-100 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900",
                    iconBox: "bg-slate-50 group-hover:bg-blue-50 dark:bg-slate-800 dark:group-hover:bg-blue-900/30",
                    icon: <FileText className="h-6 w-6 text-slate-400 transition-colors group-hover:text-blue-600 sm:h-8 sm:w-8" />,
                    badge: "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
                };
        }
    };

    if (activeTab === "materials") {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    {materials.map((file) => {
                    const isQuiz = file.type === "quiz";
                    const isHomework = file.type === "homework";
                    const hasExternalLink = Boolean(file.resourceUrl);
                    const hasDownload = Boolean(file.attachmentId || file.attachmentUrl);
                    const meta = getMaterialMeta(file);

                    return (
                        <div
                            key={file.id}
                            onClick={() => void handleMaterialAction(file)}
                            className={`group flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-xl dark:bg-slate-900 dark:shadow-none sm:rounded-[32px] sm:p-7 ${meta.accent} ${
                                isQuiz || hasExternalLink || hasDownload ? "cursor-pointer" : ""
                            }`}
                        >
                            <div className="flex min-w-0 items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-16 sm:w-16 sm:rounded-[22px] ${meta.iconBox}`}>
                                        {meta.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-black tracking-tight text-slate-900 dark:text-white sm:text-[15px]">
                                            {file.title}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <div className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest sm:text-[11px] ${meta.badge}`}>
                                                {file.size}
                                            </div>
                                            <div className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800/80 dark:text-slate-300 sm:text-[11px]">
                                                {file.uploadedAt}
                                            </div>
                                        </div>
                                        {(isQuiz || isHomework) && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {typeof file.questionCount === "number" && (
                                                    <div className="rounded-md bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700 ring-1 ring-amber-100 dark:bg-slate-800/90 dark:text-amber-300 dark:ring-amber-900/40 sm:text-[11px]">
                                                        {file.questionCount} savol
                                                    </div>
                                                )}
                                                {typeof file.durationMinutes === "number" && (
                                                    <div className="rounded-md bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700 ring-1 ring-amber-100 dark:bg-slate-800/90 dark:text-amber-300 dark:ring-amber-900/40 sm:text-[11px]">
                                                        {file.durationMinutes} min
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {file.description && (
                                            <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                                                {file.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {isQuiz ? (
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onQuizOpen?.(file);
                                        }}
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 sm:h-12 sm:rounded-2xl"
                                        type="button"
                                    >
                                        <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                                        Testni ochish
                                    </button>
                                ) : (
                                    <>
                                        {hasExternalLink && (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openExternal(file.resourceUrl);
                                                }}
                                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-5 text-xs font-black uppercase tracking-[0.18em] text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white sm:h-12 sm:rounded-2xl"
                                                type="button"
                                            >
                                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Boshqa oynada ochish
                                            </button>
                                        )}
                                        {hasDownload && (
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    void downloadAttachment(file);
                                                }}
                                                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-5 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:bg-slate-900 hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-blue-600 sm:h-12 sm:rounded-2xl"
                                                type="button"
                                            >
                                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Yuklab olish
                                            </button>
                                        )}
                                        {!hasExternalLink && !hasDownload && (
                                            <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-5 text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 sm:h-12 sm:rounded-2xl">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Hozircha mavjud emas
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                    })}
                </div>
            </div>
        );
    }

    if (activeTab === "homework") {
        if (!canAccessHomework) {
            return (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="text-lg font-black uppercase italic text-slate-900 dark:text-white">
                        Homework bo'limi faqat student uchun
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Bu sahifa student submission, baho va feedback oqimi uchun mo'ljallangan.
                    </p>
                </div>
            );
        }

        if (!homeworkMaterial?.taskId) {
            return (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <div className="text-lg font-black uppercase italic text-slate-900 dark:text-white">
                        Homework task topilmadi
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Bu dars uchun homework backenddan hali kelmagan.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Student homework
                        </div>
                        <h3 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                            Submission va natijalar
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Vazifani yuboring, keyin history, score va feedbackni shu yerda ko'ring.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/homework-history")}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <History className="h-4 w-4" />
                        Barcha history
                    </button>
                </div>

                <HomeworkSubmitForm
                    taskId={homeworkMaterial.taskId}
                    lessonId={lessonId}
                />

                <div className="space-y-4">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Mening yuborishlarim
                        </div>
                        <h4 className="mt-2 text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                            Shu dars bo'yicha history
                        </h4>
                    </div>

                    <HomeworkSubmissionHistory
                        submissions={lessonSubmissions}
                        isLoading={isLessonSubmissionsPending}
                        errorMessage={
                            lessonSubmissionsError instanceof Error
                                ? lessonSubmissionsError.message
                                : null
                        }
                        emptyTitle="Bu dars uchun submission topilmadi"
                        emptyDescription="Comment, link yoki file bilan birinchi homework submissionni yuboring."
                        showLessonName={false}
                    />
                </div>
            </div>
        );
    }

    if (activeTab === "reviews") {
        return <ReviewSection lessonId={lessonId} />;
    }

    return <DiscussionSection lessonId={lessonId} />;
}

function CurriculumSidebar({
    courseId,
    courseModules,
    expandedModules,
    selectedLesson,
    progress,
    onToggleModule,
    onSelectLesson,
    onNavigateToPurchase,
    mode = "static",
    onClose,
}: {
    courseId: string;
    courseModules: CoursePlayerData["modules"];
    expandedModules: string[];
    selectedLesson: string;
    progress: number;
    onToggleModule: (id: string) => void;
    onSelectLesson: (lesson: CoursePlayerLesson) => void;
    onNavigateToPurchase?: (courseId: string) => void;
    mode?: "static" | "overlay";
    onClose?: () => void;
}) {
    const isOverlay = mode === "overlay";

    return (
        <aside
            className={`flex h-full w-full shrink-0 flex-col bg-white dark:bg-slate-950 ${
                isOverlay
                    ? "overflow-hidden"
                    : "hidden border-t border-slate-100 dark:border-slate-800 lg:flex lg:w-[360px] lg:border-l lg:border-t-0 xl:w-[420px]"
            }`}
        >
            <div className="shrink-0 border-b border-slate-100 bg-slate-50/30 p-4 dark:border-slate-800 dark:bg-slate-900/30 sm:p-6 lg:p-8">
                <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 sm:text-[11px]">
                            Kurs mundarijasi
                        </h3>
                        <span className="rounded-lg border border-slate-100 bg-white px-2 py-0.5 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400">
                            {progress}%
                        </span>
                    </div>
                    {isOverlay ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800 sm:h-2">
                    <div
                        className="h-full rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="max-h-[420px] flex-1 space-y-2.5 overflow-y-auto p-3 sm:max-h-[500px] sm:space-y-3 sm:p-4 lg:max-h-none lg:p-5">
                {courseModules.map((module) => {
                    const isModuleLocked = module.isPurchased === false;
                    const isExpanded = expandedModules.includes(module.id);

                    return (
                        <div key={module.id} className="space-y-1.5">
                            <button
                                onClick={() => {
                                    if (isModuleLocked) {
                                        onClose?.();
                                        onNavigateToPurchase?.(courseId);
                                        return;
                                    }
                                    onToggleModule(module.id);
                                }}
                                className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3.5 text-left text-[11px] font-black transition-all sm:rounded-[24px] sm:p-5 sm:text-[13px] ${
                                    isModuleLocked
                                        ? "cursor-pointer border-transparent bg-slate-50/50 text-slate-400 dark:bg-slate-900/20"
                                          : isExpanded
                                          ? "border-blue-100 bg-blue-600/10 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400"
                                          : "border-transparent bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                }`}
                                type="button"
                            >
                                <div className="flex items-center gap-3">
                                    {isModuleLocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                                    <span className="text-left uppercase tracking-wide">
                                        {module.title}
                                    </span>
                                </div>
                                <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                </motion.div>
                            </button>

                            {isExpanded && (
                                <div className="space-y-1.5 pl-1 pt-1">
                                    {module.lessons.map((lesson) => {
                                        const isLocked = module.isPurchased === false;
                                        const isSelected = selectedLesson === lesson.id;

                                        return (
                                            <button
                                                key={lesson.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isLocked) return;
                                                    onSelectLesson(lesson);
                                                    onClose?.();
                                                    if (window.innerWidth < 1024) {
                                                        window.scrollTo({
                                                            top: 0,
                                                            behavior: "smooth",
                                                        });
                                                    }
                                                }}
                                                className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all sm:rounded-[24px] sm:p-4 ${
                                                    isLocked
                                                        ? "cursor-not-allowed border-transparent bg-slate-50/30 text-slate-400 dark:bg-slate-900/10"
                                                          : isSelected
                                                          ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none"
                                                          : "border-transparent bg-white text-slate-600 hover:border-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                                                }`}
                                            >
                                                <LessonStatusIcon
                                                    type={lesson.type}
                                                    isLocked={isLocked}
                                                    isCompleted={lesson.completed}
                                                    isSelected={isSelected}
                                                />
                                                <div className="min-w-0 flex-1 text-left">
                                                    <p className="truncate text-[12px] font-black uppercase italic leading-tight sm:text-[13px]">
                                                        {lesson.title}
                                                    </p>
                                                    <span className="mt-1 block text-[8px] font-black uppercase tracking-widest text-inherit opacity-70 sm:text-[10px]">
                                                        {lesson.duration}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export function CoursePage({
    data,
    withHeader = false,
    HeaderComponent,
    onNavigateToPurchase,
    onLessonChange,
    onQuizOpen,
    renderVideoPlayer,
}: CoursePageProps) {
    const { data: currentUser } = useUser();
    const contentTabsRef = useRef<HTMLDivElement | null>(null);
    const allLessons = useMemo(() => data.modules.flatMap((module) => module.lessons), [data]);
    const [activeTab, setActiveTab] = useState<CoursePlayerTab>("discussion");
    const [expandedModules, setExpandedModules] = useState<string[]>(
        data.modules[0] ? [data.modules[0].id] : [],
    );
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(
        data.initialLessonId ?? allLessons[0]?.id ?? "",
    );

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!isSidebarOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        if (data.initialLessonId && data.initialLessonId !== selectedLesson) {
            setSelectedLesson(data.initialLessonId);
        }
    }, [data.initialLessonId, selectedLesson]);

    const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === selectedLesson);
    const currentLesson = allLessons[currentLessonIndex];
    const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : undefined;
    const nextLessonModule = nextLesson
        ? data.modules.find((module) => module.lessons.some((lesson) => lesson.id === nextLesson.id))
        : undefined;
    const isNextLessonLocked = nextLessonModule?.isPurchased === false;
    const isCurrentLessonCompleted = Boolean(currentLesson?.completed);
    const averageRating = data.reviews.length
        ? data.reviews.reduce((acc, review) => acc + review.rating, 0) / data.reviews.length
        : 0;
    const currentLessonRating = currentLesson?.rating ?? averageRating;

    const lessonQuiz = data.materials.find(m => m.type === "quiz");
    const lessonHomework = data.materials.find((material) => material.type === "homework");
    const hasVideo = !!currentLesson?.videoUrl;
    const isPractice = currentLesson?.type === "PRACTICE";
    const canAccessHomework = currentUser?.roleName === "STUDENT";
    const availableTabs: CoursePlayerTab[] =
        canAccessHomework && lessonHomework
            ? ["discussion", "materials", "homework", "reviews"]
            : ["discussion", "materials", "reviews"];

    useEffect(() => {
        if (activeTab === "homework" && (!canAccessHomework || !lessonHomework)) {
            setActiveTab("discussion");
        }
    }, [activeTab, canAccessHomework, lessonHomework]);

    function handleSelectLesson(lesson: CoursePlayerLesson) {
        setSelectedLesson(lesson.id);
        onLessonChange?.(lesson);

        const lessonModule = data.modules.find((module) =>
            module.lessons.some((item) => item.id === lesson.id),
        );
        if (lessonModule) {
            setExpandedModules([lessonModule.id]);
        }
    }

    function handleNextLesson() {
        if (isNextLessonLocked) {
            return;
        }

        if (currentLessonIndex < allLessons.length - 1) {
            handleSelectLesson(allLessons[currentLessonIndex + 1]);
        }
    }

    function handlePrevLesson() {
        if (currentLessonIndex > 0) {
            handleSelectLesson(allLessons[currentLessonIndex - 1]);
        }
    }

    function handleRatingClick() {
        setActiveTab("reviews");

        window.requestAnimationFrame(() => {
            contentTabsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans transition-colors duration-300 dark:bg-slate-950">
            {withHeader && HeaderComponent ? <HeaderComponent /> : null}

            <div className="flex flex-1 flex-col overflow-x-hidden lg:flex-row">
                <div className="min-w-0 flex-1 bg-[#F8FAFC] dark:bg-slate-900/10">
                    <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 pb-20 sm:space-y-6 sm:px-6 sm:py-8 sm:pb-32 lg:px-8 lg:py-10">
                        
                        {isPractice ? (
                            <div className="space-y-5 rounded-[24px] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 text-center shadow-xl shadow-amber-500/5 dark:border-amber-900/30 dark:from-amber-900/10 dark:to-slate-900 sm:space-y-6 sm:rounded-[32px] sm:p-10 lg:p-12">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-amber-500 shadow-lg shadow-amber-500/30 sm:h-20 sm:w-20 sm:rounded-3xl">
                                    <HelpCircle className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                                        Amaliy dars: {currentLesson?.title}
                                    </h2>
                                    <p className="text-xs font-bold uppercase italic tracking-[0.18em] text-slate-400 sm:text-sm">
                                        Bu darsda video yo'q. Test va vazifalarni resurslar bo'limidan bajaring.
                                    </p>
                                </div>
                                {lessonQuiz && (
                                    <button
                                        onClick={() =>
                                            onQuizOpen?.(lessonQuiz.id, {
                                                questionCount: lessonQuiz.questionCount,
                                                durationMinutes: lessonQuiz.durationMinutes,
                                            })
                                        }
                                        className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] hover:bg-amber-600 active:scale-[0.98] sm:w-auto sm:px-10 sm:py-5"
                                    >
                                        Testni boshlash
                                    </button>
                                )}
                            </div>
                        ) : hasVideo ? (
                            renderVideoPlayer ? (
                                renderVideoPlayer({
                                    lesson: currentLesson,
                                    lessonId: selectedLesson,
                                    poster: data.poster,
                                })
                            ) : (
                                <VideoPlayer
                                    videoUrl={currentLesson?.videoUrl}
                                    lessonId={selectedLesson}
                                    poster={data.poster}
                                />
                            )
                        ) : (
                            <div className="space-y-3 rounded-[24px] border border-slate-100 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 sm:rounded-[32px] sm:p-10 lg:p-12">
                                <Video className="mx-auto h-12 w-12 text-slate-300" />
                                <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                                    Video topilmadi
                                </h2>
                                <p className="text-sm font-bold text-slate-400">
                                    Bu LESSON turi uchun video backenddan kelmadi.
                                </p>
                            </div>
                        )}

                        <LessonHeader
                            title={currentLesson?.title || ""}
                            lessonNumber={currentLessonIndex + 1}
                            duration={currentLesson?.duration || ""}
                            rating={currentLessonRating}
                            onPrev={handlePrevLesson}
                            onNext={handleNextLesson}
                            onRatingClick={handleRatingClick}
                            isPrevDisabled={currentLessonIndex <= 0}
                            isNextDisabled={
                                currentLessonIndex === allLessons.length - 1 ||
                                isNextLessonLocked ||
                                !isCurrentLessonCompleted
                            }
                        />

                        <div className="lg:hidden">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(true)}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:px-5"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                            Modullar
                                        </div>
                                        <div className="truncate text-sm font-black text-slate-900 dark:text-white">
                                            Kurs mundarijasini ochish
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-black text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400">
                                    {data.progress}%
                                </div>
                            </button>
                        </div>

                        <div ref={contentTabsRef} className="space-y-5 sm:space-y-8 lg:space-y-10">
                            <div className="scrollbar-hide -mx-4 flex items-center gap-5 overflow-x-auto border-b border-slate-100 px-4 dark:border-slate-800 sm:mx-0 sm:gap-8 sm:px-0 lg:gap-12">
                                {availableTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-1 pb-4 text-xs font-black capitalize tracking-tight whitespace-nowrap transition-all sm:pb-5 sm:text-[15px] ${
                                            activeTab === tab
                                                ? "text-blue-600"
                                                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                        }`}
                                        type="button"
                                    >
                                        {tab === "discussion"
                                            ? "Muloqot"
                                            : tab === "materials"
                                              ? "Resurslar"
                                              : tab === "homework"
                                                ? "Homework"
                                                : "Sharhlar"}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="course-player-tab"
                                                className="absolute bottom-[-1px] left-0 right-0 h-1 rounded-full bg-blue-600"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <LessonContentTabs
                                activeTab={activeTab}
                                lessonId={selectedLesson}
                                materials={data.materials}
                                canAccessHomework={canAccessHomework}
                                onQuizOpen={(material) =>
                                    onQuizOpen?.(material.id, {
                                        questionCount: material.questionCount,
                                        durationMinutes: material.durationMinutes,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                {isSidebarOpen ? (
                    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] lg:hidden">
                        <button
                            type="button"
                            aria-label="Modullar panelini yopish"
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute inset-0"
                        />

                        <div className="absolute inset-x-0 bottom-0 top-[14vh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-slate-950 md:inset-y-0 md:right-0 md:left-auto md:top-0 md:w-[420px] md:max-w-[88vw] md:rounded-none md:border-l md:border-slate-800">
                            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-slate-200 dark:bg-slate-700 md:hidden" />
                            <CurriculumSidebar
                                mode="overlay"
                                courseId={data.courseId}
                                courseModules={data.modules}
                                expandedModules={expandedModules}
                                selectedLesson={selectedLesson}
                                progress={data.progress}
                                onToggleModule={(id) =>
                                    setExpandedModules((prev) =>
                                        prev.includes(id) ? [] : [id],
                                    )
                                }
                                onSelectLesson={handleSelectLesson}
                                onNavigateToPurchase={onNavigateToPurchase}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        </div>
                    </div>
                ) : null}

                <CurriculumSidebar
                    mode="static"
                    courseId={data.courseId}
                    courseModules={data.modules}
                    expandedModules={expandedModules}
                    selectedLesson={selectedLesson}
                    progress={data.progress}
                    onToggleModule={(id) =>
                        setExpandedModules((prev) =>
                            prev.includes(id) ? [] : [id],
                        )
                    }
                    onSelectLesson={handleSelectLesson}
                    onNavigateToPurchase={onNavigateToPurchase}
                />
            </div>
        </div>
    );
}

export default CoursePage;
