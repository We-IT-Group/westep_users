import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Check, Plus, Clock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './Badge';
import { PriceDisplay } from './PriceDisplay';
import { CoursePurchaseModule } from '../components/coursePurchase/types';

interface PurchaseModuleItemProps {
  module: CoursePurchaseModule;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: (id: string, isPurchased: boolean) => void;
  onExpand: (id: string) => void;
  modulePrice: number;
}

export const PurchaseModuleItem: React.FC<PurchaseModuleItemProps> = ({
  module,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
  modulePrice
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-[24px] border transition-all duration-300 overflow-hidden ${
        module.isPurchased
          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60'
          : isSelected
            ? 'bg-white dark:bg-slate-900 border-blue-500/40 shadow-xl shadow-blue-500/5'
            : 'bg-white/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
      }`}
    >
      <div 
        onClick={() => onToggle(module.id, !!module.isPurchased)}
        className={`flex items-center gap-5 p-5 ${!module.isPurchased ? 'cursor-pointer' : ''}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
          module.isPurchased
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
            <h3 className={`text-[16px] font-bold tracking-tight transition-colors ${
              module.isPurchased ? 'text-slate-500 dark:text-slate-500' : isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'
            }`}>
              {module.title}
            </h3>
            <div className="flex items-center gap-4">
              {module.isPurchased ? (
                <Badge variant="emerald">Sotib olingan</Badge>
              ) : (
                <span className={`text-[16px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400 opacity-60'}`}>
                  <PriceDisplay price={modulePrice} />
                </span>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(module.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2.5 Soat</span>
            <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> {module.lessons.length} Dars</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden"
          >
            <div className="p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Mavzular ro'yxati</p>
              {module.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between group/lesson">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 opacity-40 group-hover/lesson:scale-150 transition-transform" />
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{lesson.title}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
