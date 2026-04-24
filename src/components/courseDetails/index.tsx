import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useGetContinueLearning, useGetCourseById } from "../../api/courses/useCourse.ts";
import { useGetLessonById } from "../../api/lesson/useLesson.ts";
import { useGetStudentCourseModulesById } from "../../api/module/useModule.ts";
import {
    useGetLessonsProgressList,
    useStartLessonProgress,
} from "../../api/lessonProgress/useLessonProgress.ts";
import CoursePage from "../coursePlayer/CoursePage.tsx";
import LessonVedio from "../lessonDetails/LessonVedio.tsx";
import { useGetLessonTasks } from "../../api/lesson-tasks/useLessonTasks.ts";
import { useGetRatingSummary } from "../../api/review/useReview.ts";
import type {
    Course,
    CourseDetailModule,
    Lesson,
    Module,
} from "../../types/types.ts";
import type {
    CoursePlayerData,
    CoursePlayerDiscussion,
    CoursePlayerReview,
} from "../coursePlayer/types.ts";

const defaultDiscussions: CoursePlayerDiscussion[] = [
    {
        id: "discussion-placeholder-1",
        user: "Westep Team",
        userAvatar: "WT",
        question: "Savol-javob bo'limi tez orada backend bilan ulanadi. Hozircha darsni bemalol ko'rishingiz mumkin.",
        timestamp: "Hozir",
        replies: [],
    },
];

const defaultReviews: CoursePlayerReview[] = [
    {
        id: "review-placeholder-1",
        user: "Westep",
        userAvatar: "W",
        rating: 5,
        comment: "Dars ko'rish sahifasi yangi dizaynga moslashtirildi.",
        timestamp: "Bugun",
    },
];

