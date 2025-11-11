import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Topic } from "@/models/period";
import { Calendar, User, FileText, GraduationCap, TrendingUp } from "lucide-react";

interface TopicDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
}

export function TopicDetailModal({ open, onOpenChange, topic }: TopicDetailModalProps) {
  if (!topic) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", variant: "secondary" as const },
      approved: { label: "Đã duyệt", variant: "default" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
      in_progress: { label: "Đang thực hiện", variant: "default" as const },
      paused: { label: "Tạm dừng", variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "default" as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const statusConfig = getStatusBadge(topic.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết đề tài</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6 py-4">
            {/* Topic Title & Status */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold leading-tight">{topic.title}</h3>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Mã đề tài: {topic.id}</span>
              </div>
            </div>

            <Separator />

            {/* Instructor */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                <span>Giảng viên hướng dẫn</span>
              </div>
              <p className="text-sm text-foreground pl-6">{topic.instructor}</p>
            </div>

            {/* Student (if available) */}
            {topic.student && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  <span>Sinh viên thực hiện</span>
                </div>
                <p className="text-sm text-foreground pl-6">{topic.student}</p>
              </div>
            )}

            {/* Progress (if available) */}
            {typeof topic.progress !== 'undefined' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>Tiến độ thực hiện</span>
                </div>
                <div className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{topic.progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Score (if available) */}
            {typeof topic.score !== 'undefined' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>Điểm trung bình</span>
                </div>
                <p className="text-sm text-foreground pl-6 font-semibold text-lg">
                  {topic.score}/10
                </p>
              </div>
            )}

            {/* Registration Count (if available) */}
            {typeof topic.registrationCount !== 'undefined' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  <span>Số lượng đăng ký</span>
                </div>
                <p className="text-sm text-foreground pl-6">{topic.registrationCount} sinh viên</p>
              </div>
            )}

            {/* Submitted Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>Thời gian nộp</span>
              </div>
              <p className="text-sm text-foreground pl-6">
                {new Date(topic.submittedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>

            {/* Report File (if available) */}
            {topic.reportFile && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  <span>File báo cáo</span>
                </div>
                <div className="pl-6">
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {topic.reportFile}
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                <span>Mô tả đề tài</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                Đây là mô tả chi tiết về đề tài. Nội dung này sẽ được cập nhật từ dữ liệu thực tế.
                Bao gồm mục tiêu, phạm vi, công nghệ sử dụng và kết quả mong đợi của đề tài.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}