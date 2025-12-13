import React, { useState } from 'react';
import { ChevronRight, Download, Send, XCircle, LayoutDashboard } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { ProgressBar } from './ProgressBar';
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

interface MilestonePanelProps {
  milestones: Milestone[];
  totalProgress: number;
  updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void;
}

export const MilestonePanel = ({ milestones, totalProgress, updateMilestone }: MilestonePanelProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  return (
    <div className="h-full overflow-y-auto p-6 bg-work">
      {/* Project Overview */}
      <div className="mb-6 p-5 bg-accent rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Tổng quan Dự án Nhóm</h3>
            <p className="text-sm text-muted-foreground">Tiến độ chung</p>
          </div>
          <span className="ml-auto text-2xl font-bold text-primary">{totalProgress}%</span>
        </div>
        <ProgressBar progress={totalProgress} status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'} />
      </div>

      {/* Milestones List */}
      <h3 className="text-lg font-bold text-foreground mb-4">Các Milestone chi tiết</h3>
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="milestone-card flex items-center gap-4"
            onClick={() => setSelectedMilestone(milestone)}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{milestone.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Hạn chót: <span className="font-medium">{milestone.dueDate}</span>
              </p>
              <div className="mt-2">
                <ProgressBar progress={milestone.progress} status={milestone.status} size="sm" />
              </div>
            </div>
            <StatusTag status={milestone.status} />
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </div>

      {/* Milestone Detail Drawer */}
      {selectedMilestone && (
        <>
          <div 
            className="fixed inset-0 bg-foreground/20 z-40" 
            onClick={() => setSelectedMilestone(null)} 
          />
          <MilestoneDetail
            milestone={selectedMilestone}
            onClose={() => setSelectedMilestone(null)}
            updateMilestone={updateMilestone}
          />
        </>
      )}
    </div>
  );
};

interface MilestoneDetailProps {
  milestone: Milestone;
  onClose: () => void;
  updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void;
}

const MilestoneDetail = ({ milestone, onClose, updateMilestone }: MilestoneDetailProps) => {
  const [score, setScore] = useState(milestone.submission?.score?.toString() || '');
  const [feedback, setFeedback] = useState(milestone.submission?.feedback || '');
  const [progress, setProgress] = useState(milestone.progress.toString());

  const handleSaveEvaluation = () => {
    const finalScore = score !== '' ? parseFloat(score) : undefined;
    let newStatus = milestone.status;
    if (finalScore !== undefined) {
      newStatus = 'Đã Hoàn thành';
    }
    updateMilestone(milestone.id, milestone.progress, newStatus, finalScore, feedback);
    onClose();
  };

  const handleUpdateProgress = () => {
    const newProgress = parseInt(progress, 10);
    let statusToUpdate = milestone.status;
    
    if (newProgress === 100 && statusToUpdate !== 'Đã Hoàn thành') {
      statusToUpdate = 'Đang Chờ Duyệt';
    } else if (newProgress < 100 && newProgress > 0) {
      statusToUpdate = 'Đang Tiến hành';
    }
    
    updateMilestone(milestone.id, newProgress, statusToUpdate);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{milestone.title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <XCircle className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-secondary rounded-xl mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ngày Hết hạn:</span>
            <span className="font-medium text-foreground">{milestone.dueDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tiến độ:</span>
            <span className="font-semibold text-primary">{milestone.progress}%</span>
          </div>
          <StatusTag status={milestone.status} />
          <ProgressBar progress={milestone.progress} status={milestone.status} />
        </div>

        {/* Submission Files */}
        {milestone.submission && (
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3">Tài liệu đã nộp</h4>
            <p className="text-sm text-muted-foreground mb-3">Ngày nộp: {milestone.submission.date}</p>
            <div className="space-y-2">
              {milestone.submission.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                    <button className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Evaluation Form */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Điểm số (0-10)</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                  max="10"
                  placeholder="Nhập điểm"
                  className="mt-1 w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phản hồi</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Viết nhận xét..."
                  className="mt-1 w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSaveEvaluation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Lưu Đánh giá
              </button>
            </div>
          </div>
        )}

        {/* Student Progress Update */}
        <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
          <h4 className="font-semibold text-info mb-3">Cập nhật Tiến độ</h4>
          <div className="mb-4">
            <label className="text-sm text-foreground">Phần trăm hoàn thành:</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="flex-1 accent-primary"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-12 px-2 py-1 text-center rounded border border-border bg-card"
                />
                <span className="text-foreground">%</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleUpdateProgress}
            className="w-full px-4 py-2.5 bg-info text-info-foreground rounded-lg font-medium hover:bg-info/90 transition-colors"
          >
            Lưu Thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
