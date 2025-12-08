import type { RegistrationPeriod } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Clock, Info } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface BeforePhaseNoticeProps {
  period: RegistrationPeriod;
}

export function BeforePhaseNotice({ period }: BeforePhaseNoticeProps) {
  const { startDate, name } = period;
  const timeUntilOpen = formatDistanceToNow(startDate, { locale: vi, addSuffix: true });

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-lg w-full border-warning/30 bg-warning/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-warning/10">
            <CalendarClock className="h-12 w-12 text-warning" />
          </div>
          <CardTitle className="text-xl">Pha đăng ký chưa mở</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Pha đăng ký <span className="font-medium text-foreground">"{name}"</span> sẽ được mở {timeUntilOpen}.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Clock className="h-4 w-4" />
            <span>
              Thời gian mở: {format(startDate, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 text-left">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Bạn có thể xem lại đề tài đã đăng ký từ các kỳ trước trong tab "Đã đăng ký" nếu có.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
