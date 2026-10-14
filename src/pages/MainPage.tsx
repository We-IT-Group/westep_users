import { useMemo } from "react";
import { baseUrlImage } from "../api/apiClient.ts";
import { useUser } from "../api/auth/useAuth.ts";
import { getCoursePurchaseUrl } from "../utils/coursePurchase.ts";
import {
    useGetCourses,
    useGetContinueLearning,
    useGetStudentCourseById,
} from "../api/courses/useCourse.ts";
import { useGetStudentCourseProgress } from "../api/studentProgressCourse/useStudentProgressCourse.ts";
import type { Course, Lesson, StudentCourse } from "../types/types.ts";
import AcademyHome, { type HomeIsland } from "../layouts/academy/AcademyHome.tsx";
import { isTeenAge } from "../layouts/academy/age.ts";

type ProgressLesson = Lesson & {
    active?: boolean;
};

type ContinueLearningCard = {
    id: string;
    courseId: string;
    moduleId?: string;
    lessonId?: string;
    title: string;
    currentLesson: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    image: string;
};

type ContinueLearningResponse = {
    id?: string;
    studentCourseId?: string;
    courseId?: string;
    courseName?: string;
    title?: string;
    nextModuleId?: string;
    nextModuleName?: string;
    nextLessonId?: string;
    nextLessonName?: string;
    moduleName?: string;
    lessonName?: string;
    currentLesson?: string;
    percent?: number;
    progress?: number;
    completedLessons?: number;
    totalLessons?: number;
    lessonsCount?: number;
    attachmentUrl?: string | null;
    image?: string | null;
};

function imageUrl(path?: string | null) {
    return path ? `${baseUrlImage}${path}` : "";
}

function getStudentCoursePercent(course?: StudentCourse | null) {
    if (!course) return 0;
    if (typeof course.progressPercentage === "number") return course.progressPercentage;
    return course.percent || 0;
}

export function Dashboard() {
    const { data: user } = useUser();
    const { data: studentCourses = [] } = useGetStudentCourseById(user?.id);
    const { data: allCourses = [] } = useGetCourses();
    const { data: continueLearningData } = useGetContinueLearning();

    const enrolledCourses = studentCourses as StudentCourse[];
    const activeStudentCourse = enrolledCourses[0];
    const { data: activeCourseProgress } = useGetStudentCourseProgress(activeStudentCourse?.id);

    const continueLearning = useMemo<ContinueLearningCard | null>(() => {
        const apiData = Array.isArray(continueLearningData)
            ? ((continueLearningData[0] as ContinueLearningResponse | undefined) ?? undefined)
            : (continueLearningData as ContinueLearningResponse | undefined);

        if (apiData) {
            const matchedStudentCourse = enrolledCourses.find(
                (item) => item.courseId === apiData.courseId,
            );
            const totalLessons =
                apiData.totalLessons ??
                apiData.lessonsCount ??
                matchedStudentCourse?.totalLessons ??
                0;
            const progress =
                getStudentCoursePercent(matchedStudentCourse) ||
                apiData.progress ||
                apiData.percent ||
                0;
            const completedLessons =
                apiData.completedLessons ??
                matchedStudentCourse?.completedLessons ??
                (totalLessons > 0 ? Math.round((totalLessons * progress) / 100) : 0);

            return {
                id: apiData.studentCourseId || apiData.id || matchedStudentCourse?.id || "",
                courseId: apiData.courseId || "",
                moduleId: apiData.nextModuleId || undefined,
                lessonId: apiData.nextLessonId || undefined,
                title: apiData.courseName || apiData.title || "Kursni davom ettirish",
                currentLesson:
                    apiData.nextLessonName ||
                    apiData.lessonName ||
                    apiData.currentLesson ||
                    "Darsni davom ettirishga tayyor",
                progress: Math.min(100, Math.max(0, Math.round(progress))),
                completedLessons,
                totalLessons,
                image: imageUrl(apiData.attachmentUrl || apiData.image || matchedStudentCourse?.attachmentUrl || ""),
            };
        }

        if (!activeStudentCourse) return null;

        const lessons = (activeCourseProgress?.lessons || []) as ProgressLesson[];
        const currentLesson = lessons.find((lesson) => lesson.active) || lessons[0];
        const progress = getStudentCoursePercent(activeStudentCourse);

        return {
            id: activeStudentCourse.id,
            courseId: activeStudentCourse.courseId,
            title: activeStudentCourse.courseName,
            currentLesson: currentLesson?.name || "Darsni davom ettirishga tayyor",
            progress: Math.min(100, Math.max(0, Math.round(progress))),
            completedLessons: activeCourseProgress?.completedLessons ?? 0,
            totalLessons: activeCourseProgress?.totalLessons ?? lessons.length,
            image: imageUrl(activeStudentCourse.attachmentUrl),
        };
    }, [activeCourseProgress, activeStudentCourse, continueLearningData, enrolledCourses]);

    const continueLearningHref = useMemo(() => {
        if (!continueLearning) return "/courses";
        if (continueLearning.moduleId && continueLearning.lessonId) {
            return `/courses/${continueLearning.courseId}/${continueLearning.id}/${continueLearning.moduleId}/${continueLearning.lessonId}/questions`;
        }
        return `/courses/${continueLearning.courseId}/${continueLearning.id}`;
    }, [continueLearning]);

    const islands = useMemo<HomeIsland[]>(() => {
        const enrolled = enrolledCourses.slice(0, 4).map((course) => ({
            id: course.id,
            title: course.courseName,
            subtitle: `${Math.round(getStudentCoursePercent(course))}% · ochiq`,
            href: `/courses/${course.courseId}/${course.id}`,
        }));

        if (enrolled.length >= 4) return enrolled;

        const enrolledIds = new Set(enrolledCourses.map((course) => course.courseId));
        const extra = (allCourses as Course[])
            .filter((course) => !enrolledIds.has(course.id))
            .slice(0, 4 - enrolled.length)
            .map((course) => ({
                id: course.id,
                title: course.name,
                subtitle: course.purchased ? "ochiq" : "yozilish",
                href: getCoursePurchaseUrl(course),
            }));

        return [...enrolled, ...extra];
    }, [allCourses, enrolledCourses]);

    const pathNodes = Math.min(8, continueLearning?.totalLessons || 0);
    const pathCurrent =
        continueLearning && continueLearning.totalLessons > 0
            ? Math.min(
                  Math.max(pathNodes - 1, 0),
                  Math.floor((continueLearning.completedLessons / continueLearning.totalLessons) * pathNodes),
              )
            : 0;

    return (
        <AcademyHome
            teen={isTeenAge(user?.birthDate)}
            continueLearning={
                continueLearning
                    ? {
                          title: continueLearning.title,
                          lessonTitle: continueLearning.currentLesson,
                          href: continueLearningHref,
                          progress: continueLearning.progress,
                          image: continueLearning.image,
                      }
                    : null
            }
            islands={islands}
            pathTitle={continueLearning ? `${continueLearning.title} yo‘li` : undefined}
            pathTotal={pathNodes}
            pathCurrent={pathCurrent}
        />
    );
}

export default Dashboard;
