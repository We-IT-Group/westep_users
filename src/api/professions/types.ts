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

export type QuizDimension = "RIASEC" | "SUBJECT" | "STRENGTH" | "LEARNING" | "VALUES" | "MOOD" | "SHAPE_COLOR";
export type QuizQuestionType = "LIKERT" | "CHOICE" | "IMAGE" | "SHAPE" | "COLOR";

export interface QuizOptionDto {
    id: string;
    text: string;
    emoji?: string | null;
    imageKey?: string | null;
}

export interface QuizQuestionDto {
    id: string;
    text: string;
    dimension?: QuizDimension | null;
    type?: QuizQuestionType | null;
    options: QuizOptionDto[];
}

export interface InterestQuizDto {
    ageGroup: string;
    tier?: number | null;
    questions: QuizQuestionDto[];
}

export interface InterestQuizTiersDto {
    ageGroup: string;
    tiers: Array<{ tier: number; questionCount: number }>;
}

export interface QuizResultFieldScore {
    fieldKey: string;
    fieldLabel: string;
    score: number;
}

export interface QuizProfileDto {
    /** Yo'q bo'lishi mumkin: fan bo'limisiz eski natijalar. */
    subjects?: QuizResultFieldScore[];
    strengths: QuizResultFieldScore[];
    learning: QuizResultFieldScore[];
    values: QuizResultFieldScore[];
    mood: QuizResultFieldScore[];
    shapeColor: QuizResultFieldScore[];
}

export interface InterestQuizResultDto {
    ageGroup: string;
    tier?: number | null;
    totalQuestions: number;
    hollandCode?: string | null;
    riasecScores?: QuizResultFieldScore[];
    fieldScores: QuizResultFieldScore[];
    profile?: QuizProfileDto | null;
    attention?: boolean;
}

export interface FitPartDto {
    key: string;
    label: string;
    score: number;
}

export interface RecommendationItemDto {
    professionId: string;
    slug: string;
    title?: string | null;
    tagline?: string | null;
    emoji?: string | null;
    fieldKey: string;
    ageAppropriate: boolean;
    score: number;
    /** Kasbga moslik 0–100 (test yo'q bo'lsa null). */
    fit?: number | null;
    fitParts?: { interest: number | null; subjects?: number | null; strengths: number | null; values: number | null } | null;
    matches?: FitPartDto[];
    gaps?: FitPartDto[];
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
