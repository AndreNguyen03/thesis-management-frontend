"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Download, Clock } from "lucide-react"
import type { DefenseMilestoneDto, TopicAssignment } from "@/models/defenseCouncil.model"
import type { MiniPeriod } from "@/models/period.model"
interface ContextData {
    defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
    periodInfo: MiniPeriod
    name: string // VD: "Hội đồng 1 - Phòng E03.2"
    location: string // Phòng bảo vệ
    scheduledDate: Date // Thời gian bảo vệ
    topic: TopicAssignment
}
interface CouncilMinutesModalProps {
  isOpen: boolean
  onClose: () => void
  	context: ContextData
}

export function CouncilMinutesModal({ isOpen, onClose }: CouncilMinutesModalProps) {
  const councilData = {
    batch: "Đợt 1",
    academicYear: "2023-2024",
    faculty: "Khoa Công nghệ Thông tin",
    trainingSystem: "Chương trình đại trà",
    meeting: {
      startTime: "08:00",
      date: "15/01/2024",
      room: "Phòng A207",
    },
    councilMembers: [
      { name: "TS. Trần Văn X", role: "Chủ tịch", sign: "✓" },
      { name: "ThS. Nguyễn Thị Y", role: "Thư ký", sign: "✓" },
      { name: "TS. Lê Minh Z", role: "Ủy viên", sign: "✓" },
    ],
    thesisInfo: [
      {
        stt: 1,
        student: "Nguyễn Văn A",
        id: "20520001",
        title: "Xây dựng hệ thống quản lý học tập trực tuyến",
        advisor: "TS. Trần Văn X",
        reviewer: "ThS. Nguyễn Thị Y",
      },
    ],
    conclusion: {
      students: [
        {
          stt: 1,
          name: "Nguyễn Văn A",
          advisorScore: 8.5,
          reviewerScore: 8.3,
          chairmanScore: 8.4,
          secretaryScore: 8.5,
          memberScore: 8.2,
          totalScore: 8.38,
        },
      ],
    },
  }

  const calculateTotalScore = (scores: {
    advisorScore: number
    reviewerScore: number
    chairmanScore: number
    secretaryScore: number
    memberScore: number
  }) => {
    // Formula: (CTHĐ + TKHĐ + CBHD*2 + CBPB*2) / 6
    return (
      (scores.chairmanScore + scores.secretaryScore + scores.advisorScore * 2 + scores.reviewerScore * 2) /
      6
    ).toFixed(2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border-border bg-card">
        <DialogHeader className="sticky top-0 bg-card pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Biên Bản Hội Đồng Khóa Luận Tốt Nghiệp
          </DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">KLTN-8 | Đại học Quốc gia TP. HCM</p>
        </DialogHeader>

        <Separator className="bg-border" />

        {/* Meeting Info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">ĐỢT / NĂM HỌC</p>
            <p className="mt-1 font-medium text-foreground">
              {councilData.batch} - {councilData.academicYear}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground">KHOA / HỆ ĐÀO TẠO</p>
            <p className="mt-1 font-medium text-foreground">{councilData.faculty}</p>
          </div>
        </div>

        {/* Time and Location */}
        <Card className="border-border bg-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">I. THỜI GIAN - ĐỊA ĐIỂM</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded bg-secondary/30 p-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Thời gian bắt đầu</p>
                <p className="font-medium text-foreground">
                  {councilData.meeting.startTime} ngày {councilData.meeting.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded bg-secondary/30 p-3">
              <p className="text-xs text-muted-foreground">Địa điểm:</p>
              <p className="font-medium text-foreground">{councilData.meeting.room}</p>
            </div>
          </CardContent>
        </Card>

        {/* Council Members */}
        <Card className="border-border bg-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">II. THÀNH PHẦN HỘI ĐỒNG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {councilData.councilMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between rounded bg-secondary/30 p-3">
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {member.sign}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Thesis Information */}
        <Card className="border-border bg-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">III. THÔNG TIN ĐỀ TÀI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {councilData.thesisInfo.map((thesis, idx) => (
                <div key={idx} className="space-y-2 rounded bg-secondary/30 p-3">
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Sinh viên:</p>
                      <p className="font-medium text-foreground">
                        {thesis.student} ({thesis.id})
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">STT:</p>
                      <p className="font-medium text-foreground">{thesis.stt}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Đề tài:</p>
                    <p className="mt-1 font-medium text-foreground">{thesis.title}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Cán bộ hướng dẫn:</p>
                      <p className="font-medium text-foreground">{thesis.advisor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cán bộ phản biện:</p>
                      <p className="font-medium text-foreground">{thesis.reviewer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conclusion - Scoring Table */}
        <Card className="border-border bg-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">III. KẾT LUẬN - ĐIỂM TỔNG KẾT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="border-border">
                    <TableHead className="font-semibold text-foreground">STT</TableHead>
                    <TableHead className="font-semibold text-foreground">Họ tên</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">CBHD</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">CBPB</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">CTHĐ</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">TKHĐ</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">UVHĐ</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Tổng kết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {councilData.conclusion.students.map((student, idx) => (
                    <TableRow key={idx} className="border-border hover:bg-secondary/30">
                      <TableCell className="font-medium text-foreground">{student.stt}</TableCell>
                      <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{student.advisorScore}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{student.reviewerScore}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{student.chairmanScore}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{student.secretaryScore}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{student.memberScore}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-primary text-primary-foreground text-base font-semibold">
                          {calculateTotalScore({
                            advisorScore: student.advisorScore,
                            reviewerScore: student.reviewerScore,
                            chairmanScore: student.chairmanScore,
                            secretaryScore: student.secretaryScore,
                            memberScore: student.memberScore,
                          })}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold">Công thức:</span> (CTHĐ + TKHĐ + CBHD×2 + CBPB×2) / 6
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onClose}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Xác nhận nộp
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
