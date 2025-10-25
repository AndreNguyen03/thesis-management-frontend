import { Badge } from "@/components/ui/badge";

type StatusType = "open" | "in-progress" | "completed" | "pending";

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig = {
  open: {
    label: "Đang mở",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  "in-progress": {
    label: "Đang thực hiện",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  pending: {
    label: "Chờ phê duyệt",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
