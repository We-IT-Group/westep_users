import { useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ClipboardList,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    MessageSquareText,
    RefreshCcw,
} from "lucide-react";
import { getFileById } from "../../api/file/filesApi.ts";
import type { LessonHomeworkSubmissionResponse } from "../../api/lesson-homework/lessonHomeworkApi.ts";

type HomeworkSubmissionHistoryProps = {
    submissions?: LessonHomeworkSubmissionResponse[];
    isLoading?: boolean;
    errorMessage?: string | null;
    emptyTitle?: string;
    emptyDescription?: string;
    showLessonName?: boolean;
};

function formatDateTime(value?: string | null) {
    if (!value) return "Mavjud emas";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortUrl(value?: string | null) {
    if (!value) return "";

    try {
        const url = new URL(value);
        const path = url.pathname === "/" ? "" : url.pathname;
        const shortPath = path.length > 20 ? `${path.slice(0, 20)}...` : path;
        return `${url.hostname}${shortPath}`;
    } catch {
        return value.length > 28 ? `${value.slice(0, 28)}...` : value;
    }
}

function getSubmissionStatus(submission: LessonHomeworkSubmissionResponse) {
    if (submission.reviewedAt) {
        return {
            label: "Baholangan",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300",
            icon: <CheckCircle2 className="h-4 w-4" />,
        };
    }

    return {
        label: "Kutilmoqda",
        className:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
    };
}

export function HomeworkSubmissionHistory({
    submissions = [],
    isLoading = false,
    errorMessage,
    emptyTitle = "Topshiriqlar hali yuborilmagan",
    emptyDescription = "Comment, link yoki file bilan birinchi submissionni yuboring.",
    showLessonName = true,
}: HomeworkSubmissionHistoryProps) {
    const [busyAttachmentId, setBusyAttachmentId] = useState<string | null>(null);

    const openAttachment = async (attachmentId: string) => {
        setBusyAttachmentId(attachmentId);
        try {
            const blob = await getFileById(attachmentId);
            const blobUrl = window.URL.createObjectURL(blob);
            window.open(blobUrl, "_blank", "noopener,noreferrer");
            window.setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 60_000);
        } finally {
            setBusyAttachmentId(null);
        }
    };

    const downloadAttachment = async (attachmentId: string) => {
        setBusyAttachmentId(attachmentId);
        try {
            const blob = await getFileById(attachmentId);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `homework-${attachmentId}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } finally {
            setBusyAttachmentId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Yuklanmoqda...
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div>
                        <div className="text-sm font-black uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
                            Xatolik yuz berdi
                        </div>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-red-600 dark:text-red-200">
                            {errorMessage}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!submissions.length) {
        return (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800">
                    <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                </div>
                <h3 className="mt-5 text-lg font-black uppercase italic text-slate-900 dark:text-white">
                    {emptyTitle}
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {submissions.map((submission) => {
                const status = getSubmissionStatus(submission);
                const hasFeedback = Boolean(submission.feedback?.trim());
                const isRevisionRequested = Boolean(submission.revisionRequested);

                return (
                    <div
                        key={submission.submissionId}
                        className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] sm:p-7"
                    >
                        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-2">
                                {showLessonName && (
                                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        {submission.lessonName}
                                    </div>
                                )}
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                                    {submission.taskTitle}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <div className="rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        Yuborilgan: {formatDateTime(submission.submittedAt)}
                                    </div>
                                    {submission.reviewedAt && (
                                        <div className="rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                            Ko'rib chiqilgan: {formatDateTime(submission.reviewedAt)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div
                                className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] ${status.className}`}
                            >
                                {status.icon}
                                {status.label}
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_1fr]">
                            <div className="space-y-4">
                                <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                                    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Comment
                                    </div>
                                    <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                                        {submission.comment?.trim() || "Izoh qoldirilmagan"}
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                                    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Link
                                    </div>
                                    {submission.externalUrl ? (
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    window.open(
                                                        submission.externalUrl!,
                                                        "_blank",
                                                        "noopener,noreferrer",
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 transition-all hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300"
                                            >
                                                <ExternalLink className="h-4 w-4 shrink-0" />
                                                Havolani ochish
                                            </button>
                                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                                {formatShortUrl(submission.externalUrl)}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Havola biriktirilmagan
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                                    <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Attachments
                                    </div>
                                    {submission.attachmentIds.length ? (
                                        <div className="space-y-2">
                                            {submission.attachmentIds.map((attachmentId, index) => (
                                                <div
                                                    key={attachmentId}
                                                    className="flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                                            <FileText className="h-4 w-4 text-slate-500" />
                                                        </div>
                                                        <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                                                            Biriktirma #{index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => void openAttachment(attachmentId)}
                                                            disabled={busyAttachmentId === attachmentId}
                                                            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Ochish
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void downloadAttachment(attachmentId)}
                                                            disabled={busyAttachmentId === attachmentId}
                                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Yuklash
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Fayl biriktirilmagan
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                                        <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                            Score
                                        </div>
                                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                            {submission.score ?? "-"}
                                        </div>
                                    </div>

                                    <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                                        <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                            Revision
                                        </div>
                                        <div className="inline-flex items-center gap-2 text-base font-bold text-slate-700 dark:text-slate-200">
                                            <RefreshCcw className="h-4 w-4 text-slate-400" />
                                            {isRevisionRequested
                                                ? "Qayta topshirish so'ralgan"
                                                : hasFeedback
                                                  ? "Feedback mavjud"
                                                  : "Hozircha yo'q"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-[26px] border border-white/80 bg-white/75 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                <MessageSquareText className="h-4 w-4" />
                                O'qituvchi feedbacki
                            </div>
                            <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                                {hasFeedback
                                    ? submission.feedback
                                    : submission.reviewedAt
                                      ? "Feedback qoldirilmagan"
                                      : "Tekshiruv yakunlangach feedback shu yerda ko'rinadi"}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default HomeworkSubmissionHistory;
