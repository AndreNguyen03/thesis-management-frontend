"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface TopicsFilterProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: string) => void
  onGradeFilter: (grade: string) => void
  isLoading?: boolean
}

export function TopicsFilter({ onSearch, onStatusFilter, onGradeFilter, isLoading = false }: TopicsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [grade, setGrade] = useState("all")

  const handleClear = () => {
    setSearchQuery("")
    setStatus("all")
    setGrade("all")
    onSearch("")
    onStatusFilter("all")
    onGradeFilter("all")
  }

  const isFiltered = searchQuery || status !== "all" || grade !== "all"

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-col md:flex-row">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, sinh viên, giảng viên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearch(e.target.value)
            }}
            disabled={isLoading}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val)
            onStatusFilter(val)
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="submitted">Nộp bài</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>

        {/* Grade Filter */}
        <Select
          value={grade}
          onValueChange={(val) => {
            setGrade(val)
            onGradeFilter(val)
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Xếp loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="excellent">Xuất sắc</SelectItem>
            <SelectItem value="good">Giỏi</SelectItem>
            <SelectItem value="fair">Khá</SelectItem>
            <SelectItem value="average">Trung bình</SelectItem>
            <SelectItem value="unscored">Chưa chấm</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {isFiltered && (
          <Button variant="outline" size="icon" onClick={handleClear} disabled={isLoading} title="Xóa bộ lọc">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
