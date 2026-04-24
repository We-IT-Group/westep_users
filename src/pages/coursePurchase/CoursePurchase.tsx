import { useNavigate, useParams } from "react-router-dom";
import { useGetCourseById, useSetStudentCourseByIdForPayment } from "../../api/courses/useCourse.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import { CoursePurchasePage } from "../../components/coursePurchase/CoursePurchasePage.tsx";
import type { 
    CoursePurchaseCourse, 
    CoursePurchaseModule, 
    PaymentProvider 
} from "../../components/coursePurchase/types.ts";
import { Header } from "../../layouts/headers/Header_new.tsx";
import { Loader2 } from "lucide-react";

export default function CoursePurchase() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const { data: user, isLoading: isUserLoading } = useUser();
    const { data: courseData, isLoading: isCourseLoading } = useGetCourseById(courseId);
    
    // Purchase mutation
    const { mutate: setStudentCourse } = useSetStudentCourseByIdForPayment();

    if (isCourseLoading || isUserLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
                <Header />
                <div className="flex flex-col h-[calc(100vh-80px)] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
                <Header />
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
        category: "Development", // Could be mapped if backend provides
        price: courseData.price
    };

    // Map Backend Modules to CoursePurchaseModule
    const mappedModules: CoursePurchaseModule[] = (courseData.modules || []).map((mod: any) => ({
        id: mod.moduleId,
        title: mod.moduleName,
        isPurchased: mod.isPurchased,
        lessons: (mod.lessons || []).map((lesson: any) => ({
            id: lesson.lessonId,
            title: lesson.lessonName,
            duration: lesson.duration ? `${lesson.duration} daqiqa` : "Videodars"
        }))
    }));

    // Payment providers
    const paymentProviders: PaymentProvider[] = [
        {
            id: "payme",
            name: "Payme",
            color: "from-[#00BAFF] to-[#0088CC]",
            logo: "https://cdn.payme.uz/logo/payme_color.svg"
        },
        {
            id: "click",
            name: "Click",
            color: "from-[#00A3FF] to-[#0077CC]",
            logo: "https://click.uz/static/img/logo.png"
        },
        {
            id: "uzum",
            name: "Uzum",
            color: "from-[#7000FF] to-[#5500CC]",
            logo: "https://uzum.uz/static/img/logo.png"
        }
    ];

    const handleSubmitPurchase = (payload: {
        courseId: string;
        selectedModules: string[];
        paymentMethod: string;
    }) => {
        if (!user?.id) return;
        
        // Ensure moduleList contains the IDs correctly mapped back
        setStudentCourse({
            studentId: user.id,
            courseId: payload.courseId,
            moduleList: payload.selectedModules
        });
    };

    return (
        <CoursePurchasePage
            courseId={courseId}
            course={mappedCourse}
            modules={mappedModules}
            paymentProviders={paymentProviders}
            withHeader={true}
            HeaderComponent={Header}
            onSubmit={handleSubmitPurchase}
            modulePrice={courseData.price || 598000} // Dynamic price if available
            bulkDiscount={0.2}
        />
    );
}
