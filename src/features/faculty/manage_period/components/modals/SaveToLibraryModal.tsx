import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SaveToLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToLibraryModal({ open, onOpenChange }: SaveToLibraryModalProps) {
  const [includeReports, setIncludeReports] = useState(true);
  const [includeSourceCode, setIncludeSourceCode] = useState(true);
  const [includePresentation, setIncludePresentation] = useState(false);
  const [makePublic, setMakePublic] = useState(true);

  const handleSave = () => {
    toast({
      title: "Thành công",
      description: "Đã lưu 72 đề tài vào thư viện số",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Lưu vào Thư viện số</DialogTitle>
          <DialogDescription>
            Lưu trữ các đề tài đã hoàn thành vào thư viện số của trường
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Thống kê đợt đăng ký:</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li>Tổng số đề tài hoàn thành: <strong>72</strong></li>
                  <li>Đã chấm điểm: <strong>68</strong></li>
                  <li>Chờ chấm điểm: <strong>4</strong></li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base">Nội dung lưu trữ</Label>
            
            <div className="space-y-3 ml-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reports"
                  checked={includeReports}
                  onCheckedChange={(checked) => setIncludeReports(checked as boolean)}
                />
                <label
                  htmlFor="reports"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Báo cáo tốt nghiệp (bắt buộc)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="source"
                  checked={includeSourceCode}
                  onCheckedChange={(checked) => setIncludeSourceCode(checked as boolean)}
                />
                <label
                  htmlFor="source"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mã nguồn / sản phẩm
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="presentation"
                  checked={includePresentation}
                  onCheckedChange={(checked) => setIncludePresentation(checked as boolean)}
                />
                <label
                  htmlFor="presentation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Slide thuyết trình
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-md border p-4">
            <Label className="text-base">Quyền truy cập</Label>
            
            <div className="flex items-center space-x-2 ml-2">
              <Checkbox
                id="public"
                checked={makePublic}
                onCheckedChange={(checked) => setMakePublic(checked as boolean)}
              />
              <label
                htmlFor="public"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Công khai cho sinh viên và giảng viên xem
              </label>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Lưu ý:</strong> Sau khi lưu vào thư viện số, đợt đăng ký sẽ được đánh dấu là hoàn thành 
              và không thể chỉnh sửa.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Xác nhận lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}