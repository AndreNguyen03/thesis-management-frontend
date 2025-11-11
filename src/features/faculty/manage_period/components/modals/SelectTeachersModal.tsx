import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
}

const mockTeachers: Teacher[] = [
  { id: "1", name: "TS. Nguyễn Văn A", department: "Khoa CNTT", email: "nguyenvana@university.edu.vn" },
  { id: "2", name: "PGS. Trần Thị B", department: "Khoa CNTT", email: "tranthib@university.edu.vn" },
  { id: "3", name: "TS. Lê Văn C", department: "Khoa CNTT", email: "levanc@university.edu.vn" },
  { id: "4", name: "TS. Phạm Thị D", department: "Khoa CNTT", email: "phamthid@university.edu.vn" },
  { id: "5", name: "GS. Hoàng Văn E", department: "Khoa CNTT", email: "hoangvane@university.edu.vn" },
];

interface SelectTeachersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectTeachersModal({ open, onOpenChange }: SelectTeachersModalProps) {
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = mockTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSave = () => {
    toast({
      title: "Thành công",
      description: `Đã chọn ${selectedTeachers.length} giảng viên bắt buộc nộp đề tài`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chọn giảng viên bắt buộc nộp</DialogTitle>
          <DialogDescription>
            Chọn các giảng viên phải nộp đề tài trong pha này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-[350px]">
              <div className="space-y-1 p-4">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-start space-x-3 rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={() => toggleTeacher(teacher.id)}
                  >
                    <Checkbox
                      checked={selectedTeachers.includes(teacher.id)}
                      onCheckedChange={() => toggleTeacher(teacher.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.department}</p>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Đã chọn: <span className="font-medium text-foreground">{selectedTeachers.length}</span> giảng viên
            </span>
            {selectedTeachers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTeachers([])}
              >
                Bỏ chọn tất cả
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Xác nhận ({selectedTeachers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}