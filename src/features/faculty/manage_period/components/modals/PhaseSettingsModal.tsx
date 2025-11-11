import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, Save } from "lucide-react";

interface PhaseSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: number;
}

export function PhaseSettingsModal({ open, onOpenChange, phase }: PhaseSettingsModalProps) {
  const isPhase1 = phase === 1;
  const isPhase2 = phase === 2;
  const isPhase4 = phase === 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Thiết lập cho Pha {phase}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ========== THIẾT LẬP THỜI GIAN ========== */}
          <section className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base">Thiết lập thời gian</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Chọn thời gian bắt đầu và kết thúc cho Pha {phase}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 w-full"
              />
              <input
                type="datetime-local"
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <Button variant="default" size="sm">Lưu thời gian</Button>
          </section>

          {/* ========== GIẢNG VIÊN ========== */}
          {isPhase1 && (
            <section className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Giảng viên bắt buộc nộp</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Chọn giảng viên bắt buộc phải nộp đề tài trong pha này.
              </p>
              <Button variant="outline" size="sm">Chọn giảng viên</Button>
            </section>
          )}

          {/* ========== THÔNG BÁO ========== */}
          {(isPhase1 || isPhase2) && (
            <section className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Gửi thông báo</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Gửi thông báo cho {isPhase1 ? "giảng viên" : "sinh viên"} trong pha này.
              </p>
              <div className="flex flex-wrap gap-2">
                {isPhase1 && (
                  <Button variant="outline" size="sm">
                    Thông báo Giảng viên
                  </Button>
                )}
                {isPhase2 && (
                  <Button variant="outline" size="sm">
                    Thông báo Sinh viên
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* ========== LƯU VÀO THƯ VIỆN SỐ ========== */}
          {isPhase4 && (
            <section className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Lưu vào Thư viện số</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sau khi hoàn tất, lưu toàn bộ đề tài vào thư viện số để tra cứu sau này.
              </p>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Lưu vào Thư viện số
              </Button>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
