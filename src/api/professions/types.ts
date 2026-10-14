export type DemandTone = "success" | "warning" | "error" | "neutral" | "primary";

export interface ProfessionGrad {
    from: string;
    to: string;
}

export interface ProfessionFieldDto {
    key: string;
    label: string;
}

export interface ProfessionFieldsResponse {
    fields: ProfessionFieldDto[];
}

export interface ProfessionListItemDto {
    id: string;
    slug: string;
    emoji: string;
    field: string;
    fieldLabel: string;
    grad: ProfessionGrad;
    title: string;
    tagline: string;
    demand: string;
    demandTone: DemandTone;
    courseCount: number;
}

export interface ProfessionListResponse {
    items: ProfessionListItemDto[];
    total: number;
    limit: number;
    offset: number;
}

export interface ProfessionRelatedCourseDto {
    id: string;
    name: string;
    categoryLabel: string;
    teacherFullName: string;
    studentsCount: number;
    rating: number;
    price: number;
    grad: ProfessionGrad | null;
    emoji: string | null;
}

export interface ProfessionDetailDto {
    id: string;
    slug: string;
    emoji: string;
    field: string;
    fieldLabel: string;
    grad: ProfessionGrad;
    title: string;
    tagline: string;
    description: string;
    demand: string;
    demandTone: DemandTone;
    duration: string;
    level: string;
    skills: string[];
    roles: string[];
    courses: ProfessionRelatedCourseDto[];
}

export interface ProfessionListParams {
    field?: string;
    q?: string;
    limit?: number;
    offset?: number;
}

export interface QuizOptionDto {
    id: string;
    text: string;
    emoji?: string | null;
}

export interface QuizQuestionDto {
    id: string;
    text: string;
    options: QuizOptionDto[];
}

export interface InterestQuizDto {
    ageGroup: string;
    questions: QuizQuestionDto[];
}

export interface QuizResultFieldScore {
    fieldKey: string;
    fieldLabel: string;
    score: number;
}

export interface InterestQuizResultDto {
    ageGroup: string;
    totalQuestions: number;
    fieldScores: QuizResultFieldScore[];
}

export interface RecommendationItemDto {
    professionId: string;
    slug: string;
    emoji?: string | null;
    fieldKey: string;
    ageAppropriate: boolean;
    score: number;
}

export interface RecommendationsDto {
    hasQuizResult: boolean;
    recommendations: RecommendationItemDto[];
}

export type StudentProfessionStatus =
    | "UNDER_REVIEW"
    | "CONFIRMED"
    | "RESELECTING"
    | "COMPLETED"
    | "ABANDONED";

export interface StudentProfessionDto {
    id: string;
    professionId: string;
    slug: string;
    emoji?: string | null;
    title: string;
    status: StudentProfessionStatus;
    source: string;
    matchScore?: number | null;
    reviewNote?: string | null;
}

export interface RoadmapItemViewDto {
    id: string;
    itemType: "COURSE" | "SKILL" | "EXTERNAL";
    courseId?: string | null;
    title: string;
    description?: string | null;
    status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "DONE";
    progressPercent: number;
    required: boolean;
    track?: "SUBJECT" | "SKILL" | "EXPERIENCE";
}

export interface RoadmapStageViewDto {
    name: string;
    orderIndex: number;
    completed: boolean;
    current?: boolean;
    ageFrom?: number | null;
    ageTo?: number | null;
    estimatedWeeks?: number | null;
    items: RoadmapItemViewDto[];
}

export interface StudentRoadmapDto {
    id: string;
    professionId: string;
    professionSlug: string;
    professionEmoji?: string | null;
    professionTitle: string;
    status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
    overallProgressPercent: number;
    closeness?: {
        studentAge: number;
        targetReadyAge: number;
        remainingYears: number;
        currentStageIndex: number;
        currentStageName: string;
        stagePercent: number;
        subjectsPercent: number;
        skillsPercent: number;
        experiencePercent: number;
        stageRemainingMonths: number;
        fieldKey?: string | null;
        fieldLabel?: string | null;
        directionLabel?: string | null;
        nextAction?: {
            itemId: string;
            title: string;
            itemType: string;
            courseId?: string | null;
            estimatedMinutes: number;
        } | null;
    } | null;
    stages: RoadmapStageViewDto[];
}
