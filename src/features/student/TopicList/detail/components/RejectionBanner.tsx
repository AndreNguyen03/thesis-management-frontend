import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { XCircle, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/Button'

export function RejectionBanner() {
	const location = useLocation()
	const navigate = useNavigate()

	// 1. Lấy dữ liệu từ state (được gửi từ NotificationPopover)
	const state = location.state as {
		notiType?: string
		message?: string
		reasonSub?: string
		rejectedBy?: string
	} | null

	const [isVisible, setIsVisible] = useState(!!state?.notiType)

	//Chỉ hiển thị nếu đúng là loại REJECTED
	if (!isVisible || state?.notiType !== 'REJECTED') return <></>

	const handleClose = () => {
		setIsVisible(false)
		// Xóa state để F5 không hiện lại (Optional)
		navigate(location.pathname, { replace: true, state: {} })
	}

	return (
		<div className='h-fit space-y-4 rounded-md border border-gray-300 bg-white p-4'>
			<div className='duration-300 animate-in slide-in-from-top-2'>
				<Alert
					variant='destructive'
					className='relative border-l-4 border-l-red-600 bg-red-50 text-red-900 shadow-sm dark:bg-red-900/20 dark:text-red-100'
				>
					<XCircle className='h-5 w-5 text-red-600' />

					<div className='ml-2 pr-8'>
						<AlertTitle className='text-lg font-bold text-red-700 dark:text-red-400'>
							Đăng ký bị từ chối
						</AlertTitle>

						<AlertDescription className='mt-2 text-sm text-red-800/90 dark:text-red-200/90'>
							<div>{state.message || 'Giảng viên đã từ chối yêu cầu tham gia đề tài này.'}</div>

							{/* Phần hiển thị Lý do quan trọng */}
							{state.reasonSub && (
								<div className='mt-3 rounded-md bg-white/60 p-3 text-sm font-medium italic text-red-900 dark:bg-black/20'>
									{`${state.rejectedBy}: ${state.reasonSub}`}
								</div>
							)}
						</AlertDescription>
					</div>

					{/* Nút đóng */}
					<Button
						variant='ghost'
						size='icon'
						className='absolute right-2 top-2 h-8 w-8 pr-6 text-red-500 hover:bg-red-100 hover:text-red-700'
						onClick={handleClose}
					>
						<X className='h-8 w-8' />
					</Button>
				</Alert>
			</div>
		</div>
	)
}
