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
  const { id, name, logo, disabled } = provider;
  
  return (
    <button
      onClick={() => !disabled && onSelect(id)}
      className={`group relative flex min-h-[118px] flex-col items-center justify-center overflow-hidden rounded-[24px] border p-4 transition-all duration-300 ${
        isSelected 
          ? 'border-blue-600 bg-blue-50/60 shadow-[0_16px_40px_-24px_rgba(37,99,235,0.55)] dark:bg-blue-900/10' 
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
      }`}
      disabled={disabled}
      type="button"
    >
      {logo ? (
        <img src={logo} alt={name} className="h-14 w-full object-contain" />
      ) : (
        <span className="text-base font-black uppercase tracking-[0.12em] text-slate-900 dark:text-white">{name}</span>
      )}
      {!logo && disabled && (
        <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Tez orada
        </span>
      )}
      {isSelected && (
        <motion.div layoutId="payment-active" className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3 h-3 text-white stroke-[4px]" />
        </motion.div>
      )}
      {disabled && logo && (
        <span className="absolute bottom-2 right-3 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Tez orada
        </span>
      )}
    </button>
  );
};
