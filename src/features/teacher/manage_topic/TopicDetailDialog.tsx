import { Topic } from "@/types/topic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Users, BookOpen, User } from "lucide-react";

interface TopicDetailDialogProps {
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopicDetailDialog({ topic, open, onOpenChange }: TopicDetailDialogProps) {
  if (!topic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
          <DialogDescription>Chi tiết thông tin đề tài</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <StatusBadge status={topic.status} />
            {topic.type && (
              <Badge variant="outline" className="bg-secondary/50">
                {topic.type}
              </Badge>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Lĩnh vực</div>
                <div className="text-base">{topic.field}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Số lượng đăng ký</div>
                <div className="text-base">
                  {topic.registrations.current} / {topic.registrations.max} sinh viên
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Hạn cuối đăng ký</div>
                <div className="text-base">
                  {format(parseISO(topic.deadline), "dd/MM/yyyy", { locale: vi })}
                </div>
              </div>
            </div>

            {topic.coAdvisor && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Giảng viên đồng hướng dẫn</div>
                  <div className="text-base">{topic.coAdvisor}</div>
                </div>
              </div>
            )}

            {topic.description && (
              <div className="pt-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">Mô tả đề tài</div>
                <div className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">
                  {topic.description}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Ngày tạo: {format(parseISO(topic.createdAt), "dd/MM/yyyy", { locale: vi })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
