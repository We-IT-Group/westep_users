import { useMemo, useState } from "react";
import { CheckCircle2, Link2, Paperclip, Trash2 } from "lucide-react";
import { useToast } from "../../hooks/useToast.tsx";
import { useSubmitHomework } from "../../api/lesson-homework/useLessonHomework.ts";

type HomeworkSubmitFormProps = {
    taskId?: string | null;
    lessonId: string;
};

function HomeworkSubmitForm({
    taskId,
    lessonId,
}: HomeworkSubmitFormProps) {
    const toast = useToast();
    const [comment, setComment] = useState("");
    const [link, setLink] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [lastSubmissionMessage, setLastSubmissionMessage] = useState<string | null>(null);
    const submitMutation = useSubmitHomework(taskId, lessonId);

    const canSubmit = useMemo(() => {
        return Boolean(comment.trim() || link.trim() || files.length);
    }, [comment, link, files.length]);

    const onPickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
        event.target.value = "";
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    };

    const onSubmit = async () => {
        if (!canSubmit) {
            toast.warning(
                "Kamida bitta maydon to'ldiring",
                "Comment, link yoki file yuborilishi kerak.",
            );
            return;
        }

        try {
            const response = await submitMutation.mutateAsync({
                comment,
                link,
                file: files.length === 1 ? files[0] : undefined,
                files: files.length > 1 ? files : undefined,
            });

            setComment("");
            setLink("");
            setFiles([]);
            setLastSubmissionMessage(
                `${response.taskTitle} muvaffaqiyatli yuborildi.`,
            );
            toast.success("Uyga vazifa yuborildi");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Uyga vazifani yuborishda xatolik";
            toast.error("Uyga vazifani yuborishda xatolik", message);
        }
    };

    return (
        <div className="rounded-[28px] border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-900/30 dark:bg-slate-900 sm:p-7">
            <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="text-lg font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                    Homework submission
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Comment, havola yoki fayl orqali vazifani yuboring. Kamida bittasi majburiy.
                </p>
            </div>

            <div className="mt-5 space-y-5">
                {lastSubmissionMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/20">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <div>
                            <div className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                Muvaffaqiyatli yuborildi
                            </div>
                            <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-200">
                                {lastSubmissionMessage}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Comment
                    </label>
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Vazifa bo'yicha izoh yozing..."
                        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Link
                    </label>
                    <div className="relative">
                        <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="url"
                            value={link}
                            onChange={(event) => setLink(event.target.value)}
                            placeholder="https://..."
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        File upload
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm font-black text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-700">
                        <Paperclip className="h-4 w-4" />
                        Fayl tanlash
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={onPickFiles}
                        />
                    </label>
                    <p className="text-xs font-medium text-slate-400">
                        Maksimal 5 ta fayl tanlash mumkin.
                    </p>
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={`${file.name}-${file.size}-${index}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/70"
                                >
                                    <div className="min-w-0 truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {file.name}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-slate-400">
                        Submitdan keyin history avtomatik yangilanadi.
                    </p>
                    <button
                        type="button"
                        onClick={() => void onSubmit()}
                        disabled={submitMutation.isPending || !taskId}
                        className="h-12 rounded-2xl bg-indigo-600 px-6 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitMutation.isPending ? "Yuborilmoqda..." : "Submission yuborish"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomeworkSubmitForm;
