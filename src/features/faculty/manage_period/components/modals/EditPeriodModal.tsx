import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { LoadingState } from '@/components/ui/LoadingState'
import { useCreatePeriodMutation } from '@/services/periodApi'
import type { ApiError } from '@/models'
import type { Period, UpdatePeriodDto } from '@/models/period.model'

interface EditPeriodModalProps {
	data: Period
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (updatedPeriod: UpdatePeriodDto) => void
	isLoading: boolean
}

export function EditPeriodModal({ data, open, onSubmit, isLoading, onOpenChange }: EditPeriodModalProps) {
	const [academicYear, setAcademicYear] = useState(data.year)
	const [semester, setSemester] = useState(String(data.semester))
	const [periodType, setPeriodType] = useState<'thesis' | 'scientific_research'>(data.type)

	const [startTime, setStartTime] = useState<string>(format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm"))
	const [endTime, setEndTime] = useState<string>(format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm"))

	const resetForm = () => {
		setAcademicYear('')
		setSemester('')
		setPeriodType('thesis')
		setStartTime('')
		setEndTime('')
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[650px]'>
				{isLoading ? (
					<LoadingState message='Đang tạo đợt đăng ký...' />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Chỉnh sửa đợt/kì</DialogTitle>
							<DialogDescription>
								Chỉnh sửa một đợt đăng ký khóa luận / NCKH cho sinh viên
							</DialogDescription>
						</DialogHeader>

						<div className='space-y-6 py-4'>
							{/* 3 trường trên cùng 1 dòng */}
							<div className='grid grid-cols-3 gap-4'>
								{/* Năm học */}
								<div className='space-y-2'>
									<Label>Năm học *</Label>
									<input
										type='text'
										placeholder='VD: 2024-2025'
										className='w-full rounded border px-3 py-2'
										value={academicYear}
										onChange={(e) => setAcademicYear(e.target.value)}
									/>
								</div>

								{/* Học kỳ */}
								<div className='space-y-2'>
									<Label>Học kỳ *</Label>
									<Select value={semester} onValueChange={setSemester}>
										<SelectTrigger>
											<SelectValue placeholder='Chọn' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1'>Học kỳ 1</SelectItem>
											<SelectItem value='2'>Học kỳ 2</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Loại đợt */}
								<div className='space-y-2'>
									<Label>Loại đợt *</Label>
									<Select
										value={periodType}
										onValueChange={(value) =>
											setPeriodType(value as 'thesis' | 'scientific_research')
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Chọn' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='thesis'>Khóa luận</SelectItem>
											<SelectItem value='scientific_research'>Nghiên cứu khoa học</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Ngày bắt đầu + kết thúc */}
							<div className='grid grid-cols-2 gap-4'>
								{/* Start DateTime */}
								<div className='space-y-2'>
									<Label>Ngày giờ bắt đầu *</Label>
									<input
										type='datetime-local'
										className='w-full rounded border px-3 py-2'
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
									/>
								</div>

								{/* End DateTime */}
								<div className='space-y-2'>
									<Label>Ngày giờ kết thúc *</Label>
									<input
										type='datetime-local'
										className='w-full rounded border px-3 py-2'
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
										min={startTime ? format(startTime, "yyyy-MM-dd'T'HH:mm") : undefined}
									/>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button variant='outline' onClick={() => onOpenChange(false)}>
								Hủy
							</Button>
							<Button
								onClick={() => {
									resetForm()
									onSubmit({
										year: academicYear,
										semester: Number(semester),
										type: periodType,
										startTime: startTime,
										endTime: endTime
									} as UpdatePeriodDto)
								}}
								disabled={
									!academicYear ||
									!semester ||
									!periodType ||
									!startTime ||
									!endTime ||
									(academicYear === data.year &&
										semester === String(data.semester) &&
										periodType === data.type &&
										startTime === format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm") &&
										endTime === format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm"))
								}
							>
								Chỉnh sửa
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
