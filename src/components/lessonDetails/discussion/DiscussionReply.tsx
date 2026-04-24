import { useState } from "react";
import moment from "moment";
import { MessageSquareReply, Edit3, GraduationCap } from "lucide-react";
import { DiscussionReplyDto } from "../../../api/discussion/useDiscussion";
import { DiscussionForm } from "./DiscussionForm";

interface DiscussionReplyProps {
    reply: DiscussionReplyDto;
    currentUserId?: string; // To check if owner
    onReply: (parentId: string) => void;
    onEdit: (commentId: string, content: string) => Promise<void>;
    replyToPreview?: {
        authorName: string;
        content: string;
    } | null;
}

export function DiscussionReply({ 
    reply, 
    currentUserId, 
    onReply, 
    onEdit,
    replyToPreview,
}: DiscussionReplyProps) {
    const isOwner = currentUserId && reply.author.id === currentUserId;
    const isTeacher = reply.author.role === "TEACHER";
    
    const [isEditing, setIsEditing] = useState(false);

    const handleEditSubmit = async (content: string) => {
        await onEdit(reply.id, content);
        setIsEditing(false);
    };

    const initials = reply.author.fullName.slice(0, 2).toUpperCase();

    return (
        <div className="flex gap-4 sm:gap-6 relative group/reply transition-all duration-300">
            {/* Minimalist thread line connector */}
            <div className="absolute -left-6 sm:-left-7 top-0 bottom-0 w-[1.5px] bg-slate-100 dark:bg-slate-800/60 rounded-full" />
            
            {/* Avatar Column */}
            <div className="flex flex-col items-center">
                <div className={`w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center font-black text-[10px] sm:text-[12px] shadow-sm tracking-tighter border ${
                    isTeacher 
                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 text-white" 
                        : "bg-white border-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                }`}>
                    {isTeacher ? <GraduationCap className="w-4 h-4" /> : initials}
                </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0 pb-2">
                {/* Header: Name + Time */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-1.5 px-1">
                    <span className={`font-black text-[13px] sm:text-[14px] tracking-tight ${
                        isTeacher ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                    }`}>
                        {reply.author.fullName}
                    </span>
                    {isTeacher && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-widest shadow-lg shadow-blue-500/20">
                            Ustoz
                        </span>
                    )}
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-60">
                        {moment(reply.createdAt).fromNow()}
                    </span>
                </div>

                {/* Content Area */}
                <div className="relative">
                    {isEditing ? (
                        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-2 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <DiscussionForm 
                                initialValue={reply.content}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all group-hover/reply:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] group-hover/reply:border-slate-200 dark:group-hover/reply:border-slate-700">
                            {replyToPreview ? (
                                <div className="mb-3 rounded-2xl border-l-4 border-blue-500 bg-blue-50/70 px-3 py-2 dark:bg-blue-950/20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                                        {replyToPreview.authorName}
                                    </p>
                                    <p className="line-clamp-2 text-[12px] font-semibold text-slate-500 dark:text-slate-300">
                                        {replyToPreview.content}
                                    </p>
                                </div>
                            ) : null}
                            <p className="font-bold text-[13px] sm:text-[14px] text-slate-600 dark:text-slate-300 leading-[1.6] whitespace-pre-wrap break-words">
                                {reply.content}
                            </p>
                        </div>
                    )}

                    {/* Quick Actions (Floating or bottom) */}
                    {!reply.deleted && !isEditing && (
                        <div className="flex items-center gap-2 mt-2 ml-2">
                            <button
                                onClick={() => onReply(reply.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
                            >
                                <MessageSquareReply className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Javob</span>
                            </button>
                            {isOwner && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all active:scale-95"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
