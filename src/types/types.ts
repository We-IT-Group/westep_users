export interface Common {
    id: string;
    createdAt?: string
}


export interface User {
    id?: string,
    firstname: string,
    lastname: string,
    birthDate: string,
    gender: string,
    roleName?: string,
    avatar?: string | null,
    avatarUrl?: string | null,
    attachmentUrl?: string | null,
    profileImageUrl?: string | null,
    imageUrl?: string | null,
    password: string,
    phone: string
    phoneNumber: string
}

export interface Course extends Common {
    name: string,
    description: string,
    shortDescription?: string,
    fullDescription?: string,
    isPublished: boolean,
    active?: boolean,
    publishedAt: string,
    businessId: string
    attachmentUrl: string | null
    trailerVideoUrl?: string | null
    purchased?: boolean
    studentsCount?: number
    free?: boolean
    price: number
    level?: string | null
    languageId?: string | null
    languageName?: string | null
    languageCode?: string | null
    language?: string | null
    createdBy?: string | null
    createdByFullName?: string | null
    teacherId?: string | null
    teacherFullName?: string | null
    primaryCategory?: { id?: string; name?: string } | null
    subcategory?: { id?: string; name?: string } | null
    lessonsCount?: number
    totalDuration?: number
    modules?: CourseDetailModule[]
}

export interface StudentCourse extends Common {
    courseId: string,
    courseName: string,
    studentId: boolean,
    attachmentUrl: string,
    percent: number,
    progressPercentage?: number,
    totalLessons?: number,
    completedLessons?: number,
}

export interface Module extends Common {
    name: string,
    description?: string,
    courseId: string
    orderIndex: number | null,
    active?: boolean,
    price: number,
}

export interface Lesson extends Common {
    name: string,
    description?: string,
    moduleId: string,
    orderIndex: number,
    estimatedDuration: number | null,
    videoUrl?: string,
    progress?: boolean,
    completed?: boolean,
}

export interface CourseDetailLesson {
    lessonId: string,
    lessonName: string,
    type?: "LESSON" | "PRACTICE",
    duration: number,
    hasVideo?: boolean,
    hasQuiz?: boolean,
    hasHomework?: boolean,
    hasResources?: boolean,
}

export interface CourseDetailModule {
    moduleId: string,
    moduleName: string,
    purchased?: boolean,
    isPurchased?: boolean,
    lessonsCount: number,
    totalDuration: number,
    price: number,
    lessons: CourseDetailLesson[],
}
