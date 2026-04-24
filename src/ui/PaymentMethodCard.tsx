import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PaymentProvider } from '../components/coursePurchase/types';

interface PaymentMethodCardProps {
  provider: PaymentProvider;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  provider,
  isSelected,
  onSelect
}) => {
  const { id, name, color, logo } = provider;
  
  return (
    <button
      onClick={() => onSelect(id)}
      className={`group relative flex flex-col items-center gap-3 p-5 rounded-[24px] border-2 transition-all duration-500 overflow-hidden ${
        isSelected 
          ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-900/5' 
          : 'border-slate-50 dark:border-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700'
      }`}
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} shadow-xl p-2.5 transition-transform group-hover:scale-110 duration-500`}>
        {logo ? (
          <img src={logo} alt={name} className="w-full h-full object-contain brightness-0 invert" />
        ) : (
          <span className="text-white font-black uppercase text-xs">{name.slice(0,2)}</span>
        )}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
        {name}
      </span>
      {isSelected && (
        <motion.div layoutId="payment-active" className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3 h-3 text-white stroke-[4px]" />
        </motion.div>
      )}
    </button>
  );
};
