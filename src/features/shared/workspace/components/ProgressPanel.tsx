import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle, Clock, Zap, LayoutDashboard } from 'lucide-react';
import { StatusTag, getSubtaskStatusProps } from './StatusTag';
import { ProgressBar } from './ProgressBar';

interface Subtask {
  id: number;
  title: string;
  status: 'Todo' | 'In Progress' | 'Done';
}

interface Task {
  id: string;
  title: string;
  subtasks: Subtask[];
}

interface Milestone {
  id: number;
  title: string;
  dueDate: string;
  progress: number;
  status: string;
}

interface ProgressPanelProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  milestones: Milestone[];
  totalProgress: number;
}

export const ProgressPanel = ({ tasks, setTasks, milestones, totalProgress }: ProgressPanelProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate milestone stats
  const milestoneStats = useMemo(() => {
    const stats = { completed: 0, pendingReview: 0, inProgress: 0, overdue: 0, total: milestones.length };
    milestones.forEach(m => {
      switch (m.status) {
        case 'Đã Hoàn thành': stats.completed++; break;
        case 'Đang Chờ Duyệt': stats.pendingReview++; break;
        case 'Đang Tiến hành': stats.inProgress++; break;
        case 'Quá Hạn': stats.overdue++; break;
      }
    });
    return stats;
  }, [milestones]);

  // Calculate task stats
  const taskStats = useMemo(() => {
    const stats = { todo: 0, inProgress: 0, done: 0, total: 0 };
    tasks.forEach(task => {
      task.subtasks.forEach(subtask => {
        stats.total++;
        switch (subtask.status) {
          case 'Done': stats.done++; break;
          case 'In Progress': stats.inProgress++; break;
          case 'Todo': stats.todo++; break;
        }
      });
    });
    return stats;
  }, [tasks]);

  // Find next due date
  const nextDueDate = useMemo(() => {
    const upcoming = milestones
      .filter(m => m.status !== 'Đã Hoàn thành' && m.status !== 'Quá Hạn')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return upcoming.length > 0 ? upcoming[0].dueDate : 'Chưa xác định';
  }, [milestones]);

  const calculateTaskProgress = (subtasks: Subtask[]) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const doneCount = subtasks.filter(s => s.status === 'Done').length;
    return Math.round((doneCount / subtasks.length) * 100);
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      title: newTaskTitle,
      subtasks: [
        { id: Date.now(), title: 'Bước 1: Phân tích yêu cầu', status: 'Todo' },
        { id: Date.now() + 1, title: 'Bước 2: Triển khai', status: 'Todo' },
        { id: Date.now() + 2, title: 'Bước 3: Kiểm thử', status: 'Todo' },
      ],
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskTitle('');
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string; value: string | number; icon: React.ElementType; colorClass: string }) => (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-work space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="Tiến độ Dự án" 
          value={`${totalProgress}%`} 
          icon={LayoutDashboard} 
          colorClass="bg-primary/10 text-primary" 
        />
        <StatCard 
          title="Milestone Hoàn thành" 
          value={milestoneStats.completed} 
          icon={CheckCircle} 
          colorClass="bg-success/10 text-success" 
        />
        <StatCard 
          title="Công việc Đang làm" 
          value={taskStats.inProgress} 
          icon={Zap} 
          colorClass="bg-warning/10 text-warning" 
        />
        <StatCard 
          title="Hạn chót Sắp tới" 
          value={nextDueDate} 
          icon={Clock} 
          colorClass="bg-info/10 text-info" 
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-card p-4 rounded-xl border border-border">
        <h4 className="font-semibold text-foreground mb-3">Tiến độ Hoàn thành</h4>
        <ProgressBar progress={totalProgress} status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'} />
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Milestones</p>
            <p className="text-success">{milestoneStats.completed} hoàn thành</p>
            <p className="text-info">{milestoneStats.pendingReview} chờ duyệt</p>
            <p className="text-destructive">{milestoneStats.overdue} quá hạn</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Subtasks</p>
            <p className="text-success">{taskStats.done} hoàn thành</p>
            <p className="text-warning">{taskStats.inProgress} đang làm</p>
            <p className="text-muted-foreground">{taskStats.todo} chờ xử lý</p>
          </div>
        </div>
      </div>

      {/* Create New Task */}
      <div className="bg-card p-4 rounded-xl border border-primary/20">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Tạo Công Việc Mới
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tiêu đề công việc..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
          <button
            onClick={handleCreateTask}
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Tạo
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">Danh sách Công việc</h4>
        {tasks.map((task) => {
          const progress = calculateTaskProgress(task.subtasks);
          let taskStatus: 'Done' | 'In Progress' | 'Todo' = 'Todo';
          if (progress === 100) taskStatus = 'Done';
          else if (progress > 0) taskStatus = 'In Progress';

          return (
            <div key={task.id} className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-medium text-foreground">{task.title}</h5>
                <StatusTag status={taskStatus} type="subtask" />
              </div>
              <ProgressBar progress={progress} status={progress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'} size="sm" />
              <p className="text-xs text-muted-foreground mt-2">
                {progress}% ({task.subtasks.filter(s => s.status === 'Done').length}/{task.subtasks.length} subtasks)
              </p>
              
              {/* Subtasks Kanban */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {(['Todo', 'In Progress', 'Done'] as const).map(statusKey => {
                  const { className } = getSubtaskStatusProps(statusKey);
                  return (
                    <div key={statusKey} className="p-2 rounded-lg bg-secondary">
                      <p className={`text-xs font-medium mb-2 ${className.replace('status-', 'text-')}`}>
                        {statusKey} ({task.subtasks.filter(s => s.status === statusKey).length})
                      </p>
                      <div className="space-y-1">
                        {task.subtasks
                          .filter(s => s.status === statusKey)
                          .map(subtask => (
                            <div key={subtask.id} className="p-2 bg-card rounded text-xs text-foreground">
                              {subtask.title}
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
