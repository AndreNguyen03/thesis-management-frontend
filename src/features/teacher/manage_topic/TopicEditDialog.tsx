import { useState } from "react";
import { Topic } from "@/types/topic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarIcon, X, Plus, Info, Upload, Sparkles, FileCheck, Search, Check, ChevronsUpDown, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TopicEditDialogProps {
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_FIELDS = [
  "Web Development",
  "Mobile Development", 
  "Machine Learning",
  "Data Science",
  "IoT",
  "Blockchain",
  "Cloud Computing",
  "Cybersecurity",
  "Game Development",
  "AR/VR"
];

const SUGGESTED_SKILLS = [
  "React", "Angular", "Vue.js", "TypeScript", "JavaScript",
  "Python", "Java", "C++", "C#", "Go", "Rust",
  "Node.js", "Express", "Django", "Flask", "Spring Boot",
  "SQL", "MongoDB", "PostgreSQL", "Redis",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
  "Git", "CI/CD", "Agile", "Scrum"
];

const EXAMPLE_DESCRIPTION = `Ví dụ mô tả đề tài tốt:

**Mục tiêu:**
Xây dựng hệ thống quản lý sinh viên giúp nhà trường theo dõi điểm, lịch học, và thông tin cá nhân một cách hiệu quả.

**Phạm vi:**
- Module đăng nhập, phân quyền người dùng
- Quản lý thông tin sinh viên, giảng viên
- Tra cứu điểm, lịch học theo thời gian thực
- Thống kê, báo cáo theo kỳ học

**Kết quả mong đợi:**
- Website responsive hoạt động trên mọi thiết bị
- API RESTful đầy đủ tài liệu
- Báo cáo đồ án hoàn chỉnh với phân tích yêu cầu, thiết kế hệ thống, và hướng phát triển`;

