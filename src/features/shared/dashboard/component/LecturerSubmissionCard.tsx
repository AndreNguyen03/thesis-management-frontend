import { Button } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { PeriodPhaseName, type GetCustomMiniPeriodInfoRequestDto, type Period } from '@/models/period.model'
import { AlertCircle, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
interface LecturerSubmissionCardProps {
	period: GetCustomMiniPeriodInfoRequestDto
	submittedCount: number
	requiredCount: number
}
export const LecturerSubmissionCard = ({ period, submittedCount, requiredCount }: LecturerSubmissionCardProps) => {
	const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null)
	const [progress, setProgress] = useState(0)

	// 1. Logic tính toán thời gian đếm ngược
	useEffect(() => {
		if (!period.currentPhaseDetail.phase) return

		const calculateTime = () => {
			const now = new Date().getTime()
			const end = new Date(period.currentPhaseDetail.endTime).getTime()
			const start = new Date(period.currentPhaseDetail.startTime).getTime()
			const totalDuration = end - start
			const timePassed = now - start

			const distance = end - now

			if (distance < 0) {
				setTimeLeft(null) // Đã kết thúc
				setProgress(100)
			} else {
				// Tính toán ngày giờ còn lại
				const days = Math.floor(distance / (1000 * 60 * 60 * 24))
				const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
				const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

				setTimeLeft({ days, hours, minutes })

				// Tính % thanh tiến độ thời gian (đã trôi qua bao nhiêu %)
				// Tránh chia cho 0 nếu totalDuration = 0
				const percent = totalDuration > 0 ? Math.min(100, Math.max(0, (timePassed / totalDuration) * 100)) : 0
				setProgress(percent)
			}
		}

		calculateTime()
		const timer = setInterval(calculateTime, 60000) // Cập nhật mỗi phút

		return () => clearInterval(timer)
	}, [period.currentPhaseDetail])

	// Nếu không có pha nộp đề tài đang diễn ra
	if (!period.currentPhaseDetail || period.currentPhaseDetail.phase !== PeriodPhaseName.SUBMIT_TOPIC) {
		// Để demo hiển thị được, nếu không phải SUBMIT_TOPIC thì return null hoặc UI khác
		// return null;
		// DEMO MODE: Nếu logic check thất bại, vẫn hiển thị để bạn xem UI (xóa đoạn này trong production)
		// console.warn("Not in SUBMIT_TOPIC phase");
	}

	// Determine status color based on time left (Cảnh báo nếu < 2 ngày)
	const isUrgent = timeLeft && timeLeft.days < 2
	const isCompleted = submittedCount >= requiredCount

	return (
		<div className='relative w-full overflow-hidden rounded-xl border border-blue-100 bg-white font-sans shadow-sm'>
			{/* Background decoration */}
			<div className='absolute right-0 top-0 -z-0 h-32 w-32 rounded-bl-full bg-blue-50 opacity-50'></div>

			<div className='relative z-10 p-6'>
				<div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
					{/* Cột trái: Thông tin chính */}
					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<span className='rounded bg-blue-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-blue-700'>
								Đang diễn ra
							</span>
							<h3 className='text-lg font-bold text-gray-800'>Đợt Nộp Đề Tài - {period.name}</h3>
						</div>

						<div className='flex items-center gap-4 text-sm text-gray-500'>
							<div className='flex items-center gap-1'>
								<Calendar size={16} />
								<span>
									Bắt đầu:{' '}
									{new Date(period.currentPhaseDetail?.startTime || Date.now()).toLocaleDateString('vi-VN')}
								</span>
							</div>
							<div className='flex items-center gap-1'>
								<AlertCircle size={16} className={isUrgent ? 'text-red-500' : ''} />
								<span>
									Hạn chót:{' '}
									<span className='font-semibold text-gray-700'>
										{new Date(period.currentPhaseDetail?.endTime || Date.now()).toLocaleDateString(
											'vi-VN'
										)}
									</span>
								</span>
							</div>
						</div>
					</div>

					{/* Cột phải: Countdown Timer */}
					{timeLeft ? (
						<div className='flex gap-3 text-center'>
							<div className='min-w-[60px] rounded-lg bg-blue-50 p-2'>
								<div className='text-xl font-bold text-blue-700'>{timeLeft.days}</div>
								<div className='text-xs font-medium text-blue-600'>Ngày</div>
							</div>
							<div className='min-w-[60px] rounded-lg bg-blue-50 p-2'>
								<div className='text-xl font-bold text-blue-700'>{timeLeft.hours}</div>
								<div className='text-xs font-medium text-blue-600'>Giờ</div>
							</div>
							<div className='min-w-[60px] rounded-lg bg-blue-50 p-2'>
								<div className='text-xl font-bold text-blue-700'>{timeLeft.minutes}</div>
								<div className='text-xs font-medium text-blue-600'>Phút</div>
							</div>
						</div>
					) : (
						<div className='rounded-lg bg-red-50 px-4 py-2 font-bold text-red-600'>Đã kết thúc</div>
					)}
				</div>

				{/* Thanh Progress Bar Thời gian */}
				<div className='mt-6 space-y-2'>
					<div className='flex justify-between text-xs text-gray-500'>
						<span>Tiến độ thời gian</span>
						<span>{Math.round(progress)}% trôi qua</span>
					</div>
					<Progress
						value={progress}
						className={`h-2 ${isUrgent ? 'bg-red-100' : 'bg-blue-100'}`}
						indicatorClassName={isUrgent ? 'bg-red-500' : 'bg-blue-600'}
					/>
				</div>

				{/* Footer: Trạng thái cá nhân & Action */}
				<div className='mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:flex-row'>
					<div className='flex items-center gap-2'>
						{isCompleted ? (
							<div className='flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600'>
								<CheckCircle2 size={18} />
								Bạn đã nộp đủ số lượng ({submittedCount}/{requiredCount})
							</div>
						) : (
							<div className='text-sm text-gray-600'>
								Bạn đã nộp <span className='font-bold text-gray-900'>{submittedCount}</span> /{' '}
								<span className='font-bold text-gray-900'>{requiredCount}</span> đề tài yêu cầu.
							</div>
						)}
					</div>

					<Button
						className={`${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} gap-2 text-white shadow-lg shadow-blue-200`}
						disabled={!timeLeft} // Disable nếu hết giờ
					>
						Đăng ký đề tài ngay <ArrowRight size={16} />
					</Button>
				</div>
			</div>
		</div>
	)
}
