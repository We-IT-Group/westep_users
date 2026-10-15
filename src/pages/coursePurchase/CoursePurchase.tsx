import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetStudentCoursePurchaseDetail, useSetStudentCourseById } from "../../api/courses/useCourse.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import { CoursePurchasePage } from "../../components/coursePurchase/CoursePurchasePage.tsx";
import type {
    CoursePurchaseCourse,
    CoursePurchaseModule
} from "../../components/coursePurchase/types.ts";
import type { CourseDetailLesson, CourseDetailModule } from "../../types/types.ts";
import { Loader2 } from "lucide-react";

export default function CoursePurchase() {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const courseId = params.courseId || params.id || searchParams.get("courseId") || undefined;

    const { data: user, isLoading: isUserLoading } = useUser();
    const { data: courseData, isLoading: isCourseLoading } = useGetStudentCoursePurchaseDetail({ id: courseId });

    // Enroll mutation
    const { mutate: setStudentCourse, isPending: isEnrollPending } = useSetStudentCourseById();

    if (isCourseLoading || isUserLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
                <div className="flex flex-col h-[calc(100vh-80px)] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
                <div className="flex flex-col h-[calc(100vh-80px)] items-center justify-center text-center">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
                        Kurs topilmadi
                    </h2>
                    <p className="text-slate-500 mt-2">Bunday kurs mavjud emas yoki o'chirilgan.</p>
                    <button
                        onClick={() => navigate("/courses")}
                        className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold"
                    >
                        Kurslarga qaytish
                    </button>
                </div>
            </div>
        );
    }

    // Map Backend Course to CoursePurchaseCourse
    const mappedCourse: CoursePurchaseCourse = {
        id: courseData.id,
        title: courseData.name,
        category: [courseData.primaryCategory?.name, courseData.subcategory?.name].filter(Boolean).join(" / ") || courseData.languageName || "Kurs",
    };

    // Map Backend Modules to CoursePurchaseModule
    const mappedModules: CoursePurchaseModule[] = (courseData.modules || []).map((mod: CourseDetailModule) => ({
        id: mod.moduleId,
        title: mod.moduleName,
        requiresSubscription: mod.requiresSubscription,
        unlocked: mod.unlocked,
        lessons: (mod.lessons || []).map((lesson: CourseDetailLesson) => ({
            id: lesson.lessonId,
            title: lesson.lessonName,
            duration: lesson.duration ? `${lesson.duration} daqiqa` : "Videodars"
        }))
    }));

    const handleSubmitPurchase = (payload: { courseId: string }) => {
        if (!user?.id) return;

        setStudentCourse({
            studentId: user.id,
            courseId: payload.courseId,
        });
    };

    return (
        <CoursePurchasePage
            courseId={courseId}
            course={mappedCourse}
            modules={mappedModules}
            onSubmit={handleSubmitPurchase}
            isSubmitting={isEnrollPending}
        />
    );
}