export function TopicEditDialog({ topic, open, onOpenChange }: TopicEditDialogProps) {
  const [formData, setFormData] = useState<Topic | null>(topic);
  const [skills, setSkills] = useState<string[]>(topic?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [references, setReferences] = useState<{ name: string; url?: string }[]>(topic?.references || []);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(
    topic?.deadline ? new Date(topic.deadline) : undefined
  );
  const [openFieldCombo, setOpenFieldCombo] = useState(false);
  const [openSkillCombo, setOpenSkillCombo] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleAddSkill = (skill?: string) => {
    const skillToAdd = skill || skillInput.trim();
    if (skillToAdd && !skills.includes(skillToAdd)) {
      setSkills([...skills, skillToAdd]);
      setSkillInput("");
      setOpenSkillCombo(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddReference = () => {
    setReferences([...references, { name: "" }]);
  };

  const handleRemoveReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index: number, field: "name" | "url", value: string) => {
    const newRefs = [...references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setReferences(newRefs);
  };

  const handleAIOptimizeDescription = async () => {
    setAiLoading("optimize");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("AI đã tối ưu hóa mô tả đề tài!");
    setAiLoading(null);
  };

  const handleAISuggestSkills = async () => {
    setAiLoading("skills");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const suggestedSkills = ["React", "TypeScript", "Node.js"];
    setSkills([...new Set([...skills, ...suggestedSkills])]);
    toast.success("AI đã gợi ý các kỹ năng liên quan!");
    setAiLoading(null);
  };

  const handleAICheckDuplicate = async () => {
    setAiLoading("duplicate");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info("Không tìm thấy đề tài trùng lặp");
    setAiLoading(null);
  };

  const handleSaveDraft = () => {
    toast.success("Đã lưu bản nháp thành công!");
    onOpenChange(false);
  };

  const handlePublish = () => {
    const errors: Record<string, boolean> = {};
    
    if (!formData?.title?.trim()) errors.title = true;
    if (!formData?.field) errors.field = true;
    if (!formData?.type) errors.type = true;
    if (!date) errors.deadline = true;
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPublish = () => {
    toast.success("Đã đăng đề tài thành công!");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  if (!topic || !formData) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đăng đề tài mới</DialogTitle>
            <DialogDescription>Tạo đề tài cho sinh viên đăng ký trong học kỳ</DialogDescription>
          </DialogHeader>
          
          <TooltipProvider>
            <div className="space-y-6 py-4">
              {/* Thông tin cơ bản */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Thông tin cơ bản
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Thông tin bắt buộc để sinh viên hiểu rõ đề tài</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className={cn(validationErrors.title && "text-destructive")}>
                      Tên đề tài *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setValidationErrors({ ...validationErrors, title: false });
                      }}
                      placeholder="VD: Xây dựng hệ thống quản lý sinh viên"
                      className={cn(validationErrors.title && "border-destructive focus-visible:ring-destructive")}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="description">Mô tả chi tiết</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Mô tả mục tiêu, phạm vi và kết quả mong đợi của đề tài</p>
                        </TooltipContent>
                      </Tooltip>
                      <Popover open={showExample} onOpenChange={setShowExample}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Xem ví dụ
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px]" align="start">
                          <div className="space-y-2">
                            <h4 className="font-medium">Ví dụ mô tả đề tài</h4>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {EXAMPLE_DESCRIPTION}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi, kết quả mong đợi..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="field" className={cn(validationErrors.field && "text-destructive")}>
                        Lĩnh vực *
                      </Label>
                      <Popover open={openFieldCombo} onOpenChange={setOpenFieldCombo}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openFieldCombo}
                            className={cn(
                              "w-full justify-between",
                              !formData.field && "text-muted-foreground",
                              validationErrors.field && "border-destructive"
                            )}
                          >
                            {formData.field || "Chọn lĩnh vực"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm lĩnh vực..." />
                            <CommandList>
                              <CommandEmpty>Không tìm thấy lĩnh vực.</CommandEmpty>
                              <CommandGroup>
                                {AVAILABLE_FIELDS.map((field) => (
                                  <CommandItem
                                    key={field}
                                    value={field}
                                    onSelect={(currentValue) => {
                                      setFormData({ ...formData, field: currentValue });
                                      setOpenFieldCombo(false);
                                      setValidationErrors({ ...validationErrors, field: false });
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.field === field ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {field}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className={cn(validationErrors.type && "text-destructive")}>
                        Loại đề tài *
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => {
                          setFormData({ ...formData, type: value as any });
                          setValidationErrors({ ...validationErrors, type: false });
                        }}
                      >
                        <SelectTrigger className={cn(validationErrors.type && "border-destructive")}>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Đồ án">Đồ án</SelectItem>
                          <SelectItem value="Khóa luận">Khóa luận</SelectItem>
                          <SelectItem value="NCKH">NCKH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="maxRegistrations">Số lượng sinh viên *</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Số lượng sinh viên tối đa có thể đăng ký đề tài này</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={formData.registrations.max.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            registrations: { ...formData.registrations, max: parseInt(value) },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 sinh viên</SelectItem>
                          <SelectItem value="2">2 sinh viên</SelectItem>
                          <SelectItem value="3">3 sinh viên</SelectItem>
                          <SelectItem value="4">4 sinh viên</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className={cn(validationErrors.deadline && "text-destructive")}>
                          Hạn đăng ký *
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ngày cuối cùng sinh viên có thể đăng ký đề tài này</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground",
                              validationErrors.deadline && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                              setDate(newDate);
                              if (newDate) {
                                setFormData({ ...formData, deadline: format(newDate, "yyyy-MM-dd") });
                              }
                              setValidationErrors({ ...validationErrors, deadline: false });
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coAdvisor">Giảng viên đồng hướng dẫn</Label>
                    <Input
                      id="coAdvisor"
                      value={formData.coAdvisor || ""}
                      onChange={(e) => setFormData({ ...formData, coAdvisor: e.target.value })}
                      placeholder="Nhập tên giảng viên (nếu có)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Yêu cầu kỹ năng */}
              <Card>
                <CardHeader>
                  <CardTitle>Yêu cầu kỹ năng</CardTitle>
                  <CardDescription>Kỹ năng sinh viên cần có để thực hiện đề tài</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Popover open={openSkillCombo} onOpenChange={setOpenSkillCombo}>
                      <PopoverTrigger asChild>
                        <div className="flex-1 relative">
                          <Input
                            value={skillInput}
                            onChange={(e) => {
                              setSkillInput(e.target.value);
                              setOpenSkillCombo(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="VD: React, Python, SQL... (nhập hoặc chọn từ gợi ý)"
                            onFocus={() => setOpenSkillCombo(true)}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Tìm kiếm kỹ năng..." 
                            value={skillInput}
                            onValueChange={setSkillInput}
                          />
                          <CommandList>
                            <CommandEmpty>Nhấn Enter để thêm "{skillInput}"</CommandEmpty>
                            <CommandGroup heading="Kỹ năng phổ biến">
                              {SUGGESTED_SKILLS.filter(skill => 
                                !skills.includes(skill) && 
                                skill.toLowerCase().includes(skillInput.toLowerCase())
                              ).map((skill) => (
                                <CommandItem
                                  key={skill}
                                  value={skill}
                                  onSelect={() => handleAddSkill(skill)}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  {skill}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button type="button" onClick={() => handleAddSkill()} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="pl-3 pr-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tài liệu tham khảo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Tài liệu tham khảo
                  </CardTitle>
                  <CardDescription>Thêm link hoặc mô tả tài liệu để sinh viên tham khảo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {references.map((ref, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Tên tài liệu"
                          value={ref.name}
                          onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                        />
                        <Input
                          placeholder="Link (tùy chọn)"
                          value={ref.url || ""}
                          onChange={(e) => handleReferenceChange(index, "url", e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveReference(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddReference} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài liệu
                  </Button>
                </CardContent>
              </Card>

              {/* AI Tools */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Công cụ hỗ trợ AI
                  </CardTitle>
                  <CardDescription>Giúp bạn hoàn thiện đề tài nhanh hơn và chính xác hơn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAIOptimizeDescription}
                    disabled={!!aiLoading}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {aiLoading === "optimize" ? "Đang xử lý..." : "Tối ưu mô tả đề tài"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAISuggestSkills}
                    disabled={!!aiLoading}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    {aiLoading === "skills" ? "Đang xử lý..." : "Gợi ý yêu cầu kỹ năng"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAICheckDuplicate}
                    disabled={!!aiLoading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {aiLoading === "duplicate" ? "Đang kiểm tra..." : "Kiểm tra trùng lặp"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TooltipProvider>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              Lưu bản nháp
            </Button>
            <Button onClick={handlePublish}>Đăng đề tài</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng đề tài</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn đăng đề tài "{formData?.title}" cho sinh viên đăng ký không?
              Sau khi đăng, sinh viên sẽ có thể xem và đăng ký đề tài này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublish}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
