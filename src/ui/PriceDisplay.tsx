import React from 'react';

interface PriceDisplayProps {
  price: number;
  className?: string;
  isRed?: boolean;
  isStrikethrough?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  className = '', 
  isRed = false,
  isStrikethrough = false
}) => {
  const formattedPrice = new Intl.NumberFormat('uz-UZ').format(Math.round(price)).replace(/,/g, ' ');

  return (
    <div className={`${className} ${isRed ? 'text-red-500' : ''} ${isStrikethrough ? 'line-through opacity-80 decoration-[2px]' : ''}`}>
      {formattedPrice} so'm
    </div>
  );
};
