import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface NotifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientType: "teachers" | "students";
}

export function NotifyModal({ open, onOpenChange, recipientType }: NotifyModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: `Đã gửi thông báo đến ${recipientType === "teachers" ? "giảng viên" : "sinh viên"}`,
    });
    setSubject("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Gửi thông báo đến {recipientType === "teachers" ? "giảng viên" : "sinh viên"}
          </DialogTitle>
          <DialogDescription>
            Soạn nội dung thông báo và chọn phương thức gửi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Tiêu đề</Label>
            <Input
              id="subject"
              placeholder="Nhập tiêu đề thông báo"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Nội dung</Label>
            <Textarea
              id="message"
              placeholder="Nhập nội dung thông báo chi tiết..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </div>

          <div className="space-y-3 rounded-md border p-4">
            <Label>Phương thức gửi</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Gửi email
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
              />
              <label
                htmlFor="notification"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Gửi thông báo trong hệ thống
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSend}>
            Gửi thông báo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}