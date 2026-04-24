import React, { useState } from "react";
import { SendHorizontal, Loader2, Reply, X } from "lucide-react";

interface DiscussionFormProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    initialValue?: string;
    onCancel?: () => void;
    autoFocus?: boolean;
    replyPreview?: {
        authorName: string;
        content: string;
    } | null;
    onClearReply?: () => void;
}

export function DiscussionForm({ 
    onSubmit, 
    placeholder = "Izoh yozing...", 
    initialValue = "", 
    onCancel,
    autoFocus = false,
    replyPreview,
    onClearReply,
}: DiscussionFormProps) {
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
            setIsSubmitting(true);
            await onSubmit(trimmed);
            setContent(""); // Only clear on success
        } catch (error) {
            // Error managed by react query hook toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative group/form">
            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 shadow-sm group-hover/form:border-slate-300 dark:group-hover/form:border-slate-700">
                {replyPreview ? (
                    <div className="mx-4 mt-4 rounded-[18px] border border-blue-100 bg-white px-4 py-3 shadow-sm dark:border-blue-900/40 dark:bg-slate-800/70">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <Reply className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                                        {replyPreview.authorName} ga javob
                                    </span>
                                </div>
                                <p className="line-clamp-2 text-[12px] font-semibold text-slate-500 dark:text-slate-300">
                                    {replyPreview.content}
                                </p>
                            </div>
                            {onClearReply ? (
                                <button
                                    type="button"
                                    onClick={onClearReply}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 2000))}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={autoFocus}
                    className="w-full resize-none min-h-[100px] p-5 text-[14px] font-medium text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 scrollbar-hide"
                />
                
                <div className="flex items-center justify-between px-5 pb-4 bg-transparent">
                    <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${content.length > 1800 ? 'bg-amber-500' : 'bg-blue-500'} opacity-50`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">
                            {content.length} <span className="opacity-40">/</span> 2000
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                                Bekor qilish
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <SendHorizontal className="w-3.5 h-3.5" />
                            )}
                            <span>Yuborish</span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
