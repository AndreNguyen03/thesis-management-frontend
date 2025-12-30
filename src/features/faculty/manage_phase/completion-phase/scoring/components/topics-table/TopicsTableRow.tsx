"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Download, Trash2, CheckCircle } from "lucide-react"
import { getGradeColor, getGradeText, getStatusColor, getStatusLabel } from "@/utils/grade-helper"
import type { TopicsInDefenseMilestone } from "@/models"

interface TopicsTableRowProps {
  topic: TopicsInDefenseMilestone
  index: number
  onScore?: (topicId: string) => void
  onDownload?: (topic: TopicsInDefenseMilestone) => void
  onDelete?: (topicId: string) => void
}

export function TopicsTableRow({ topic, index, onScore, onDownload, onDelete }: TopicsTableRowProps) {
  const hasDefenseResult = !!topic.defenseResult
  const score = topic.defenseResult?.finalScore
  const gradeText = getGradeText(score)

  return (
    <tr className="border-b hover:bg-muted/30 transition-colors">
      <td className="border px-4 py-3 text-center text-sm text-muted-foreground">{index + 1}</td>
      <td className="border px-4 py-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-sm">{topic.titleVN}</p>
          <p className="text-xs text-muted-foreground">{topic.titleEng}</p>
        </div>
      </td>
      <td className="border px-4 py-3">
        <div className="space-y-1">
          {topic.students?.length > 0 ? (
            topic.students.map((student) => (
              <div key={student._id} className="text-sm">
                <p className="font-medium text-foreground">{student.fullName}</p>
                <p className="text-xs text-muted-foreground">{student.studentCode}</p>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Không có sinh viên</span>
          )}
        </div>
      </td>
      <td className="border px-4 py-3">
        <div className="space-y-1">
          {topic.lecturers?.length > 0 ? (
            topic.lecturers.map((lecturer) => (
              <div key={lecturer._id} className="text-sm">
                <p className="font-medium text-foreground">{lecturer.fullName}</p>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Không có giảng viên</span>
          )}
        </div>
      </td>
      <td className="border px-4 py-3 text-center">
        <Badge variant="outline" className={getStatusColor(topic.currentStatus)}>
          {getStatusLabel(topic.currentStatus)}
        </Badge>
      </td>
      <td className="border px-4 py-3 text-center">
        <span className={`text-sm font-semibold ${hasDefenseResult ? "text-foreground" : "text-muted-foreground"}`}>
          {score ? score.toFixed(1) : "-"}
        </span>
      </td>
      <td className="border px-4 py-3 text-center">
        <Badge variant="outline" className={getGradeColor(score)}>
          {gradeText}
        </Badge>
      </td>
      <td className="border px-4 py-3 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!hasDefenseResult && onScore && (
              <DropdownMenuItem onClick={() => onScore(topic._id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Chấm điểm
              </DropdownMenuItem>
            )}
            {topic.finalProduct?.thesisReport && onDownload && (
              <DropdownMenuItem onClick={() => onDownload(topic)}>
                <Download className="w-4 h-4 mr-2" />
                Tải báo cáo
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(topic._id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
