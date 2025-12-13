import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  status: string;
  size?: 'sm' | 'md';
}

export const ProgressBar = ({ progress, status, size = 'md' }: ProgressBarProps) => {
  const getColorClass = () => {
    switch (status) {
      case 'Đã Hoàn thành':
        return 'bg-success';
      case 'Đang Chờ Duyệt':
        return 'bg-info';
      case 'Quá Hạn':
        return 'bg-destructive';
      default:
        return 'bg-warning';
    }
  };

  return (
    <div className={cn('progress-bar', size === 'sm' ? 'h-1.5' : 'h-2')}>
      <div
        className={cn('progress-bar-fill', getColorClass())}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
