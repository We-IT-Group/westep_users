import { useState } from "react";
import moment from "moment";
import { MessageSquareReply, Edit3, GraduationCap } from "lucide-react";
import { DiscussionCommentDto } from "../../../api/discussion/useDiscussion";
import { DiscussionForm } from "./DiscussionForm";
import { DiscussionReply } from "./DiscussionReply";

interface DiscussionThreadProps {
    thread: DiscussionCommentDto;
    currentUserId?: string;
    onReply: (commentId: string, content: string) => Promise<void>;
    onEdit: (commentId: string, content: string) => Promise<void>;
}

export function DiscussionThread({
    thread,
    currentUserId,
    onReply,
    onEdit
}: DiscussionThreadProps) {
    const isOwner = currentUserId && thread.author.id === currentUserId;
    const isTeacher = thread.author.role === "TEACHER";

    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyTarget, setReplyTarget] = useState<{
        id: string;
        authorName: string;
        content: string;
    } | null>(null);

    const handleEditSubmit = async (content: string) => {
        await onEdit(thread.id, content);
        setIsEditing(false);
    };

    const handleReplySubmit = async (content: string) => {
        await onReply(replyTarget?.id || thread.id, content);
        setIsReplying(false);
        setReplyTarget(null);
    };

    const initials = thread.author.fullName.slice(0, 2).toUpperCase();

    return (
        <div className="flex flex-col group/thread transition-all duration-300">
            {/* Root Thread Item */}
            <div className="flex gap-4 sm:gap-6">
                {/* Avatar Column */}
                <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center font-black text-xs sm:text-[15px] shadow-md tracking-tighter border transition-transform group-hover/thread:scale-105 ${
                        isTeacher 
                            ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white" 
                            : "bg-white border-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    }`}>
                        {isTeacher ? <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" /> : initials}
                    </div>
                    {/* Visual thread line if replies or replying */}
                    {(thread.replies?.length > 0 || isReplying) && (
                        <div className="w-[1.5px] flex-1 bg-slate-100 dark:bg-slate-800/60 my-2 rounded-full" />
                    )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 pb-4">
                    {/* Header: Name + Time */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-2 px-1">
                        <span className={`font-black text-[15px] sm:text-[16px] tracking-tight ${
                            isTeacher ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                        }`}>
                            {thread.author.fullName}
                        </span>
                        {isTeacher && (
                            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-widest shadow-lg shadow-blue-500/20">
                                Ustoz
                            </span>
                        )}
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-60">
                            {moment(thread.createdAt).fromNow()}
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="relative">
                        {isEditing ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-2 border border-slate-200 dark:border-slate-800 shadow-xl">
                                <DiscussionForm 
                                    initialValue={thread.content}
                                    onSubmit={handleEditSubmit}
                                    onCancel={() => setIsEditing(false)}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.03)] transition-all group-hover/thread:shadow-[0_10px_40px_-4px_rgba(0,0,0,0.06)] group-hover/thread:border-slate-200 dark:group-hover/thread:border-slate-700">
                                <p className="font-bold text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-300 leading-[1.6] whitespace-pre-wrap break-words">
                                    {thread.content}
                                </p>
                            </div>
                        )}

                        {/* Actions under bubble */}
                        {!isEditing && (
                            <div className="flex items-center gap-3 mt-2.5 ml-3">
                                <button
                                    onClick={() => {
                                        setReplyTarget({
                                            id: thread.id,
                                            authorName: thread.author.fullName,
                                            content: thread.content,
                                        });
                                        setIsReplying((prev) => !prev);
                                    }}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all active:scale-95 ${
                                        isReplying 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                    }`}
                                >
                                    <MessageSquareReply className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Javob</span>
                                </button>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all active:scale-95"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies & Reply Form Container - Optimized Indentation for Mobile */}
            <div className="ml-5 pl-5 sm:ml-7 sm:pl-7 border-l-0 flex flex-col gap-5 mt-1 border-transparent">
                {/* Reply Form */}
                {isReplying && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 mb-2">
                        <DiscussionForm 
                            placeholder={`${replyTarget?.authorName || thread.author.fullName} ga javob yozish...`}
                            onSubmit={handleReplySubmit}
                            onCancel={() => {
                                setIsReplying(false);
                                setReplyTarget(null);
                            }}
                            replyPreview={
                                replyTarget
                                    ? {
                                          authorName: replyTarget.authorName,
                                          content: replyTarget.content,
                                      }
                                    : null
                            }
                            onClearReply={() => {
                                setReplyTarget(null);
                                setIsReplying(false);
                            }}
                            autoFocus
                        />
                    </div>
                )}

                {/* Replies Iterable */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    {thread.replies && thread.replies.length > 0 && thread.replies.map((reply) => {
                        const parentReply = thread.replies.find((item) => item.id === reply.parentId);
                        const replyToPreview =
                            reply.parentId === thread.id
                                ? {
                                      authorName: thread.author.fullName,
                                      content: thread.content,
                                  }
                                : parentReply
                                  ? {
                                        authorName: parentReply.author.fullName,
                                        content: parentReply.content,
                                    }
                                  : null;

                        return (
                            <DiscussionReply
                                key={reply.id}
                                reply={reply}
                                currentUserId={currentUserId}
                                onReply={() => {
                                    setReplyTarget({
                                        id: reply.id,
                                        authorName: reply.author.fullName,
                                        content: reply.content,
                                    });
                                    setIsReplying(true);
                                }}
                                onEdit={onEdit}
                                replyToPreview={replyToPreview}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
