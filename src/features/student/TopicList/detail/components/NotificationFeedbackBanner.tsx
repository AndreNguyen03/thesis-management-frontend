import { Button } from "@/components/ui"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, FileWarning, X } from "lucide-react"
import { useState } from "react"
import { useLocation } from "react-router-dom"

export function NotificationFeedbackBanner() {
	const location = useLocation()

	// Lấy dữ liệu được truyền từ navigate state (xem phần Logic điều hướng bên dưới)
	const notificationState = location.state as {
		notiType?: 'REJECTED' | 'APPROVED' | 'REMINDER'
		message?: string
		reason?: string
	} | null

	const [isVisible, setIsVisible] = useState(!!notificationState)

	if (!isVisible || !notificationState) return null

	// 1. Cấu hình UI cho trường hợp BỊ TỪ CHỐI
	if (notificationState.notiType === 'REJECTED') {
		return (
			<Alert
				variant='destructive'
				className='mb-6 border-l-4 border-l-red-600 bg-red-50 animate-in fade-in slide-in-from-top-4 dark:bg-red-900/20'
			>
				<AlertCircle className='h-5 w-5' />
				<div className='flex w-full items-start justify-between'>
					<div>
						<AlertTitle className='text-lg font-bold text-red-700 dark:text-red-400'>
							Đăng ký đề tài này đã bị từ chối
						</AlertTitle>
						<AlertDescription className='mt-2 text-red-600 dark:text-red-300'>
							<span className='font-semibold'>Lý do từ Giảng viên:</span>
							<p className='mt-1 rounded-md border border-red-200 bg-white p-3 italic dark:border-red-800 dark:bg-black/20'>
								"{notificationState.reason || 'Kỹ năng chuyên môn chưa phù hợp với yêu cầu của đề tài.'}
								"
							</p>
							<p className='mt-2 text-sm'>
								Vui lòng chọn đề tài khác hoặc liên hệ giảng viên để biết thêm chi tiết.
							</p>
						</AlertDescription>
					</div>
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6 text-red-500'
						onClick={() => setIsVisible(false)}
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</Alert>
		)
	}

	// 2. Cấu hình UI cho trường hợp NHẮC NHỞ NỘP BÀI
	if (notificationState.notiType === 'REMINDER') {
		return (
			<Alert className='mb-6 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'>
				<FileWarning className='h-5 w-5 text-yellow-600' />
				<div className='flex w-full items-center justify-between'>
					<div>
						<AlertTitle className='font-bold text-yellow-700 dark:text-yellow-400'>
							Sắp đến hạn nộp báo cáo!
						</AlertTitle>
						<AlertDescription className='text-yellow-600 dark:text-yellow-300'>
							{notificationState.message ||
								'Bạn còn 2 ngày để nộp báo cáo tiến độ. Hãy hoàn thành sớm nhé.'}
						</AlertDescription>
					</div>
					<Button className='border-none bg-yellow-600 text-white hover:bg-yellow-700'>Nộp bài ngay</Button>
				</div>
			</Alert>
		)
	}

	// 3. Cấu hình UI cho trường hợp THÀNH CÔNG
	if (notificationState.notiType === 'APPROVED') {
		return (
			<Alert className='mb-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10'>
				<CheckCircle2 className='h-5 w-5 text-green-600' />
				<AlertTitle className='font-bold text-green-700'>Đăng ký thành công!</AlertTitle>
				<AlertDescription className='text-green-600'>
					Chúc mừng! Bạn đã trở thành thành viên chính thức của nhóm đề tài này.
				</AlertDescription>
			</Alert>
		)
	}

	return null
}
