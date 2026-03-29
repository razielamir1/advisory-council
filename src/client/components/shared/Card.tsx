import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  glowColor?: string;
}

export default function Card({ children, hoverable = false, glowColor, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-6 transition-all duration-300 ${
        hoverable ? 'cursor-pointer hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600/80 hover:bg-gray-50 dark:hover:bg-gray-800/70' : ''
      } ${glowColor ? `hover:shadow-lg hover:shadow-[${glowColor}]/10` : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
