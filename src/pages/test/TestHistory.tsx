import { useMemo, useState, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight, Trophy, Clock, Calendar, AlertCircle, Loader2, Check, Search, ChevronDown, LayoutGrid, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courses/courseApi.ts';
import { useGetStudentCourseById } from '../../api/courses/useCourse.ts';
import { useUser } from '../../api/auth/useAuth.ts';
import {
  type LessonQuizResultSummary,
  useGetGlobalQuizHistory,
} from '../../api/quizHistory/useQuizHistory.ts';
import { QuizHistoryDetailModal } from '../../components/quizHistory/QuizHistoryDetailModal.tsx';
import type { Course, StudentCourse } from '../../types/types.ts';

const UZBEK_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

export function TestHistory() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { data: studentCourses = [], isPending: isStudentCoursesPending } = useGetStudentCourseById(user?.id);
  const { data: allResults = [], isPending: isResultsPending } = useGetGlobalQuizHistory();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [brokenCourseImages, setBrokenCourseImages] = useState<Record<string, boolean>>({});

  const typedStudentCourses = studentCourses as StudentCourse[];

  const courseDetailQueries = useQueries({
    queries: typedStudentCourses.map((course) => ({
      queryKey: ['test-history-course-detail', course.courseId],
      queryFn: () => getCourseById(course.courseId),
      enabled: !!course.courseId,
      retry: false,
    })),
  });

  const courseLessonMap = useMemo(() => {
    return typedStudentCourses.reduce<Record<string, Set<string>>>((acc, course, index) => {
      const detail = courseDetailQueries[index]?.data as Course | undefined;
      const lessonIds = new Set<string>();

      detail?.modules?.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          lessonIds.add(lesson.lessonId);
        });
      });

      acc[course.courseId] = lessonIds;
      return acc;
    }, {});
  }, [courseDetailQueries, typedStudentCourses]);

  const lessonMetaMap = useMemo(() => {
    return typedStudentCourses.reduce<
      Record<string, { lessonName: string; moduleName: string; courseId: string }>
    >((acc, course, index) => {
      const detail = courseDetailQueries[index]?.data as Course | undefined;

      detail?.modules?.forEach((module) => {
        module.lessons?.forEach((lesson) => {
          acc[lesson.lessonId] = {
            lessonName: lesson.lessonName,
            moduleName: module.moduleName,
            courseId: course.courseId,
          };
        });
      });

      return acc;
    }, {});
  }, [courseDetailQueries, typedStudentCourses]);

  const availableCourses = typedStudentCourses.map((course) => ({
    id: course.courseId,
    title: course.courseName,
    category: 'Kurs',
    image: course.attachmentUrl,
    backendCourseId: course.courseId,
  }));

  const currentCourse = availableCourses.find(c => c.id === selectedCourseId);

  const filteredCourses = availableCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize selected course
  useEffect(() => {
    if (availableCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(availableCourses[0].id);
    }
  }, [availableCourses, selectedCourseId]);

  const results = useMemo(() => {
    if (!selectedCourseId) return [];

    const lessonIds = courseLessonMap[selectedCourseId] || new Set<string>();

    return (allResults as LessonQuizResultSummary[])
      .filter((result) => lessonIds.has(result.lessonId))
      .sort((a, b) => {
        const aTime = new Date(a.finishedAt || a.endsAt || a.startedAt).getTime();
        const bTime = new Date(b.finishedAt || b.endsAt || b.startedAt).getTime();
        return bTime - aTime;
      });
  }, [allResults, courseLessonMap, selectedCourseId]);

  const loading =
    isStudentCoursesPending ||
    isResultsPending ||
    courseDetailQueries.some((query) => query.isPending);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sana yo\'q';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Sana yo\'q';

    return `${date.getDate()} ${UZBEK_MONTHS[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatSpentSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes <= 0) return `${seconds} soniya`;
    if (seconds === 0) return `${minutes} daqiqa`;
    return `${minutes} daqiqa ${seconds} soniya`;
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-bold italic animate-pulse">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 selection:bg-blue-500/30 font-sans transition-colors duration-300 pb-20">
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Natijalar tarixi
            </h1>
            <p className="text-slate-400 font-bold italic text-sm">Barcha topshirilgan testlar tahlili</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-sm font-black text-slate-900 dark:text-white">{results.length} ta test</div>
            </div>
          </div>
        </header>

        <div className="relative">
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-6 px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanlangan kurs</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[200px] sm:max-w-xs">{currentCourse?.title || 'Kursni tanlang'}</h3>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-slate-950/5 dark:bg-slate-950/20 backdrop-blur-[2px]"
                  onClick={() => setIsSelectorOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[400px] mt-4 z-50 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl p-4 space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Kursni qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500/30 outline-none text-sm font-bold text-slate-700 dark:text-white transition-all"
                    />
                  </div>

                  <div className="max-h-[350px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {filteredCourses.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-200 mx-auto" />
                        <p className="text-xs font-bold text-slate-400 italic">Hech narsa topilmadi</p>
                      </div>
                    ) : (
                      filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setIsSelectorOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${selectedCourseId === course.id
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                            }`}
                        >
                          {course.image && !brokenCourseImages[course.id] ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              onError={() =>
                                setBrokenCourseImages((prev) => ({ ...prev, [course.id]: true }))
                              }
                              className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-slate-100 dark:border-slate-700"
                            />
                          ) : (
                            <div className={`flex w-10 h-10 items-center justify-center rounded-xl border transition-all ${
                              selectedCourseId === course.id
                                ? 'border-white/20 bg-white/15 text-white'
                                : 'border-slate-100 bg-slate-50 text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400'
                            }`}>
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <h4 className="text-sm font-black uppercase italic tracking-tight">{course.title}</h4>
                            <p className={`text-[10px] font-bold ${selectedCourseId === course.id ? 'text-white/60' : 'text-slate-400 group-hover:text-blue-600'}`}>
                              {course.category}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {results.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center space-y-6 border border-slate-100 dark:border-slate-800 border-dashed">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 mx-auto transition-transform hover:rotate-12">
              <History className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Hali natijalar yo'q</h3>
              <p className="text-slate-400 font-bold italic text-sm">Ushbu kurs uchun hali birorta test topshirmagansiz.</p>
            </div>
            <button
              onClick={() => navigate(`/courses`)}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              Darslarni ko'rish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {results.map((result, idx) => (
              <motion.div
                key={result.sessionId}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedSessionId(result.sessionId)}
                className="group bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 active:scale-[0.99]"
              >
                <div className="relative w-24 h-24 shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-800" />
                    <motion.circle
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${(result.percentage / 100) * 264} 264` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      cx="48" cy="48" r="42"
                      stroke={result.percentage >= 80 ? "#10b981" : result.percentage >= 50 ? "#3b82f6" : "#ef4444"}
                      strokeWidth="8" fill="none" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white italic">{Math.round(result.percentage)}%</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight group-hover:text-blue-600 transition-colors">
                      {lessonMetaMap[result.lessonId]?.lessonName || 'Lesson Quiz'}
                    </h3>
                    <div className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-700/50">
                      ID: {result.sessionId.slice(0, 8)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sana</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{formatDate(result.finishedAt || result.endsAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vaqt</p>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                          {formatSpentSeconds(result.spentSeconds || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To'g'ri</p>
                        <p className="text-[11px] font-bold text-emerald-600">{result.correct} / {result.total}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Xato</p>
                        <p className="text-[11px] font-bold text-red-600">{result.wrong}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <History className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bo'sh</p>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{result.unanswered || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-2 shadow-sm">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedSessionId && (
          <QuizHistoryDetailModal
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
          />
        )}
      </main>
    </div>
  );
}

export default TestHistory;
