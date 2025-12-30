"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2 } from "lucide-react"

interface TopicsInDefenseMilestone {
  _id: string
  titleVN: string
  titleEng: string
  description: string
  type: string
  majorId: string
  finalProduct?: {
    thesisReport: {
      fileName: string
      fileUrl: string
      size: number
    }
  }
  isPublishedToLibrary: boolean
  allowManualApproval: boolean
  updatedAt: Date
  currentStatus: string
  defenseResult?: {
    finalScore: number
    gradeText: string
    councilName: string
  }
  lecturers: Array<{
    _id: string
    fullName: string
  }>
  students: Array<{
    _id: string
    fullName: string
  }>
}

interface TopicsTableProps {
  topics: TopicsInDefenseMilestone[]
  onScore?: (topicId: string) => void
  onDownload?: (topicId: string) => void
  onDelete?: (topicId: string) => void
  isLoading?: boolean
}

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "outline"
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    case "submitted":
      return "secondary"
    default:
      return "outline"
  }
}

const getGradeBadgeVariant = (grade?: string) => {
  if (!grade) return "outline"
  switch (grade.toLowerCase()) {
    case "xuất sắc":
    case "excellent":
      return "default"
    case "giỏi":
    case "good":
      return "secondary"
    case "khá":
    case "fair":
      return "outline"
    default:
      return "outline"
  }
}

export function TopicsTable({ topics, onScore, onDownload, onDelete, isLoading = false }: TopicsTableProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Đang tải dữ liệu...</div>
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">Không có đề tài nào để hiển thị</div>
    )
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[30%] font-semibold text-foreground">Tiêu đề đề tài</TableHead>
            <TableHead className="w-[15%] font-semibold text-foreground">Sinh viên</TableHead>
            <TableHead className="w-[15%] font-semibold text-foreground">Giảng viên</TableHead>
            <TableHead className="w-[12%] font-semibold text-foreground">Trạng thái</TableHead>
            <TableHead className="w-[12%] font-semibold text-foreground">Xếp loại</TableHead>
            <TableHead className="w-[16%] text-right font-semibold text-foreground">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic._id} className="hover:bg-muted/50 transition-colors">
              {/* Topic Title */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm leading-tight text-foreground">{topic.titleVN}</p>
                  <p className="text-xs text-muted-foreground">{topic.titleEng}</p>
                </div>
              </TableCell>

              {/* Students */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1">
                  {topic.students && topic.students.length > 0 ? (
                    topic.students.map((student) => (
                      <span key={student._id} className="text-sm text-foreground">
                        {student.fullName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Chưa có sinh viên</span>
                  )}
                </div>
              </TableCell>

              {/* Lecturers */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1">
                  {topic.lecturers && topic.lecturers.length > 0 ? (
                    topic.lecturers.map((lecturer) => (
                      <span key={lecturer._id} className="text-sm text-foreground">
                        {lecturer.fullName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Chưa có giảng viên</span>
                  )}
                </div>
              </TableCell>

              {/* Status */}
              <TableCell className="align-top py-4">
                <Badge variant={getStatusBadgeVariant(topic.currentStatus)}>
                  {topic.currentStatus || "Chưa xác định"}
                </Badge>
              </TableCell>

              {/* Defense Result / Grade */}
              <TableCell className="align-top py-4">
                {topic.defenseResult ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      {topic.defenseResult.finalScore?.toFixed(1)}
                    </div>
                    <Badge variant={getGradeBadgeVariant(topic.defenseResult.gradeText)}>
                      {topic.defenseResult.gradeText || "Chưa xếp loại"}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Chưa chấm</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="align-top py-4">
                <div className="flex items-center justify-end gap-2">
                  {!topic.defenseResult && onScore && (
                    <Button variant="outline" size="sm" onClick={() => onScore(topic._id)} className="text-xs">
                      Chấm điểm
                    </Button>
                  )}
                  {topic.finalProduct?.thesisReport && onDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(topic._id)}
                      title={`Tải ${topic.finalProduct.thesisReport.fileName}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(topic._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
