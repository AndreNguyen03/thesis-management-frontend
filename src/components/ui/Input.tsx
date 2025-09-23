import { cn } from '@/utils/utils';
import type { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  className?: string;
}

export function Input({ icon, error, className, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {/* Error tooltip */}
      {error && (
        <>
          <div className="absolute -left-2 inline-flex -translate-x-full items-center whitespace-nowrap rounded bg-red-400 px-3 py-2 text-xs text-white shadow-md">
            {error}
          </div>
          <span className="absolute -left-3 border-b-[10px] border-l-[13px] border-t-[10px] border-b-transparent border-l-red-400 border-t-transparent"></span>
        </>
      )}
      <div
        className={cn(
          'relative flex flex-1 items-center rounded-lg border px-3 py-2 transition-all duration-150 focus-within:ring-2',
          error ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 focus-within:ring-blue-500'
        )}
      >
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input
          {...props}
          className={cn('w-full bg-white pl-8 text-gray-900 focus:outline-none', className)}
        />
      </div>
    </div>
  );
}