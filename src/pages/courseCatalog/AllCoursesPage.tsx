import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Filter as FilterIcon, 
    ChevronRight, 
    Sparkles, 
    BookOpen,
    Clock,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetCourses } from "../../api/courses/useCourse.ts";
import { baseUrlImage } from "../../api/apiClient.ts";
import { formatCourseDuration } from "../../utils/utils.ts";
function imageUrl(path?: string | null) {
    return path ? `${baseUrlImage}${path}` : "";
}

function formatPrice(price?: number) {
    if (!price || price === 0) return "Bepul";
    return `${price.toLocaleString("uz-UZ")} so'm`;
}

interface Category {
    id: string;
    label: string;
}

const categories: Category[] = [
    { id: "all", label: "Barcha Kurslar" },
    { id: "premium", label: "Premium" },
    { id: "free", label: "Bepul Darslar" }
];

export default function AllCoursesPage() {
    const navigate = useNavigate();
    const { data: allCourses = [], isPending } = useGetCourses();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filteredCourses = useMemo(() => {
        let filtered = (allCourses as any[]).filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = activeCategory === "all" || 
                                   (activeCategory === "premium" && course.price > 0) || 
                                   (activeCategory === "free" && course.price === 0);
            return matchesSearch && matchesCategory;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "popular") return (b.totalStudents || 0) - (a.totalStudents || 0);
            return 0;
        });
    }, [allCourses, searchQuery, activeCategory, sortBy]);

    const handleCourseClick = (course: any) => {
        navigate(`/roadmap/${course.id}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
            {/* Minimalist Hero */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-10 pb-16">
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px]" />
                </div>
                
                <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-600/10 dark:text-blue-400"
                            >
                                <Sparkles className="h-3 w-3" />
                                <span>Kurslar Katalogi</span>
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white"
                            >
                                Bilimingizni <span className="text-blue-600">Boyiting</span>
                            </motion.h1>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full max-w-md"
                        >
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Izlash..."
                                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold shadow-sm transition-all focus:border-blue-600/20 focus:bg-white focus:ring-4 focus:ring-blue-600/5 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-28 h-fit">
                        <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Yo'nalishlar</h3>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                activeCategory === cat.id 
                                                ? "bg-slate-900 text-white dark:bg-blue-600 shadow-lg shadow-slate-900/10 dark:shadow-blue-500/20" 
                                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400"
                                            }`}
                                        >
                                            {cat.label}
                                            {activeCategory === cat.id && <ChevronRight className="h-3 w-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            <div>
                                <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tartiblash</h3>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="newest">Yangi qo'shilganlar</option>
                                    <option value="popular">Eng mashhurlar</option>
                                    <option value="price-asc">Avval arzonlari</option>
                                    <option value="price-desc">Avval qimmatlari</option>
                                </select>
                            </div>

                            <div className="rounded-2xl bg-blue-600 p-6 text-white overflow-hidden relative group">
                                <div className="relative z-10 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Premium Access</p>
                                    <h4 className="text-xl font-black italic tracking-tighter leading-tight uppercase">Barcha darslarga yo'l oching</h4>
                                    <button className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-[8px] font-black uppercase tracking-widest backdrop-blur-md transition-colors hover:bg-white/30">
                                        Ko'proq ma'lumot
                                    </button>
                                </div>
                                <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 transition-transform group-hover:scale-125" />
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex items-center justify-between mb-6">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                        >
                            <FilterIcon className="h-4 w-4" />
                            Filtrlar
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {filteredCourses.length} kurs
                        </span>
                    </div>

                    {/* Content Grid */}
                    <main className="flex-1">
                        {isPending ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-96 rounded-[40px] bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
                                ))}
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-[40px] space-y-6">
                                <Search className="h-12 w-12 text-slate-200 mx-auto" />
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Kurs topilmadi</h3>
                                <button 
                                    onClick={() => {setSearchQuery(""); setActiveCategory("all");}}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                >
                                    Tozalash
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
                                <AnimatePresence mode="popLayout">
                                    {filteredCourses.map((course) => (
                                        <motion.div 
                                            key={course.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="group"
                                        >
                                            <div className="relative flex h-full flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white p-3 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800/50 dark:bg-slate-900">
                                                <div className="relative aspect-[16/10] overflow-hidden rounded-[32px]">
                                                    {course.attachmentUrl ? (
                                                        <img
                                                            src={imageUrl(course.attachmentUrl)}
                                                            className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                                            alt={course.name}
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-slate-100 dark:from-slate-800 dark:to-slate-900" />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                                                    <div className="absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 backdrop-blur-md dark:bg-slate-900/90">
                                                        {course.price > 0 ? "Premium" : "Bepul"}
                                                    </div>
                                                </div>

                                                <div className="flex flex-1 flex-col justify-between space-y-6 p-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <div className="flex items-center gap-1.5">
                                                                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                                                                <span>{course.lessonsCount || 0} dars</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-blue-600" />
                                                                <span>{formatCourseDuration(course.totalDuration) || "Kurs"}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <h4 className="line-clamp-2 text-xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 transition-all duration-500 group-hover:text-blue-600 dark:text-white">
                                                            {course.name}
                                                        </h4>
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <div className="flex items-center justify-between border-t border-slate-50 pt-5 dark:border-slate-800">
                                                            <div className="text-lg font-black italic tracking-tighter text-slate-900 dark:text-white">
                                                                {formatPrice(course.price)}
                                                            </div>
                                                            <button
                                                                onClick={() => handleCourseClick(course)}
                                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-all hover:bg-blue-600 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
                                                            >
                                                                <ChevronRight className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 right-0 top-0 z-[70] w-80 bg-white p-8 dark:bg-slate-950 lg:hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Filtrlar</h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Kategoriyalar</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {setActiveCategory(cat.id); setIsSidebarOpen(false);}}
                                                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    activeCategory === cat.id 
                                                    ? "bg-blue-600 text-white" 
                                                    : "bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white"
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tartiblash</h3>
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => {setSortBy(e.target.value); setIsSidebarOpen(false);}}
                                        className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="newest">Yangi qo'shilganlar</option>
                                        <option value="popular">Eng mashhurlar</option>
                                        <option value="price-asc">Avval arzonlari</option>
                                        <option value="price-desc">Avval qimmatlari</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
