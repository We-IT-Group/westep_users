import LessonVedio from "./LessonVedio.tsx";
import LessonRating from "./LessonRating.tsx";
import LessonActionsBottom from "../courseDetails/LessonActionsBottom";
import {useGetLessonById, useGetLessons} from "../../api/lesson/useLesson.ts";
import {useNavigate, useParams} from "react-router-dom";
import LessonMobileNavigationBar from "./LessonMobileNavigationBar.tsx";
import {ArrowRightLineIcon} from "../../assets/icon";
import {useGetLessonsProgress, useStartLessonProgress} from "../../api/lessonProgress/useLessonProgress.ts";
import {useEffect, useState} from "react";
import {Lesson} from "../../types/types.ts";
import {useMobile} from "../../hooks/useMobile.ts";
import { DiscussionSection } from "./discussion/DiscussionSection";

function LessonActions() {

    const navigate = useNavigate();
    const isMobile = useMobile()
    const params = useParams();
    const [ended, setEnded] = useState<boolean>(false);
    const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
    const {mutate} = useStartLessonProgress()
    const {data: lessonProgress} = useGetLessonsProgress({
        studentCourseId: params.id,
        lessonId: params.lessonId,
        ended: ended
    })

    const {data: lessons} = useGetLessons(params?.moduleId || null);


    const {data} = useGetLessonById(params.lessonId || null);


    useEffect(() => {
        const currentLessonIndex = lessons?.findIndex((l: Lesson) => l.id === params.lessonId);
        const isLastLesson = currentLessonIndex === lessons?.length - 1;
        if (isLastLesson) {
            setNextLesson(null);
        } else {
            const nextLessonItem = !isLastLesson ? lessons?.[currentLessonIndex + 1] : null;
            setNextLesson(nextLessonItem);
        }
    }, [lessons])

    return (
        <div className="h-dvh w-full lg:flex-1 lg:p-10">
            {
                data && lessonProgress ?
                    <div className={'lg:p-8 pb-0 border border-blue-300 lg:rounded-[16px]'}>
                        <LessonVedio startTime={lessonProgress?.currentSecond} videoUrl={data?.vedioUrl || ""}
                                     setEnded={setEnded}/>
                        <div className={'px-4 lg:p-0'}>
                            <p className={'text-lg lg:text-2xl text-gray-900 mt-5 font-medium'}>{data.name}</p>
                            <p className={'text-sm text-gray-400  font-light'}>{data.description}</p>
                            <hr className="bg-blue-100 my-6 h-px border-0 hidden lg:block"/>
                            <LessonRating/>
                            <hr className="bg-blue-100 my-6 h-px border-0 hidden lg:block"/>
                            <LessonActionsBottom/>

                            {/* Public Discussion Section */}
                            {params.lessonId && (
                                <DiscussionSection lessonId={params.lessonId} />
                            )}

                            <div className={'sticky bottom-0 left-0 w-full flex justify-end py-3 bg-white'}>
                                <button
                                    onClick={() => {
                                        if (nextLesson) {
                                            mutate({
                                                studentCourseId: params.id,
                                                lessonId: nextLesson.id
                                            })
                                            if (isMobile) {
                                                navigate(`/courses/${params.id}/${params.moduleId}/${nextLesson.id}`)
                                            }
                                            {
                                                navigate(`${params.moduleId}/${nextLesson.id}`)
                                            }
                                        }

                                    }}
                                    disabled={!ended}
                                    className={`${ended ? 'border-primary-500 text-primary-500' : 'border-gray-500 text-gray-500'} h-[52px] flex gap-2 items-center border-2  rounded-full text-lg font-semibold p-4`}>
                                    {
                                        nextLesson ? "Keyingi darsga o'tish" : 'Modulni yakunlash'
                                    }
                                    <ArrowRightLineIcon width={24} height={24}/>
                                </button>
                            </div>
                        </div>
                    </div> :
                    <div className={'flex items-center justify-center h-dvh lg:h-[400px]'}>
                        <p className="text-lg text-center text-black font-medium m-0 p-0 leading-none break-all w-full">
                            Darsni tanlang !!
                        </p>
                    </div>

            }
            <LessonMobileNavigationBar/>

        </div>

    );
}

export default LessonActions;