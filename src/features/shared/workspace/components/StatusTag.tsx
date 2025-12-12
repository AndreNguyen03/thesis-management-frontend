import { CheckCircle, Clock, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: string;
  type?: 'milestone' | 'subtask';
}

const getMilestoneStatusProps = (status: string) => {
  switch (status) {
    case 'Đã Hoàn thành':
      return { icon: CheckCircle, className: 'status-completed', text: 'Đã Hoàn thành' };
    case 'Đang Chờ Duyệt':
      return { icon: Clock, className: 'status-pending', text: 'Đang Chờ Duyệt' };
    case 'Đang Tiến hành':
      return { icon: Clock, className: 'status-progress', text: 'Đang Tiến hành' };
    case 'Quá Hạn':
      return { icon: XCircle, className: 'status-overdue', text: 'Quá Hạn' };
    default:
      return { icon: Clock, className: 'bg-muted text-muted-foreground', text: 'Mới' };
  }
};

const getSubtaskStatusProps = (status: string) => {
  switch (status) {
    case 'Done':
      return { icon: CheckCircle, className: 'status-completed', text: 'Done' };
    case 'In Progress':
      return { icon: Zap, className: 'status-progress', text: 'In Progress' };
    case 'Todo':
    default:
      return { icon: Clock, className: 'bg-muted text-muted-foreground', text: 'Todo' };
  }
};

export const StatusTag = ({ status, type = 'milestone' }: StatusTagProps) => {
  const { icon: Icon, className, text } = type === 'milestone' 
    ? getMilestoneStatusProps(status) 
    : getSubtaskStatusProps(status);
  
  return (
    <div className={cn('status-badge', className)}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  );
};

export { getMilestoneStatusProps, getSubtaskStatusProps };