function formatLessonDuration(totalSeconds?: number) {
    if (!totalSeconds) return "0:00";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function extractFirstUrl(value?: string | null) {
    if (!value) return undefined;
    const match = value.match(/https?:\/\/[^\s]+/i);
    return match?.[0];
}

function normalizeTaskType(value?: string | null) {
    return (value || "").trim().toUpperCase();
}

function inferMaterialType(task: {
    type?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    resourceUrl?: string | null;
    attachmentUrl?: string | null;
}) {
    const normalizedType = normalizeTaskType(task.type);

    if (normalizedType === "QUIZ" || normalizedType === "TEST") return "quiz" as const;
    if (normalizedType === "HOMEWORK" || normalizedType === "ASSIGNMENT") return "homework" as const;

    const source = `${task.fileName || ""} ${task.mimeType || ""} ${task.resourceUrl || ""} ${task.attachmentUrl || ""}`.toLowerCase();

    if (source.includes(".zip") || source.includes("zip") || source.includes("rar")) {
        return "zip" as const;
    }
    if (source.includes(".doc") || source.includes("word") || source.includes("document")) {
        return "doc" as const;
    }
    if (source.includes(".mp4") || source.includes("video") || source.includes("youtube")) {
        return "video" as const;
    }

    return "pdf" as const;
}

function getTaskResource(task: {
    attachmentId?: string | null;
    attachmentUrl?: string | null;
    url?: string | null;
    link?: string | null;
    resourceUrl?: string | null;
    externalUrl?: string | null;
    description?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    attachment?: {
        id?: string | null;
        attachmentId?: string | null;
        url?: string | null;
        attachmentUrl?: string | null;
        fileName?: string | null;
        originalName?: string | null;
        name?: string | null;
        mimeType?: string | null;
        contentType?: string | null;
    } | null;
    attachments?: Array<{
        attachmentId?: string | null;
        attachmentUrl?: string | null;
        fileName?: string | null;
        mimeType?: string | null;
    }> | null;
    links?: Array<{
        title?: string | null;
        url?: string | null;
        link?: string | null;
        resourceUrl?: string | null;
    }> | null;
}) {
    const firstAttachment = task.attachments?.[0];
    const firstLink = task.links?.[0];

    return {
        attachmentId:
            task.attachmentId ||
            firstAttachment?.attachmentId ||
            task.attachment?.attachmentId ||
            task.attachment?.id ||
            undefined,
        attachmentUrl:
            task.attachmentUrl ||
            firstAttachment?.attachmentUrl ||
            task.attachment?.attachmentUrl ||
            task.attachment?.url ||
            undefined,
        resourceUrl:
            task.resourceUrl ||
            task.url ||
            task.link ||
            task.externalUrl ||
            firstLink?.resourceUrl ||
            firstLink?.url ||
            firstLink?.link ||
            extractFirstUrl(task.description),
        fileName:
            task.fileName ||
            firstAttachment?.fileName ||
            task.attachment?.fileName ||
            task.attachment?.originalName ||
            task.attachment?.name ||
            undefined,
        mimeType:
            task.mimeType ||
            firstAttachment?.mimeType ||
            task.attachment?.mimeType ||
            task.attachment?.contentType ||
            undefined,
    };
}

function Index() {
    const navigate = useNavigate();
    const params = useParams();
    const splatSegments = (params["*"] || "").split("/").filter(Boolean);
    const currentModuleId = splatSegments[0];
    const currentLessonId = splatSegments[1];

    const { data: course, isPending: isCoursePending } = useGetCourseById(params.courseId) as {
        data: Course | undefined;
        isPending: boolean;
    };
    const { data: continueLearningData } = useGetContinueLearning();
    const { data: studentModules = [], isPending: isModulesPending } =
        useGetStudentCourseModulesById(params.id);
    const { data: lessonProgressList = [], isPending: isProgressPending } =
        useGetLessonsProgressList(params.id);
    const { data: lessonDetail } = useGetLessonById(currentLessonId || null) as {
        data:
            | (Lesson & {
                  vedioUrl?: string;
              })
            | undefined;
    };
    const { data: lessonRatingSummary } = useGetRatingSummary(currentLessonId || "");
    const { mutateAsync: startLessonProgress } = useStartLessonProgress();
    const { data: lessonTasks = [] } = useGetLessonTasks(currentLessonId);
    const [startedLessonProgress, setStartedLessonProgress] = useState<{ currentSecond?: number; completed?: boolean } | null>(null);
    const currentLessonCompleted = Boolean(startedLessonProgress?.completed);

    const modules = useMemo(() => course?.modules ?? [], [course?.modules]);
    const unlockedModuleIds = useMemo(
        () => new Set((studentModules as Module[]).map((module) => module.id)),
        [studentModules],
    );

    const continueLearningTarget = useMemo(() => {
        const entries = Array.isArray(continueLearningData)
            ? continueLearningData
            : continueLearningData
              ? [continueLearningData]
              : [];

        const matchedEntry = entries.find(
            (item: {
                studentCourseId?: string | null;
                courseId?: string | null;
                nextModuleId?: string | null;
                nextLessonId?: string | null;
            }) =>
                item?.nextLessonId &&
                item?.nextModuleId &&
                ((params.id && item.studentCourseId === params.id) ||
                    (params.courseId && item.courseId === params.courseId)),
        );

        if (!matchedEntry?.nextLessonId || !matchedEntry?.nextModuleId) {
            return null;
        }

        return {
            moduleId: matchedEntry.nextModuleId,
            lessonId: matchedEntry.nextLessonId,
        };
    }, [continueLearningData, params.courseId, params.id]);

    const redirectTarget = useMemo(() => {
        if (continueLearningTarget?.moduleId && continueLearningTarget?.lessonId) {
            return continueLearningTarget;
        }

        const progressedLessonId = Array.isArray(lessonProgressList)
            ? lessonProgressList[0]?.lessonId
            : null;

        if (progressedLessonId) {
            const progressedModule = modules.find((module) =>
                module.lessons.some((lesson) => lesson.lessonId === progressedLessonId),
            );

            if (progressedModule) {
                return {
                    moduleId: progressedModule.moduleId,
                    lessonId: progressedLessonId,
                };
            }
        }

        const candidateModule =
            modules.find((module) => unlockedModuleIds.has(module.moduleId) && module.lessons.length) ||
            modules.find((module) => module.lessons.length);

        if (!candidateModule) return null;

        return {
            moduleId: candidateModule.moduleId,
            lessonId: candidateModule.lessons[0]?.lessonId,
        };
    }, [continueLearningTarget, lessonProgressList, modules, unlockedModuleIds]);

    const playerData = useMemo<CoursePlayerData | null>(() => {
        if (!course) return null;

        const totalLessons = modules.reduce(
            (acc, module) => acc + module.lessons.length,
            0,
        );
        const completedLessons = Array.isArray(lessonProgressList)
            ? lessonProgressList.filter(
                  (item: { completed?: boolean }) => item.completed === true,
              ).length
            : 0;
        const progress = totalLessons
            ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
            : 0;

        return {
            courseId: params.courseId || "",
            title: course.name,
            progress,
            poster: course.attachmentUrl || undefined,
            initialLessonId: currentLessonId || redirectTarget?.lessonId,
            modules: modules.map((module: CourseDetailModule) => ({
                id: module.moduleId,
                title: module.moduleName,
                isPurchased: unlockedModuleIds.has(module.moduleId),
                lessons: module.lessons.map((lesson) => ({
                    id: lesson.lessonId,
                    title:
                        lesson.lessonId === currentLessonId && lessonDetail?.name
                            ? lessonDetail.name
                            : lesson.lessonName,
                    duration: formatLessonDuration(lesson.duration),
                    rating:
                        lesson.lessonId === currentLessonId
                            ? lessonRatingSummary?.averageRating || 0
                            : undefined,
                    completed: Array.isArray(lessonProgressList)
                        ? lesson.lessonId === currentLessonId
                            ? currentLessonCompleted
                            : lessonProgressList.some(
                                  (item: { lessonId: string; completed?: boolean }) =>
                                      item.lessonId === lesson.lessonId &&
                                      item.completed === true,
                              )
                        : false,
                    type: "video" as const,
                    videoUrl:
                        lesson.lessonId === currentLessonId ? lessonDetail?.vedioUrl || "" : "",
                    description:
                        lesson.lessonId === currentLessonId
                            ? lessonDetail?.description
                            : undefined,
                })),
            })),
            materials: lessonTasks.flatMap(task => {
                const normalizedType = normalizeTaskType(task.type);
                const taskResource = getTaskResource(task);
                const linkMaterials = [
                    ...(taskResource.resourceUrl
                        ? [{
                            id: `${task.id}-link`,
                            taskId: task.id,
                            title: task.title,
                            type: inferMaterialType({
                                type: task.type,
                                fileName: undefined,
                                mimeType: undefined,
                                resourceUrl: taskResource.resourceUrl,
                                attachmentUrl: undefined,
                            }),
                            size:
                                normalizedType === "QUIZ" || normalizedType === "TEST"
                                    ? "Test"
                                    : normalizedType === "HOMEWORK" || normalizedType === "ASSIGNMENT"
                                      ? "Havola"
                                      : "Havola",
                            uploadedAt: task.deadline ? `Muddati: ${new Date(task.deadline).toLocaleDateString()}` : "Dars materiali",
                            questionCount: task.questionCount || undefined,
                            durationMinutes: task.durationMinutes || undefined,
                            description: task.description || undefined,
                            attachmentId: undefined,
                            attachmentUrl: undefined,
                            resourceUrl: taskResource.resourceUrl,
                            fileName: undefined,
                            mimeType: undefined,
                        }]
                        : []),
                    ...((task.links || []).flatMap((item, index) => {
                        const url = item.resourceUrl || item.url || item.link;
                        if (!url) return [];
                        return [{
                            id: `${task.id}-external-${index}`,
                            taskId: task.id,
                            title: item.title || task.title,
                            type: inferMaterialType({
                                type: task.type,
                                fileName: undefined,
                                mimeType: undefined,
                                resourceUrl: url,
                                attachmentUrl: undefined,
                            }),
                            size: "Havola",
                            uploadedAt: task.deadline ? `Muddati: ${new Date(task.deadline).toLocaleDateString()}` : "Dars materiali",
                            questionCount: task.questionCount || undefined,
                            durationMinutes: task.durationMinutes || undefined,
                            description: task.description || undefined,
                            attachmentId: undefined,
                            attachmentUrl: undefined,
                            resourceUrl: url,
                            fileName: undefined,
                            mimeType: undefined,
                        }];
                    })),
                ];

                if (task.attachments?.length) {
                    const attachmentMaterials = task.attachments.map((attachment, index) => {
                        const resource = {
                            attachmentId: attachment.attachmentId || undefined,
                            attachmentUrl: attachment.attachmentUrl || undefined,
                            resourceUrl: undefined,
                            fileName: attachment.fileName || undefined,
                            mimeType: attachment.mimeType || undefined,
                        };

                        const materialType = inferMaterialType({
                            type: task.type,
                            fileName: resource.fileName,
                            mimeType: resource.mimeType,
                            resourceUrl: resource.resourceUrl,
                            attachmentUrl: resource.attachmentUrl,
                        });

                        return {
                            id: `${task.id}-${attachment.attachmentId || index}`,
                            taskId: task.id,
                            title: attachment.fileName || task.title,
                            type: materialType,
                            size:
                                normalizedType === "QUIZ" || normalizedType === "TEST"
                                    ? "Test"
                                    : normalizedType === "HOMEWORK" || normalizedType === "ASSIGNMENT"
                                      ? "Vazifa"
                                      : attachment.fileName || attachment.mimeType || "Fayl",
                            uploadedAt: task.deadline ? `Muddati: ${new Date(task.deadline).toLocaleDateString()}` : "Dars materiali",
                            questionCount: task.questionCount || undefined,
                            durationMinutes: task.durationMinutes || undefined,
                            description: task.description || undefined,
                            attachmentId: resource.attachmentId,
                            attachmentUrl: resource.attachmentUrl,
                            resourceUrl: resource.resourceUrl,
                            fileName: resource.fileName,
                            mimeType: resource.mimeType,
                        };
                    });

                    return [...linkMaterials, ...attachmentMaterials];
                }

                const resource = taskResource;
                const materialType = inferMaterialType({
                    type: task.type,
                    fileName: resource.fileName,
                    mimeType: resource.mimeType,
                    resourceUrl: resource.resourceUrl,
                    attachmentUrl: resource.attachmentUrl || task.attachment?.attachmentUrl || task.attachment?.url,
                });

                return [...linkMaterials, {
                    id: task.id,
                    taskId: task.id,
                    title: task.title,
                    type: materialType,
                    size:
                        normalizedType === "QUIZ" || normalizedType === "TEST"
                            ? "Test"
                            : normalizedType === "HOMEWORK" || normalizedType === "ASSIGNMENT"
                              ? "Vazifa"
                              : resource.fileName ||
                                resource.mimeType ||
                                (resource.resourceUrl ? "Havola" : "Fayl"),
                    uploadedAt: task.deadline ? `Muddati: ${new Date(task.deadline).toLocaleDateString()}` : "Dars materiali",
                    questionCount: task.questionCount || undefined,
                    durationMinutes: task.durationMinutes || undefined,
                    description: task.description || undefined,
                    attachmentId: resource.attachmentId,
                    attachmentUrl: resource.attachmentUrl,
                    resourceUrl: resource.resourceUrl,
                    fileName: resource.fileName,
                    mimeType: resource.mimeType,
                }];
            }),
            discussions: defaultDiscussions,
            reviews: defaultReviews,
        };
    }, [
        course,
        currentLessonId,
        lessonDetail,
        lessonProgressList,
        lessonRatingSummary?.averageRating,
        currentLessonCompleted,
        modules,
        params.courseId,
        redirectTarget?.lessonId,
        unlockedModuleIds,
        lessonTasks
    ]);

    useEffect(() => {
        if (!params.id || !currentLessonId) return;

        let isMounted = true;

        setStartedLessonProgress(null);

        startLessonProgress({
            studentCourseId: params.id,
            lessonId: currentLessonId,
        }).then((data) => {
            if (!isMounted) return;
            setStartedLessonProgress(data || null);
        }).catch(() => {
            if (!isMounted) return;
            setStartedLessonProgress(null);
        });

        return () => {
            isMounted = false;
        };
    }, [currentLessonId, params.id, startLessonProgress]);

    if (isCoursePending || isModulesPending || isProgressPending) {
        return (
            <div className="flex min-h-[calc(100dvh-76px)] items-center justify-center">
                <div className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    Yuklanmoqda...
                </div>
            </div>
        );
    }

    if (!playerData || !modules.length || !redirectTarget?.lessonId) {
        return (
            <div className="flex min-h-[calc(100dvh-76px)] items-center justify-center">
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    Darslar topilmadi.
                </div>
            </div>
        );
    }

    if (!currentModuleId || !currentLessonId) {
        return (
            <Navigate
                to={`${redirectTarget.moduleId}/${redirectTarget.lessonId}/questions`}
                replace
            />
        );
    }

    return (
        <CoursePage
            data={playerData}
            onLessonChange={(lesson) => {
                const module = playerData.modules.find((item) =>
                    item.lessons.some((itemLesson) => itemLesson.id === lesson.id),
                );

                if (!module) return;

                navigate(
                    `/courses/${params.courseId}/${params.id}/${module.id}/${lesson.id}/questions`,
                );
            }}
            onQuizOpen={(quizId, meta) =>
                navigate(`/test/${quizId}`, {
                    state: {
                        questionCount: meta?.questionCount,
                        durationMinutes: meta?.durationMinutes,
                        modules: playerData.modules,
                        selectedLessonId: currentLessonId,
                        selectedModuleId: currentModuleId,
                        courseTitle: playerData.title,
                    },
                })
            }
            onNavigateToPurchase={(courseId) => navigate(`/roadmap/${courseId}`)}
            renderVideoPlayer={({ lessonId }) => (
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl sm:rounded-[36px]">
                    <LessonVedio
                        key={lessonId}
                        startTime={startedLessonProgress?.currentSecond ?? 0}
                        onProgressChange={(progress) => setStartedLessonProgress(progress || null)}
                        videoUrl={lessonDetail?.vedioUrl || ""}
                        setEnded={() => {}}
                    />
                </div>
            )}
        />
    );
}

export default Index;
