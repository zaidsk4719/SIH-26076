import React from 'react';
import { Clock } from 'lucide-react';
import { formatLastUpdated } from '../../utils/timeFormat';

interface LastUpdatedTagProps {
  timestamp?: number | string | null;
  language?: 'en' | 'hi';
  compact?: boolean;
  className?: string;
  icon?: boolean;
}

export const LastUpdatedTag: React.FC<LastUpdatedTagProps> = ({
  timestamp,
  language = 'en',
  compact = false,
  className = '',
  icon = true,
}) => {
  const text = formatLastUpdated(timestamp, language, compact);

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0 ${className}`}>
      {icon && <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
