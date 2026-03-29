import type { Domain } from '../../../shared/types';

interface DomainCardProps {
  domain: Domain;
  selected: boolean;
  onClick: () => void;
}

export default function DomainCard({ domain, selected, onClick }: DomainCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative text-right p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.03] shadow-lg shadow-indigo-500/10'
          : 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:scale-[1.01]'
      }`}
    >
      <div className="text-3xl mb-2">{domain.icon}</div>
      <div className="text-gray-900 dark:text-white font-semibold text-sm mb-1">{domain.nameHe}</div>
      <div className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed">{domain.description}</div>
      {selected && (
        <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
