export type LessonType = "video" | "reading" | "quiz";
export type CoursePlayerTab = "discussion" | "materials" | "reviews";

export interface CoursePlayerLesson {
    id: string;
    title: string;
    duration: string;
    rating?: number;
    completed: boolean;
    type: LessonType;
    videoUrl?: string;
    description?: string;
    locked?: boolean;
    backendTestModuleId?: string;
}

export interface CoursePlayerModule {
    id: string;
    title: string;
    lessons: CoursePlayerLesson[];
    isPurchased?: boolean;
}

export interface CoursePlayerMaterial {
    id: string;
    taskId?: string;
    title: string;
    type: "pdf" | "zip" | "doc" | "video" | "quiz" | "homework";
    size: string;
    uploadedAt: string;
    questionCount?: number;
    durationMinutes?: number;
    description?: string;
    attachmentId?: string;
    attachmentUrl?: string;
    resourceUrl?: string;
    fileName?: string;
    mimeType?: string;
}

export interface CoursePlayerDiscussionReply {
    id: string;
    user: string;
    userAvatar: string;
    content: string;
    timestamp: string;
    isInstructor?: boolean;
}

export interface CoursePlayerDiscussion {
    id: string;
    user: string;
    userAvatar: string;
    question: string;
    timestamp: string;
    replies: CoursePlayerDiscussionReply[];
}

export interface CoursePlayerReview {
    id: string;
    user: string;
    userAvatar: string;
    rating: number;
    comment: string;
    timestamp: string;
}

export interface CoursePlayerData {
    courseId: string;
    title: string;
    progress: number;
    poster?: string;
    initialLessonId?: string;
    modules: CoursePlayerModule[];
    materials: CoursePlayerMaterial[];
    discussions: CoursePlayerDiscussion[];
    reviews: CoursePlayerReview[];
}
