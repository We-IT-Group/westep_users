import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Layers3,
    ShieldCheck,
    Award, Check, Plus, Clock, Play, ChevronDown, ChevronUp
} from "lucide-react";
import { useUser } from "../../api/auth/useAuth.ts";
import {
    useGetCourseById,
    useGetStudentCourseById,
    useSetStudentCourseById,
    useSetStudentCourseByIdForPayment,
} from "../../api/courses/useCourse.ts";
import { useGetStudentCourseModulesById } from "../../api/module/useModule.ts";
import type { Course, CourseDetailLesson, CourseDetailModule, Module, StudentCourse } from "../../types/types.ts";

type PaymentMethod = "payme" | "click" | "uzum" | "alif" | "paynet";

function formatDuration(totalSeconds?: number) {
    if (!totalSeconds) return "0";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours} : ${minutes > 0 ? ` ${minutes}` : ""}`;
    }

    if (minutes > 0) {
        return `${minutes} : ${seconds > 0 ? ` ${seconds}` : ""}`;
    }

    return ` : ${seconds} `;
}

function PriceDisplay({
    price,
    isStrikethrough,
    className = "",
}: {
    price: number;
    isStrikethrough?: boolean;
    className?: string;
}) {
    return (
        <span className={`${isStrikethrough ? "line-through" : ""} ${className}`}>
            {price.toLocaleString("uz-UZ")} so'm
        </span>
    );
}

function Badge({
    children,
    variant = "blue",
}: {
    children: ReactNode;
    variant?: "blue" | "gray" | "emerald";
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${variant === "blue"
                ? "border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800/50 dark:bg-blue-600/10 dark:text-blue-400"
                : variant === "emerald" ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-300" :
                    "border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
        >
            {children}
        </span>
    );
}

function PaymentMethodCard({
    id,
    name,
    color,
    logo,
    isSelected,
    onSelect,
    disabled,
}: {
    id: PaymentMethod;
    name: string;
    color: string;
    logo?: string;
    isSelected: boolean;
    onSelect: (value: PaymentMethod) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onSelect(id)}
            className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-[24px] border-2 p-5 text-left transition-all duration-500 ${isSelected
                ? "border-blue-600 bg-blue-50/10 dark:bg-blue-900/5"
                : "border-slate-50 hover:border-slate-100 dark:border-slate-800/50 dark:hover:border-slate-700"
                } ${disabled ? "cursor-not-allowed opacity-50" : "active:scale-[0.98]"}`}
        >
            <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${color} p-2.5 shadow-xl transition-transform duration-500 group-hover:scale-110`}
            >
                {logo ? (
                    <img
                        src={logo}
                        alt={name}
                        className="h-full w-full object-contain brightness-0 invert"
                    />
                ) : (
                    <span className="text-xs font-black uppercase text-white">
                        {name.slice(0, 2)}
                    </span>
                )}
            </div>
            <div
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isSelected ? "text-blue-600" : "text-slate-400"
                    }`}
            >
                {name}
            </div>
            {isSelected && (
                <motion.div
                    layoutId="payment-active-roadmap"
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 shadow-lg"
                >
                    <CheckCircle2 className="h-3 w-3 text-white" />
                </motion.div>
            )}
            {disabled && (
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Tez orada
                </div>
            )}
        </button>
    );
}

