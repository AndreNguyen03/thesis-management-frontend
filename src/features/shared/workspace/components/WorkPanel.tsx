import React, { useState } from 'react';
import { ListChecks, BarChart3, FolderOpen } from 'lucide-react';
import { MilestonePanel } from './MilestonePanel';
import { ProgressPanel } from './ProgressPanel';
import { DocumentsPanel } from './DocumentsPanel';
import { cn } from '@/lib/utils';

interface Milestone {
  id: number;
  title: string;
  dueDate: string;
  progress: number;
  status: string;
  submission?: {
    date: string;
    files: { name: string; size: string }[];
    score: number | null;
    feedback: string;
  } | null;
}

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

interface WorkPanelProps {
  milestones: Milestone[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  totalProgress: number;
  updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void;
}

type TabType = 'milestone' | 'progress' | 'documents';

export const WorkPanel = ({ milestones, tasks, setTasks, totalProgress, updateMilestone }: WorkPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('milestone');

  const tabs = [
    { id: 'milestone' as TabType, label: 'Milestone', icon: ListChecks },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'documents' as TabType, label: 'Tài liệu', icon: FolderOpen },
  ];

  return (
    <div className="h-full flex flex-col bg-work">
      {/* Tab Header */}
      <div className="flex border-b border-border bg-work-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'work-tab flex items-center gap-2',
              activeTab === tab.id && 'work-tab-active'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'milestone' && (
          <MilestonePanel
            milestones={milestones}
            totalProgress={totalProgress}
            updateMilestone={updateMilestone}
          />
        )}
        {activeTab === 'progress' && (
          <ProgressPanel
            tasks={tasks}
            setTasks={setTasks}
            milestones={milestones}
            totalProgress={totalProgress}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsPanel />
        )}
      </div>
    </div>
  );
};
