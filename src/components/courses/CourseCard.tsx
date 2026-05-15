import Image from "../../ui/Image"
import {Course} from "../../types/types.ts";
import Spinner from "../../ui/Spinner.tsx";
import {useUser} from "../../api/auth/useAuth.ts";
import {useSetStudentCourseById} from "../../api/courses/useCourse.ts";
import {Link} from "react-router-dom";
import { getCoursePurchaseUrl } from "../../utils/coursePurchase.ts";

interface CourseCard {
    course: Course;
}

function CourseCard({course}: CourseCard) {

    const {data: user} = useUser()
    const {mutate, isPending} = useSetStudentCourseById()


    function handleCourse(id: string) {
        mutate({
            studentId: user.id,
            courseId: id,
            moduleList:[],
        })
    }

    return (
        <>
            <div className={'border border-blue-200 rounded-3xl overflow-hidden h-full flex flex-col'}>
                <div className="w-full h-[180px]">
                    <Image imageUrl={course.attachmentUrl}/>
                </div>
                <div className={'p-4 flex flex-col justify-between flex-1'}>
                    <div>
                        <h3 className={'text-md font-medium break-all'}>{course?.name}</h3>
                        <div className={'flex items-center gap-3 mt-2 justify-start flex-wrap'}>
                            <p className={'text-xs font-light break-all'}>{course?.description}</p>
                        </div>
                    </div>
                    {
                        course.price > 0 ?
                            <Link to={getCoursePurchaseUrl(course)}>
                                <button
                                    className={'w-full h-[40px] mt-3 bg-blue-50 text-blue-400 border border-blue-400 rounded-full p-1 text-center'}>
                                    Sotib Olish
                                </button>
                            </Link>
                            :
                            <button
                                onClick={() => handleCourse(course.id)}
                                className={'w-full h-[40px] mt-3 bg-blue-50 text-blue-400 border border-blue-400 rounded-full p-1 text-center'}>
                                {isPending && <Spinner/>}
                                Boshlash
                            </button>
                    }


                </div>
            </div>
        </>
    );
}

export default CourseCard;
