import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronRight, ShieldCheck } from "lucide-react";
import { CoursePurchaseCourse, CoursePurchaseModule, PaymentProvider } from "./types";
import { Badge } from "../../ui/Badge";
import { PriceDisplay } from "../../ui/PriceDisplay";
import { PaymentMethodCard } from "../../ui/PaymentMethodCard";
import { PurchaseModuleItem } from "../../ui/PurchaseModuleItem";

export const MODULE_PRICE = 598000;
export const BULK_DISCOUNT = 0.2;

export type CoursePurchasePageProps = {
  courseId?: string;
  course: CoursePurchaseCourse;
  modules: CoursePurchaseModule[];
  paymentProviders: PaymentProvider[];
  withHeader?: boolean;
  HeaderComponent?: React.ComponentType;
  modulePrice?: number;
  bulkDiscount?: number;
  onSubmit?: (payload: {
    courseId: string;
    selectedModules: string[];
    paymentMethod: string;
    pricing: {
      totalPrice: number;
      originalPrice: number;
      hasBulkDiscount: boolean;
    };
  }) => void;
};

export function CoursePurchasePage({
  courseId,
  course,
  modules: courseModules,
  paymentProviders: providers,
  withHeader = false,
  HeaderComponent,
  modulePrice = MODULE_PRICE,
  bulkDiscount = BULK_DISCOUNT,
  onSubmit,
}: CoursePurchasePageProps) {
  const purchaseableModules = useMemo(() => courseModules.filter(m => !m.isPurchased), [courseModules]);
  const [selectedModules, setSelectedModules] = useState<string[]>(purchaseableModules.map(m => m.id));
  const [paymentMethod, setPaymentMethod] = useState<string>(providers[0]?.id || 'payme');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const toggleModule = (id: string, isPurchased: boolean) => {
    if (isPurchased) return;
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  const toggleAll = () => {
    if (selectedModules.length === purchaseableModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(purchaseableModules.map(m => m.id));
    }
  };

  const { totalPrice, originalPrice, hasBulkDiscount } = useMemo(() => {
    const count = selectedModules.length;
    const base = count * modulePrice;
    const allNewSelected = count === purchaseableModules.length && count > 0;

    if (allNewSelected && purchaseableModules.length > 1) {
      return { totalPrice: base * (1 - bulkDiscount), originalPrice: base, hasBulkDiscount: true };
    }
    return { totalPrice: base, originalPrice: base, hasBulkDiscount: false };
  }, [selectedModules, purchaseableModules, modulePrice, bulkDiscount]);

  const handleSubmit = () => {
    if (!selectedModules.length || !onSubmit) return;
    onSubmit({
      courseId: courseId || course.id,
      selectedModules,
      paymentMethod,
      pricing: { totalPrice, originalPrice, hasBulkDiscount }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] transition-colors duration-500 selection:bg-blue-500/30 font-sans">
      {withHeader && HeaderComponent && <HeaderComponent />}

      <main className="max-w-[1300px] mx-auto px-4 sm:px-10 pt-12 sm:pt-16 pb-24 text-slate-900 dark:text-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          <div className="lg:col-span-7 space-y-12">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-8 bg-blue-600 rounded-full" />
                <Badge variant="blue">{course.category} • Professional Series</Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight">
                {course.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                Yuqori darajadagi bilim va amaliy tajriba. Kurs doirasida barcha modullarni professional darajada o'zlashtiring.
              </p>
            </motion.div>

            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    O'quv rejasi
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Sotib olinmagan modullarni belgilang</p>
                </div>
                {purchaseableModules.length > 0 && (
                  <button
                    onClick={toggleAll}
                    className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 text-slate-600 dark:text-slate-300"
                  >
                    {selectedModules.length === purchaseableModules.length ? 'Barchasini bekor qilish' : 'Qolganini tanlash'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {courseModules.map((module) => (
                  <PurchaseModuleItem
                    key={module.id}
                    module={module}
                    isSelected={selectedModules.includes(module.id)}
                    isExpanded={expandedModule === module.id}
                    onToggle={toggleModule}
                    onExpand={toggleExpand}
                    modulePrice={modulePrice}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[44px] border border-slate-200/50 dark:border-slate-800/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] p-8 sm:p-12 space-y-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Hisob-kitob</h3>
                  <Badge variant="blue">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Secure
                    </div>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end gap-4 flex-wrap">
                    <AnimatePresence mode="wait">
                      <motion.span key={totalPrice} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                        <PriceDisplay price={totalPrice} />
                      </motion.span>
                    </AnimatePresence>
                    {hasBulkDiscount && (
                      <div className="flex flex-col mb-2">
                        <PriceDisplay price={originalPrice} isStrikethrough className="text-xl text-slate-300 dark:text-slate-700 font-bold leading-none" />
                        <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mt-1">To'liq xarid -20%</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.1em] leading-relaxed">
                    {selectedModules.length} ta yangi modul tanlandi. {hasBulkDiscount ? 'Chegirma hisoblandi.' : purchaseableModules.length > 1 ? "Barcha modullarni oling va 20% tejang." : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-5 relative z-10 pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">To'lov shakli</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {providers.map((p) => (
                    <PaymentMethodCard
                      key={p.id}
                      provider={p}
                      isSelected={paymentMethod === p.id}
                      onSelect={setPaymentMethod}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-6 relative z-10">
                <motion.button
                  whileHover={selectedModules.length > 0 ? { scale: 1.01, y: -2 } : {}}
                  whileTap={selectedModules.length > 0 ? { scale: 0.99 } : {}}
                  disabled={selectedModules.length === 0}
                  onClick={handleSubmit}
                  className={`w-full group py-6 rounded-[28px] transition-all flex items-center justify-center gap-4 px-8 ${selectedModules.length > 0
                      ? 'bg-blue-600 text-white shadow-[0_24px_48px_-12px_rgba(37,99,235,0.35)] hover:bg-blue-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <span className="text-[13px] font-bold uppercase tracking-[0.25em]">
                    {selectedModules.length > 0 ? 'Sotib olish' : 'Modul tanlang'}
                  </span>
                  {selectedModules.length > 0 && (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1.5 transition-transform duration-300">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.button>
                <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encryption</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CoursePurchasePage;
