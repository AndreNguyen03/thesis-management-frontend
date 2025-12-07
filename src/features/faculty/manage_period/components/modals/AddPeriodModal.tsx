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

interface AddPeriodModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AddPeriodModal({ open, onOpenChange }: AddPeriodModalProps) {
	const [academicYear, setAcademicYear] = useState('')
	const [semester, setSemester] = useState('')
	const [periodType, setPeriodType] = useState<'thesis' | 'scientific_research'>('thesis')

	const [startTime, setStartTime] = useState<string>('')
	const [endTime, setEndTime] = useState<string>('')

	const [createPeriod, { isLoading }] = useCreatePeriodMutation()

	const resetForm = () => {
		setAcademicYear('')
		setSemester('')
		setPeriodType('thesis')
		setStartTime('')
		setEndTime('')
		onOpenChange(false)
	}

	const handleAddPeriod = async () => {
		if (!academicYear || !semester || !periodType || !startTime || !endTime) return

		const payload = {
			year: academicYear,
			semester: Number(semester),
			type: periodType,
			startTime: new Date(startTime),
			endTime: new Date(endTime)
		}

		try {
			const response = await createPeriod(payload).unwrap()
			resetForm()
			toast({
				title: 'Thành công',
				description: response.message
			})
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: (error as ApiError).data?.message,
				variant: 'destructive'
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[650px]'>
				{isLoading ? (
					<LoadingState message='Đang tạo đợt đăng ký...' />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Thêm đợt đăng ký mới</DialogTitle>
							<DialogDescription>Tạo một đợt đăng ký khóa luận / NCKH cho sinh viên</DialogDescription>
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
								onClick={handleAddPeriod}
								disabled={!academicYear || !semester || !periodType || !startTime || !endTime}
							>
								Tạo đợt mới
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