function PurchaseModuleItem({
    module,
    isSelected,
    isExpanded,
    onToggle,
    onExpand,
}: {
    module: CourseDetailModule;
    isSelected: boolean;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    onExpand: (event: MouseEvent<HTMLButtonElement>, id: string) => void;
}) {
    const isPurchased = module.isPurchased;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className={`group relative rounded-[24px] border transition-all duration-300 overflow-hidden ${isPurchased ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                : isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-500/40 shadow-xl shadow-blue-500/5'
                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
        >
            <div
                onClick={() => onToggle(module.moduleId)}
                className={`flex items-center gap-5 p-5 ${!isPurchased ? 'cursor-pointer' : ''}`}
            >

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${module.isPurchased
                    ? 'bg-emerald-500 scale-100 shadow-lg shadow-emerald-500/20'
                    : isSelected
                        ? 'bg-blue-600 scale-105 shadow-lg shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    {module.isPurchased ? (
                        <Award className="w-5 h-5 text-white" />
                    ) : isSelected ? (
                        <Check className="w-5 h-5 text-white stroke-[4px]" />
                    ) : (
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3
                            className={`text-[16px] font-bold tracking-tight transition-colors ${isPurchased ? 'text-emerald-700 dark:text-emerald-300' : isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'
                                }`}
                        >
                            {module.moduleName}
                        </h3>
                        <div className="flex items-center gap-4">
                            {module.isPurchased ? (
                                <Badge variant="emerald">Sotib olingan</Badge>
                            ) : (
                                <span className={`text-[16px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400 opacity-60'}`}>
                                    <PriceDisplay price={module.price} />
                                </span>
                            )}
                            <button
                                onClick={(e) => onExpand(e, module.moduleId)}
                                className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                            >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>


                    <div className="flex items-center gap-4 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDuration(module.totalDuration)} Soat</span>
                        <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> {module.lessonsCount} Dars</span>
                    </div>
                </div>


            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden"
                    >
                        <div className="p-5 space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                Modul ichidagi lessonlar
                            </p>
                            {module.lessons.map((lesson) => (
                                <LessonRow
                                    key={lesson.lessonId}
                                    lesson={lesson}
                                />
                            ))}
                        </div>



                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function LessonRow({
    lesson,
}: {
    lesson: CourseDetailLesson;
}) {
    return (
        <div className="flex items-center justify-between group/lesson">
            <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-blue-400 opacity-40 group-hover/lesson:scale-150 transition-transform" />
                <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{lesson.lessonName}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{formatDuration(lesson.duration)}</span>
        </div>
    );
}

function RoadMap() {
    const params = useParams();
    const { data: user } = useUser();
    const { data: studentCourses = [] } = useGetStudentCourseById(user?.id);
    const { data: course, isPending } = useGetCourseById(params.id) as {
        data: Course | undefined;
        isPending: boolean;
    };
    const matchedStudentCourse = (studentCourses as StudentCourse[]).find(
        (item) => item.courseId === params.id,
    );
    const { data: purchasedModules = [] } = useGetStudentCourseModulesById(matchedStudentCourse?.id);
    const { mutate: purchaseWithPayment, isPending: isPaymentPending } =
        useSetStudentCourseByIdForPayment();
    const { mutate: enrollForFree, isPending: isEnrollPending } = useSetStudentCourseById();

    const purchasedModuleIds = useMemo(() => {
        return new Set((purchasedModules as Module[]).map((item) => item.id));
    }, [purchasedModules]);

    const modules = useMemo(
        () =>
            (course?.modules ?? []).map((module) => ({
                ...module,
                isPurchased: module.isPurchased ?? purchasedModuleIds.has(module.moduleId),
            })),
        [course?.modules, purchasedModuleIds],
    );
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payme");
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    useEffect(() => {
        if (!modules.length) {
            setSelectedModules([]);
            setExpandedModule(null);
        }
    }, [modules]);

    const selectedModuleObjects = useMemo(
        () => modules.filter((module) => selectedModules.includes(module.moduleId)),
        [modules, selectedModules],
    );

    const unpurchasedModules = useMemo(
        () => modules.filter((module) => !module.isPurchased),
        [modules],
    );
    const unpurchasedModuleIds = useMemo(
        () => unpurchasedModules.map((module) => module.moduleId),
        [unpurchasedModules],
    );

    const toggleModule = (id: string) => {
        const module = modules.find((m) => m.moduleId === id);
        if (module?.isPurchased) return;

        setSelectedModules((prev) =>
            prev.includes(id) ? prev.filter((moduleId) => moduleId !== id) : [...prev, id],
        );
    };

    const toggleAll = () => {
        if (selectedModules.length === unpurchasedModuleIds.length) {
            setSelectedModules([]);
        } else {
            setSelectedModules(unpurchasedModuleIds);
        }
    };

    const { totalPrice, originalPrice, hasBulkDiscount } = useMemo(() => {
        const base = selectedModuleObjects.reduce((sum, module) => sum + module.price, 0);

        // Bulk discount applies if all available (unpurchased) modules are selected
        const allAvailableSelected =
            unpurchasedModules.length > 0 &&
            selectedModules.length === unpurchasedModules.length &&
            modules.length > 1;

        if (allAvailableSelected) {
            return {
                totalPrice: Math.round(base * 0.8),
                originalPrice: base,
                hasBulkDiscount: true,
            };
        }

        return {
            totalPrice: base,
            originalPrice: base,
            hasBulkDiscount: false,
        };
    }, [modules, selectedModuleObjects, selectedModules.length]);

    const providers: Array<{
        id: PaymentMethod;
        name: string;
        color: string;
        logo?: string;
        disabled?: boolean;
    }> = [
            {
                id: "payme",
                name: "Payme",
                color: "from-[#00BAFF] to-[#0088CC]",
                logo: "https://cdn.payme.uz/logo/payme_color.svg",
            },
            {
                id: "click",
                name: "Click",
                color: "from-[#00A3FF] to-[#0077CC]",
                logo: "https://click.uz/static/img/logo.png",
                disabled: true,
            },
            {
                id: "uzum",
                name: "Uzum",
                color: "from-[#7000FF] to-[#5500CC]",
                logo: "https://uzum.uz/static/img/logo.png",
                disabled: true,
            },
            {
                id: "alif",
                name: "Alif Nasiya",
                color: "from-[#00D166] to-[#00A350]",
                logo: "https://alif.uz/static/logo.png",
                disabled: true,
            },
            {
                id: "paynet",
                name: "Paynet",
                color: "from-[#FF3D00] to-[#CC3100]",
                logo: "https://paynet.uz/static/logo.png",
                disabled: true,
            },
        ];

    const isFreeCourse = totalPrice === 0;
    const isSubmitting = isPaymentPending || isEnrollPending;

    function handlePurchase() {
        if (!user?.id || !params.id || !selectedModules.length) {
            return;
        }

        const payload = {
            studentId: user.id,
            courseId: params.id,
            moduleList: selectedModules,
        };

        if (isFreeCourse) {
            enrollForFree(payload);
            return;
        }

        if (paymentMethod !== "payme") {
            return;
        }

        purchaseWithPayment(payload);
    }

    return (
        <div className="min-h-[calc(100dvh-76px)] bg-[#F8FAFC] font-sans transition-colors duration-500 dark:bg-[#020617]">
            <main className="mx-auto max-w-[1300px] px-4 pb-24 pt-12 text-slate-900 dark:text-slate-100 sm:px-10 sm:pt-16">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
                    <div className="space-y-12 lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="h-[2px] w-8 rounded-full bg-blue-600" />
                                <Badge variant="blue">
                                    {course?.price ? "Premium" : "Bepul"} • Professional Series
                                </Badge>
                            </div>

                            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                                {course?.name || "Kurs xarid qilish"}
                            </h1>

                            <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl">
                                {course?.description ||
                                    "Yuqori darajadagi bilim va amaliy tajriba. Kurs doirasida barcha modullarni professional darajada o'zlashtiring."}
                            </p>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Clock3 className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Umumiy davomiylik
                                    </p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                        {formatDuration(course?.totalDuration)}
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Layers3 className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Modullar
                                    </p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                        {modules.length} ta modul
                                    </p>
                                </div>

                                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                        Lessonlar
                                    </p>
                                    <p className="mt-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                        {course?.lessonsCount ?? 0} ta lesson
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
                                <div>
                                    <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                        O'quv rejasi
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-slate-400">
                                        Modul, lesson va davomiylik ma'lumotlari backenddan yuklandi
                                    </p>
                                </div>

                                {!!unpurchasedModules.length && (
                                    <button
                                        onClick={toggleAll}
                                        className="rounded-xl border border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                                        type="button"
                                    >
                                        {selectedModules.length === unpurchasedModules.length
                                            ? "Barchasini bekor qilish"
                                            : "Barchasini tanlash"}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {modules.map((module) => (
                                    <PurchaseModuleItem
                                        key={module.moduleId}
                                        module={module}
                                        isSelected={selectedModules.includes(module.moduleId)}
                                        isExpanded={expandedModule === module.moduleId}
                                        onToggle={toggleModule}
                                        onExpand={(event, id) => {
                                            event.stopPropagation();
                                            setExpandedModule((prev) => (prev === id ? null : id));
                                        }}
                                    />
                                ))}

                                {!modules.length && !isPending && (
                                    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                        Hozircha modullar topilmadi.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-fit lg:col-span-5 lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-[44px] border border-slate-200/50 bg-white p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] dark:border-slate-800/50 dark:bg-slate-900 sm:p-12"
                        >
                            <div className="pointer-events-none absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-blue-600/5 blur-[100px]" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Hisob-kitob
                                    </h3>
                                    <Badge variant="blue">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            Secure
                                        </div>
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={totalPrice}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white sm:text-4xl lg:text-5xl"
                                            >
                                                <PriceDisplay price={totalPrice} />
                                            </motion.span>
                                        </AnimatePresence>

                                        {hasBulkDiscount && (
                                            <div className="mb-2 flex flex-col">
                                                <PriceDisplay
                                                    price={originalPrice}
                                                    isStrikethrough
                                                    className="text-xl font-bold leading-none text-slate-300 dark:text-slate-700"
                                                />
                                                <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                                    To'liq xarid -20%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[11px] font-medium uppercase leading-relaxed tracking-[0.1em] text-slate-400">
                                        {selectedModules.length} ta modul tanlandi.{" "}
                                        {hasBulkDiscount
                                            ? "Chegirma hisoblandi."
                                            : unpurchasedModules.length > 1
                                                ? "Barcha modullarni oling va 20% tejang."
                                                : ""}
                                    </p>
                                </div>

                            </div>

                            {!isFreeCourse && (
                                <div className="relative z-10 space-y-5 pt-6">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        To'lov shakli
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {providers.map((provider) => (
                                            <PaymentMethodCard
                                                key={provider.id}
                                                {...provider}
                                                isSelected={paymentMethod === provider.id}
                                                onSelect={setPaymentMethod}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="relative z-10 pt-6">
                                <motion.button
                                    whileHover={
                                        selectedModules.length > 0 &&
                                            !isSubmitting &&
                                            (isFreeCourse || paymentMethod === "payme")
                                            ? { scale: 1.01, y: -2 }
                                            : {}
                                    }
                                    whileTap={
                                        selectedModules.length > 0 &&
                                            !isSubmitting &&
                                            (isFreeCourse || paymentMethod === "payme")
                                            ? { scale: 0.99 }
                                            : {}
                                    }
                                    disabled={
                                        selectedModules.length === 0 ||
                                        isSubmitting ||
                                        (!isFreeCourse && paymentMethod !== "payme")
                                    }
                                    onClick={handlePurchase}
                                    className={`group flex w-full items-center justify-center gap-4 rounded-[28px] px-8 py-6 transition-all ${selectedModules.length > 0 &&
                                        !isSubmitting &&
                                        (isFreeCourse || paymentMethod === "payme")
                                        ? "bg-blue-600 text-white shadow-[0_24px_48px_-12px_rgba(37,99,235,0.35)] hover:bg-blue-700"
                                        : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                                        }`}
                                    type="button"
                                >
                                    <span className="text-[13px] font-bold uppercase tracking-[0.25em]">
                                        {isSubmitting
                                            ? "Yuklanmoqda..."
                                            : selectedModules.length > 0
                                                ? isFreeCourse
                                                    ? "Boshlash"
                                                    : "Sotib olish"
                                                : "Modul tanlang"}
                                    </span>
                                    {selectedModules.length > 0 &&
                                        !isSubmitting &&
                                        (isFreeCourse || paymentMethod === "payme") && (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1.5">
                                                <ChevronRight className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                </motion.button>

                                <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
                                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        End-to-End Encryption
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RoadMap;
