import { useState } from "react";
import { Topic } from "@/types/topic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Edit, AlertCircle, Users } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import { TopicDetailDialog } from "./TopicDetailDialog";
import { TopicEditDialog } from "./TopicEditDialog";

interface TopicsTableProps {
  topics: Topic[];
}

export function TopicsTable({ topics }: TopicsTableProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getDeadlineStatus = (deadline: string) => {
    const daysUntil = differenceInDays(parseISO(deadline), new Date());
    if (daysUntil < 0) return { color: "text-destructive", label: "Quá hạn" };
    if (daysUntil <= 7) return { color: "text-warning", label: "Sắp đến hạn" };
    return { color: "text-foreground", label: "" };
  };

  const handleViewTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setDetailDialogOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setEditDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Tên đề tài</TableHead>
              <TableHead className="font-semibold">Lĩnh vực</TableHead>
              <TableHead className="font-semibold">Loại</TableHead>
              <TableHead className="font-semibold">Đăng ký</TableHead>
              <TableHead className="font-semibold">Hạn cuối</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Không có đề tài nào
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => {
                const deadlineStatus = getDeadlineStatus(topic.deadline);
                const isOverRegistered = topic.registrations.current > topic.registrations.max;

                return (
                  <TableRow key={topic.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{topic.title}</div>
                        {topic.coAdvisor && (
                          <div className="text-sm text-muted-foreground">
                            Đồng HD: {topic.coAdvisor}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{topic.field}</TableCell>
                    <TableCell>
                      {topic.type && (
                        <Badge variant="outline" className="bg-secondary/50">
                          {topic.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className={isOverRegistered ? "text-warning font-medium" : ""}>
                                {topic.registrations.current}/{topic.registrations.max}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {topic.registrations.current} đăng ký / {topic.registrations.max} tối đa
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {isOverRegistered && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-warning" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vượt quá số lượng tối đa</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className={deadlineStatus.color}>
                          {format(parseISO(topic.deadline), "dd/MM/yyyy", { locale: vi })}
                        </div>
                        {deadlineStatus.label && (
                          <div className="text-xs text-warning font-medium">
                            {deadlineStatus.label}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={topic.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewTopic(topic)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết đề tài</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditTopic(topic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa thông tin đề tài</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TopicDetailDialog
        topic={selectedTopic}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      
      <TopicEditDialog
        topic={selectedTopic}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </TooltipProvider>
  );
}
