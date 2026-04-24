import { useState, useEffect } from 'react';
import { ChevronLeft, Check, X, Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { testApi, SessionDetail } from '../../api/module-tests/testApi';

export default function TestDetail() {
   const { sessionId } = useParams();
   const navigate = useNavigate();
   const [detail, setDetail] = useState<SessionDetail | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function fetchDetail() {
         if (!sessionId) return;
         try {
            setLoading(true);
            const data = await testApi.getResultDetail(sessionId);
            setDetail(data);
         } catch (error) {
            console.error('Failed to fetch test detail:', error);
         } finally {
            setLoading(false);
         }
      }
      fetchDetail();
   }, [sessionId]);

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('uz-UZ', {
         day: 'numeric',
         month: 'long',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
               <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
         </div>
      );
   }

   if (!detail) {
      return (
         <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
               <div className="text-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Ma'lumot topilmadi</h2>
                  <button onClick={() => navigate('/test-history')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Tarixga qaytish</button>
               </div>
            </div>
         </div>
      );
   }

   const { summary, questions } = detail;

   return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 selection:bg-blue-500/30 font-sans transition-colors duration-300">
         <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
            <button onClick={() => navigate('/test-history')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
               <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-blue-50 transition-all">
                  <ChevronLeft className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">Tarixga qaytish</span>
            </button>

            <section className="bg-white dark:bg-slate-900 rounded-[48px] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center border-8 border-blue-500 rounded-full">
                      <span className="text-3xl font-black text-slate-900 dark:text-white italic">{Math.round(summary.percentage)}%</span>
                  </div>
                  <div className="flex-1 space-y-6 text-center md:text-left">
                     <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{summary.moduleName}</h2>
                     <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs font-bold"><Calendar className="w-4 h-4" />{formatDate(summary.finishedAt)}</div>
                        <div className="flex items-center gap-1.5 text-xs font-bold"><Clock className="w-4 h-4" />{summary.spentSeconds ? Math.floor(summary.spentSeconds / 60) : summary.durationMinutes} daqiqa</div>
                     </div>
                     <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase">To'g'ri</span><div className="text-2xl font-black text-emerald-500">{summary.correct}</div></div>
                        <div className="space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase">Xato</span><div className="text-2xl font-black text-red-500">{summary.wrong}</div></div>
                        <div className="space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase">Bo'sh</span><div className="text-2xl font-black text-slate-400">{summary.unanswered}</div></div>
                        <div className="space-y-1"><span className="text-[10px] font-black text-slate-400 uppercase">Jami</span><div className="text-2xl font-black text-slate-900 dark:text-white">{summary.total}</div></div>
                     </div>
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-widest pl-2">Savollar tahlili</h3>
               <div className="space-y-4">
                  {questions.map((q, idx) => (
                     <div key={idx} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-start gap-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${q.correct ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{idx + 1}</div>
                              <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">{q.questionText}</h4>
                           </div>
                           {q.correct ? <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"><Check className="w-5 h-5" /></div> : <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"><X className="w-5 h-5" /></div>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {[{ id: 'A', text: q.optionA }, { id: 'B', text: q.optionB }, { id: 'C', text: q.optionC }, { id: 'D', text: q.optionD }].map(opt => {
                              const isSelected = q.selectedOption === opt.id;
                              const isCorrect = q.correctOption === opt.id;
                              let styles = "bg-slate-50 dark:bg-slate-800/50 border-slate-100 text-slate-700";
                              if (isSelected) styles = "bg-red-50 border-red-200 text-red-700";
                              if (isCorrect) styles = "bg-emerald-50 border-emerald-200 text-emerald-700";
                              if (isSelected && isCorrect) styles = "bg-emerald-600 border-emerald-600 text-white";
                              return (
                                 <div key={opt.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${styles}`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border ${isSelected && isCorrect ? 'bg-white text-emerald-600' : 'bg-white dark:bg-slate-700'}`}>{opt.id}</div>
                                    <span className="font-bold text-sm">{opt.text}</span>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         </main>
      </div>
   );
}
