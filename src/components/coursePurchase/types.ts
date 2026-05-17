export interface CoursePurchaseLesson {
    id: string;
    title: string;
    duration: string;
}

export interface CoursePurchaseModule {
    id: string;
    title: string;
    price?: number;
    isPurchased?: boolean;
    lessons: CoursePurchaseLesson[];
}

export interface CoursePurchaseCourse {
    id: string;
    title: string;
    category: string;
    price?: number;
}

export interface PaymentProvider {
    id: "payme" | "click" | "uzum" | "xazna" | "humo" | "paynet" | (string & {});
    name: string;
    color: string;
    logo?: string;
    disabled?: boolean;
}

export interface CoursePurchaseData {
    courseId: string;
    course: CoursePurchaseCourse;
    modules: CoursePurchaseModule[];
    paymentProviders: PaymentProvider[];
}
