import { MessageSquare } from "lucide-react";
import { useUser } from "../../../api/auth/useAuth";
import {
    useGetDiscussions,
    useCreateDiscussion,
    useReplyDiscussion,
    useUpdateDiscussion
} from "../../../api/discussion/useDiscussion";
import { DiscussionForm } from "./DiscussionForm";
import { DiscussionThread } from "./DiscussionThread";

interface DiscussionSectionProps {
    lessonId: string;
}

export function DiscussionSection({ lessonId }: DiscussionSectionProps) {
    const { data: user } = useUser();
    const { data: response, isLoading, isError } = useGetDiscussions(lessonId);

    const { mutateAsync: createDiscussion } = useCreateDiscussion(lessonId);
    const { mutateAsync: replyDiscussion } = useReplyDiscussion(lessonId);
    const { mutateAsync: updateDiscussion } = useUpdateDiscussion(lessonId);

    const threads = response?.threads || [];
    const totalThreads = response?.totalThreads || 0;

    const handleCreateSubmit = async (content: string) => {
        await createDiscussion(content);
    };

    const handleReplySubmit = async (commentId: string, content: string) => {
        await replyDiscussion({ commentId, content });
    };

    const handleEditSubmit = async (commentId: string, content: string) => {
        await updateDiscussion({ commentId, content });
    };

    if (isError) {
        return (
            <div className="mt-8 p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    Siz bu dars muhokamasiga kira olmaysiz yoki xatolik yuz berdi.
                </span>
            </div>
        );
    }

    return (
        <section className="mt-16 mb-24 max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[20px] bg-blue-600 shadow-xl shadow-blue-500/20 flex items-center justify-center rotate-3 transition-transform hover:rotate-0">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                            Muloqot
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {totalThreads} ta fikr bildirilgan
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create new thread area - Integrated Design */}
            <div className="mb-16 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-[40px] blur-xl opacity-50 dark:opacity-20" />
                <div className="relative bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-white dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6 ml-1">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                            Fikringizni qoldiring
                        </h3>
                    </div>
                    <DiscussionForm 
                        onSubmit={handleCreateSubmit} 
                        placeholder="Dars haqida o'z savol yohud fikringizni yozib qoldiring..."
                    />
                </div>
            </div>

            {/* Loading state or Threads list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Xabarlar yuklanmoqda</span>
                </div>
            ) : threads.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/10 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/20">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-sm mx-auto flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Hozircha hech qanday fikr bildirilmagan</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {threads.map((thread) => (
                        <DiscussionThread
                            key={thread.id}
                            thread={thread}
                            currentUserId={user?.id}
                            onReply={handleReplySubmit}
                            onEdit={handleEditSubmit}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
